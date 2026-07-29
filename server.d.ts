import { internalMutation, internalQuery, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { auth } from "./auth";

/* ---------- Grace Spring ops backend (admin-only CRM) ----------
   Every function here requires users.isAdmin. Grant it by running:
   npx convex run admin:grantAdmin '{"email":"you@...","secret":"..."}' — or
   edit the user document in the Convex dashboard (Data → users → isAdmin). */

async function requireAdmin(ctx: any) {
  const userId = await auth.getUserId(ctx);
  if (!userId) throw new Error("Not signed in.");
  const user = await ctx.db.get(userId);
  if (!user?.isAdmin) throw new Error("Admin access required.");
  return user;
}

/* CLI-only helper (internal — not callable from browsers). */
export const grantAdminByEmail = internalMutation({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", args.email.toLowerCase()))
      .first();
    if (!user) throw new Error("No user with that email.");
    await ctx.db.patch(user._id, { isAdmin: true });
    return `${args.email} is now an admin`;
  },
});

export const amIAdmin = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return false;
    const user = await ctx.db.get(userId);
    return Boolean(user?.isAdmin);
  },
});

export const assertAdmin = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    return Boolean(user?.isAdmin);
  },
});

/* All orders, newest first, with photo URLs resolved. */
export const allOrders = query({
  args: { status: v.optional(v.string()) },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    let orders = await ctx.db.query("orders").order("desc").take(200);
    if (args.status) orders = orders.filter((o) => o.status === args.status);
    return Promise.all(orders.map(async (o) => ({
      ...o,
      photoUrls: await Promise.all((o.deliveryPhotos ?? []).map((id) => ctx.storage.getUrl(id))),
    })));
  },
});

/* Customer roster: distinct emails with order stats + monthly-refill state. */
export const customers = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const orders = await ctx.db.query("orders").order("desc").take(500);
    const enrollments = await ctx.db.query("refillEnrollments").order("desc").take(200);
    const byEmail = new Map<string, any>();
    for (const o of orders) {
      const c = byEmail.get(o.email) ?? { email: o.email, orders: 0, revenue: 0, lastOrder: o._creationTime, name: `${o.address.firstName} ${o.address.lastName}` };
      if (o.status !== "pending" && o.status !== "cancelled") {
        c.orders += 1;
        if (o.status !== "refunded") c.revenue += o.total;
      }
      byEmail.set(o.email, c);
    }
    for (const e of enrollments) {
      const c = byEmail.get(e.email);
      if (c && !c.refill) c.refill = true;
    }
    return [...byEmail.values()].filter((c) => c.orders > 0);
  },
});

export const setOrderStatus = mutation({
  args: {
    orderId: v.id("orders"),
    status: v.union(
      v.literal("confirmed"),
      v.literal("out-for-delivery"),
      v.literal("delivered"),
      v.literal("cancelled")
    ),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const order = await ctx.db.get(args.orderId);
    if (!order) throw new Error("Order not found.");
    await ctx.db.patch(args.orderId, {
      status: args.status,
      statusHistory: [...(order.statusHistory ?? []),
        { status: args.status, at: Date.now(), note: args.note ?? `by ${admin.email}` }],
    });
  },
});

export const setAdminNotes = mutation({
  args: { orderId: v.id("orders"), notes: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.patch(args.orderId, { adminNotes: args.notes });
  },
});

/* Proof-of-delivery photo upload (two-step: URL then attach). */
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});

export const attachDeliveryPhoto = mutation({
  args: { orderId: v.id("orders"), storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const order = await ctx.db.get(args.orderId);
    if (!order) throw new Error("Order not found.");
    await ctx.db.patch(args.orderId, {
      deliveryPhotos: [...(order.deliveryPhotos ?? []), args.storageId],
    });
  },
});

/* Damage policy: customer keeps damaged goods; we ship a free replacement. */
export const createReplacementOrder = mutation({
  args: { orderId: v.id("orders") },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const order = await ctx.db.get(args.orderId);
    if (!order) throw new Error("Order not found.");
    const orderNumber = "GS-" + String(Date.now()).slice(-6);
    const id = await ctx.db.insert("orders", {
      userId: order.userId,
      email: order.email,
      orderNumber,
      mode: "one-time",
      items: order.items,
      subtotal: 0,
      savings: 0,
      total: 0,
      deliveryWindow: order.deliveryWindow,
      address: order.address,
      status: "confirmed",
      replacementFor: order.orderNumber,
      statusHistory: [{ status: "confirmed", at: Date.now(), note: `replacement for ${order.orderNumber} by ${admin.email}` }],
    });
    return { id, orderNumber };
  },
});

/* Internal helpers for the Stripe refund action. */
export const markRefunded = internalMutation({
  args: { orderId: v.id("orders"), note: v.string() },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);
    if (!order) return;
    await ctx.db.patch(args.orderId, {
      status: "refunded",
      statusHistory: [...(order.statusHistory ?? []), { status: "refunded", at: Date.now(), note: args.note }],
    });
    // No auto-charge subscription to unwind — monthly refill is reminder-only.
  },
});

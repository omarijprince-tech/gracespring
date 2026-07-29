import { internalMutation, internalQuery, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { auth } from "./auth";
import { computeTotals, checkZip } from "../lib/catalog";

const orderItem = v.object({ id: v.string(), qty: v.number() });
const coolerSpec = v.object({ loader: v.string(), color: v.string() });

const orderArgs = {
  email: v.string(),
  mode: v.union(v.literal("one-time"), v.literal("monthly")),
  items: v.array(orderItem),
  cooler: v.optional(coolerSpec),
  notifyMethod: v.optional(v.union(v.literal("text"), v.literal("email"), v.literal("phone"))),
  deliveryWindow: v.string(),
  address: v.object({
    firstName: v.string(),
    lastName: v.string(),
    phone: v.optional(v.string()),
    street: v.string(),
    city: v.string(),
    zip: v.string(),
  }),
};

/* Shared: validate + insert an order row with the given status. Totals are
   ALWAYS recomputed server-side from the catalog — client prices are never
   trusted. Returning customers (already hold a deposit) skip the deposit. */
async function insertOrder(ctx: any, args: any, status: "pending" | "placed") {
  const userId = await auth.getUserId(ctx);
  const user = userId ? await ctx.db.get(userId) : null;
  const isReturningCustomer = !!user?.hasBottleDeposit;

  const t = computeTotals({
    mode: args.mode,
    items: args.items,
    cooler: args.cooler ?? null,
    isReturningCustomer,
  });
  const orderNumber = "GS-" + String(Date.now()).slice(-6);
  const orderId = await ctx.db.insert("orders", {
    userId: userId ?? undefined,
    email: args.email.toLowerCase(),
    orderNumber,
    mode: args.mode,
    items: args.items,
    cooler: args.cooler ?? undefined,
    notifyMethod: args.notifyMethod ?? undefined,
    itemsSubtotal: +t.itemsSubtotal.toFixed(2),
    coolerPrice: +t.coolerPrice.toFixed(2),
    deposit: +t.deposit.toFixed(2),
    shipping: +t.shipping.toFixed(2),
    subtotal: +t.subtotal.toFixed(2),
    total: +t.total.toFixed(2),
    deliveryWindow: args.deliveryWindow,
    address: args.address,
    status,
  });
  return { orderId, orderNumber, totals: t };
}

/* Enroll (or refresh) the customer's monthly refill reminder. */
async function enrollRefill(ctx: any, order: any) {
  const existing = order.userId
    ? await ctx.db.query("refillEnrollments").withIndex("by_user", (q: any) => q.eq("userId", order.userId)).collect()
    : await ctx.db.query("refillEnrollments").withIndex("by_email", (q: any) => q.eq("email", order.email)).collect();
  for (const e of existing) {
    if (e.status !== "cancelled") await ctx.db.patch(e._id, { status: "cancelled" });
  }
  await ctx.db.insert("refillEnrollments", {
    userId: order.userId,
    email: order.email,
    notifyMethod: order.notifyMethod ?? "text",
    lastItems: order.items,
    status: "active",
    startedOrderNumber: order.orderNumber,
  });
}

/* Mark the customer as holding a deposit so future orders skip it. */
async function markDepositPaid(ctx: any, order: any) {
  if (order.deposit > 0 && order.userId) {
    const u = await ctx.db.get(order.userId);
    if (u && !u.hasBottleDeposit) await ctx.db.patch(order.userId, { hasBottleDeposit: true });
  }
}

/* Called by the Stripe action before redirecting to Checkout. */
export const createPendingOrder = internalMutation({
  args: orderArgs,
  handler: async (ctx, args) => {
    const { orderId, orderNumber } = await insertOrder(ctx, args, "pending");
    return { orderId, orderNumber };
  },
});

/* Called by the Stripe webhook when payment completes. */
export const finalizeOrder = internalMutation({
  args: {
    orderId: v.id("orders"),
    stripeSessionId: v.string(),
    stripeCustomerId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);
    if (!order) return;
    if (order.status !== "pending") return; // idempotent: webhooks can repeat
    await ctx.db.patch(args.orderId, {
      status: "placed",
      stripeSessionId: args.stripeSessionId,
      stripeCustomerId: args.stripeCustomerId,
    });
    await markDepositPaid(ctx, order);
    if (order.mode === "monthly") await enrollRefill(ctx, order);
  },
});

/* Order lookup for the webhook's confirmation email. */
export const getOrderById = internalQuery({
  args: { orderId: v.id("orders") },
  handler: async (ctx, args) => ctx.db.get(args.orderId),
});

/* ---------- Cart recovery ----------
   A "pending" order is one that reached Stripe Checkout but never paid, so it
   is exactly an abandoned cart with a known email address.
   Window: 1h (give people time to finish paying) → 24h (Stripe expires the
   session by then, and a day-old nudge is just noise). */
export const ABANDON_MIN_AGE_MS = 60 * 60 * 1000;
export const ABANDON_MAX_AGE_MS = 24 * 60 * 60 * 1000;

export const listAbandoned = internalQuery({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const pending = await ctx.db
      .query("orders")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .order("desc")
      .take(200);
    return pending.filter((o) => {
      if (o.abandonedEmailSentAt) return false;       // chased once, never again
      const age = now - o._creationTime;
      return age >= ABANDON_MIN_AGE_MS && age <= ABANDON_MAX_AGE_MS;
    });
  },
});

/* Stamped before the send so a retry or overlapping cron can't double-email. */
export const markAbandonedEmailSent = internalMutation({
  args: { orderId: v.id("orders") },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);
    if (!order || order.status !== "pending" || order.abandonedEmailSentAt) return false;
    await ctx.db.patch(args.orderId, { abandonedEmailSentAt: Date.now() });
    return true;
  },
});

/* Called by the Stripe webhook when a checkout session expires unpaid. */
export const cancelPendingOrder = internalMutation({
  args: { orderId: v.id("orders") },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);
    if (order && order.status === "pending") {
      await ctx.db.patch(args.orderId, { status: "cancelled" });
    }
  },
});

/* Place an order (demo fallback path when Stripe keys are absent). Totals are
   recomputed SERVER-SIDE from the catalog. Works for guests and members. */
export const placeOrder = mutation({
  args: orderArgs,
  handler: async (ctx, args) => {
    if (args.items.length === 0 && !args.cooler) throw new Error("Order is empty.");
    if (!checkZip(args.address.zip)) throw new Error("ZIP code is outside the delivery area.");

    const { orderId, totals: t, orderNumber } = await insertOrder(ctx, args, "placed");
    const order = await ctx.db.get(orderId);
    await markDepositPaid(ctx, order);
    if (args.mode === "monthly") await enrollRefill(ctx, order);
    return { orderId, orderNumber, total: +t.total.toFixed(2) };
  },
});

/* Orders for the signed-in user (also picks up guest orders placed with the
   same email before the account existed). */
export const myOrders = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return [];
    const user = await ctx.db.get(userId);
    const byUser = await ctx.db.query("orders").withIndex("by_user", (q) => q.eq("userId", userId)).order("desc").collect();
    const byEmail = user?.email
      ? await ctx.db.query("orders").withIndex("by_email", (q) => q.eq("email", user.email!.toLowerCase())).order("desc").collect()
      : [];
    const seen = new Set(byUser.map((o) => o._id.toString()));
    return [...byUser, ...byEmail.filter((o) => !seen.has(o._id.toString()))]
      .filter((o) => o.status !== "pending" && o.status !== "cancelled")
      .sort((a, b) => b._creationTime - a._creationTime);
  },
});

/* The customer's active monthly-refill enrollment, if any. */
export const myRefill = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return null;
    const user = await ctx.db.get(userId);
    const list = [
      ...(await ctx.db.query("refillEnrollments").withIndex("by_user", (q) => q.eq("userId", userId)).collect()),
      ...(user?.email
        ? await ctx.db.query("refillEnrollments").withIndex("by_email", (q) => q.eq("email", user.email!.toLowerCase())).collect()
        : []),
    ];
    const unique = new Map(list.map((s) => [s._id.toString(), s]));
    const sorted = [...unique.values()].sort((a, b) => b._creationTime - a._creationTime);
    return sorted.find((s) => s.status !== "cancelled") ?? sorted[0] ?? null;
  },
});

export const setRefillStatus = mutation({
  args: {
    id: v.id("refillEnrollments"),
    status: v.union(v.literal("active"), v.literal("paused"), v.literal("cancelled")),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Sign in to manage your refill service.");
    const e = await ctx.db.get(args.id);
    if (!e) throw new Error("Enrollment not found.");
    const user = await ctx.db.get(userId);
    const owns = e.userId === userId || (user?.email && e.email === user.email.toLowerCase());
    if (!owns) throw new Error("Not your enrollment.");
    await ctx.db.patch(args.id, { status: args.status });
  },
});

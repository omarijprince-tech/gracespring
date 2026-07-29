import { mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { auth } from "./auth";

/* ---------- Delivery routes ----------
   Dispatcher side is admin-gated. Driver side is TOKEN-gated: the route link
   itself is the credential (unguessable, scoped to that route's orders only),
   so borrowed Blue Star drivers need no account. */

async function requireAdmin(ctx: any) {
  const userId = await auth.getUserId(ctx);
  if (!userId) throw new Error("Not signed in.");
  const user = await ctx.db.get(userId);
  if (!user?.isAdmin) throw new Error("Admin access required.");
  return user;
}

function makeToken() {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let t = "";
  for (let i = 0; i < 28; i++) t += chars[Math.floor(Math.random() * chars.length)];
  return t;
}

/* ---------- Automatic route optimization ----------
   The dispatcher's depot (Blue Star Pure Water, Paterson NJ) is the start and
   end of every route. We approximate each stop's location from its 3-digit ZIP
   prefix (centroid table below), then order the stops greedily by proximity
   (nearest-neighbor from the depot). This needs no geocoding API; for
   turn-by-turn we hand the ORDERED addresses to Google Maps, which does the
   real driving directions. Swap in a geocoder/Directions API later for
   house-level optimization — only coordFor() and the order step change. */
const DEPOT = { label: "Blue Star Pure Water, 527 E 39th St, Paterson, NJ 07504", lat: 40.9163, lng: -74.1560 };

const ZIP_CENTROIDS: Record<string, [number, number]> = {
  // Northern NJ
  "070": [40.735, -74.172], "071": [40.735, -74.172], "072": [40.663, -74.211],
  "073": [40.718, -74.048], "074": [40.916, -74.156], "075": [40.886, -74.048],
  "076": [40.920, -74.000], "077": [40.350, -74.080], "078": [40.880, -74.560],
  "079": [40.797, -74.480],
  // NYC five boroughs
  "100": [40.751, -73.993], "101": [40.751, -73.993], "102": [40.790, -73.950],
  "103": [40.580, -74.150], "104": [40.840, -73.870], "110": [40.750, -73.870],
  "111": [40.700, -73.820], "112": [40.650, -73.950], "113": [40.720, -73.790],
  "114": [40.760, -73.870],
};
function coordFor(zip: string): [number, number] {
  return ZIP_CENTROIDS[String(zip).slice(0, 3)] ?? [DEPOT.lat, DEPOT.lng];
}
function dist(a: [number, number], b: [number, number]) {
  const dx = a[0] - b[0], dy = a[1] - b[1];
  return dx * dx + dy * dy; // squared euclidean — fine for local ordering
}
/* Greedy nearest-neighbor ordering of stops, starting at the depot. */
function optimizeOrder<T extends { zip: string }>(stops: T[]): T[] {
  const remaining = [...stops];
  const ordered: T[] = [];
  let cur: [number, number] = [DEPOT.lat, DEPOT.lng];
  while (remaining.length) {
    let bestIdx = 0, bestD = Infinity;
    for (let i = 0; i < remaining.length; i++) {
      const d = dist(cur, coordFor(remaining[i].zip));
      if (d < bestD) { bestD = d; bestIdx = i; }
    }
    const [next] = remaining.splice(bestIdx, 1);
    ordered.push(next);
    cur = coordFor(next.zip);
  }
  return ordered;
}
/* Google Maps directions URL: depot → each stop in order → back to depot.
   No API key required; Maps computes real driving directions for the given
   waypoint order. */
function buildMapsUrl(stops: { street: string; city: string; zip: string }[]): string {
  const enc = (s: string) => encodeURIComponent(s.replace(/\s+/g, " ").trim());
  const points = [
    DEPOT.label,
    ...stops.map((s) => `${s.street}, ${s.city}, NJ ${s.zip}`),
    DEPOT.label,
  ].map(enc);
  return "https://www.google.com/maps/dir/" + points.join("/");
}

async function routeByTokenOrThrow(ctx: any, token: string) {
  const route = await ctx.db.query("routes")
    .withIndex("by_token", (q: any) => q.eq("token", token)).first();
  if (!route) throw new Error("Route not found.");
  return route;
}

const orderSummary = async (ctx: any, id: any) => {
  const o = await ctx.db.get(id);
  if (!o) return null;
  return {
    _id: o._id,
    orderNumber: o.orderNumber,
    status: o.status,
    name: `${o.address.firstName} ${o.address.lastName}`,
    street: o.address.street,
    city: o.address.city,
    zip: o.address.zip,
    deliveryWindow: o.deliveryWindow,
    items: o.items,
    notes: o.adminNotes,
    photoCount: (o.deliveryPhotos ?? []).length,
    replacementFor: o.replacementFor,
  };
};

/* ----- Dispatcher (admin) ----- */

/* Orders ready to route: paid/confirmed, not yet on a route. */
export const openOrders = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const orders = await ctx.db.query("orders").order("desc").take(300);
    const open = orders.filter((o) =>
      (o.status === "placed" || o.status === "confirmed") && !o.routeId);
    return Promise.all(open.map((o) => orderSummary(ctx, o._id)));
  },
});

export const listRoutes = query({
  args: { date: v.optional(v.string()) },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const routes = args.date
      ? await ctx.db.query("routes").withIndex("by_date", (q) => q.eq("date", args.date!)).collect()
      : await ctx.db.query("routes").order("desc").take(30);
    return Promise.all(routes.map(async (r) => {
      const stopDetails = (await Promise.all(r.stops.map((id) => orderSummary(ctx, id)))).filter(Boolean);
      return { ...r, stopDetails, mapsUrl: buildMapsUrl(stopDetails as any) };
    }));
  },
});

/* Re-optimize an existing route's stop order (nearest-neighbor from depot). */
export const optimizeRoute = mutation({
  args: { routeId: v.id("routes") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const route = await ctx.db.get(args.routeId);
    if (!route) throw new Error("Route not found.");
    const withZip: { id: any; zip: string }[] = [];
    for (const id of route.stops) {
      const o = await ctx.db.get(id);
      if (o) withZip.push({ id, zip: o.address.zip });
    }
    await ctx.db.patch(args.routeId, { stops: optimizeOrder(withZip).map((s) => s.id) });
  },
});

export const createRoute = mutation({
  args: {
    date: v.string(),
    driverName: v.string(),
    driverPhone: v.optional(v.string()),
    orderIds: v.array(v.id("orders")),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    if (args.orderIds.length === 0) throw new Error("Pick at least one stop.");
    const withZip: { id: any; zip: string }[] = [];
    for (const id of args.orderIds) {
      const o = await ctx.db.get(id);
      if (!o) throw new Error("Order not found.");
      if (o.routeId) throw new Error(`${o.orderNumber} is already on a route.`);
      withZip.push({ id, zip: o.address.zip });
    }
    // Automatically order the stops into an efficient delivery sequence.
    const optimizedIds = optimizeOrder(withZip).map((s) => s.id);
    const token = makeToken();
    const routeId = await ctx.db.insert("routes", {
      date: args.date,
      driverName: args.driverName.trim() || "Driver",
      driverPhone: args.driverPhone?.trim() || undefined,
      token,
      stops: optimizedIds,
      status: "draft",
    });
    for (const id of optimizedIds) await ctx.db.patch(id, { routeId });
    return { routeId, token };
  },
});

export const reorderStop = mutation({
  args: { routeId: v.id("routes"), orderId: v.id("orders"), direction: v.union(v.literal(-1), v.literal(1)) },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const route = await ctx.db.get(args.routeId);
    if (!route) throw new Error("Route not found.");
    const i = route.stops.indexOf(args.orderId);
    const j = i + args.direction;
    if (i < 0 || j < 0 || j >= route.stops.length) return;
    const stops = [...route.stops];
    [stops[i], stops[j]] = [stops[j], stops[i]];
    await ctx.db.patch(args.routeId, { stops });
  },
});

export const removeStop = mutation({
  args: { routeId: v.id("routes"), orderId: v.id("orders") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const route = await ctx.db.get(args.routeId);
    if (!route) throw new Error("Route not found.");
    await ctx.db.patch(args.routeId, { stops: route.stops.filter((s) => s !== args.orderId) });
    await ctx.db.patch(args.orderId, { routeId: undefined });
  },
});

export const deleteRoute = mutation({
  args: { routeId: v.id("routes") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const route = await ctx.db.get(args.routeId);
    if (!route) return;
    for (const id of route.stops) {
      const o = await ctx.db.get(id);
      if (o && o.routeId === args.routeId) await ctx.db.patch(id, { routeId: undefined });
    }
    await ctx.db.delete(args.routeId);
  },
});

export const markRouteSent = mutation({
  args: { routeId: v.id("routes") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.patch(args.routeId, { status: "sent" });
  },
});

/* ----- Driver (token) ----- */

export const routeByToken = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const route = await ctx.db.query("routes")
      .withIndex("by_token", (q) => q.eq("token", args.token)).first();
    if (!route) return null;
    const stopDetails = (await Promise.all(route.stops.map((id) => orderSummary(ctx, id)))).filter(Boolean);
    return { date: route.date, driverName: route.driverName, status: route.status, stopDetails, mapsUrl: buildMapsUrl(stopDetails as any) };
  },
});

export const driverMarkDelivered = mutation({
  args: { token: v.string(), orderId: v.id("orders") },
  handler: async (ctx, args) => {
    const route = await routeByTokenOrThrow(ctx, args.token);
    if (!route.stops.includes(args.orderId)) throw new Error("Stop not on this route.");
    const order = await ctx.db.get(args.orderId);
    if (!order || order.status === "delivered") return;
    await ctx.db.patch(args.orderId, {
      status: "delivered",
      statusHistory: [...(order.statusHistory ?? []),
        { status: "delivered", at: Date.now(), note: `by driver ${route.driverName} (route link)` }],
    });
    // route complete when every stop is delivered
    const all = await Promise.all(route.stops.map((id: any) => ctx.db.get(id)));
    if (all.every((o: any) => !o || o.status === "delivered" || o.status === "cancelled" || o.status === "refunded")) {
      await ctx.db.patch(route._id, { status: "complete" });
    }
    await ctx.scheduler.runAfter(0, internal.emails.sendDeliveredEmail, { orderId: args.orderId });
  },
});

export const driverUploadUrl = mutation({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    await routeByTokenOrThrow(ctx, args.token);
    return await ctx.storage.generateUploadUrl();
  },
});

export const driverAttachPhoto = mutation({
  args: { token: v.string(), orderId: v.id("orders"), storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    const route = await routeByTokenOrThrow(ctx, args.token);
    if (!route.stops.includes(args.orderId)) throw new Error("Stop not on this route.");
    const order = await ctx.db.get(args.orderId);
    if (!order) throw new Error("Order not found.");
    await ctx.db.patch(args.orderId, { deliveryPhotos: [...(order.deliveryPhotos ?? []), args.storageId] });
  },
});

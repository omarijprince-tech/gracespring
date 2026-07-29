import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

/* Grace Spring Water backend schema.
   authTables provides: users, authSessions, authAccounts, etc. */

const orderItem = v.object({
  id: v.string(),   // catalog product id, e.g. "alkaline-5gal"
  qty: v.number(),
});

const coolerSpec = v.object({
  loader: v.string(),  // "Top Loader" | "Bottom Loader"
  color: v.string(),   // "Black" | "White"
});

export default defineSchema({
  ...authTables,

  // auth users table + Grace Spring fields (must keep the auth fields/indexes)
  users: defineTable({
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),
    isAdmin: v.optional(v.boolean()),
    // set true once a customer has paid a bottle deposit; suppresses the
    // one-time deposit on their future orders
    hasBottleDeposit: v.optional(v.boolean()),
  })
    .index("email", ["email"])
    .index("phone", ["phone"]),

  orders: defineTable({
    userId: v.optional(v.id("users")),   // guests may order without an account
    email: v.string(),
    orderNumber: v.string(),             // "GS-123456", shown to the customer
    mode: v.union(v.literal("one-time"), v.literal("monthly")),
    items: v.array(orderItem),
    cooler: v.optional(coolerSpec),      // Avalon cooler add-on (auto free bundle)
    notifyMethod: v.optional(v.union(v.literal("text"), v.literal("email"), v.literal("phone"))),
    itemsSubtotal: v.optional(v.number()),
    coolerPrice: v.optional(v.number()),
    deposit: v.number(),                 // one-time refundable bottle deposit
    shipping: v.number(),                // flat per-delivery shipping
    subtotal: v.number(),                // items + cooler
    total: v.number(),
    deliveryWindow: v.string(),
    address: v.object({
      firstName: v.string(),
      lastName: v.string(),
      phone: v.optional(v.string()),
      street: v.string(),
      city: v.string(),
      zip: v.string(),
    }),
    status: v.union(
      v.literal("pending"),    // awaiting Stripe payment
      v.literal("placed"),
      v.literal("confirmed"),
      v.literal("out-for-delivery"),
      v.literal("delivered"),
      v.literal("cancelled"),
      v.literal("refunded")
    ),
    stripeSessionId: v.optional(v.string()),
    stripeCustomerId: v.optional(v.string()),
    // ops (admin CRM): status timeline, driver proof-of-delivery, notes
    statusHistory: v.optional(v.array(v.object({
      status: v.string(),
      at: v.number(),
      note: v.optional(v.string()),
    }))),
    deliveryPhotos: v.optional(v.array(v.id("_storage"))),
    adminNotes: v.optional(v.string()),
    replacementFor: v.optional(v.string()),  // orderNumber this order replaces
    routeId: v.optional(v.id("routes")),     // set while assigned to a route
    // cart recovery: stamped once, so an abandoned order is never chased twice
    abandonedEmailSentAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_email", ["email"])
    .index("by_status", ["status"])
    .index("by_stripe_session", ["stripeSessionId"]),

  /* Monthly-refill enrollment: the customer opted into reminder-based
     reordering. No auto-charge — we notify them (text/email/phone) the day
     before each route and they reply with a quantity. */
  refillEnrollments: defineTable({
    userId: v.optional(v.id("users")),
    email: v.string(),
    notifyMethod: v.union(v.literal("text"), v.literal("email"), v.literal("phone")),
    lastItems: v.array(orderItem),       // their most recent order, for a quick re-order
    status: v.union(v.literal("active"), v.literal("paused"), v.literal("cancelled")),
    startedOrderNumber: v.string(),
  })
    .index("by_user", ["userId"])
    .index("by_email", ["email"]),

  /* Delivery routes: a day's stop list for one driver/truck. Drivers open
     the route via an unguessable token link — no account needed. */
  routes: defineTable({
    date: v.string(),               // "2026-07-26" (dispatcher-local)
    driverName: v.string(),
    driverPhone: v.optional(v.string()),
    token: v.string(),
    stops: v.array(v.id("orders")), // ordered
    status: v.union(v.literal("draft"), v.literal("sent"), v.literal("complete")),
  })
    .index("by_token", ["token"])
    .index("by_date", ["date"]),

  /* Customer support messages from /contact. Stored so nothing is lost if
     the outbound email fails, and so the owner has a record to work from. */
  contactMessages: defineTable({
    name: v.string(),
    email: v.string(),
    orderNumber: v.optional(v.string()),
    topic: v.string(),
    message: v.string(),
    emailSentAt: v.optional(v.number()),   // set once Resend accepts it
    emailError: v.optional(v.string()),
  }).index("by_email", ["email"]),
});

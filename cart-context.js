"use node";

import { action, internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { ConvexError, v } from "convex/values";
import Stripe from "stripe";
import { Resend } from "resend";
import { auth } from "./auth";
import { byId, computeTotals, checkZip, money, COOLER } from "../lib/catalog";

/* Order-confirmation email. Failures are logged, never fatal — email must
   not break order fulfillment. */
async function sendOrderConfirmation(order: any) {
  const apiKey = process.env.AUTH_RESEND_KEY;
  if (!apiKey || !order) return;
  try {
    const resend = new Resend(apiKey);
    const isMonthly = order.mode === "monthly";
    const itemLines = order.items
      .map((i: any) => `  • ${byId(i.id)?.name ?? i.id} × ${i.qty}`)
      .join("\n");
    const coolerLine = order.cooler
      ? `\n  • Avalon Water Cooler (${order.cooler.loader}, ${order.cooler.color}) — ${money(order.coolerPrice ?? COOLER.price)}` +
        `\n  • 5 free 5-gallon bottles + a bottle stand — FREE`
      : "";
    const { error } = await resend.emails.send({
      from: process.env.EMAIL_FROM ?? "Grace Spring Water <onboarding@resend.dev>",
      to: [order.email],
      subject: `Order ${order.orderNumber} confirmed — Grace Spring Water`,
      text:
        `Thanks for your order, ${order.address.firstName}!\n\n` +
        `Order ${order.orderNumber}\n${itemLines}${coolerLine}\n\n` +
        `Subtotal: ${money(order.subtotal)}\n` +
        (order.deposit > 0 ? `Initial bottle deposit (one-time, refundable): ${money(order.deposit)}\n` : "") +
        `Shipping: ${money(order.shipping)}\n` +
        `Total: ${money(order.total)}\n\n` +
        (isMonthly
          ? `You're enrolled in our monthly refill service — we'll remind you the day before each delivery by ${order.notifyMethod ?? "text"}. Just reply with how many jugs you'd like. No auto-charges.\n`
          : `This is a one-time order.\n`) +
        `Delivery window: ${order.deliveryWindow}\n` +
        `Delivering to: ${order.address.street}, ${order.address.city} ${order.address.zip}\n\n` +
        `A team member will call to confirm your route and first delivery date.\n\n— Grace Spring Water · 100% Natural Spring Water · 973-742-0216`,
    });
    if (error) console.error("Order confirmation email failed", error);
  } catch (err) {
    console.error("Order confirmation email failed", err);
  }
}

const orderItem = v.object({ id: v.string(), qty: v.number() });
const coolerSpec = v.object({ loader: v.string(), color: v.string() });

/* Creates a Stripe Checkout Session for the cart and a pending order row.
   Line-item prices are computed SERVER-SIDE from the catalog rules (inline
   price_data). Both one-time and monthly orders are a single payment — the
   monthly refill service reminds the customer to reorder, it does not
   auto-charge. The webhook marks the order paid. */
export const createCheckoutSession = action({
  args: {
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
  },
  handler: async (ctx, args): Promise<{ url: string }> => {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    // ConvexError survives production error redaction — the client relies on
    // this sentinel to fall back to demo checkout until live keys exist
    if (!secretKey) throw new ConvexError("STRIPE_NOT_CONFIGURED");
    if (args.items.length === 0 && !args.cooler) throw new Error("Order is empty.");
    if (!checkZip(args.address.zip)) throw new Error("ZIP code is outside the delivery area.");

    const t = computeTotals({ mode: args.mode, items: args.items, cooler: args.cooler ?? null });

    const stripe = new Stripe(secretKey);
    const siteUrl = (process.env.SITE_URL ?? "http://localhost:4173").replace(/\/$/, "");

    // pending order first, so the session can carry its id in metadata
    const { orderId, orderNumber } = await ctx.runMutation(internal.orders.createPendingOrder, args);

    const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
    const push = (name: string, cents: number) => {
      line_items.push({ quantity: 1, price_data: { currency: "usd", product_data: { name }, unit_amount: cents } });
    };

    // one product line per item (quantity folded into the name so the fee
    // lines below always read cleanly)
    for (const i of args.items) {
      const p = byId(i.id)!;
      push(`${p.name} × ${i.qty}`, Math.round(p.price * i.qty * 100));
    }
    if (args.cooler) {
      push(`Avalon Water Cooler — ${args.cooler.loader}, ${args.cooler.color}`, Math.round(t.coolerPrice * 100));
      push(`${COOLER.freeBottles}× ${byId(COOLER.freeBottleId)!.name} + bottle stand — FREE`, 0);
    }
    if (t.deposit > 0) push("Initial Bottle Deposit (one-time, refundable)", Math.round(t.deposit * 100));
    if (t.shipping > 0) push("Shipping", Math.round(t.shipping * 100));

    // reconcile any rounding drift onto the first line so Stripe's total
    // matches the site's engine to the cent
    const targetCents = Math.round(t.total * 100);
    const sumCents = line_items.reduce((s, l) => s + (l.price_data!.unit_amount as number), 0);
    if (line_items.length > 0 && sumCents !== targetCents) {
      (line_items[0].price_data!.unit_amount as number);
      line_items[0].price_data!.unit_amount = (line_items[0].price_data!.unit_amount as number) + (targetCents - sumCents);
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: args.email.toLowerCase(),
      line_items,
      metadata: { convexOrderId: orderId, orderNumber, orderMode: args.mode },
      success_url: `${siteUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/checkout`,
    });

    if (!session.url) throw new Error("Stripe did not return a checkout URL.");
    return { url: session.url };
  },
});

/* Theft policy: refund the order's payment via Stripe. Admin-only. */
export const adminRefundOrder = action({
  args: { orderId: v.id("orders") },
  handler: async (ctx, args): Promise<{ refunded: boolean; detail: string }> => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not signed in.");
    const isAdmin = await ctx.runQuery(internal.admin.assertAdmin, { userId });
    if (!isAdmin) throw new Error("Admin access required.");

    const order: any = await ctx.runQuery(internal.orders.getOrderById, { orderId: args.orderId });
    if (!order) throw new Error("Order not found.");
    if (order.status === "refunded") return { refunded: false, detail: "Already refunded." };

    const secretKey = process.env.STRIPE_SECRET_KEY;
    let detail = "No Stripe payment on file (demo order) — marked refunded locally.";

    if (secretKey && order.stripeSessionId) {
      const stripe = new Stripe(secretKey);
      const session = await stripe.checkout.sessions.retrieve(order.stripeSessionId);
      const pi = typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id;
      if (!pi) throw new Error("No payment found on the Stripe session.");
      await stripe.refunds.create({ payment_intent: pi });
      detail = "Payment refunded in Stripe.";
    }

    await ctx.runMutation(internal.admin.markRefunded, { orderId: args.orderId, note: detail });
    return { refunded: true, detail };
  },
});

/* Webhook fulfillment — verifies the signature and applies the event.
   Wired to POST /stripe/webhook in convex/http.ts. */
export const fulfillWebhook = internalAction({
  args: { signature: v.string(), payload: v.string() },
  handler: async (ctx, args): Promise<{ success: boolean }> => {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!secretKey || !webhookSecret) return { success: false };

    const stripe = new Stripe(secretKey);
    let event: Stripe.Event;
    try {
      event = await stripe.webhooks.constructEventAsync(args.payload, args.signature, webhookSecret);
    } catch (err) {
      console.error("Stripe webhook signature verification failed", err);
      return { success: false };
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata?.convexOrderId;
      if (orderId) {
        await ctx.runMutation(internal.orders.finalizeOrder, {
          orderId: orderId as any,
          stripeSessionId: session.id,
          stripeCustomerId: typeof session.customer === "string" ? session.customer : undefined,
        });
        const order = await ctx.runQuery(internal.orders.getOrderById, { orderId: orderId as any });
        await sendOrderConfirmation(order);
      }
    } else if (event.type === "checkout.session.expired") {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata?.convexOrderId;
      if (orderId) {
        await ctx.runMutation(internal.orders.cancelPendingOrder, { orderId: orderId as any });
      }
    }

    return { success: true };
  },
});

"use node";

import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { Resend } from "resend";
import { byId, money } from "../lib/catalog";

/* Support inbox destination. Override with SUPPORT_EMAIL if the alias moves. */
const SUPPORT_TO = () => process.env.SUPPORT_EMAIL ?? "support@gracespringwater.com";

/* Contact-form notification. Sends to the support alias with reply_to set to
   the customer, so hitting Reply in the inbox answers them directly. The
   outcome is written back to the row either way. */
export const sendContactEmail = internalAction({
  args: { messageId: v.id("contactMessages") },
  handler: async (ctx, args) => {
    const msg: any = await ctx.runQuery(internal.contact.getMessage, { messageId: args.messageId });
    if (!msg) return;

    const apiKey = process.env.AUTH_RESEND_KEY;
    if (!apiKey) {
      await ctx.runMutation(internal.contact.markEmailResult, {
        messageId: args.messageId, error: "AUTH_RESEND_KEY not configured",
      });
      return;
    }

    try {
      const resend = new Resend(apiKey);
      const { error } = await resend.emails.send({
        from: process.env.EMAIL_FROM ?? "Grace Spring Water <onboarding@resend.dev>",
        to: [SUPPORT_TO()],
        replyTo: msg.email,
        subject: `[${msg.topic}] Contact form — ${msg.name}`,
        text:
          `${msg.name} <${msg.email}> wrote via gracespringwater.com/contact:\n\n` +
          `Topic: ${msg.topic}\n` +
          (msg.orderNumber ? `Order: ${msg.orderNumber}\n` : "") +
          `\n${msg.message}\n\n` +
          `— Reply to this email to answer ${msg.name} directly.`,
      });
      await ctx.runMutation(internal.contact.markEmailResult, {
        messageId: args.messageId,
        error: error ? String(error.message ?? error) : undefined,
      });
      if (error) console.error("Contact email failed", error);
    } catch (err) {
      console.error("Contact email failed", err);
      await ctx.runMutation(internal.contact.markEmailResult, {
        messageId: args.messageId, error: String(err),
      });
    }
  },
});

/* ---------- Cart recovery ----------
   Hourly cron. Each order is CLAIMED (stamped) before its email is sent, so a
   retry or an overlapping run can never chase the same cart twice. The cost of
   the stamp-first order is losing one email if Resend fails — better than
   spamming a customer. */
export const sendAbandonedCartEmails = internalAction({
  args: {},
  handler: async (ctx) => {
    const apiKey = process.env.AUTH_RESEND_KEY;
    if (!apiKey) return;

    const abandoned: any[] = await ctx.runQuery(internal.orders.listAbandoned, {});
    if (abandoned.length === 0) return;

    const resend = new Resend(apiKey);
    const siteUrl = (process.env.SITE_URL ?? "https://gracespringwater.com").replace(/\/$/, "");

    for (const order of abandoned) {
      const claimed = await ctx.runMutation(internal.orders.markAbandonedEmailSent, { orderId: order._id });
      if (!claimed) continue; // paid, cancelled, or already chased since the query

      const itemLines = order.items
        .map((i: any) => `  • ${byId(i.id)?.name ?? i.id} × ${i.qty}`)
        .join("\n");
      const isMonthly = order.mode === "monthly";

      try {
        const { error } = await resend.emails.send({
          from: process.env.EMAIL_FROM ?? "Grace Spring Water <onboarding@resend.dev>",
          to: [order.email],
          subject: "Your water is still in your cart 💧",
          text:
            `Hi ${order.address.firstName},\n\n` +
            `You left these behind:\n\n${itemLines}\n\n` +
            (order.savings > 0 ? `Your cart includes ${money(order.savings)} in free bottles.\n` : "") +
            (isMonthly
              ? `Enroll in monthly refill and we'll just remind you before each delivery — no auto-charges.\n`
              : `Flat ${money(order.shipping)} shipping. A team member calls to confirm your route & first delivery.\n`) +
            `\nPick up where you left off: ${siteUrl}/checkout\n\n` +
            `Not ready yet? No problem — this cart will be here when you are.\n\n` +
            `— Grace Spring Water · Fresh spring water, delivered to your door.`,
        });
        if (error) console.error("Abandoned-cart email failed", order.orderNumber, error);
      } catch (err) {
        console.error("Abandoned-cart email failed", order.orderNumber, err);
      }
    }
  },
});

/* Delivery-completed notification, fired when a driver marks a stop
   delivered. Failures are logged, never fatal. */
export const sendDeliveredEmail = internalAction({
  args: { orderId: v.id("orders") },
  handler: async (ctx, args) => {
    const apiKey = process.env.AUTH_RESEND_KEY;
    if (!apiKey) return;
    const order: any = await ctx.runQuery(internal.orders.getOrderById, { orderId: args.orderId });
    if (!order) return;
    try {
      const resend = new Resend(apiKey);
      const { error } = await resend.emails.send({
        from: process.env.EMAIL_FROM ?? "Grace Spring Water <onboarding@resend.dev>",
        to: [order.email],
        subject: `Your water has arrived 📦 — Order ${order.orderNumber}`,
        text:
          `Hi ${order.address.firstName},\n\n` +
          `Your Grace Spring delivery (order ${order.orderNumber}) was just dropped off at ` +
          `${order.address.street}, ${order.address.city}.\n\n` +
          `Every delivery is photo-documented. If anything arrived damaged, keep it — ` +
          `reply to this email and we'll send a free replacement.\n\n` +
          `Stay hydrated!\n— Grace Spring Water`,
      });
      if (error) console.error("Delivered email failed", error);
    } catch (err) {
      console.error("Delivered email failed", err);
    }
  },
});

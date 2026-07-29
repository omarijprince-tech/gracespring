"use client";

/* Landed here from Stripe Checkout's success redirect. Payment is confirmed
   by the webhook server-side; this page clears the local cart and points the
   customer at their account. */

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useCart } from "../../../lib/cart-context";
import { useLang } from "../../../lib/lang-context";
import { track } from "../../../lib/analytics";

export default function SuccessClient() {
  const { clearCart, hydrated } = useCart();
  const { L } = useLang();
  const cleared = useRef(false);

  useEffect(() => {
    if (!hydrated || cleared.current) return;
    cleared.current = true;
    clearCart();
    track("purchase_completed", { via: "stripe_checkout" });
  }, [hydrated, clearCart]);

  return (
    <div className="order-confirm">
      <div className="big-check">✓</div>
      <h1>{L("Payment received — order confirmed!", "¡Pago recibido — pedido confirmado!")}</h1>
      <p>
        {L("Thanks for choosing Grace Spring. Your receipt is on its way from Stripe, and your order details are in your account. We'll confirm your delivery day shortly.",
           "Gracias por elegir Grace Spring. Tu recibo va en camino desde Stripe y los detalles del pedido están en tu cuenta. Pronto te confirmaremos el día de entrega.")}
      </p>
      <Link className="btn btn-primary" href="/account">{L("View in My Account", "Ver en Mi Cuenta")}</Link>
      <Link className="btn btn-outline" href="/" style={{ marginLeft: 10 }}>{L("Back to Home", "Volver al inicio")}</Link>
    </div>
  );
}

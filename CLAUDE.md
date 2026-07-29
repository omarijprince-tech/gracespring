"use client";

/* Checkout — reads the shared cart, renders the summary, and places the
   order in Convex (server-side price validation). Stripe Checkout handles
   payment; falls back to a demo confirmation until keys are configured. */

import { useState } from "react";
import Link from "next/link";
import { useAction, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { byId, checkZip, money, COOLER, DELIVERY } from "../../lib/catalog";
import { track } from "../../lib/analytics";
import { useCart } from "../../lib/cart-context";
import { useLang } from "../../lib/lang-context";

const NOTIFY = [
  ["text", "Text", "Mensaje"],
  ["email", "Email", "Correo"],
  ["phone", "Phone Call", "Llamada"],
];

export default function CheckoutClient() {
  const { cart, totals: t, setMode, setNotifyMethod, clearCart, hydrated } = useCart();
  const { L } = useLang();
  const placeOrderMutation = useMutation(api.orders.placeOrder);
  const createCheckoutSession = useAction(api.stripe.createCheckoutSession);
  const [zipError, setZipError] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [placeError, setPlaceError] = useState("");
  const [confirmed, setConfirmed] = useState(null);

  const isMonthly = cart.mode === "monthly";

  if (!hydrated) return null;

  if (confirmed) {
    return (
      <div className="order-confirm">
        <div className="big-check">✓</div>
        <h1>{L("Order confirmed!", "¡Pedido confirmado!")}</h1>
        <p>{confirmed.msg}</p>
        <Link className="btn btn-primary" href="/account">{L("View in My Account", "Ver en Mi Cuenta")}</Link>
        <Link className="btn btn-outline" href="/" style={{ marginLeft: 10 }}>{L("Back to Home", "Volver al inicio")}</Link>
      </div>
    );
  }

  if (cart.items.length === 0 && !cart.cooler) {
    return (
      <div className="checkout-layout">
        <div className="panel" style={{ gridColumn: "1/-1", textAlign: "center" }}>
          <h2>{L("Your cart is empty", "Tu carrito está vacío")}</h2>
          <p style={{ color: "var(--muted)", marginBottom: 18 }}>{L("Head back to the shop to add some water.", "Regresa a la tienda y agrega agua.")}</p>
          <Link className="btn btn-primary" href="/#shop">{L("Start Your Order", "Haz tu pedido")}</Link>
        </div>
      </div>
    );
  }

  const placeOrder = async () => {
    const form = document.getElementById("checkoutForm");
    if (!form.reportValidity()) return;

    const zip = document.getElementById("zip").value.trim();
    if (!checkZip(zip)) {
      setZipError(true);
      document.getElementById("zip").focus();
      return;
    }
    setZipError(false);
    setPlaceError("");

    const val = (id) => document.getElementById(id).value.trim();
    const windowVal = document.getElementById("window").value;

    const orderPayload = {
      email: val("email").toLowerCase(),
      mode: cart.mode,                       // "one-time" | "monthly"
      items: cart.items.map((i) => ({ id: i.id, qty: i.qty })),
      cooler: cart.cooler ? { loader: cart.cooler.loader, color: cart.cooler.color } : undefined,
      notifyMethod: cart.notifyMethod || "text",
      deliveryWindow: windowVal,
      address: {
        firstName: val("fName"),
        lastName: val("lName"),
        phone: val("phone"),
        street: val("addr"),
        city: val("city"),
        zip,
      },
    };

    setPlacing(true);

    // Stripe Checkout first; falls back to demo mode until keys are configured
    try {
      const { url } = await createCheckoutSession(orderPayload);
      track("checkout_redirected_to_stripe", { mode: cart.mode, units: t.units });
      window.location.href = url;
      return;
    } catch (err) {
      const notConfigured = err?.data === "STRIPE_NOT_CONFIGURED" ||
        String(err?.message || err).includes("STRIPE_NOT_CONFIGURED");
      if (!notConfigured) {
        setPlaceError(L("Couldn't start the payment — check your connection and try again.",
                        "No se pudo iniciar el pago — revisa tu conexión e inténtalo de nuevo."));
        setPlacing(false);
        return;
      }
    }

    try {
      const result = await placeOrderMutation(orderPayload);
      track("purchase_completed", { order_id: result.orderNumber, mode: cart.mode, units: t.units, total: result.total });
      track("revenue", { order_id: result.orderNumber, value: result.total, currency: "USD" });
      clearCart();
      setConfirmed({
        msg: isMonthly
          ? L(`You're enrolled in monthly refill! Order ${result.orderNumber} — ${money(result.total)}. We'll remind you before each delivery. (Demo — no payment was processed.)`,
              `¡Estás inscrito en el servicio mensual! Pedido ${result.orderNumber} — ${money(result.total)}. Te recordaremos antes de cada entrega. (Demo — no se procesó ningún pago.)`)
          : L(`Order ${result.orderNumber} confirmed — ${money(result.total)}. We'll call to confirm your delivery day. (Demo — no payment was processed.)`,
              `Pedido ${result.orderNumber} confirmado — ${money(result.total)}. Llamaremos para confirmar el día de entrega. (Demo — no se procesó ningún pago.)`),
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setPlaceError(L("Couldn't place the order — check your connection and try again.",
                      "No se pudo hacer el pedido — revisa tu conexión e inténtalo de nuevo."));
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="checkout-layout">
      <div>
        <div className="panel">
          <h2>{L("Delivery details", "Datos de entrega")}</h2>
          <form id="checkoutForm" className="form-grid" noValidate>
            <div className="field"><label htmlFor="fName">{L("First name", "Nombre")}</label><input id="fName" autoComplete="given-name" required /></div>
            <div className="field"><label htmlFor="lName">{L("Last name", "Apellido")}</label><input id="lName" autoComplete="family-name" required /></div>
            <div className="field"><label htmlFor="email">{L("Email", "Correo electrónico")}</label><input id="email" type="email" autoComplete="email" required /></div>
            <div className="field"><label htmlFor="phone">{L("Phone", "Teléfono")}</label><input id="phone" type="tel" autoComplete="tel" required /></div>
            <div className="field full"><label htmlFor="addr">{L("Street address", "Dirección")}</label><input id="addr" autoComplete="street-address" required /></div>
            <div className="field"><label htmlFor="city">{L("City", "Ciudad")}</label><input id="city" autoComplete="address-level2" required /></div>
            <div className="field"><label htmlFor="zip">{L("ZIP code", "Código postal")}</label><input id="zip" inputMode="numeric" pattern="[0-9]{5}" maxLength={5} autoComplete="postal-code" required />
              <p className="field-hint" style={zipError ? { color: "#b91c1c" } : undefined}>
                {zipError
                  ? L("⚠ This ZIP is outside our delivery area — we currently serve northern NJ and the five NYC boroughs.",
                      "⚠ Este código postal está fuera de nuestra zona — por ahora servimos el norte de NJ y los cinco condados de NYC.")
                  : L("We'll confirm delivery coverage for your ZIP.", "Confirmaremos la cobertura para tu código postal.")}
              </p></div>
            <div className="field full"><label htmlFor="window">{L("Preferred delivery window", "Horario de entrega preferido")}</label>
              <select id="window" defaultValue="Morning · 8 AM – 12 PM">
                <option value="Morning · 8 AM – 12 PM">{L("Morning · 8 AM – 12 PM", "Mañana · 8 AM – 12 PM")}</option>
                <option value="Afternoon · 12 PM – 4 PM">{L("Afternoon · 12 PM – 4 PM", "Tarde · 12 PM – 4 PM")}</option>
                <option value="Evening · 4 PM – 8 PM">{L("Evening · 4 PM – 8 PM", "Noche · 4 PM – 8 PM")}</option>
              </select>
              <p className="field-hint">{L("A team member calls to confirm your route & first delivery date.", "Un miembro del equipo llama para confirmar tu ruta y primera entrega.")}</p>
            </div>
          </form>
        </div>

        <div className="panel">
          <h2>{L("Delivery type", "Tipo de entrega")}</h2>
          <div className="freq-options">
            {[
              { value: "one-time", title: L("One-time Order", "Pedido único"), desc: L("A single delivery. No recurring charges. A team member calls to confirm your date.", "Una sola entrega, sin cobros recurrentes. Te llamamos para confirmar la fecha.") },
              { value: "monthly", title: L("Monthly Refill Service", "Servicio mensual de recarga"), desc: L("We remind you the day before each delivery — reply with how many jugs. No auto-charges.", "Te recordamos el día antes de cada entrega — responde cuántos garrafones. Sin cargos automáticos.") },
            ].map((f) => (
              <label className="freq-option" key={f.value}>
                <input type="radio" name="mode" value={f.value} checked={cart.mode === f.value} onChange={() => setMode(f.value)} />
                <span>
                  <span className="freq-title">{f.title}</span>
                  <span className="freq-desc">{f.desc}</span>
                </span>
              </label>
            ))}
          </div>
          {isMonthly && (
            <div className="notify-box" style={{ marginTop: 14 }}>
              <strong>{L("How would you like to be reminded?", "¿Cómo quieres que te recordemos?")}</strong>
              <div className="notify-opts">
                {NOTIFY.map(([v, en, es]) => (
                  <button key={v} type="button" className={cart.notifyMethod === v ? "sel" : ""} onClick={() => setNotifyMethod(v)}>{L(en, es)}</button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="panel">
          <h2>{L("Payment", "Pago")}</h2>
          <div className="stripe-placeholder">
            {L(<>🔒 <strong>Secure checkout powered by Stripe.</strong> After clicking Place Order you&apos;ll
            be taken to Stripe&apos;s payment page — card, Apple&nbsp;Pay, and Google&nbsp;Pay. We never
            see or store your card details.</>,
               <>🔒 <strong>Pago seguro con Stripe.</strong> Al hacer tu pedido pasarás a la página de pago
            de Stripe — tarjeta, Apple&nbsp;Pay y Google&nbsp;Pay. Nunca vemos ni guardamos los datos de tu tarjeta.</>)}
          </div>
        </div>
      </div>

      <div className="panel" id="summaryPanel">
        <h2>{L("Order summary", "Resumen del pedido")}</h2>
        <div className="summary-list">
          {cart.items.map((i) => {
            const p = byId(i.id);
            return <div className="summary-item" key={i.id}><span>{p.name} × {i.qty}</span><span>{money(p.price * i.qty)}</span></div>;
          })}
          {cart.cooler && (
            <div className="summary-item"><span>{L("Avalon Cooler", "Dispensador Avalon")} · {cart.cooler.loader} · {cart.cooler.color}</span><span>{money(COOLER.price)}</span></div>
          )}
          {t.freeBottles.length > 0 && (
            <div className="summary-item">
              <span>{t.freeBottles.length}× {byId(COOLER.freeBottleId).name} + {L("stand", "estante")} <span className="free-badge">{L("FREE", "GRATIS")}</span></span>
              <span><s className="muted">{money(t.freeBottleValue)}</s> $0.00</span>
            </div>
          )}
        </div>
        <div className="cart-foot" style={{ border: "none", padding: 0 }}>
          <div className="total-row"><span>{L(`Subtotal (${t.units} item${t.units === 1 ? "" : "s"})`, `Subtotal (${t.units} art.)`)}</span><span>{money(t.subtotal)}</span></div>
          {t.deposit > 0 && (
            <div className="total-row"><span>{L("Initial Bottle Deposit", "Depósito inicial")}<small className="sub-note">{L("One-time · refundable", "Único · reembolsable")}</small></span><span className="plus">+{money(t.deposit)}</span></div>
          )}
          <div className="total-row"><span>{L("Shipping", "Envío")}</span><span className="plus">+{money(t.shipping)}</span></div>
          <div className="total-row grand"><span>{L("Order Total", "Total del pedido")}</span><span>{money(t.total)}</span></div>
        </div>
        <button className="btn btn-primary btn-block" style={{ marginTop: 14 }} onClick={placeOrder} disabled={placing}>
          {placing ? L("Starting secure checkout…", "Iniciando pago seguro…") : L("Place Order", "Hacer pedido")}
        </button>
        {placeError && <p className="field-hint" role="alert" style={{ color: "#b91c1c", marginTop: 8 }}>{placeError}</p>}
        <p className="cart-note" style={{ marginTop: 10 }}>
          {isMonthly
            ? L(`Monthly refill service — no auto-charge. We remind you before each delivery. Flat ${money(DELIVERY.shipping)} shipping.`,
                `Servicio mensual — sin cargo automático. Te recordamos antes de cada entrega. Envío fijo de ${money(DELIVERY.shipping)}.`)
            : L(`One-time order. No recurring charges. Flat ${money(DELIVERY.shipping)} shipping.`, `Pedido único. Sin cobros recurrentes. Envío fijo de ${money(DELIVERY.shipping)}.`)}
        </p>
      </div>
    </div>
  );
}

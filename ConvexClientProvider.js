"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { byId, money, DEPOSIT, DELIVERY, COOLER } from "../lib/catalog";
import { track } from "../lib/analytics";
import { useCart } from "../lib/cart-context";
import { useLang } from "../lib/lang-context";
import ProductImage from "./ProductImage";

const NOTIFY = [
  ["text", "Text", "Mensaje"],
  ["email", "Email", "Correo"],
  ["phone", "Phone Call", "Llamada"],
];

export default function CartDrawer() {
  const router = useRouter();
  const { L } = useLang();
  const {
    cart, totals: t, adjustQty, setMode, removeCooler, setNotifyMethod,
    drawerOpen, closeCart,
  } = useCart();

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") closeCart(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [closeCart]);

  const isMonthly = cart.mode === "monthly";
  const isEmpty = cart.items.length === 0 && !cart.cooler;

  const goCheckout = () => {
    track("checkout_started", {
      mode: t.mode, units: t.units,
      subtotal: +t.subtotal.toFixed(2), deposit: +t.deposit.toFixed(2), total: +t.total.toFixed(2),
    });
    closeCart();
    router.push("/checkout");
  };

  return (
    <>
      <div className={`overlay${drawerOpen ? " open" : ""}`} onClick={closeCart} />
      <aside className={`cart-drawer${drawerOpen ? " open" : ""}`} aria-label={L("Shopping cart", "Carrito de compras")} aria-hidden={!drawerOpen}>
        <div className="cart-head">
          <h2>{L("Your Cart", "Tu carrito")}</h2>
          <button className="icon-btn" onClick={closeCart} aria-label={L("Close cart", "Cerrar carrito")}>✕</button>
        </div>

        <div className="cart-body">
          {isEmpty ? (
            <div className="cart-empty">
              <p style={{ fontSize: "2rem" }}>💧</p>
              <p>{L("Your cart is empty.", "Tu carrito está vacío.")}</p>
              <p style={{ fontSize: "0.85rem", marginTop: 6 }}>{L("Add a few bottles — we'll bring them to your door.", "Agrega unas botellas — te las llevamos a tu puerta.")}</p>
            </div>
          ) : (
            <>
              <div className="cart-mode" role="tablist" aria-label={L("Order type", "Tipo de pedido")}>
                <button className={isMonthly ? "" : "active"} onClick={() => setMode("one-time")}>{L("One-Time", "Una vez")}</button>
                <button className={isMonthly ? "active" : ""} onClick={() => setMode("monthly")}>{L("Monthly Delivery", "Entrega mensual")}</button>
              </div>

              {cart.items.map((i) => {
                const p = byId(i.id);
                return (
                  <div className="cart-item" key={i.id}>
                    <div className="cart-item-thumb"><ProductImage product={p} /></div>
                    <div className="cart-item-info">
                      <h4>{p.name}</h4>
                      <span className="line-price">{money(p.price)} × {i.qty}{p.deposit ? L(" · +$5 deposit ea.", " · +$5 depósito c/u") : ""}</span>
                    </div>
                    <div className="qty-stepper">
                      <button onClick={() => adjustQty(i.id, -1)} aria-label={L("Decrease", "Menos")}>−</button>
                      <output>{i.qty}</output>
                      <button onClick={() => adjustQty(i.id, 1)} aria-label={L("Increase", "Más")}>+</button>
                    </div>
                  </div>
                );
              })}

              {cart.cooler && (
                <div className="cart-item">
                  <div className="cart-item-thumb" aria-hidden="true">🧊</div>
                  <div className="cart-item-info">
                    <h4>{L("Avalon Water Cooler", "Dispensador Avalon")}</h4>
                    <span className="line-price">{cart.cooler.loader} · {cart.cooler.color} · {money(COOLER.price)}</span>
                    <span className="free-note">{L("+ 5 bottles & a stand, free", "+ 5 botellas y un estante, gratis")}</span>
                  </div>
                  <button className="link-btn" onClick={removeCooler}>{L("Remove", "Quitar")}</button>
                </div>
              )}
            </>
          )}
        </div>

        <div className="cart-foot">
          {isEmpty ? (
            <a className="btn btn-primary btn-block" href="/#shop" onClick={closeCart}>{L("Start Your Order", "Haz tu pedido")}</a>
          ) : (
            <>
              <div className="notify-box">
                <strong>{L("How would you like to be reminded?", "¿Cómo quieres que te recordemos?")}</strong>
                <p>{L("We'll remind you each month the day before delivery — just reply with how many jugs you'd like.",
                      "Te recordaremos cada mes el día antes de la entrega — solo responde cuántos garrafones quieres.")}</p>
                <div className="notify-opts">
                  {NOTIFY.map(([val, en, es]) => (
                    <button
                      key={val}
                      className={cart.notifyMethod === val ? "sel" : ""}
                      onClick={() => setNotifyMethod(val)}
                    >{L(en, es)}</button>
                  ))}
                </div>
              </div>

              <div className="total-row"><span>{L(`Subtotal (${t.units} item${t.units === 1 ? "" : "s"})`, `Subtotal (${t.units} art.)`)}</span><span>{money(t.subtotal)}</span></div>
              {t.deposit > 0 && (
                <div className="total-row">
                  <span>{L("Initial Bottle Deposit", "Depósito inicial de botella")}<small className="sub-note">{L("One-time · refundable on empty return", "Único · reembolsable al devolver vacíos")}</small></span>
                  <span className="plus">+{money(t.deposit)}</span>
                </div>
              )}
              <div className="total-row"><span>{L("Shipping", "Envío")}</span><span className="plus">+{money(t.shipping)}</span></div>
              <div className="total-row grand"><span>{L("Order Total", "Total del pedido")}</span><span>{money(t.total)}</span></div>

              <button className="btn btn-primary btn-block" onClick={goCheckout}>{L("Checkout", "Pagar")}</button>
              <p className="cart-note">
                {L(`After checkout we call to confirm your address & first delivery. Flat ${money(DELIVERY.shipping)} shipping.`,
                   `Después de la compra llamamos para confirmar tu dirección y primera entrega. Envío fijo de ${money(DELIVERY.shipping)}.`)}
              </p>
            </>
          )}
        </div>
      </aside>
    </>
  );
}

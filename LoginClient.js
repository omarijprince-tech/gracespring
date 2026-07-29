"use client";

/* Account page — real orders + monthly-refill status from Convex for
   signed-in users. There is no auto-charge subscription; "monthly refill"
   is a reminder enrollment derived from the customer's orders. */

import Link from "next/link";
import { useConvexAuth, useQuery } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "../../convex/_generated/api";
import { byId, money } from "../../lib/catalog";
import { useLang } from "../../lib/lang-context";

function itemsText(items) {
  return (items ?? []).map((i) => `${byId(i.id)?.name ?? i.id} × ${i.qty}`).join(" · ");
}

const NOTIFY_LABEL = {
  text: ["Text message", "Mensaje de texto"],
  email: ["Email", "Correo"],
  phone: ["Phone call", "Llamada"],
};

export default function AccountClient() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { signOut } = useAuthActions();
  const { L } = useLang();
  const me = useQuery(api.users.me, isAuthenticated ? {} : "skip");
  const orders = useQuery(api.orders.myOrders, isAuthenticated ? {} : "skip");

  if (isLoading) return null;

  if (!isAuthenticated) {
    return (
      <div className="panel auth-panel" style={{ margin: "40px auto", maxWidth: 440, textAlign: "center" }}>
        <h1 style={{ fontSize: "1.4rem", marginBottom: 8 }}>{L("My Account", "Mi Cuenta")}</h1>
        <p style={{ color: "var(--muted)", fontSize: "0.95rem", marginBottom: 18 }}>
          {L("Sign in to see your orders and manage your monthly refill reminders. Orders you placed as a guest appear automatically when you create an account with the same email.",
             "Inicia sesión para ver tus pedidos y gestionar tus recordatorios de recarga mensual. Los pedidos que hiciste como invitado aparecen automáticamente al crear una cuenta con el mismo correo.")}
        </p>
        <Link className="btn btn-primary btn-block" href="/login">{L("Sign In / Create Account", "Iniciar sesión / Crear cuenta")}</Link>
      </div>
    );
  }

  // Derive refill status from the most recent monthly order.
  const monthlyOrder = (orders ?? []).find((o) => o.mode === "monthly");
  const notify = monthlyOrder?.notifyMethod ?? "text";

  return (
    <>
      <div className="user-bar">
        <span>{L("Signed in as", "Sesión iniciada como")} <strong>{me?.email ?? "…"}</strong></span>
        <button className="btn btn-outline" onClick={() => void signOut()}>{L("Sign out", "Cerrar sesión")}</button>
      </div>

      <h1 style={{ fontSize: "1.6rem" }}>{L("My Account", "Mi Cuenta")}</h1>

      <div className="account-grid">
        <div className="panel">
          <h2>{L("Monthly Refill", "Recarga mensual")}</h2>
          {orders === undefined ? null : !monthlyOrder ? (
            <>
              <p style={{ color: "var(--muted)", fontSize: "0.92rem", marginBottom: 14 }}>
                {L("You're not enrolled in monthly refill. Enroll and we'll remind you the day before each delivery — no auto-charges, cancel anytime.",
                   "No estás inscrito en la recarga mensual. Inscríbete y te recordaremos el día antes de cada entrega — sin cargos automáticos, cancela cuando quieras.")}
              </p>
              <Link className="btn btn-primary btn-block" href="/#shop">{L("Start Refill Service", "Iniciar servicio")}</Link>
            </>
          ) : (
            <>
              <div className="summary-list">
                <div className="summary-item"><span>{L("Status", "Estado")}</span><span className="status-pill active">{L("Enrolled", "Inscrito")}</span></div>
                <div className="summary-item"><span>{L("We remind you by", "Te recordamos por")}</span><span>{L(NOTIFY_LABEL[notify][0], NOTIFY_LABEL[notify][1])}</span></div>
                <div className="summary-item"><span>{L("Last order", "Último pedido")}</span><span className="muted" style={{ textAlign: "right" }}>{itemsText(monthlyOrder.items)}</span></div>
              </div>
              <p style={{ color: "var(--muted)", fontSize: "0.82rem", marginTop: 10 }}>
                {L("We'll remind you the day before each route — just reply with how many jugs. To pause or stop, call 973-742-0216.",
                   "Te recordaremos el día antes de cada ruta — solo responde cuántos garrafones. Para pausar o cancelar, llama al 973-742-0216.")}
              </p>
            </>
          )}
        </div>

        <div className="panel">
          <h2>{L("Payment & Addresses", "Pago y Direcciones")}</h2>
          <div className="summary-list">
            <div className="summary-item"><span>💳 {L("Payment method", "Método de pago")}</span><span className="muted">{L("Handled securely via Stripe at checkout", "Se gestiona de forma segura vía Stripe al pagar")}</span></div>
            <div className="summary-item"><span>🏠 {L("Delivery address", "Dirección de entrega")}</span><span className="muted">{L("Saved with each order", "Se guarda con cada pedido")}</span></div>
          </div>
          <button className="btn btn-outline btn-block" disabled>{L("Manage (enabled at launch)", "Gestionar (disponible al lanzar)")}</button>
        </div>
      </div>

      <div className="panel">
        <h2>{L("Order History", "Historial de pedidos")}</h2>
        {orders === undefined ? null : orders.length === 0 ? (
          <p style={{ color: "var(--muted)", fontSize: "0.92rem" }}>{L("No orders yet.", "Aún no hay pedidos.")}{" "}
            <Link href="/#shop">{L("Start your first order", "Haz tu primer pedido")}</Link>.</p>
        ) : (
          orders.map((o) => (
            <div className="order-row" key={o._id}>
              <span><strong>{o.orderNumber}</strong>
                {" "}<span className={`status-pill ${o.status === "delivered" ? "" : "ok"}`} style={{ background: o.status === "delivered" ? "var(--success-bg)" : "var(--pale)", color: o.status === "delivered" ? "var(--success)" : "var(--navy)", fontSize: "0.68rem" }}>{o.status}</span>
                <br />
                <span style={{ color: "var(--muted)", fontSize: "0.82rem" }}>
                  {new Date(o._creationTime).toLocaleDateString(L("en-US", "es-US"), { month: "short", day: "numeric", year: "numeric" })}
                  {" · "}{itemsText(o.items)}
                  {o.cooler ? L(" · + cooler (5 free bottles)", " · + dispensador (5 botellas gratis)") : ""}
                </span>
                {o.address && (
                  <><br /><span style={{ color: "var(--muted)", fontSize: "0.8rem" }}>
                    🏠 {o.address.street}, {o.address.city} {o.address.zip}
                    {o.deliveryWindow ? ` · 🕘 ${o.deliveryWindow}` : ""}
                  </span></>
                )}
              </span>
              <span style={{ textAlign: "right" }}>
                <span className="status-pill ok" style={{ background: "var(--pale)", color: "var(--navy)" }}>
                  {o.mode === "monthly" ? L("Monthly refill", "Recarga mensual") : L("One-time", "Única")}</span><br />
                <strong>{money(o.total)}</strong>
                {o.deposit > 0 && <><br /><span style={{ color: "var(--muted)", fontSize: "0.75rem" }}>{L("incl.", "incl.")} {money(o.deposit)} {L("deposit", "depósito")}</span></>}
              </span>
            </div>
          ))
        )}
      </div>
    </>
  );
}

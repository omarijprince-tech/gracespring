"use client";

/* Grace Spring operations dashboard (admin-only).
   Orders board with status pipeline, proof-of-delivery photos, notes,
   replacements (damage policy) and refunds (theft policy) + customer roster. */

import { useRef, useState } from "react";
import Link from "next/link";
import { useConvexAuth, useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { byId, money } from "../../lib/catalog";
import { useCart } from "../../lib/cart-context";
import { useLang } from "../../lib/lang-context";
import DashboardTab from "./DashboardTab";
import RoutesTab from "./RoutesTab";

const STATUS_FLOW = { placed: "confirmed", confirmed: "out-for-delivery", "out-for-delivery": "delivered" };
const statusLabels = (L) => ({
  pending: L("Pending payment", "Pago pendiente"), placed: L("Placed", "Recibido"), confirmed: L("Confirmed", "Confirmado"),
  "out-for-delivery": L("Out for delivery", "En reparto"), delivered: L("Delivered", "Entregado"),
  cancelled: L("Cancelled", "Cancelado"), refunded: L("Refunded", "Reembolsado"),
});
const nextLabels = (L) => ({
  placed: L("Confirm", "Confirmar"), confirmed: L("Out for delivery", "En reparto"),
  "out-for-delivery": L("Mark delivered", "Marcar entregado"),
});

function fmtDate(ts) {
  return new Date(ts).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

function OrderCard({ o }) {
  const { showToast } = useCart();
  const { L } = useLang();
  const STATUS_LABELS = statusLabels(L);
  const NEXT_LABEL = nextLabels(L);
  const setStatus = useMutation(api.admin.setOrderStatus);
  const setNotes = useMutation(api.admin.setAdminNotes);
  const genUpload = useMutation(api.admin.generateUploadUrl);
  const attachPhoto = useMutation(api.admin.attachDeliveryPhoto);
  const makeReplacement = useMutation(api.admin.createReplacementOrder);
  const refund = useAction(api.stripe.adminRefundOrder);
  const [expanded, setExpanded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notesDraft, setNotesDraft] = useState(null);
  const fileRef = useRef(null);

  const act = async (fn, okMsg) => {
    setBusy(true);
    try { await fn(); if (okMsg) showToast(okMsg, "success"); }
    catch (e) { showToast(String(e?.message || L("Something went wrong.", "Algo salió mal."))); }
    finally { setBusy(false); }
  };

  const uploadPhoto = async (file) => {
    if (!file) return;
    await act(async () => {
      const url = await genUpload();
      const res = await fetch(url, { method: "POST", headers: { "Content-Type": file.type }, body: file });
      const { storageId } = await res.json();
      await attachPhoto({ orderId: o._id, storageId });
    }, L("Delivery photo attached ✓", "Foto de entrega guardada ✓"));
  };

  const next = STATUS_FLOW[o.status];

  return (
    <div className="panel" style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12, flexWrap: "wrap", cursor: "pointer" }}
        onClick={() => setExpanded((e) => !e)}>
        <span>
          <strong>{o.orderNumber}</strong>
          {o.replacementFor && <span className="muted" style={{ fontSize: "0.8rem" }}> · {L("replaces", "reemplaza a")} {o.replacementFor}</span>}
          <br />
          <span style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
            {fmtDate(o._creationTime)} · {o.address.firstName} {o.address.lastName} · {o.email}
          </span>
        </span>
        <span style={{ textAlign: "right" }}>
          <span className="status-pill" style={{ background: "var(--pale)", color: "var(--navy)" }}>{STATUS_LABELS[o.status] ?? o.status}</span>
          <br /><strong>{o.total === 0 ? L("FREE", "GRATIS") : money(o.total)}</strong>
          <span className="muted" style={{ fontSize: "0.8rem" }}> · {o.mode === "monthly" ? L("monthly refill", "recarga mensual") : L("one-time", "única")}{o.cooler ? L(" · +cooler", " · +dispensador") : ""}</span>
        </span>
      </div>

      {expanded && (
        <div style={{ marginTop: 14, borderTop: "1.5px solid var(--line)", paddingTop: 14 }}>
          <div className="summary-list">
            <div className="summary-item"><span>{L("Items", "Productos")}</span><span style={{ textAlign: "right" }}>
              {o.items.map((i) => `${byId(i.id)?.name ?? i.id} × ${i.qty}`).join(" · ")}
              {o.cooler ? L(` · Avalon cooler (${o.cooler.loader}, ${o.cooler.color}) + 5 FREE bottles + stand`, ` · Dispensador Avalon (${o.cooler.loader}, ${o.cooler.color}) + 5 botellas GRATIS + estante`) : ""}</span></div>
            <div className="summary-item"><span>{L("Deliver to", "Entregar en")}</span><span>{o.address.street}, {o.address.city} {o.address.zip}</span></div>
            <div className="summary-item"><span>{L("Window", "Horario")}</span><span>{o.deliveryWindow}</span></div>
            {o.statusHistory?.length > 0 && (
              <div className="summary-item"><span>{L("History", "Historial")}</span><span style={{ textAlign: "right", fontSize: "0.8rem" }}>
                {o.statusHistory.map((h) => `${STATUS_LABELS[h.status] ?? h.status} · ${fmtDate(h.at)}`).join(" → ")}</span></div>
            )}
          </div>

          {o.photoUrls?.length > 0 && (
            <div style={{ display: "flex", gap: 8, margin: "12px 0", flexWrap: "wrap" }}>
              {o.photoUrls.map((u, i) => u && (
                <a key={i} href={u} target="_blank" rel="noopener noreferrer">
                  <img src={u} alt={`Delivery photo ${i + 1}`} style={{ width: 92, height: 92, objectFit: "cover", borderRadius: 10, border: "1.5px solid var(--line)" }} />
                </a>
              ))}
            </div>
          )}

          <textarea
            placeholder={L("Internal notes (gate codes, doorman, damage reports…)", "Notas internas (códigos de acceso, portero, reportes de daños…)")}
            value={notesDraft ?? o.adminNotes ?? ""}
            onChange={(e) => setNotesDraft(e.target.value)}
            onBlur={() => { if (notesDraft !== null && notesDraft !== (o.adminNotes ?? "")) act(() => setNotes({ orderId: o._id, notes: notesDraft }), L("Notes saved ✓", "Notas guardadas ✓")); }}
            style={{ width: "100%", minHeight: 56, margin: "10px 0", padding: 10, borderRadius: 9, border: "1.5px solid var(--line)", fontFamily: "inherit", fontSize: "0.88rem" }}
          />

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {next && (
              <button className="btn btn-primary" disabled={busy}
                onClick={() => act(() => setStatus({ orderId: o._id, status: next }), `${STATUS_LABELS[next]} ✓`)}>
                {NEXT_LABEL[o.status]}
              </button>
            )}
            {["confirmed", "out-for-delivery", "delivered"].includes(o.status) && (
              <>
                <button className="btn btn-outline" disabled={busy} onClick={() => fileRef.current?.click()}>📷 {L("Add delivery photo", "Agregar foto de entrega")}</button>
                <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => uploadPhoto(e.target.files?.[0])} />
              </>
            )}
            {o.status === "delivered" && o.total > 0 && (
              <button className="btn btn-outline" disabled={busy}
                onClick={() => window.confirm(L(`Send a free replacement of ${o.orderNumber}? (Damage policy — customer keeps the damaged order.)`,
                                               `¿Enviar un reemplazo gratis del pedido ${o.orderNumber}? (Política de daños — el cliente se queda con el pedido dañado.)`)) &&
                  act(async () => { const r = await makeReplacement({ orderId: o._id }); showToast(L(`Replacement ${r.orderNumber} created ✓`, `Reemplazo ${r.orderNumber} creado ✓`), "success"); })}>
                {L("Replace (damaged)", "Reemplazar (dañado)")}
              </button>
            )}
            {["placed", "confirmed", "out-for-delivery", "delivered"].includes(o.status) && o.total > 0 && (
              <button className="btn btn-outline" style={{ borderColor: "#b91c1c", color: "#b91c1c" }} disabled={busy}
                onClick={() => window.confirm(L(`Refund ${o.orderNumber} (${money(o.total)})? (Theft policy.)`,
                                               `¿Reembolsar ${o.orderNumber} (${money(o.total)})? (Política de robo.)`)) &&
                  act(async () => { const r = await refund({ orderId: o._id }); showToast(r.detail, "success"); })}>
                {L("Refund (stolen)", "Reembolsar (robado)")}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminClient() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { L } = useLang();
  const STATUS_LABELS = statusLabels(L);
  const isAdmin = useQuery(api.admin.amIAdmin, isAuthenticated ? {} : "skip");
  const [statusFilter, setStatusFilter] = useState("");
  const [tab, setTab] = useState("dashboard");
  const orders = useQuery(api.admin.allOrders, isAdmin ? { status: tab === "orders" && statusFilter ? statusFilter : undefined } : "skip");
  const customers = useQuery(api.admin.customers, isAdmin && tab !== "orders" ? {} : "skip");

  if (isLoading || (isAuthenticated && isAdmin === undefined)) return null;

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="panel auth-panel" style={{ margin: "40px auto", maxWidth: 440, textAlign: "center" }}>
        <h1 style={{ fontSize: "1.3rem", marginBottom: 8 }}>{L("Operations", "Operaciones")}</h1>
        <p style={{ color: "var(--muted)", fontSize: "0.92rem", marginBottom: 16 }}>
          {L("This area is for the Grace Spring team.", "Esta área es para el equipo de Grace Spring.")}{" "}
          {isAuthenticated ? L("Your account doesn't have admin access.", "Tu cuenta no tiene acceso de administrador.") : L("Sign in with an admin account.", "Inicia sesión con una cuenta de administrador.")}
        </p>
        {!isAuthenticated && <Link className="btn btn-primary btn-block" href="/login">{L("Sign In", "Iniciar sesión")}</Link>}
      </div>
    );
  }

  const counts = {};
  (orders ?? []).forEach((o) => { counts[o.status] = (counts[o.status] ?? 0) + 1; });

  return (
    <>
      <h1 style={{ fontSize: "1.6rem", marginBottom: 4 }}>{L("Operations", "Operaciones")}</h1>
      <p style={{ color: "var(--muted)", fontSize: "0.9rem", marginBottom: 18 }}>
        {L("Live order board — updates in real time as orders come in.", "Tablero de pedidos en vivo — se actualiza en tiempo real cuando llegan pedidos.")}
      </p>

      <div className="auth-tabs admin-tabs" style={{ maxWidth: 560, marginBottom: 18 }} role="tablist">
        <button className={tab === "dashboard" ? "active" : ""} onClick={() => setTab("dashboard")}>{L("Dashboard", "Panel")}</button>
        <button className={tab === "orders" ? "active" : ""} onClick={() => setTab("orders")}>{L("Orders", "Pedidos")}</button>
        <button className={tab === "routes" ? "active" : ""} onClick={() => setTab("routes")}>{L("Routes", "Rutas")}</button>
        <button className={tab === "customers" ? "active" : ""} onClick={() => setTab("customers")}>{L("Customers", "Clientes")}</button>
      </div>

      {tab === "dashboard" && <DashboardTab orders={orders} customers={customers} />}

      {tab === "routes" && <RoutesTab />}

      {tab === "orders" && (
        <>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
            {["", "placed", "confirmed", "out-for-delivery", "delivered", "refunded", "cancelled"].map((s) => (
              <button key={s || "all"} className="chip" style={statusFilter === s ? { borderColor: "var(--blue)", color: "var(--blue)" } : undefined}
                onClick={() => setStatusFilter(s)}>
                {s === "" ? L("All", "Todos") : STATUS_LABELS[s]}{s && counts[s] ? ` (${counts[s]})` : ""}
              </button>
            ))}
          </div>
          {orders === undefined ? <p className="muted">{L("Loading…", "Cargando…")}</p> :
            orders.length === 0 ? <p style={{ color: "var(--muted)" }}>{statusFilter ? L(`No orders with status "${STATUS_LABELS[statusFilter]}".`, `No hay pedidos con estado "${STATUS_LABELS[statusFilter]}".`) : L("No orders yet.", "Aún no hay pedidos.")}</p> :
              orders.map((o) => <OrderCard key={o._id} o={o} />)}
        </>
      )}

      {tab === "customers" && (
        <div className="panel">
          {customers === undefined ? <p className="muted">{L("Loading…", "Cargando…")}</p> :
            customers.length === 0 ? <p style={{ color: "var(--muted)" }}>{L("No customers yet.", "Aún no hay clientes.")}</p> :
              customers.map((c) => (
                <div className="order-row" key={c.email}>
                  <span><strong>{c.name}</strong><br />
                    <span style={{ color: "var(--muted)", fontSize: "0.82rem" }}>{c.email}</span></span>
                  <span style={{ textAlign: "right" }}>
                    {c.refill && <><span className="status-pill active">{L("monthly refill", "recarga mensual")}</span><br /></>}
                    <strong>{c.orders} {L(`order${c.orders !== 1 ? "s" : ""}`, `pedido${c.orders !== 1 ? "s" : ""}`)}</strong>
                    <span style={{ color: "var(--muted)", fontSize: "0.82rem" }}> · {money(c.revenue)} {L("lifetime", "histórico")}</span>
                  </span>
                </div>
              ))}
        </div>
      )}
    </>
  );
}

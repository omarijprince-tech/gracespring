"use client";

/* Dispatch: build a day's routes from open orders (auto-grouped by ZIP),
   get the pick list per truck, and send the driver a tokenized link. */

import { useMemo, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { byId } from "../../lib/catalog";
import { useCart } from "../../lib/cart-context";
import { useLang } from "../../lib/lang-context";

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/* Pick list: total cases per SKU across a set of stops (paid + free). */
function pickList(stops) {
  const sums = new Map();
  for (const s of stops) {
    for (const i of s.items) sums.set(i.id, (sums.get(i.id) ?? 0) + i.qty);
    /* free-case tracking removed */
  }
  return [...sums.entries()].map(([id, qty]) => `${qty}× ${byId(id)?.name ?? id}`);
}

const zipSort = (a, b) => a.zip.localeCompare(b.zip) || a.street.localeCompare(b.street);

export default function RoutesTab() {
  const { showToast } = useCart();
  const { L } = useLang();
  const open = useQuery(api.routes.openOrders, {});
  const routes = useQuery(api.routes.listRoutes, {});
  const createRoute = useMutation(api.routes.createRoute);
  const reorderStop = useMutation(api.routes.reorderStop);
  const removeStop = useMutation(api.routes.removeStop);
  const deleteRoute = useMutation(api.routes.deleteRoute);
  const markSent = useMutation(api.routes.markRouteSent);
  const optimizeRoute = useMutation(api.routes.optimizeRoute);

  const [selected, setSelected] = useState(new Set());
  const [driverName, setDriverName] = useState("");
  const [driverPhone, setDriverPhone] = useState("");
  const [busy, setBusy] = useState(false);

  const sortedOpen = useMemo(() => (open ? [...open].sort(zipSort) : []), [open]);

  const toggle = (id) => setSelected((prev) => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  const create = async () => {
    setBusy(true);
    try {
      const orderIds = sortedOpen.filter((o) => selected.has(o._id)).map((o) => o._id);
      await createRoute({ date: todayStr(), driverName: driverName || L("Driver", "Repartidor"), driverPhone: driverPhone || undefined, orderIds });
      setSelected(new Set()); setDriverName(""); setDriverPhone("");
      showToast(L("Route created ✓", "Ruta creada ✓"), "success");
    } catch (e) {
      showToast(String(e?.message ?? L("Couldn't create the route.", "No se pudo crear la ruta.")));
    } finally { setBusy(false); }
  };

  const routeLink = (r) => `${window.location.origin}/route/${r.token}`;
  const smsBody = (r) => encodeURIComponent(
    L(`Grace Spring deliveries for ${r.date} — ${r.stopDetails.length} stop${r.stopDetails.length !== 1 ? "s" : ""}. Open your route: ${routeLink(r)}`,
      `Entregas Grace Spring del ${r.date} — ${r.stopDetails.length} parada${r.stopDetails.length !== 1 ? "s" : ""}. Abre tu ruta: ${routeLink(r)}`));

  const copyLink = async (r) => {
    await navigator.clipboard.writeText(routeLink(r));
    markSent({ routeId: r._id });
    showToast(L("Driver link copied ✓", "Enlace del repartidor copiado ✓"), "success");
  };

  return (
    <>
      {/* Build a new route */}
      <div className="panel" style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: "1.05rem", marginBottom: 4 }}>{L("New route", "Nueva ruta")}</h2>
        <p style={{ color: "var(--muted)", fontSize: "0.85rem", marginBottom: 12 }}>
          {L("Check the orders for this truck and create the route — stops are automatically ordered into an efficient delivery sequence from the depot, with a one-tap Google Maps route for the driver.",
             "Marca los pedidos de este camión y crea la ruta — las paradas se ordenan automáticamente en una secuencia de entrega eficiente desde el depósito, con una ruta de Google Maps de un toque para el repartidor.")}
        </p>
        {open === undefined ? <p className="muted">{L("Loading…", "Cargando…")}</p> :
          sortedOpen.length === 0 ? <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>{L("No unrouted orders right now.", "No hay pedidos sin ruta por ahora.")}</p> : (
            <>
              {sortedOpen.map((o) => (
                <label key={o._id} style={{ display: "flex", gap: 10, alignItems: "center", padding: "8px 4px", borderBottom: "1px solid var(--line)", cursor: "pointer", fontSize: "0.9rem" }}>
                  <input type="checkbox" checked={selected.has(o._id)} onChange={() => toggle(o._id)} style={{ width: 17, height: 17 }} />
                  <span style={{ flex: 1 }}>
                    <strong>{o.zip}</strong> · {o.name} — {o.street}, {o.city}
                    <span style={{ color: "var(--muted)" }}> · {o.orderNumber}{o.replacementFor ? L(" (replacement)", " (reemplazo)") : ""}</span>
                  </span>
                  <span style={{ color: "var(--muted)", fontSize: "0.82rem", whiteSpace: "nowrap" }}>
                    {o.items.reduce((n, i) => n + i.qty, 0)} {L("items", "art.")}
                  </span>
                </label>
              ))}
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12 }}>
                <input placeholder={L("Driver name", "Nombre del repartidor")} value={driverName} onChange={(e) => setDriverName(e.target.value)}
                  style={{ flex: "1 1 140px", padding: "10px 14px", borderRadius: 9, border: "1.5px solid var(--line)", fontFamily: "inherit" }} />
                <input placeholder={L("Driver phone (optional)", "Teléfono del repartidor (opcional)")} value={driverPhone} onChange={(e) => setDriverPhone(e.target.value)}
                  style={{ flex: "1 1 140px", padding: "10px 14px", borderRadius: 9, border: "1.5px solid var(--line)", fontFamily: "inherit" }} />
                <button className="btn btn-primary" disabled={busy || selected.size === 0} onClick={create}>
                  {L(`Create route (${selected.size} stop${selected.size !== 1 ? "s" : ""})`, `Crear ruta (${selected.size} parada${selected.size !== 1 ? "s" : ""})`)}
                </button>
              </div>
            </>
          )}
      </div>

      {/* Existing routes */}
      {routes === undefined ? null : routes.length === 0 ? (
        <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>{L("No routes yet — build one above.", "Aún no hay rutas — crea una arriba.")}</p>
      ) : routes.map((r) => {
        const delivered = r.stopDetails.filter((s) => s.status === "delivered").length;
        return (
          <div className="panel" key={r._id} style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8, alignItems: "baseline" }}>
              <span><strong>{r.date}</strong> · {r.driverName}{r.driverPhone ? ` · ${r.driverPhone}` : ""}</span>
              <span className="status-pill" style={{ background: r.status === "complete" ? "var(--success-bg)" : "var(--pale)", color: r.status === "complete" ? "var(--success)" : "var(--navy)" }}>
                {r.status === "complete" ? L("Complete", "Completa") : L(`${delivered}/${r.stopDetails.length} delivered`, `${delivered}/${r.stopDetails.length} entregadas`)}
              </span>
            </div>

            <div style={{ background: "var(--pale)", borderRadius: 10, padding: "9px 13px", margin: "10px 0", fontSize: "0.88rem" }}>
              <strong>🚚 {L("Load:", "Cargar:")}</strong> {pickList(r.stopDetails).join(" · ")}
            </div>

            {r.stopDetails.map((s, i) => (
              <div key={s._id} style={{ display: "flex", gap: 8, alignItems: "center", padding: "6px 0", borderBottom: "1px solid var(--line)", fontSize: "0.88rem" }}>
                <span style={{ minWidth: 22, fontWeight: 700, color: s.status === "delivered" ? "var(--success)" : "var(--navy)" }}>
                  {s.status === "delivered" ? "✓" : i + 1}
                </span>
                <span style={{ flex: 1 }}>{s.name} — {s.street}, {s.city} {s.zip}
                  {s.photoCount > 0 && <span style={{ color: "var(--success)" }}> 📷</span>}</span>
                {r.status !== "complete" && s.status !== "delivered" && (
                  <span style={{ display: "flex", gap: 4 }}>
                    <button className="icon-btn" title={L("Earlier", "Antes")} onClick={() => reorderStop({ routeId: r._id, orderId: s._id, direction: -1 })}>↑</button>
                    <button className="icon-btn" title={L("Later", "Después")} onClick={() => reorderStop({ routeId: r._id, orderId: s._id, direction: 1 })}>↓</button>
                    <button className="icon-btn" title={L("Remove from route", "Quitar de la ruta")} onClick={() => removeStop({ routeId: r._id, orderId: s._id })}>✕</button>
                  </span>
                )}
              </div>
            ))}

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
              {r.mapsUrl && (
                <a className="btn btn-primary" href={r.mapsUrl} target="_blank" rel="noopener noreferrer">
                  🗺️ {L("Open route in Google Maps", "Abrir ruta en Google Maps")}
                </a>
              )}
              {r.status !== "complete" && r.stopDetails.length > 1 && (
                <button className="btn btn-outline" onClick={async () => { await optimizeRoute({ routeId: r._id }); showToast(L("Route re-optimized ✓", "Ruta reoptimizada ✓"), "success"); }}>
                  ⚡ {L("Auto-optimize order", "Optimizar orden")}
                </button>
              )}
              <button className="btn btn-outline" onClick={() => copyLink(r)}>{L("Copy driver link", "Copiar enlace del repartidor")}</button>
              {r.driverPhone && (
                <a className="btn btn-outline" href={`sms:${r.driverPhone}?&body=${smsBody(r)}`}
                  onClick={() => markSent({ routeId: r._id })}>{L(`Text it to ${r.driverName}`, `Enviar por SMS a ${r.driverName}`)}</a>
              )}
              {r.status !== "complete" && (
                <button className="btn btn-outline" style={{ borderColor: "#b91c1c", color: "#b91c1c" }}
                  onClick={() => window.confirm(L("Delete this route? Stops return to the unrouted pool.", "¿Eliminar esta ruta? Las paradas vuelven a la lista de pendientes.")) && deleteRoute({ routeId: r._id })}>
                  {L("Delete", "Eliminar")}
                </button>
              )}
            </div>
          </div>
        );
      })}
    </>
  );
}

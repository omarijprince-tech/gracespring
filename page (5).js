"use client";

/* Driver route view — opened from the tokenized link the dispatcher sends.
   No login: the token IS the credential. Built for one-thumb use in a truck. */

import { useRef, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { byId } from "../../../lib/catalog";
import { useLang } from "../../../lib/lang-context";

function itemsText(stop) {
  const lines = stop.items.map((i) => `${i.qty}× ${byId(i.id)?.name ?? i.id}`);
  /* no free-case lines in the Grace Spring model */
  return lines;
}

function Stop({ stop, index, token }) {
  const markDelivered = useMutation(api.routes.driverMarkDelivered);
  const uploadUrl = useMutation(api.routes.driverUploadUrl);
  const attachPhoto = useMutation(api.routes.driverAttachPhoto);
  const { L } = useLang();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const fileRef = useRef(null);
  const done = stop.status === "delivered";
  const mapsUrl = `https://maps.google.com/?q=${encodeURIComponent(`${stop.street}, ${stop.city} ${stop.zip}`)}`;

  const deliverWithPhoto = async (file) => {
    setBusy(true); setErr("");
    try {
      if (file) {
        const url = await uploadUrl({ token });
        const res = await fetch(url, { method: "POST", headers: { "Content-Type": file.type }, body: file });
        const { storageId } = await res.json();
        await attachPhoto({ token, orderId: stop._id, storageId });
      }
      await markDelivered({ token, orderId: stop._id });
    } catch (e) {
      setErr(L("Didn't save — check signal and try again.", "No se guardó — revisa la señal e inténtalo de nuevo."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="panel" style={{ marginBottom: 12, opacity: done ? 0.62 : 1 }}>
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
        <div style={{
          minWidth: 34, height: 34, borderRadius: "50%", display: "flex", alignItems: "center",
          justifyContent: "center", fontWeight: 700, color: "#fff",
          background: done ? "var(--success)" : "var(--blue)",
        }}>{done ? "✓" : index + 1}</div>
        <div style={{ flex: 1 }}>
          <strong style={{ fontSize: "1.02rem" }}>{stop.name}</strong>
          <div style={{ fontSize: "0.95rem" }}>{stop.street}, {stop.city} {stop.zip}</div>
          <div style={{ color: "var(--muted)", fontSize: "0.85rem" }}>{stop.deliveryWindow}</div>
          <ul style={{ listStyle: "none", margin: "8px 0", fontSize: "0.92rem", fontWeight: 600, color: "var(--navy)" }}>
            {itemsText(stop).map((l, i) => <li key={i}>💧 {l}</li>)}
          </ul>
          {stop.notes && (
            <div style={{ background: "var(--pale)", borderRadius: 9, padding: "7px 11px", fontSize: "0.85rem", marginBottom: 8 }}>
              📝 {stop.notes}
            </div>
          )}
          {stop.replacementFor && (
            <div style={{ fontSize: "0.8rem", color: "var(--muted)", marginBottom: 6 }}>
              {L(`Free replacement for order ${stop.replacementFor}`, `Reemplazo gratis del pedido ${stop.replacementFor}`)}
            </div>
          )}
          {err && <p style={{ color: "#b91c1c", fontSize: "0.85rem" }}>{err}</p>}
          {!done && (
            <div style={{ display: "grid", gap: 8, marginTop: 6 }}>
              <a className="btn btn-outline btn-block" href={mapsUrl} target="_blank" rel="noopener noreferrer">🧭 {L("Navigate", "Navegar")}</a>
              <button className="btn btn-primary btn-block" disabled={busy} onClick={() => fileRef.current?.click()}>
                {busy ? L("Saving…", "Guardando…") : L("📷 Photo + Delivered", "📷 Foto + Entregado")}
              </button>
              <button className="linklike" style={{ fontSize: "0.83rem" }} disabled={busy}
                onClick={() => window.confirm(L("Mark delivered without a photo?", "¿Marcar como entregado sin foto?")) && deliverWithPhoto(null)}>
                {L("Delivered without photo", "Entregado sin foto")}
              </button>
              <input ref={fileRef} type="file" accept="image/*" capture="environment" hidden
                onChange={(e) => deliverWithPhoto(e.target.files?.[0])} />
            </div>
          )}
          {done && stop.photoCount > 0 && (
            <div style={{ fontSize: "0.82rem", color: "var(--success)", fontWeight: 600 }}>✓ {L("Photo on file", "Foto guardada")}</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function RouteClient({ token }) {
  const route = useQuery(api.routes.routeByToken, { token });
  const { lang, setLang, L } = useLang();

  if (route === undefined) return null;
  if (route === null) {
    return (
      <main className="container" style={{ padding: "60px 0", textAlign: "center" }}>
        <h1 style={{ fontSize: "1.3rem" }}>{L("Route not found", "Ruta no encontrada")}</h1>
        <p style={{ color: "var(--muted)" }}>{L("This link may have been replaced — check with dispatch.", "Puede que este enlace haya sido reemplazado — consulta con despacho.")}</p>
      </main>
    );
  }

  const delivered = route.stopDetails.filter((s) => s.status === "delivered").length;

  return (
    <>
      <header className="site-header">
        <div className="container header-inner" style={{ justifyContent: "space-between" }}>
          <span className="brand" style={{ gap: 10 }}>
            <img src="/assets/logo-mark.png" alt="" width="38" height="38" />
            <span><span className="brand-name" style={{ fontSize: "1.05rem" }}>GRACE SPRING</span>
              <span className="brand-sub">Delivery Route</span></span>
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button className="lang-toggle" onClick={() => setLang(lang === "es" ? "en" : "es")}>
              {lang === "es" ? "EN" : "ES"}
            </button>
            <span style={{ fontWeight: 700, color: "var(--navy)", fontSize: "0.95rem" }}>
              {delivered}/{route.stopDetails.length} {L("done", "listas")}
            </span>
          </span>
        </div>
      </header>
      <main className="container" style={{ padding: "18px 0 60px" }}>
        <p style={{ color: "var(--muted)", fontSize: "0.9rem", marginBottom: 14 }}>
          {route.date} · {route.driverName} — {L("tap a stop when the water's at the door.", "toca una parada cuando el agua esté en la puerta.")}
        </p>
        {route.mapsUrl && (
          <a className="btn btn-primary btn-block" href={route.mapsUrl} target="_blank" rel="noopener noreferrer" style={{ marginBottom: 14 }}>
            🗺️ {L("Navigate the whole route", "Navegar toda la ruta")}
          </a>
        )}
        {route.stopDetails.map((s, i) => <Stop key={s._id} stop={s} index={i} token={token} />)}
        {delivered === route.stopDetails.length && (
          <div className="panel" style={{ textAlign: "center", background: "var(--success-bg)" }}>
            <strong style={{ color: "var(--success)" }}>{L("Route complete — thank you! 🎉", "Ruta completa — ¡gracias! 🎉")}</strong>
          </div>
        )}
      </main>
    </>
  );
}

"use client";

/* Contact form — bilingual (EN/ES via useLang). Submits to Convex, which
   stores the message and emails the support alias with reply-to set to the
   customer. */

import { useState } from "react";
import Link from "next/link";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useLang } from "../../lib/lang-context";

export default function ContactClient() {
  const { L } = useLang();
  const submit = useMutation(api.contact.submit);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const TOPICS = [
    ["Order or delivery", "Pedido o entrega"],
    ["Subscription", "Suscripción"],
    ["Damaged or missing delivery", "Entrega dañada o perdida"],
    ["Billing", "Facturación"],
    ["Delivery area", "Zona de entrega"],
    ["Something else", "Otro tema"],
  ];

  const onSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (!form.reportValidity()) return;

    setSending(true);
    setError("");
    const val = (id) => document.getElementById(id).value.trim();

    try {
      await submit({
        name: val("cName"),
        email: val("cEmail").toLowerCase(),
        orderNumber: val("cOrder") || undefined,
        topic: val("cTopic"),
        message: val("cMessage"),
      });
      setSent(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(
        err?.message?.replace(/^\[.*?\]\s*/, "") ||
          L("Couldn't send your message — check your connection and try again.",
            "No se pudo enviar tu mensaje — revisa tu conexión e inténtalo de nuevo.")
      );
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <div className="order-confirm">
        <div className="big-check">✓</div>
        <h1>{L("Message sent", "Mensaje enviado")}</h1>
        <p>
          {L("Thanks for reaching out — we read every message and usually reply within one business day.",
             "Gracias por escribirnos — leemos todos los mensajes y normalmente respondemos en un día hábil.")}
        </p>
        <Link className="btn btn-primary" href="/">{L("Back to Home", "Volver al inicio")}</Link>
        <Link className="btn btn-outline" href="/account" style={{ marginLeft: 10 }}>{L("My account", "Mi cuenta")}</Link>
      </div>
    );
  }

  return (
    <div className="contact-layout">
      <div className="panel">
        <h1 className="contact-title">{L("Get in touch", "Contáctanos")}</h1>
        <p className="contact-lede">
          {L("Question about a delivery, monthly refill, or an order? Send us a note and we'll get back to you — usually within one business day.",
             "¿Tienes una pregunta sobre una entrega, una suscripción o un pedido? Escríbenos y te respondemos — normalmente en un día hábil.")}
        </p>

        <form className="form-grid" onSubmit={onSubmit} noValidate>
          <div className="field">
            <label htmlFor="cName">{L("Your name", "Tu nombre")}</label>
            <input id="cName" autoComplete="name" maxLength={120} required />
          </div>
          <div className="field">
            <label htmlFor="cEmail">{L("Email", "Correo electrónico")}</label>
            <input id="cEmail" type="email" autoComplete="email" maxLength={200} required />
          </div>
          <div className="field">
            <label htmlFor="cTopic">{L("What's this about?", "¿De qué se trata?")}</label>
            <select id="cTopic" defaultValue={TOPICS[0][0]}>
              {TOPICS.map(([en, es]) => (
                <option key={en} value={en}>{L(en, es)}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="cOrder">{L("Order number", "Número de pedido")} <span className="optional">{L("(optional)", "(opcional)")}</span></label>
            <input id="cOrder" placeholder="GS-123456" maxLength={40} />
            <p className="field-hint">{L("Helps us find your delivery faster.", "Nos ayuda a encontrar tu entrega más rápido.")}</p>
          </div>
          <div className="field full">
            <label htmlFor="cMessage">{L("Message", "Mensaje")}</label>
            <textarea id="cMessage" rows={6} maxLength={4000} required
              placeholder={L("Tell us what's going on…", "Cuéntanos qué pasa…")} />
          </div>
          <div className="full">
            <button className="btn btn-primary btn-block" type="submit" disabled={sending}>
              {sending ? L("Sending…", "Enviando…") : L("Send message", "Enviar mensaje")}
            </button>
            {error && <p className="field-hint" role="alert" style={{ color: "#b91c1c", marginTop: 8 }}>{error}</p>}
          </div>
        </form>
      </div>

      <aside className="panel contact-aside">
        <h2>{L("Before you write", "Antes de escribir")}</h2>
        <p className="contact-lede">
          {L("A few answers are already waiting for you:", "Algunas respuestas ya te están esperando:")}
        </p>
        <ul className="contact-links">
          <li><a href="/#faq">{L("Delivery timing, skipping, and changes", "Horarios de entrega, saltos y cambios")}</a></li>
          <li><a href="/#faq">{L("Damaged or missing deliveries", "Entregas dañadas o perdidas")}</a></li>
          <li><a href="/#delivery">{L("Check whether we deliver to your ZIP", "Verifica si entregamos en tu código postal")}</a></li>
          <li><Link href="/account">{L("Pause or stop monthly refill", "Pausar o cancelar la recarga mensual")}</Link></li>
        </ul>

        <h2 style={{ marginTop: 22 }}>{L("Delivery area", "Zona de entrega")}</h2>
        <p className="contact-lede">
          {L("Northern New Jersey and the New York City metro — Newark, Jersey City, Paterson, Hackensack, Manhattan, Brooklyn, Queens, the Bronx, and Staten Island.",
             "Norte de Nueva Jersey y el área metropolitana de Nueva York — Newark, Jersey City, Paterson, Hackensack, Manhattan, Brooklyn, Queens, el Bronx y Staten Island.")}
        </p>
        <p className="contact-lede" style={{ marginBottom: 0 }}>
          {L("Grace Spring is the bottled water line from Blue Star Pure Water, serving the area since 2010.",
             "Grace Spring es la línea de agua embotellada de Blue Star Pure Water, sirviendo la zona desde 2010.")}
        </p>
      </aside>
    </div>
  );
}

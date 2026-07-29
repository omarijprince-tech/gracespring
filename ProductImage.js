"use client";

/* Homepage content — bilingual (EN/ES via useLang). Server shell in
   app/page.js owns metadata + JSON-LD. Grace Spring model: 5-gallon home &
   office delivery, one-time bottle deposit + flat shipping, an Avalon cooler
   offer (buy a cooler → 5 free bottles + a stand), and a monthly reminder
   refill service (text / email / phone — no auto-charge). */

import Link from "next/link";
import SiteHeader from "./SiteHeader";
import SiteFooter from "./SiteFooter";
import ShopSection from "./ShopSection";
import ZipChecker from "./ZipChecker";
import OfferCtaButton from "./OfferCtaButton";
import HomeAnalytics from "./HomeAnalytics";
import { useLang } from "../lib/lang-context";
import { DELIVERY, DEPOSIT, COOLER, money } from "../lib/catalog";

export default function HomeContent() {
  const { L } = useLang();

  const faqs = [
    [L("What's the bottle deposit?", "¿Qué es el depósito por botella?"),
     L(`Your first order includes a one-time ${money(DEPOSIT.perBottle)} deposit per 5-gallon bottle. It's non-recurring as long as we swap your empties for full bottles, and it's refundable when you return your empties for good.`,
       `Tu primer pedido incluye un depósito único de ${money(DEPOSIT.perBottle)} por garrafón de 5 galones. No se repite mientras cambiemos tus vacíos por botellas llenas, y es reembolsable cuando devuelves tus vacíos definitivamente.`)],
    [L("How does monthly delivery work?", "¿Cómo funciona la entrega mensual?"),
     L("There are no auto-charges. Each month, the day before your route runs, we remind you by text, email, or phone call. Just reply with how many jugs you'd like and we'll bring them.",
       "No hay cargos automáticos. Cada mes, el día antes de tu ruta, te recordamos por mensaje, correo o llamada. Solo responde cuántos garrafones quieres y te los llevamos.")],
    [L("How much is delivery?", "¿Cuánto cuesta la entrega?"),
     L(`Shipping is a flat ${money(DELIVERY.shipping)} per delivery anywhere in our service area, no matter how many bottles you order.`,
       `El envío es fijo de ${money(DELIVERY.shipping)} por entrega en toda nuestra zona de servicio, sin importar cuántas botellas pidas.`)],
    [L("What's the difference between your waters?", "¿Cuál es la diferencia entre sus aguas?"),
     L("Natural is Grace Spring 100% natural spring water from a protected source. Purified is Blue Star multi-stage water, clean and neutral. Alkaline is ALKAID 9.5 pH water with electrolytes. We also carry ALKAID alkaline in retail cases.",
       "La natural es agua de manantial 100% natural Grace Spring de una fuente protegida. La purificada es agua Blue Star en varias etapas, limpia y neutra. La alcalina es ALKAID 9.5 pH con electrolitos. También tenemos ALKAID alcalina en cajas.")],
    [L("How much is delivery for a cooler?", "¿Puedo agregar un dispensador?"),
     L(`Buy any Avalon cooler (${money(COOLER.price)}) and we automatically add 5 free 5-gallon bottles and a bottle stand. Hot & cold, top or bottom loader, black or white. You can always skip it.`,
       `Compra cualquier dispensador Avalon (${money(COOLER.price)}) y agregamos automáticamente 5 garrafones gratis y un estante. Frío/caliente, carga superior o inferior, negro o blanco. Siempre puedes omitirlo.`)],
    [L("Do you deliver to my area?", "¿Entregan en mi zona?"),
     L("We cover northern New Jersey — Bergen, Hudson, Passaic, Essex, Union, and Morris counties — plus all five NYC boroughs. Check your ZIP in the Delivery section below.",
       "Cubrimos el norte de Nueva Jersey — Bergen, Hudson, Passaic, Essex, Union y Morris — más los cinco condados de NYC. Verifica tu código postal en la sección de Entregas.")],
    [L("What if my order arrives damaged or goes missing?", "¿Y si mi pedido llega dañado o desaparece?"),
     L("If your water arrives damaged, keep it — we'll send a replacement at no charge. If a delivery is stolen after drop-off, we'll issue a refund. Every delivery is photo-documented by our driver.",
       "Si tu agua llega dañada, quédatela — te enviamos un reemplazo sin costo. Si te roban la entrega después de dejarla, te reembolsamos. Cada entrega queda documentada con foto por nuestro repartidor.")],
    [L("Is Grace Spring the same company as Blue Star and ALKAID?", "¿Grace Spring es la misma empresa que Blue Star y ALKAID?"),
     L("Yes — Grace Spring, Blue Star, and ALKAID are all from the same family water company, serving New Jersey and New York since 2010.",
       "Sí — Grace Spring, Blue Star y ALKAID son de la misma empresa familiar de agua, sirviendo a Nueva Jersey y Nueva York desde 2010.")],
  ];

  return (
    <>
      <a className="skip-link" href="#shop">{L("Skip to shop", "Ir a la tienda")}</a>
      <HomeAnalytics page="home" />

      <div className="announce">
        <strong>{L("New customer special:", "Especial nuevo cliente:")}</strong>{" "}
        {L("Buy 1 water cooler, get 5 bottles + a bottle stand FREE. · Se Habla Español",
           "Compra 1 dispensador, llévate 5 botellas + 1 estante GRATIS. · Se Habla Español")}
      </div>

      <SiteHeader variant="home" />

      <main id="main">
        {/* Hero */}
        <section className="hero">
          <div className="container hero-inner">
            <div>
              <span className="eyebrow">{L("5-gallon water delivery · NJ & NYC", "Agua en garrafón de 5 galones · NJ y NYC")}</span>
              <h1>{L(<>Fresh spring water, <em>delivered to your door.</em></>,
                     <>Agua de manantial fresca, <em>hasta tu puerta.</em></>)}</h1>
              <p className="hero-sub">
                {L("Grace Spring brings 5-gallon bottles of alkaline, purified, and natural spring water to homes and offices across New Jersey and the five boroughs. Order online — we confirm your route and remind you every month.",
                   "Grace Spring lleva garrafones de 5 galones de agua alcalina, purificada y natural a hogares y oficinas en Nueva Jersey y los cinco condados de NYC. Pide en línea — confirmamos tu ruta y te recordamos cada mes.")}
              </p>
              <div className="hero-ctas">
                <a className="btn btn-primary" href="#shop">{L("Start Your Order", "Haz tu pedido")}</a>
                <a className="btn btn-outline" href="#delivery">{L("Check Your Area", "Verifica tu zona")}</a>
              </div>
              <div className="hero-chips">
                <span className="chip">🚚 {L("Next-day local delivery", "Entrega local al día siguiente")}</span>
                <span className="chip">💧 {L("Alkaline · Purified · Natural", "Alcalina · Purificada · Natural")}</span>
                <span className="chip">🎁 {L("Cooler? 5 bottles + stand free", "¿Dispensador? 5 botellas + estante gratis")}</span>
              </div>
            </div>
            <div className="hero-visual photo">
              <img src="/assets/natural-5gal.png" width="560" height="560"
                alt={L("Grace Spring 5-gallon natural spring water bottle", "Garrafón de 5 galones de agua natural de manantial Grace Spring")} />
            </div>
          </div>
        </section>

        {/* Offers */}
        <section className="section" id="offers">
          <div className="container">
            <div className="section-head">
              <span className="eyebrow">{L("Ways to get your water", "Formas de recibir tu agua")}</span>
              <h2>{L("Pick what fits your home or office", "Elige lo que va con tu casa u oficina")}</h2>
              <p>{L("No auto-charges. We remind you each month and you reply with how many jugs you want.",
                    "Sin cargos automáticos. Te recordamos cada mes y respondes cuántos garrafones quieres.")}</p>
            </div>
            <div className="offers-grid">
              <article className="offer-card featured">
                <span className="offer-badge">{L("New customer special", "Especial nuevo cliente")}</span>
                <h3>{L("Buy 1 Cooler, Get 5 Bottles FREE", "Compra 1 dispensador, 5 botellas GRATIS")}</h3>
                <div className="offer-price">{L(<>+ a bottle stand, free <span>with any cooler purchase</span></>,
                                               <>+ un estante, gratis <span>con la compra de cualquier dispensador</span></>)}</div>
                <ul>
                  <li>{L(`Buy any Avalon water cooler — ${money(COOLER.price)}`, `Compra cualquier dispensador Avalon — ${money(COOLER.price)}`)}</li>
                  <li>{L("Get 5 free 5-gallon bottles of Grace Spring water", "Recibe 5 garrafones gratis de agua Grace Spring")}</li>
                  <li>{L("Plus a 5-bottle storage stand, free", "Más un estante para 5 botellas, gratis")}</li>
                  <li>{L("Add monthly refill service anytime — optional", "Agrega el servicio mensual cuando quieras — opcional")}</li>
                </ul>
                <OfferCtaButton mode="one-time" className="btn btn-primary">{L("Claim the Offer", "Aprovechar oferta")}</OfferCtaButton>
              </article>
              <article className="offer-card">
                <span className="offer-badge blue">{L("No auto-charge", "Sin cargo automático")}</span>
                <h3>{L("Monthly Refill Service", "Servicio mensual de recarga")}</h3>
                <div className="offer-price">{L(<>We remind you <span>the day before delivery</span></>,
                                               <>Te recordamos <span>el día antes de la entrega</span></>)}</div>
                <ul>
                  <li>{L("Reminder by text, email, or phone call", "Recordatorio por mensaje, correo o llamada")}</li>
                  <li>{L("Reply with how many jugs — that's it", "Responde cuántos garrafones — eso es todo")}</li>
                  <li>{L("We swap your empties for full bottles", "Cambiamos tus vacíos por botellas llenas")}</li>
                  <li>{L("Pause or stop anytime — no commitment", "Pausa o cancela cuando quieras — sin compromiso")}</li>
                </ul>
                <OfferCtaButton mode="monthly" className="btn btn-outline">{L("Start Refill Service", "Iniciar servicio")}</OfferCtaButton>
              </article>
              <article className="offer-card">
                <h3>{L("One-Time Order", "Pedido único")}</h3>
                <div className="offer-price">{L(<>No commitment <span>order exactly what you need</span></>,
                                               <>Sin compromiso <span>pide justo lo que necesitas</span></>)}</div>
                <ul>
                  <li>{L("Great for events or a one-off stock-up", "Ideal para eventos o abastecerte una vez")}</li>
                  <li>{L(`Same next-day local delivery · ${money(DELIVERY.shipping)} shipping`, `La misma entrega local · envío de ${money(DELIVERY.shipping)}`)}</li>
                  <li>{L("No account required", "No necesitas cuenta")}</li>
                </ul>
                <OfferCtaButton mode="one-time" className="btn btn-outline">{L("Shop Now", "Comprar ahora")}</OfferCtaButton>
              </article>
            </div>
          </div>
        </section>

        {/* Shop */}
        <section className="section" id="shop" style={{ background: "#fff" }}>
          <div className="container">
            <div className="section-head">
              <span className="eyebrow">{L("Shop Grace Spring", "Tienda Grace Spring")}</span>
              <h2>{L("Choose your water", "Elige tu agua")}</h2>
              <p>{L("Fresh 5-gallon bottles of alkaline, purified, and natural spring water — plus cases and ALKAID alkaline.",
                    "Garrafones frescos de 5 galones de agua alcalina, purificada y natural — más cajas y ALKAID alcalina.")}</p>
            </div>
            <ShopSection />
          </div>
        </section>

        {/* How it works */}
        <section className="section" id="how">
          <div className="container">
            <div className="section-head">
              <span className="eyebrow">{L("How it works", "Cómo funciona")}</span>
              <h2>{L("Water delivery in three easy steps", "Agua a domicilio en tres pasos")}</h2>
            </div>
            <div className="steps-grid">
              <div className="step-card">
                <div className="step-num">1</div>
                <h3>{L("Choose your water", "Elige tu agua")}</h3>
                <p>{L("Pick your bottles and add a cooler if you need one. Complete your first order online.",
                      "Elige tus botellas y agrega un dispensador si lo necesitas. Completa tu primer pedido en línea.")}</p>
              </div>
              <div className="step-card">
                <div className="step-num">2</div>
                <h3>{L("We confirm your route", "Confirmamos tu ruta")}</h3>
                <p>{L("A Grace Spring team member calls to confirm your address, delivery route, and first delivery date.",
                      "Un miembro del equipo llama para confirmar tu dirección, ruta y primera fecha de entrega.")}</p>
              </div>
              <div className="step-card">
                <div className="step-num">3</div>
                <h3>{L("We deliver & remind you", "Entregamos y te recordamos")}</h3>
                <p>{L("We drop full bottles and take your empties. Each month we remind you the day before — just reply with your count.",
                      "Dejamos botellas llenas y recogemos los vacíos. Cada mes te recordamos el día antes — solo responde tu cantidad.")}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Delivery */}
        <section className="section delivery" id="delivery">
          <div className="container">
            <div className="section-head">
              <span className="eyebrow" style={{ color: "var(--sky-100)" }}>{L("Delivery", "Entregas")}</span>
              <h2>{L("Local, reliable, on your schedule", "Local, confiable y a tu ritmo")}</h2>
              <p>{L("We deliver across northern New Jersey and all five NYC boroughs. Check your ZIP.",
                    "Entregamos en el norte de Nueva Jersey y los cinco condados de NYC. Verifica tu código postal.")}</p>
            </div>
            <div className="delivery-grid">
              <div className="delivery-card">
                <h3>{L("Check your delivery area", "Verifica tu zona de entrega")}</h3>
                <ZipChecker />
              </div>
              <div className="delivery-card">
                <h3>{L("What to expect", "Qué puedes esperar")}</h3>
                <ul>
                  <li>{L("Serving Bergen, Hudson, Passaic, Essex, Union & Morris counties, NJ", "Servimos los condados de Bergen, Hudson, Passaic, Essex, Union y Morris, NJ")}</li>
                  <li>{L("All five NYC boroughs — Manhattan, Brooklyn, Queens, the Bronx, Staten Island", "Los cinco condados de NYC — Manhattan, Brooklyn, Queens, el Bronx, Staten Island")}</li>
                  <li>{L(`Flat ${money(DELIVERY.shipping)} shipping per delivery`, `Envío fijo de ${money(DELIVERY.shipping)} por entrega`)}</li>
                  <li>{L(`One-time ${money(DEPOSIT.perBottle)} bottle deposit — refundable on empty return`, `Depósito único de ${money(DEPOSIT.perBottle)} por botella — reembolsable al devolver vacíos`)}</li>
                  <li>{L("Reminders by text, email, or phone call", "Recordatorios por mensaje, correo o llamada")}</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="section" id="faq">
          <div className="container">
            <div className="section-head">
              <span className="eyebrow">{L("FAQ", "Preguntas frecuentes")}</span>
              <h2>{L("Questions, answered", "Tus dudas, resueltas")}</h2>
            </div>
            <div className="faq-list">
              {faqs.map(([q, a], i) => (
                <details key={i} open={i === 0}>
                  <summary>{q}</summary>
                  <p>{a}</p>
                </details>
              ))}
            </div>
            <p className="faq-contact">
              {L(<>Still have questions? Call us at <strong>973-742-0216</strong> or <Link href="/contact">send us a message</Link> — Se Habla Español.</>,
                 <>¿Aún tienes dudas? Llámanos al <strong>973-742-0216</strong> o <Link href="/contact">escríbenos</Link> — Se Habla Español.</>)}
            </p>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}

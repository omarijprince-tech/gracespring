"use client";

import Link from "next/link";
import { useLang } from "../lib/lang-context";

export default function SiteFooter() {
  const { L } = useLang();
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div className="footer-brand">
              <img src="/assets/logo-mark.png" alt="Grace Spring Water logo" />
              <span><span className="brand-name" style={{ color: "#fff" }}>GRACE SPRING</span><span className="brand-sub">100% Natural Spring Water</span></span>
            </div>
            <p className="footer-tagline">
              {L("Fresh 5-gallon spring, purified & alkaline water, delivered to homes and offices across NJ & NYC.",
                 "Agua fresca de manantial, purificada y alcalina en garrafones de 5 galones, para hogares y oficinas en NJ y NYC.")}
            </p>
          </div>
          <div>
            <h4>{L("Shop", "Tienda")}</h4>
            <ul>
              <li><a href="/#shop">{L("All products", "Todos los productos")}</a></li>
              <li><a href="/#offers">{L("Offers", "Ofertas")}</a></li>
              <li><Link href="/account">{L("My account", "Mi cuenta")}</Link></li>
            </ul>
          </div>
          <div>
            <h4>{L("Company", "Empresa")}</h4>
            <ul>
              <li><a href="/#delivery">{L("Delivery areas", "Zonas de entrega")}</a></li>
              <li><a href="/#faq">{L("FAQ", "Preguntas frecuentes")}</a></li>
              <li><Link href="/contact">{L("Contact us", "Contáctanos")}</Link></li>
              <li><a href="https://gracespringwater.com">gracespringwater.com</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span>{L("© 2026 Grace Spring Water All rights reserved.", "© 2026 Grace Spring Water Todos los derechos reservados.")}</span>
          <span>{L("A family water company serving NJ & NY since 2010.", "Empresa familiar sirviendo NJ y NY desde 2010.")}</span>
        </div>
      </div>
    </footer>
  );
}

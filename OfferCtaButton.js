"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { useCart } from "../lib/cart-context";
import { useLang } from "../lib/lang-context";

/* Site header.
   variant "home"    — full nav (dropdown menu on compact widths) + Account + cart
   variant "lp"      — cart button only
   variant "simple"  — "Continue shopping" link, no cart (checkout/account/login) */
export default function SiteHeader({ variant = "home" }) {
  const { totals, openCart } = useCart();
  const { lang, setLang, L } = useLang();
  const { isAuthenticated } = useConvexAuth();
  const isAdmin = useQuery(api.admin.amIAdmin, isAuthenticated ? {} : "skip") === true;
  const [menuOpen, setMenuOpen] = useState(false);
  const headerRef = useRef(null);
  const count = totals.units + totals.freeBottles.length + (totals.hasCooler ? 1 : 0);

  const NAV_LINKS = [
    ["#shop", L("Shop", "Tienda")],
    ["#offers", L("Offers", "Ofertas")],
    ["#how", L("How it works", "Cómo funciona")],
    ["#delivery", L("Delivery", "Entregas")],
    ["#faq", L("FAQ", "Preguntas")],
  ];

  useEffect(() => {
    if (!menuOpen) return;
    const close = (e) => {
      if (e.type === "keydown" && e.key !== "Escape") return;
      if (e.type === "click" && headerRef.current?.contains(e.target)) return;
      setMenuOpen(false);
    };
    document.addEventListener("click", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("click", close);
      document.removeEventListener("keydown", close);
    };
  }, [menuOpen]);

  return (
    <header className="site-header" ref={headerRef}>
      <div className="container header-inner">
        <Link className="brand" href="/" aria-label="Grace Spring Water home">
          <img src="/assets/logo-mark.png" alt="" width="44" height="44" />
          <span><span className="brand-name">GRACE SPRING</span><span className="brand-sub">100% Natural Spring Water</span></span>
        </Link>

        {variant === "home" && (
          <nav className="main-nav" aria-label={L("Main navigation", "Navegación principal")}>
            {NAV_LINKS.map(([href, label]) => <a key={href} href={href}>{label}</a>)}
          </nav>
        )}

        <div className="header-actions" style={variant === "home" ? undefined : { marginLeft: "auto" }}>
          {variant === "home" && (
            <button
              className="nav-menu-btn"
              aria-label={L("Menu", "Menú")}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((o) => !o)}
            >
              ☰<span className="nav-menu-label"> {L("Menu", "Menú")}</span>
            </button>
          )}
          <button className="lang-toggle" onClick={() => setLang(lang === "es" ? "en" : "es")}
            aria-label={lang === "es" ? "Switch to English" : "Cambiar a español"}>
            {lang === "es" ? "EN" : "ES"}
          </button>
          {isAdmin && <Link className="account-link admin-link" href="/admin">{L("Operations", "Operaciones")}</Link>}
          {variant === "home" && <Link className="account-link" href="/account">{L("Account", "Cuenta")}</Link>}
          {variant === "simple" && <Link className="account-link" href="/#shop">{L("← Continue shopping", "← Seguir comprando")}</Link>}
          {variant !== "simple" && (
            <button className="cart-btn" onClick={openCart} aria-label={L("Open cart", "Abrir carrito")}>
              <span className="label">{L("Cart", "Carrito")}</span>
              <span className="cart-count" aria-live="polite">{count}</span>
            </button>
          )}
        </div>
      </div>

      {variant === "home" && menuOpen && (
        <nav className="mobile-menu" aria-label={L("Main navigation", "Navegación principal")}>
          {NAV_LINKS.map(([href, label]) => (
            <a key={href} href={href} onClick={() => setMenuOpen(false)}>{label}</a>
          ))}
          <Link href="/account" className="menu-account" onClick={() => setMenuOpen(false)}>{L("My Account", "Mi Cuenta")}</Link>
          {isAdmin && <Link href="/admin" className="menu-admin" onClick={() => setMenuOpen(false)}>⚙ {L("Operations", "Operaciones")}</Link>}
        </nav>
      )}
    </header>
  );
}

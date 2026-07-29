"use client";

import { useEffect, useRef, useState } from "react";
import { CATALOG, money, COOLER, productName, productDesc } from "../lib/catalog";
import { track } from "../lib/analytics";
import { useCart } from "../lib/cart-context";
import { useLang } from "../lib/lang-context";
import ProductImage from "./ProductImage";

/* ---- Cooler add-on modal (Twin Rocks-style): shown the first time a
   5-gallon jug is added, or via the "Add a cooler" button. Buying a cooler
   auto-grants 5 free bottles + a stand. ---- */
function CoolerModal({ open, onClose, onAdd }) {
  const { L } = useLang();
  const [loader, setLoader] = useState(COOLER.loaders[0]);
  const [color, setColor] = useState(COOLER.colors[0]);
  if (!open) return null;
  const Opt = (val, cur, set, label) => (
    <button type="button" className={cur === val ? "sel" : ""} onClick={() => set(val)}>{label}</button>
  );
  return (
    <div className="modal-wrap open" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>{L("Add a water dispenser?", "¿Agregar un dispensador?")}</h3>
        <p className="sub">{L("Optional — a hot & cold Avalon cooler for your 5-gallon bottles.", "Opcional — un dispensador Avalon frío/caliente para tus garrafones.")}</p>
        <div className="cooler-promo">{L("🎁 Buy any cooler and get 5 free bottles + a bottle stand — automatically added.", "🎁 Compra cualquier dispensador y recibe 5 botellas gratis + un estante — se agrega solo.")}</div>
        <div className="opt-group"><label>{L("Loader type", "Tipo de carga")}</label><div className="opt-row">{Opt("Top Loader", loader, setLoader, L("Top Loader", "Carga superior"))}{Opt("Bottom Loader", loader, setLoader, L("Bottom Loader", "Carga inferior"))}</div></div>
        <div className="opt-group"><label>{L("Color", "Color")}</label><div className="opt-row">{Opt("Black", color, setColor, L("Black", "Negro"))}{Opt("White", color, setColor, L("White", "Blanco"))}</div></div>
        <div className="cooler-price">{L("Buy a cooler", "Comprar dispensador")} · {money(COOLER.price)} <small>{L("includes 5 bottles + a stand, free", "incluye 5 botellas + un estante, gratis")}</small></div>
        <div className="modal-actions">
          <button className="btn btn-primary" onClick={() => { onAdd(loader, color); onClose(); }}>{L("Add cooler + free bottles", "Agregar dispensador + botellas gratis")}</button>
          <button className="link-btn" onClick={onClose}>{L("Skip this step", "Omitir este paso")}</button>
        </div>
      </div>
    </div>
  );
}

function ProductCard({ p, onFirstJug }) {
  const { cart, cartQty, addToCart } = useCart();
  const { lang, L } = useLang();
  const [qty, setLocalQty] = useState(() => Math.max(1, cartQty(p.id) || 1));

  const step = (d) => {
    setLocalQty((q) => {
      const next = Math.max(1, q + d);
      track("quantity_changed", { product_id: p.id, qty: next });
      return next;
    });
  };

  const onAdd = () => {
    // First 5-gallon jug added with no cooler yet → offer the cooler add-on.
    if (p.deposit && !cart.cooler && !cart.items.some((i) => i.id === p.id)) {
      onFirstJug({ id: p.id, qty });
    } else {
      addToCart(p.id, qty);
    }
  };

  return (
    <article className="product-card" data-product={p.id}>
      <div className="product-media">
        <ProductImage product={p} alt={productName(p, lang)} />
        {p.deposit && <span className="per-unit">{L("+ $5 deposit", "+ $5 depósito")}</span>}
      </div>
      <div className="product-body">
        <h3>{productName(p, lang)}</h3>
        <p className="product-desc">{productDesc(p, lang)}</p>
        <div className="price-row">
          <span className="price-now">{money(p.price)}</span>
          <span className="per-size">/ {p.size}</span>
        </div>
        <div className="product-actions">
          <div className="qty-stepper" aria-label={L(`Quantity for ${p.name}`, `Cantidad de ${p.name}`)}>
            <button onClick={() => step(-1)} aria-label={L("Decrease quantity", "Disminuir cantidad")}>−</button>
            <output>{qty}</output>
            <button onClick={() => step(1)} aria-label={L("Increase quantity", "Aumentar cantidad")}>+</button>
          </div>
          <button className="btn btn-primary" style={{ flex: 1 }} onClick={onAdd}>{L("Add to Order", "Agregar al pedido")}</button>
        </div>
      </div>
    </article>
  );
}

/* Mode toggle + product grid; also fires product_viewed on first scroll into view. */
export default function ShopSection() {
  const { cart, setMode, addToCart, addCooler } = useCart();
  const { L } = useLang();
  const isMonthly = cart.mode === "monthly";
  const gridRef = useRef(null);
  const [modalOpen, setModalOpen] = useState(false);
  const pendingRef = useRef(null);

  useEffect(() => {
    const seen = new Set();
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        const id = en.target.dataset.product;
        if (en.isIntersecting && !seen.has(id)) {
          seen.add(id);
          track("product_viewed", { product_id: id });
        }
      });
    }, { threshold: 0.4 });
    gridRef.current?.querySelectorAll("[data-product]").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const onFirstJug = (pending) => { pendingRef.current = pending; setModalOpen(true); };
  const closeModal = () => {
    setModalOpen(false);
    if (pendingRef.current) { addToCart(pendingRef.current.id, pendingRef.current.qty); pendingRef.current = null; }
  };
  const onAddCooler = (loader, color) => {
    addCooler(loader, color);
    if (pendingRef.current) { addToCart(pendingRef.current.id, pendingRef.current.qty); pendingRef.current = null; }
  };

  return (
    <>
      <div className="mode-toggle" role="tablist" aria-label={L("Purchase type", "Tipo de compra")}>
        <button className={isMonthly ? "" : "active"} role="tab" aria-selected={!isMonthly} onClick={() => setMode("one-time")}>{L("One-Time Order", "Pedido único")}</button>
        <button className={isMonthly ? "active" : ""} role="tab" aria-selected={isMonthly} onClick={() => setMode("monthly")}>{L("Monthly Delivery", "Entrega mensual")}</button>
      </div>
      <p className="mode-hint" aria-live="polite">
        {isMonthly
          ? L(<><strong>Monthly delivery.</strong> We remind you the day before each run — reply with your count, no auto-charges.</>,
              <><strong>Entrega mensual.</strong> Te recordamos el día antes — responde tu cantidad, sin cargos automáticos.</>)
          : L(<><strong>One-time order.</strong> A team member calls to confirm your address and first delivery date.</>,
              <><strong>Pedido único.</strong> Un miembro del equipo llama para confirmar tu dirección y primera entrega.</>)}
      </p>
      <div className="products-grid" ref={gridRef}>
        {CATALOG.map((p) => <ProductCard key={p.id} p={p} onFirstJug={onFirstJug} />)}
      </div>
      <CoolerModal open={modalOpen} onClose={closeModal} onAdd={onAddCooler} />
    </>
  );
}

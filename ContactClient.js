@charset "UTF-8";
/* ============================================================
   Alkaid Water Co. — Design System
   Palette extracted from brand artwork (logo + banner)
   ============================================================ */
/* Grace Spring palette — greens + white + black, with a hint of blue
   reserved for water imagery. Variable NAMES are kept from the original
   (navy/blue/sky) so the ~90 references elsewhere need no edits; only the
   VALUES change to Grace Spring's forest-green brand. */
:root {
  --navy-900: #0d3320;  /* near-black forest — dark sections   */
  --navy: #17512f;      /* brand banner green — headings/footer */
  --blue: #2f8f4e;      /* primary green — buttons, links      */
  --blue-600: #256e3d;  /* hover                                */
  --sky: #86cfa1;       /* light green — focus ring            */
  --sky-100: #c7ead4;   /* pale accent on dark                 */
  --pale: #e9f6ee;      /* pale green surfaces                 */
  --bg: #f5faf6;
  --ink: #14241b;       /* near-black text                     */
  --muted: #566b5e;
  --line: #d5e7db;
  --success: #0e8a5f;
  --success-bg: #e7f6ef;
  --free: #f5a623;      /* gold — "free" gift badges           */
  --water: #2d7dd2;     /* hint of blue — water/deposit accents */
  --cream: #f4efe1;     /* logo wordmark cream                 */
  --white: #ffffff;
  --radius: 14px;
  --radius-sm: 9px;
  --shadow: 0 8px 28px rgba(13, 51, 32, 0.1);
  --shadow-sm: 0 2px 10px rgba(13, 51, 32, 0.08);
  --font-head: "Poppins", "Segoe UI", system-ui, sans-serif;
  --font-body: "Inter", "Segoe UI", system-ui, sans-serif;
}

* { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; }
/* never allow horizontal panning — stray overflow must not create a sideways swipe */
html, body { overflow-x: clip; }
body {
  font-family: var(--font-body);
  color: var(--ink);
  background: var(--bg);
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}
img, svg { max-width: 100%; display: block; }
a { color: var(--blue); text-decoration: none; }
button { font-family: inherit; cursor: pointer; }
h1, h2, h3, h4 { font-family: var(--font-head); color: var(--navy); line-height: 1.2; }

.container { width: min(1160px, 92%); margin: 0 auto; }
.section { padding: 72px 0; }
.section-head { text-align: center; max-width: 640px; margin: 0 auto 44px; }
.section-head h2 { font-size: clamp(1.6rem, 3vw, 2.2rem); margin-bottom: 10px; }
.section-head p { color: var(--muted); }
.eyebrow {
  display: inline-block; font-size: 0.78rem; font-weight: 700; letter-spacing: 0.12em;
  text-transform: uppercase; color: var(--blue); margin-bottom: 12px;
}

.skip-link {
  position: absolute; left: -9999px; top: 0; background: var(--navy); color: #fff;
  padding: 10px 16px; z-index: 200; border-radius: 0 0 8px 0;
}
.skip-link:focus { left: 0; }

/* ---------- Buttons ---------- */
.btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  font-weight: 600; font-size: 0.95rem; border-radius: 999px; border: 2px solid transparent;
  padding: 13px 26px; transition: all 0.18s ease; white-space: nowrap;
}
.btn-primary { background: var(--blue); color: #fff; }
.btn-primary:hover { background: var(--blue-600); transform: translateY(-1px); }
.btn-outline { background: transparent; color: var(--navy); border-color: var(--navy); }
.btn-outline:hover { background: var(--navy); color: #fff; }
.btn-light { background: #fff; color: var(--navy); box-shadow: var(--shadow-sm); }
.btn-light:hover { background: var(--pale); }
.btn-block { width: 100%; }
.btn:disabled { opacity: 0.45; cursor: not-allowed; transform: none; }
.btn:focus-visible, a:focus-visible, input:focus-visible, select:focus-visible {
  outline: 3px solid var(--sky); outline-offset: 2px;
}

/* ---------- Announcement bar ---------- */
.announce {
  background: var(--navy); color: #fff; text-align: center; font-size: 0.86rem;
  padding: 9px 16px; font-weight: 500;
}
.announce strong { color: var(--sky-100); }

/* ---------- Header ---------- */
.site-header {
  position: sticky; top: 0; z-index: 100; background: rgba(255, 255, 255, 0.96);
  backdrop-filter: blur(8px); border-bottom: 1px solid var(--line);
}
.header-inner { display: flex; align-items: center; gap: 28px; padding: 12px 0; }
.brand { display: flex; align-items: center; gap: 10px; }
.brand img { width: 44px; height: 44px; }
.brand-name { display: block; font-family: "Anton", var(--font-head); font-weight: 400; font-size: 1.5rem; line-height: 0.92; color: var(--navy); letter-spacing: 0.02em; text-transform: uppercase; }
.brand-sub { display: block; font-family: "Yellowtail", cursive; font-size: 0.8rem; letter-spacing: 0.01em; color: var(--blue); font-weight: 400; text-transform: none; margin-top: 0; }
.main-nav { display: flex; gap: 22px; margin-left: auto; }
.main-nav a { color: var(--ink); font-weight: 500; font-size: 0.93rem; }
.main-nav a:hover { color: var(--blue); }
.header-actions { display: flex; align-items: center; gap: 12px; }
.cart-btn {
  position: relative; display: flex; align-items: center; gap: 8px; background: var(--navy);
  color: #fff; border: none; border-radius: 999px; padding: 10px 18px; font-weight: 600; font-size: 0.9rem;
}
.cart-btn:hover { background: var(--navy-900); }
.cart-count {
  background: var(--free); color: var(--navy-900); border-radius: 999px; font-size: 0.75rem;
  font-weight: 700; min-width: 20px; height: 20px; display: inline-flex; align-items: center; justify-content: center; padding: 0 5px;
}
.account-link { font-size: 0.9rem; font-weight: 600; color: var(--navy); }

/* ---------- Hero ---------- */
.hero { background: linear-gradient(160deg, var(--pale) 0%, #fdfeff 55%, var(--pale) 100%); overflow: hidden; }
.hero-inner { display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 48px; align-items: center; padding: 64px 0 72px; }
.hero h1 { font-size: clamp(2rem, 4.4vw, 3.1rem); margin-bottom: 18px; }
.hero h1 em { font-style: normal; color: var(--blue); }
.hero-sub { color: var(--muted); font-size: 1.08rem; max-width: 500px; margin-bottom: 28px; }
.hero-ctas { display: flex; gap: 14px; flex-wrap: wrap; margin-bottom: 30px; }
.hero-chips { display: flex; gap: 10px; flex-wrap: wrap; }
.chip {
  background: #fff; border: 1px solid var(--line); border-radius: 999px; padding: 7px 14px;
  font-size: 0.82rem; font-weight: 600; color: var(--navy); box-shadow: var(--shadow-sm);
  display: inline-flex; align-items: center; gap: 6px;
}
.chip svg { width: 15px; height: 15px; }
.hero-visual {
  background: radial-gradient(ellipse 62% 58% at 50% 48%,
    #3e8fd8 0%, var(--sky) 32%, var(--sky-100) 52%, rgba(234, 244, 252, 0) 76%);
  padding: 36px; display: flex; justify-content: center; align-items: center;
}
.hero-visual svg { width: min(300px, 100%); height: auto; }
.hero-visual.photo { background: none; padding: 0; }
.hero-visual.photo img {
  width: 100%; max-width: 560px; border-radius: 24px;
  box-shadow: var(--shadow); filter: none; object-fit: cover;
}
/* One-panel hero: text left, slideshow right, image fades into the text area */
.hero-blend { position: relative; overflow: hidden; background: #f2f8fd; }
.hero-media { position: absolute; top: 0; right: 0; bottom: 0; width: 62%; }
.hero-slide {
  position: absolute; inset: 0;
  background-size: cover;
  background-position: 65% 25%;
  opacity: 0; transition: opacity 1.4s ease; z-index: 0;
}
/* outgoing slide stays fully opaque underneath while the new one fades in over
   it — prevents the background bleeding through mid-crossfade */
.hero-slide.prev { opacity: 1; transition: none; }
.hero-slide.active { opacity: 1; z-index: 1; }
.hero-media-fade {
  position: absolute; inset: 0; z-index: 2; pointer-events: none;
  background: linear-gradient(90deg,
    #f2f8fd 0%, rgba(242, 248, 253, 0.85) 16%, rgba(242, 248, 253, 0.35) 34%, rgba(242, 248, 253, 0) 55%);
}
.hero-inner-blend { position: relative; z-index: 3; padding: 88px 0 96px; }
.hero-copy { max-width: 46%; }
@media (max-width: 920px) {
  .hero-media { position: relative; width: 100%; height: clamp(240px, 55vw, 380px); }
  .hero-media-fade {
    background: linear-gradient(180deg, rgba(242, 248, 253, 0) 55%, #f2f8fd 100%);
  }
  .hero-slide { background-position: center 20%; }
  .hero-inner-blend { padding: 8px 0 56px; text-align: center; }
  .hero-copy { max-width: 100%; }
  .hero-copy .hero-sub { margin-left: auto; margin-right: auto; }
  .hero-copy .hero-ctas, .hero-copy .hero-chips { justify-content: center; }
}
.hero-visual img { width: min(340px, 100%); height: auto; object-fit: contain; filter: drop-shadow(0 12px 24px rgba(18, 41, 74, 0.25)); }

/* ---------- Offer cards ---------- */
.offers-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 22px; align-items: stretch; }
.offer-card {
  background: #fff; border: 1.5px solid var(--line); border-radius: var(--radius);
  padding: 30px 26px; display: flex; flex-direction: column; gap: 12px; position: relative;
  box-shadow: var(--shadow-sm); transition: transform 0.18s ease, box-shadow 0.18s ease;
}
.offer-card:hover { transform: translateY(-4px); box-shadow: var(--shadow); }
.offer-card.featured { border-color: var(--blue); border-width: 2px; box-shadow: var(--shadow); }
.offer-badge {
  position: absolute; top: -13px; left: 24px; background: var(--blue); color: #fff;
  font-size: 0.72rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase;
  border-radius: 999px; padding: 4px 14px;
}
.offer-badge.gold { background: var(--free); color: var(--navy-900); }
.offer-card h3 { font-size: 1.25rem; }
.offer-price { font-family: var(--font-head); font-weight: 700; font-size: 1.9rem; color: var(--blue); }
.offer-price span { font-size: 0.95rem; color: var(--muted); font-weight: 500; }
.offer-card ul { list-style: none; display: grid; gap: 8px; color: var(--muted); font-size: 0.92rem; flex: 1; }
.offer-card ul li { padding-left: 24px; position: relative; }
.offer-card ul li::before {
  content: "\2713"; position: absolute; left: 0; color: var(--success); font-weight: 700;
}

/* ---------- Shop ---------- */
.mode-toggle {
  display: flex; background: #fff; border: 1.5px solid var(--line); border-radius: 999px;
  padding: 5px; width: fit-content; margin: 0 auto 14px; box-shadow: var(--shadow-sm);
}
.mode-toggle button {
  border: none; background: transparent; border-radius: 999px; padding: 10px 22px;
  font-weight: 600; font-size: 0.9rem; color: var(--muted); transition: all 0.15s ease;
}
.mode-toggle button.active { background: var(--navy); color: #fff; }
.mode-hint { text-align: center; font-size: 0.85rem; color: var(--muted); margin-bottom: 36px; min-height: 1.4em; }
.mode-hint strong { color: var(--success); }

.products-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 420px)); gap: 26px; justify-content: center; }
.product-card {
  background: #fff; border: 1.5px solid var(--line); border-radius: var(--radius);
  overflow: hidden; box-shadow: var(--shadow-sm); display: flex; flex-direction: column;
}
.product-media {
  background: linear-gradient(165deg, var(--pale), var(--sky-100)); padding: 26px;
  display: flex; justify-content: center; align-items: flex-end; min-height: 210px; position: relative;
}
.product-media svg { height: 170px; width: auto; }
.per-bottle {
  position: absolute; top: 14px; right: 14px; background: #fff; border-radius: 999px;
  font-size: 0.75rem; font-weight: 700; color: var(--navy); padding: 5px 12px; box-shadow: var(--shadow-sm);
}
.product-body { padding: 22px 24px 24px; display: flex; flex-direction: column; gap: 12px; flex: 1; }
.product-body h3 { font-size: 1.15rem; }
.product-desc { color: var(--muted); font-size: 0.88rem; }
.price-row { display: flex; align-items: baseline; gap: 10px; flex-wrap: wrap; }
.price-now { font-family: var(--font-head); font-size: 1.5rem; font-weight: 700; color: var(--navy); }
.price-was { color: var(--muted); text-decoration: line-through; font-size: 0.95rem; }
.price-tag {
  background: var(--success-bg); color: var(--success); font-size: 0.75rem; font-weight: 700;
  border-radius: 999px; padding: 3px 10px;
}
.product-promo-note { font-size: 0.8rem; color: var(--blue); font-weight: 600; }
.product-actions { display: flex; gap: 12px; align-items: center; margin-top: auto; }
.qty-stepper {
  display: flex; align-items: center; border: 1.5px solid var(--line); border-radius: 999px; overflow: hidden;
}
.qty-stepper button {
  border: none; background: transparent; width: 38px; height: 42px; font-size: 1.1rem;
  font-weight: 700; color: var(--navy);
}
.qty-stepper button:hover { background: var(--pale); }
.qty-stepper output { min-width: 34px; text-align: center; font-weight: 700; font-size: 0.98rem; }

/* ---------- How it works ---------- */
.steps-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 22px; }
.step-card { background: #fff; border-radius: var(--radius); padding: 28px 24px; box-shadow: var(--shadow-sm); text-align: center; }
.step-num {
  width: 44px; height: 44px; border-radius: 50%; background: var(--pale); color: var(--blue);
  font-family: var(--font-head); font-weight: 700; font-size: 1.15rem;
  display: flex; align-items: center; justify-content: center; margin: 0 auto 14px;
}
.step-card h3 { font-size: 1.05rem; margin-bottom: 8px; }
.step-card p { color: var(--muted); font-size: 0.9rem; }

/* ---------- Delivery ---------- */
.delivery { background: var(--navy); color: #fff; }
.delivery .section-head h2, .delivery h3 { color: #fff; }
.delivery .section-head p { color: var(--sky-100); }
.delivery-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 28px; align-items: start; }
.delivery-card { background: rgba(255, 255, 255, 0.07); border: 1px solid rgba(255, 255, 255, 0.16); border-radius: var(--radius); padding: 28px; }
.delivery-card ul { list-style: none; display: grid; gap: 10px; color: var(--sky-100); font-size: 0.94rem; }
.delivery-card ul li { padding-left: 26px; position: relative; }
.delivery-card ul li::before { content: "\2022"; position: absolute; left: 8px; color: var(--sky); }
.zip-form { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 16px; }
.zip-form input {
  flex: 1 1 140px; min-width: 0; border: none; border-radius: 999px; padding: 12px 18px; font-size: 0.95rem; font-family: inherit;
}
.delivery-grid > * { min-width: 0; }
.zip-result { margin-top: 12px; font-size: 0.9rem; font-weight: 600; min-height: 1.4em; }
.zip-result.ok { color: #7ff2c0; }
.zip-result.no { color: #ffc9c9; }
.placeholder-note { font-size: 0.75rem; color: var(--sky); opacity: 0.75; margin-top: 14px; }

/* ---------- Social proof ---------- */
.reviews { background: #fff; }
.rating-strip { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; margin-bottom: 36px; }
.rating-pill {
  background: var(--pale); color: var(--navy); border-radius: 999px; padding: 8px 18px;
  font-size: 0.86rem; font-weight: 600; display: inline-flex; align-items: center; gap: 8px;
}
/* flex + center so an incomplete last row (e.g. 5 cards) centers itself */
.reviews-grid { display: flex; flex-wrap: wrap; justify-content: center; gap: 20px; }
.reviews-grid .review-card { flex: 0 1 calc((100% - 40px) / 3); min-width: 240px; }
.review-card {
  background: var(--bg); border: 1.5px solid var(--line); border-radius: var(--radius);
  padding: 24px 22px; display: flex; flex-direction: column; gap: 10px; margin: 0;
}
.review-card .stars { color: var(--free); letter-spacing: 2px; font-size: 0.95rem; }
.review-card p { color: var(--ink); font-size: 0.93rem; line-height: 1.55; flex: 1; }
.review-card footer { color: var(--muted); font-size: 0.8rem; font-weight: 600; }
.review-card footer a { color: var(--blue); }
.review-card footer a:hover { text-decoration: underline; }
a.rating-pill:hover { background: var(--sky-100); }

/* ---------- FAQ ---------- */
.faq-list { max-width: 720px; margin: 0 auto; display: grid; gap: 12px; }
.faq-list details { background: #fff; border: 1.5px solid var(--line); border-radius: var(--radius-sm); padding: 16px 20px; }
.faq-list summary { font-weight: 600; color: var(--navy); cursor: pointer; }
.faq-list p { color: var(--muted); font-size: 0.92rem; margin-top: 10px; }

/* ---------- Footer ---------- */
.site-footer { background: var(--navy-900); color: var(--sky-100); padding: 48px 0 28px; }
.footer-grid { display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 36px; margin-bottom: 32px; }
.footer-grid h4 { color: #fff; font-size: 0.95rem; margin-bottom: 12px; }
.footer-grid ul { list-style: none; display: grid; gap: 8px; font-size: 0.9rem; }
.footer-grid a { color: var(--sky-100); }
.footer-grid a:hover { color: #fff; }
.footer-brand { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
.footer-brand img { width: 40px; height: 40px; }
.footer-tagline { font-size: 0.9rem; max-width: 300px; }
.footer-bottom { border-top: 1px solid rgba(255, 255, 255, 0.12); padding-top: 20px; font-size: 0.8rem; display: flex; justify-content: space-between; flex-wrap: wrap; gap: 8px; }

/* ---------- Cart drawer ---------- */
.overlay {
  position: fixed; inset: 0; background: rgba(18, 41, 74, 0.45); z-index: 150;
  opacity: 0; pointer-events: none; transition: opacity 0.22s ease;
}
.overlay.open { opacity: 1; pointer-events: auto; }
.cart-drawer {
  position: fixed; top: 0; right: 0; bottom: 0; width: min(430px, 100%); background: #fff;
  z-index: 160; transform: translateX(105%); transition: transform 0.26s ease;
  display: flex; flex-direction: column; box-shadow: -12px 0 40px rgba(18, 41, 74, 0.2);
}
.cart-drawer.open { transform: translateX(0); }
.cart-head { display: flex; align-items: center; justify-content: space-between; padding: 20px 22px; border-bottom: 1px solid var(--line); }
.cart-head h2 { font-size: 1.15rem; }
.icon-btn { background: transparent; border: none; font-size: 1.3rem; color: var(--muted); width: 36px; height: 36px; border-radius: 50%; }
.icon-btn:hover { background: var(--pale); color: var(--navy); }
.cart-body { flex: 1; overflow-y: auto; padding: 18px 22px; display: flex; flex-direction: column; gap: 14px; }
.cart-empty { text-align: center; color: var(--muted); padding: 48px 0; }

.promo-progress { background: var(--pale); border-radius: var(--radius-sm); padding: 14px 16px; font-size: 0.85rem; }
.promo-progress .bar { background: #fff; border-radius: 999px; height: 8px; margin-top: 10px; overflow: hidden; }
.promo-progress .fill { background: var(--blue); height: 100%; border-radius: 999px; transition: width 0.3s ease; }
.promo-progress.done { background: var(--success-bg); color: var(--success); font-weight: 600; }
.promo-progress.done .fill { background: var(--success); }

.cart-mode { display: flex; background: var(--pale); border-radius: 999px; padding: 4px; }
.cart-mode button {
  flex: 1; border: none; background: transparent; border-radius: 999px; padding: 9px 6px;
  font-weight: 600; font-size: 0.8rem; color: var(--muted);
}
.cart-mode button.active { background: var(--navy); color: #fff; }

.cart-item { display: flex; gap: 14px; align-items: center; border: 1px solid var(--line); border-radius: var(--radius-sm); padding: 12px 14px; }
.cart-item-thumb { width: 52px; height: 62px; border-radius: 8px; background: linear-gradient(165deg, var(--pale), var(--sky-100)); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.cart-item-thumb svg { height: 46px; width: auto; }
.cart-item-thumb img { max-height: 54px; width: auto; object-fit: contain; }
.product-media img { max-height: 190px; width: auto; object-fit: contain; filter: drop-shadow(0 8px 16px rgba(18, 41, 74, 0.18)); }
.cart-item-info { flex: 1; min-width: 0; }
.cart-item-info h4 { font-size: 0.9rem; color: var(--navy); }
.cart-item-info .line-price { font-size: 0.85rem; color: var(--muted); }
.cart-item .qty-stepper { transform: scale(0.88); transform-origin: right center; }
.cart-item.free-item { border-color: var(--free); background: #fffaf0; }
.free-badge { background: var(--free); color: var(--navy-900); font-size: 0.68rem; font-weight: 800; border-radius: 999px; padding: 2px 9px; letter-spacing: 0.05em; }
.free-item .change-link { font-size: 0.78rem; font-weight: 600; }

.cart-foot { border-top: 1px solid var(--line); padding: 18px 22px 22px; display: grid; gap: 8px; background: #fff; }
.total-row { display: flex; justify-content: space-between; font-size: 0.92rem; color: var(--muted); }
.total-row.savings { color: var(--success); font-weight: 600; }
.total-row.grand { font-size: 1.15rem; font-weight: 700; color: var(--navy); padding-top: 6px; border-top: 1px dashed var(--line); }
.cart-note { font-size: 0.78rem; color: var(--muted); text-align: center; }
/* inline "subscribe and it's free" nudge inside .cart-note */
.link-btn {
  background: none; border: 0; padding: 0; font: inherit; cursor: pointer;
  color: var(--navy); font-weight: 700; text-decoration: underline;
}
.link-btn:hover { color: var(--navy-900); }

/* ---------- Modal (free case picker) ---------- */
.modal {
  position: fixed; inset: 0; z-index: 170; display: none; align-items: center; justify-content: center; padding: 20px;
}
.modal.open { display: flex; }
.modal-card {
  background: #fff; border-radius: var(--radius); max-width: 480px; width: 100%;
  padding: 30px 28px; position: relative; z-index: 2; box-shadow: var(--shadow); max-height: 90vh; overflow-y: auto;
}
.modal-card h3 { margin-bottom: 6px; }
.modal-card > p { color: var(--muted); font-size: 0.9rem; margin-bottom: 18px; }
.free-options { display: grid; gap: 12px; margin-bottom: 20px; }
.free-option {
  display: flex; align-items: center; gap: 14px; border: 2px solid var(--line); border-radius: var(--radius-sm);
  padding: 14px 16px; background: #fff; text-align: left; transition: border-color 0.15s ease; width: 100%;
}
.free-option:hover { border-color: var(--sky); }
.free-option.selected { border-color: var(--blue); background: var(--pale); }
.free-option .cart-item-thumb { width: 46px; height: 56px; }
.free-option h4 { font-size: 0.92rem; color: var(--navy); }
.free-option .val { font-size: 0.8rem; color: var(--success); font-weight: 600; }

/* ---------- Toast ---------- */
.toast {
  position: fixed; bottom: 24px; left: 50%; transform: translate(-50%, 20px); background: var(--navy);
  color: #fff; border-radius: 999px; padding: 12px 24px; font-size: 0.9rem; font-weight: 600;
  box-shadow: var(--shadow); z-index: 180; opacity: 0; pointer-events: none; transition: all 0.25s ease;
}
.toast.show { opacity: 1; transform: translate(-50%, 0); }
.toast.success { background: var(--success); }

/* ---------- Checkout page ---------- */
.checkout-layout { display: grid; grid-template-columns: 1.15fr 0.85fr; gap: 36px; align-items: start; padding: 48px 0 80px; }
.panel { background: #fff; border: 1.5px solid var(--line); border-radius: var(--radius); padding: 28px; box-shadow: var(--shadow-sm); }
.panel + .panel { margin-top: 22px; }
.panel h2 { font-size: 1.2rem; margin-bottom: 18px; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.form-grid .full { grid-column: 1 / -1; }
.field label { display: block; font-size: 0.82rem; font-weight: 600; color: var(--navy); margin-bottom: 5px; }
.field input, .field select, .field textarea {
  width: 100%; border: 1.5px solid var(--line); border-radius: var(--radius-sm); padding: 11px 14px;
  font-size: 0.95rem; font-family: inherit; background: #fff;
}
.field textarea { resize: vertical; min-height: 120px; line-height: 1.5; }
.field input:disabled { background: var(--bg); color: var(--muted); }
.field .optional { font-weight: 400; color: var(--muted); }
.field-hint { font-size: 0.76rem; color: var(--muted); margin-top: 4px; }
.stripe-placeholder {
  border: 1.5px dashed var(--sky); border-radius: var(--radius-sm); background: var(--pale);
  padding: 18px; font-size: 0.86rem; color: var(--navy); margin-bottom: 16px;
}
.freq-options { display: grid; gap: 12px; }
.freq-option {
  display: flex; gap: 14px; align-items: flex-start; border: 2px solid var(--line);
  border-radius: var(--radius-sm); padding: 15px 18px; cursor: pointer; background: #fff;
  transition: border-color 0.15s ease, background 0.15s ease;
}
.freq-option:hover { border-color: var(--sky); }
.freq-option:has(input:checked) { border-color: var(--blue); background: var(--pale); }
.freq-option input { margin-top: 3px; accent-color: var(--blue); width: 18px; height: 18px; flex-shrink: 0; }
.freq-title { display: block; font-weight: 700; color: var(--navy); font-size: 0.98rem; }
.freq-desc { display: block; color: var(--muted); font-size: 0.84rem; margin-top: 2px; }

.summary-list { display: grid; gap: 12px; margin-bottom: 16px; }
.summary-item { display: flex; justify-content: space-between; gap: 12px; font-size: 0.92rem; }
.summary-item .muted { color: var(--muted); font-size: 0.8rem; }
.faq-contact { text-align: center; margin-top: 26px; color: var(--muted); font-size: 0.94rem; }
.faq-contact a { color: var(--navy); font-weight: 700; text-decoration: underline; }

/* ---------- Contact ---------- */
.contact-layout { display: grid; grid-template-columns: 1.15fr 0.85fr; gap: 36px; align-items: start; padding: 48px 0 80px; }
.contact-title { font-size: 1.9rem; margin-bottom: 10px; }
.contact-lede { color: var(--muted); font-size: 0.94rem; line-height: 1.6; margin-bottom: 20px; }
.contact-aside { background: var(--pale); }
.contact-links { list-style: none; display: grid; gap: 10px; font-size: 0.92rem; }
.contact-links a { color: var(--navy); font-weight: 600; text-decoration: underline; }
.contact-links a:hover { color: var(--navy-900); }

.order-confirm { text-align: center; padding: 70px 0 90px; max-width: 560px; margin: 0 auto; }
.order-confirm .big-check {
  width: 72px; height: 72px; border-radius: 50%; background: var(--success-bg); color: var(--success);
  font-size: 2rem; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;
}
.order-confirm h1 { margin-bottom: 12px; }
.order-confirm p { color: var(--muted); margin-bottom: 24px; }

/* ---------- Account page ---------- */
.account-layout { padding: 48px 0 80px; display: grid; gap: 22px; }
.account-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 22px; align-items: start; }
.order-row { display: flex; justify-content: space-between; gap: 14px; padding: 14px 0; border-bottom: 1px solid var(--line); font-size: 0.92rem; flex-wrap: wrap; }
.order-row:last-child { border-bottom: none; }
.status-pill { border-radius: 999px; font-size: 0.72rem; font-weight: 700; padding: 3px 12px; text-transform: uppercase; letter-spacing: 0.05em; }
.status-pill.active { background: var(--success-bg); color: var(--success); }
.status-pill.paused { background: #fff4e0; color: #b97a0a; }
.status-pill.cancelled { background: #fde8e8; color: #b91c1c; }
.sub-actions { display: flex; gap: 10px; margin-top: 16px; flex-wrap: wrap; }
.demo-banner {
  background: var(--pale); border: 1.5px dashed var(--sky); border-radius: var(--radius-sm);
  padding: 12px 18px; font-size: 0.85rem; color: var(--navy);
}

/* ---------- Manhattan landing page ---------- */
.announce-sub { opacity: 0.8; font-weight: 400; }
.sr-only {
  position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
  overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0;
}
.lp-hero-image { background: var(--navy-900); }
.lp-hero-image > a { display: block; line-height: 0; }
.lp-hero-image img { width: 100%; height: auto; display: block; }
.lp-hero-strip { background: var(--navy-900); padding: 18px 0 24px; }
.lp-hero-strip-inner { display: flex; justify-content: space-between; align-items: center; gap: 18px; flex-wrap: wrap; }
.lp-hero {
  position: relative; overflow: hidden; color: #fff;
  background: linear-gradient(165deg, var(--navy-900) 0%, var(--navy) 55%, #24549b 100%);
}
.lp-hero-inner { display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 48px; align-items: center; padding: 72px 0 110px; position: relative; z-index: 2; }
.lp-hero h1 { color: #fff; font-size: clamp(2rem, 4.6vw, 3.2rem); margin-bottom: 18px; }
.lp-hero-sub { color: var(--sky-100); font-size: 1.1rem; max-width: 520px; margin-bottom: 28px; }
.lp-hero .chip { background: rgba(255, 255, 255, 0.1); border-color: rgba(255, 255, 255, 0.22); color: #fff; box-shadow: none; }
.lp-hero-visual { display: flex; justify-content: center; }
.lp-hero-visual img { width: min(360px, 100%); height: auto; object-fit: contain; filter: drop-shadow(0 18px 36px rgba(0, 0, 0, 0.4)); }
.lp-skyline {
  position: absolute; bottom: -2px; left: 0; width: 100%; height: 90px;
  color: rgba(255, 255, 255, 0.07); z-index: 1;
}
.btn-ghost { background: transparent; color: #fff; border-color: rgba(255, 255, 255, 0.6); }
.btn-ghost:hover { background: rgba(255, 255, 255, 0.12); border-color: #fff; }
.lp-compare { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; max-width: 820px; margin: 0 auto; }
.lp-proof-note {
  text-align: center; color: var(--muted); font-size: 0.82rem; margin-top: 28px;
  border: 1.5px dashed var(--line); border-radius: var(--radius-sm); padding: 14px 18px;
  max-width: 620px; margin-left: auto; margin-right: auto;
}
.lp-final {
  background: linear-gradient(165deg, var(--navy) 0%, var(--navy-900) 100%);
  color: #fff; text-align: center; padding: 80px 0;
}
.lp-final h2 { color: #fff; font-size: clamp(1.6rem, 3.4vw, 2.3rem); margin-bottom: 12px; }
.lp-final p { color: var(--sky-100); margin-bottom: 28px; }
.lp-sticky-cta {
  position: fixed; bottom: 0; left: 0; right: 0; z-index: 90; padding: 12px 16px;
  padding-bottom: calc(12px + env(safe-area-inset-bottom));
  background: rgba(255, 255, 255, 0.96); backdrop-filter: blur(8px);
  border-top: 1px solid var(--line); display: none; transition: transform 0.25s ease;
}
.lp-sticky-cta.hidden { transform: translateY(110%); }

/* ---------- Responsive ---------- */
@media (max-width: 920px) {
  .hero-inner { grid-template-columns: 1fr; padding: 44px 0 52px; }
  .hero-visual { order: -1; padding: 24px; }
  .hero-visual svg { width: min(200px, 60%); }
  .offers-grid, .steps-grid { grid-template-columns: 1fr; }
  .reviews-grid .review-card { flex-basis: 100%; }
  .lp-hero-inner { grid-template-columns: 1fr; padding: 44px 0 90px; }
  .lp-hero-visual { order: -1; }
  .lp-hero-visual img { width: min(240px, 70%); }
  .lp-compare { grid-template-columns: 1fr; }
  .lp .lp-sticky-cta { display: block; }
  .products-grid { grid-template-columns: 1fr; }
  .delivery-grid { grid-template-columns: 1fr; }
  .checkout-layout { grid-template-columns: 1fr; }
  .contact-layout { grid-template-columns: 1fr; gap: 22px; }
  .account-grid { grid-template-columns: 1fr; }
  .footer-grid { grid-template-columns: 1fr 1fr; }
}

/* ---------- Compact header: nav collapses into a dropdown menu ----------
   Breakpoint is 1020px (not 920) so the nav never crowds Account/Cart. */
.nav-menu-btn {
  display: none; align-items: center; gap: 8px;
  border: 1.5px solid var(--line); background: #fff; border-radius: 10px;
  padding: 8px 13px; font-family: inherit; font-size: 1rem; font-weight: 600;
  color: var(--navy); cursor: pointer; line-height: 1;
}
.nav-menu-btn:hover { border-color: var(--blue); color: var(--blue); }
.mobile-menu {
  position: absolute; top: calc(100% - 6px); right: 4%;
  background: #fff; border: 1.5px solid var(--line); border-radius: 14px;
  box-shadow: var(--shadow); padding: 8px; min-width: 190px;
  display: grid; gap: 2px; z-index: 60;
}
.mobile-menu a { padding: 11px 14px; border-radius: 9px; color: var(--ink); font-weight: 500; font-size: 0.95rem; }
.mobile-menu a:hover { background: var(--pale); color: var(--blue); }
@media (max-width: 1020px) {
  .main-nav { display: none; }
  .nav-menu-btn { display: inline-flex; }
  /* nav's auto margin is what pushed actions right; replace it when hidden */
  .header-actions { margin-left: auto; }
}
.mobile-menu .menu-account { border-top: 1.5px solid var(--line); margin-top: 6px; padding-top: 12px; font-weight: 600; color: var(--navy); }
/* Phones: icon-only ghost hamburger at the far right; Account moves into the menu */
@media (max-width: 560px) {
  .nav-menu-label { display: none; }
  .nav-menu-btn { border: none; background: transparent; padding: 6px 9px; font-size: 1.4rem; order: 3; }
  .nav-menu-btn:hover { color: var(--blue); }
  .header-actions .account-link { display: none; }
}
@media (max-width: 560px) {
  .section { padding: 52px 0; }
  .form-grid { grid-template-columns: 1fr; }
  .footer-grid { grid-template-columns: 1fr; }
  .brand-name { font-size: 1.05rem; }
  .cart-btn span.label { display: none; }
}

/* ---------- Auth (login/account) ---------- */
.auth-layout { padding: 48px 0 72px; display: flex; justify-content: center; }
.auth-panel { max-width: 440px; width: 100%; }
.user-bar { display: flex; align-items: center; justify-content: space-between; gap: 12px;
  background: var(--pale); border-radius: var(--radius); padding: 12px 18px; margin-bottom: 18px; }
.auth-tabs { display: flex; gap: 6px; background: var(--pale); border-radius: 999px; padding: 5px;
  overflow-x: auto; scrollbar-width: none; }
.auth-tabs::-webkit-scrollbar { display: none; }
.auth-tabs button { flex: 1 0 auto; white-space: nowrap; border: none; background: transparent; padding: 10px 16px; border-radius: 999px;
  font-family: inherit; font-weight: 600; font-size: 0.92rem; color: var(--muted); cursor: pointer; }
.auth-tabs button.active { background: #fff; color: var(--navy); box-shadow: 0 1px 4px rgba(27, 63, 115, 0.14); }
/* Conditional hero art: 16:9 slides in the stacked mobile layout,
   4:3 slides in the desktop side panel (same 921px breakpoint as the layout) */
.hero-slide.slide-desktop { display: none; }
@media (min-width: 921px) {
  .hero-slide.slide-mobile { display: none; }
  .hero-slide.slide-desktop { display: block; }
}
.linklike { border: none; background: none; padding: 0; font-family: inherit; font-size: inherit;
  color: var(--blue); cursor: pointer; font-weight: 600; }
.linklike:hover { text-decoration: underline; }
/* Admin-only entries (header + dropdown) */
.account-link.admin-link { color: var(--blue); font-weight: 600; }
.mobile-menu .menu-admin { font-weight: 600; color: var(--blue); }

/* Admin tab bar: wrap to a 2x2 grid on phones so no tab is ever hidden */
@media (max-width: 560px) {
  .admin-tabs { flex-wrap: wrap; border-radius: 18px; }
  .admin-tabs button { flex: 1 1 40%; padding: 10px 6px; }
}
/* First-visit language chooser */
.lang-gate-overlay {
  position: fixed; inset: 0; z-index: 300; background: rgba(18, 41, 74, 0.55);
  backdrop-filter: blur(3px); display: flex; align-items: center; justify-content: center; padding: 20px;
}
.lang-gate { max-width: 360px; width: 100%; text-align: center; }
.lang-toggle {
  border: 1.5px solid var(--line); background: #fff; border-radius: 999px;
  padding: 7px 12px; font-family: inherit; font-weight: 700; font-size: 0.78rem;
  color: var(--muted); cursor: pointer; letter-spacing: 0.04em;
}
.lang-toggle:hover { border-color: var(--blue); color: var(--blue); }

/* ============================================================
   Grace Spring — component classes used by the rebranded
   ShopSection / CartDrawer / CheckoutClient (appended; later
   rules override any earlier partial definitions).
   ============================================================ */

/* Product card price + deposit badge */
.per-size { color: var(--muted); font-size: 0.88rem; font-weight: 500; }
.per-unit {
  position: absolute; bottom: 10px; right: 12px;
  background: rgba(255,255,255,0.92); border: 1px solid var(--line);
  border-radius: 999px; font-size: 0.72rem; font-weight: 700; color: var(--navy); padding: 3px 9px;
}

/* Cooler add-on modal */
.modal-wrap {
  position: fixed; inset: 0; background: rgba(13,51,32,0.5);
  display: none; align-items: center; justify-content: center; z-index: 300; padding: 16px;
}
.modal-wrap.open { display: flex; }
.modal {
  display: block; background: #fff; border-radius: var(--radius);
  max-width: 520px; width: 100%; padding: 28px; box-shadow: var(--shadow);
  max-height: 92vh; overflow-y: auto;
}
.modal h3 { font-size: 1.3rem; margin-bottom: 6px; }
.modal .sub { color: var(--muted); font-size: 0.92rem; margin-bottom: 16px; }
.cooler-promo {
  background: var(--pale); border: 1px solid var(--sky); border-radius: 9px;
  padding: 10px 12px; font-size: 0.86rem; color: var(--navy); font-weight: 600; margin-bottom: 18px;
}
.opt-group { margin-bottom: 16px; }
.opt-group > label {
  display: block; font-size: 0.75rem; font-weight: 700; text-transform: uppercase;
  letter-spacing: 0.05em; color: var(--muted); margin-bottom: 8px;
}
.opt-row { display: flex; gap: 8px; flex-wrap: wrap; }
.opt-row button {
  border: 1px solid var(--line); background: #fff; border-radius: 999px;
  padding: 9px 16px; font-weight: 600; font-size: 0.88rem; color: var(--navy);
}
.opt-row button.sel { background: var(--navy); color: #fff; border-color: var(--navy); }
.cooler-price {
  margin: 16px 0; font-weight: 700; color: var(--navy); font-size: 1rem;
}
.cooler-price small { display: block; font-weight: 500; color: var(--muted); font-size: 0.8rem; margin-top: 3px; }
.modal-actions { display: flex; gap: 12px; align-items: center; margin-top: 6px; }

/* Reminder (text/email/phone) box */
.notify-box { background: var(--bg); border: 1px solid var(--line); border-radius: var(--radius-sm); padding: 14px; margin: 14px 0; }
.notify-box strong { color: var(--navy); font-size: 0.95rem; }
.notify-box p { font-size: 0.82rem; color: var(--muted); margin: 4px 0 10px; }
.notify-opts { display: flex; gap: 8px; }
.notify-opts button {
  flex: 1; border: 1px solid var(--line); background: #fff; border-radius: 999px;
  padding: 8px; text-align: center; font-size: 0.85rem; font-weight: 600; color: var(--navy);
}
.notify-opts button.sel { background: var(--blue); color: #fff; border-color: var(--blue); }

/* Free-bundle + deposit sub-notes */
.free-note { display: block; color: var(--success); font-weight: 600; font-size: 0.82rem; }
.sub-note { display: block; color: var(--muted); font-size: 0.75rem; font-weight: 400; }
.total-row .plus { color: var(--water); font-weight: 600; }

# Blue Star design system (theme: shopify-theme-bluestar)

## Tokens (theme settings → CSS variables in layout/theme.liquid)

| Token | Setting | Default | Use |
|---|---|---|---|
| `--navy-900` | color_navy_900 | #0f2747 | footer, darkest surfaces |
| `--navy` | color_navy | #1b3f73 | headings, dark sections (delivery band), cart button |
| `--blue` | color_blue | #1f76bf | primary buttons, links, accents (4.8:1 on white) |
| `--blue-600` | color_blue_600 | #1b6aab | hover |
| `--sky` / `--sky-100` | color_sky / color_sky_100 | #8cc4ee / #d6eaf8 | focus ring, text on dark |
| `--pale` | color_pale | #eaf4fc | soft surfaces, chips, media backgrounds |
| `--bg` | color_bg | #f6fafd | page background |
| `--ink` / `--muted` | color_ink / color_muted | #13233a / #5a6b80 | body text / secondary text |
| `--line` | color_line | #d9e6f2 | borders |
| `--free` | color_free | #f5a623 | gold badges (MEGA SALE), cart count |

Radius 14px (cards) / 9px (inputs) / 999px (buttons, chips). Shadows: `--shadow`, `--shadow-sm`.
Type: Poppins 600/700 headings, Inter 400–700 body, 16px base, 1.6 line-height.
Hero titles clamp(2rem, 4.4vw, 3.1rem); section titles clamp(1.6rem, 3vw, 2.2rem).

## Components (classes in assets/base.css)

`.btn .btn-primary/.btn-outline/.btn-light`, `.chip`, `.eyebrow`, `.section-head`, `.offer-card`,
`.product-card` (`snippets/product-card.liquid`), `.step-card`, `.delivery-card`, `.panel`, `.qty-stepper`,
`.price-row .price-now/.price-was/.price-tag`, cart drawer (`snippets/cart-drawer*.liquid`).
Grids: add `cols-grid` + `{% render 'grid-cols', desktop:, mobile: %}`.

## Sections inventory

hero (product promo, live price, badge, backgrounds: gradient / blue waves / image, H1/H2), trust-stats, offers,
featured-collection (hand-picked products, columns), water-cards, how-it-works, delivery (ZIP checker),
newsletter, faq (+ FAQ JSON-LD), custom-liquid (Elfsight reviews), rich-text (H1/H2, two buttons), main-* page sections
(main-404: search + two buttons; main-contact: buttons inside the contact card).
Header: logo, menu, search (predictive), language toggle, account, cart. Footer: menu columns.

## Content rules

- Facts must come from the store or the owner: hours M–F 8–6, Sat 8–4; phone 973-742-0435;
  email bluealkaiddistributor@gmail.com; 527 E 39th St, Paterson, NJ 07504; licensed by NJ DOH; since 2010.
- Product names: Re-Fill (customer's own bottles) vs New Bottle; ALKAID is the alkaline brand.
- No invented prices, guarantees or delivery times. Ask the owner when unsure.
- Keep CTAs short and action-first: "Claim the Offer", "Order Water", "Call Us".

## Known findings (audit, Oct 2026)

- Fixed: primary blue is now `#1f76bf` (4.8:1 on white; was `#2d7dd2`, 4.2:1) with hover `#1b6aab`.
  `#2280cc` stays only as a decorative wave color — don't use it for text or buttons.
- Fixed: "I need New Bottles" now links to `/pages/get-bottles#new-bottles`.
- Fixed (pages audit): account pages had no auth styles; mobile search button overflowed; footer wordmark font
  wasn't loaded when the header used a logo; single products sat off-center (grids cap columns at item count);
  About and Privacy had no H1. About now has hero + trust stats + CTAs, 404 has search + links.
- Owner declined an address/map block on Contact — don't re-propose it.

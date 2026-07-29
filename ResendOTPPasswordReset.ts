# Grace Spring Water — gracespringwater.com

E-commerce site for Grace Spring bottled alkaline water (a brand of Blue Star Pure
Water, Paterson NJ, est. 2010). Owner: Omari Prince (omari.j.prince@gmail.com).

## Stack

- **Next.js 15 App Router** (JavaScript, no TS on the frontend) — pages in `app/`
- **Convex** backend (TypeScript in `convex/`): auth, orders, monthly-refill
  enrollments, ops/admin, Stripe, emails
  - dev deployment: `<your-dev-deployment>` · prod: `<your-prod-deployment>`
- **Convex Auth** email/password (`@convex-dev/auth`), reset codes via Resend
- **Stripe Checkout** — sessions built with inline `price_data` computed
  server-side in `convex/stripe.ts` (never trust client totals); webhook at
  `{deployment}.convex.site/stripe/webhook`
- **Resend** for email (domain verified for gracespringwater.com; sender in
  `EMAIL_FROM` env)
- **Vercel** hosting: push to `main` → production build which ALSO deploys
  Convex prod functions (`vercel.json` buildCommand, gated on
  `VERCEL_ENV=production`); pushes to `dev` → preview builds against dev Convex

## Language (EN/ES)

The whole UI is bilingual via `lib/lang-context.js`: `const { L } = useLang()`
then `L("English", "Español")` inline at every call site (no key files; two
languages by design). Preference persists in localStorage; first visit shows
the LanguageGate popup; header has an EN/ES toggle. Translations are natural
Spanish (owner request), not literal. Review quotes stay in original English.
Still English-only: Manhattan LP custom copy, transactional emails, metadata/
JSON-LD (English SEO primary).

## Working agreements

- Work on `dev`; release by fast-forwarding: `git push origin dev:main`
  (avoids local branch switches while the dev server holds file locks)
- `styles.css` heritage: all styling is in `app/globals.css` with the original
  class names; keep visual changes surgical
- **Business rules live in `lib/catalog.js` ONLY** (catalog, prices, promo
  engine `computeTotals`, ZIP coverage). Frontend, cart, checkout, and the
  Convex backend all import it — change prices/rules in one place.
  If a price changes, also update the mirror product in the Stripe dashboard.

## Business rules (owner-confirmed July 2026)

5-gallon home & office delivery model (Twin Rocks-style). NO auto-charge
subscription and NO buy-6-get-1. All amounts live in `lib/catalog.js` only.

- Products: three 5-gallon waters — Alkaline (ALKAID label) $8.50, Purified
  (Blue Star label) $7.25, Natural (Grace Spring label) $8.99 — plus a
  6-pack of 1-gal Grace Spring $9.00 and two ALKAID retail cases
  (24×16oz $21.99, 12×33.8oz $19.49). No refills.
- **Bottle deposit**: one-time **$5.00 per returnable 5-gallon jug**, charged
  on a customer's FIRST order only (`users.holdsDeposit` suppresses it after);
  refundable on empty return. `DEPOSIT.perBottle` in `lib/catalog.js`.
- **Shipping**: flat **$5.00 per delivery**, one-time and monthly alike.
  `DELIVERY.shipping` in `lib/catalog.js`.
- **Cooler offer**: Avalon cooler, **buy-only $180** (`COOLER.price`). Buying
  one auto-adds 5 free 5-gallon bottles + a bottle stand (the free bundle is
  granted in `computeTotals`, valued at $0).
- **Monthly refill service** = reminder enrollment, NOT auto-charge. On a
  `mode:"monthly"` order we write a `refillEnrollments` row; a team member /
  cron reminds the customer (text / email / phone) the day before each route
  and they reply with a quantity. Both one-time and monthly orders are a
  single Stripe payment.
- ZIP coverage (CONFIRMED): NJ 070–079 (Bergen, Hudson, Passaic, Essex,
  Union, Morris) + NYC five boroughs 100–104, 110–114. NO upstate / Nassau.
- Damaged delivery → customer keeps it, free replacement (admin "Replace").
  Stolen → refund (admin "Refund"). Deliveries photo-documented in /admin.

## Ops / admin

- `/admin` = Operations dashboard (metrics, live order board with status
  pipeline, delivery photos, replacements/refunds, customers, Routes)
- **Routes/dispatch** (`convex/routes.ts`): build a day's route from open
  orders (auto-sorted by ZIP), auto-summed truck pick list, driver gets a
  TOKENIZED LINK (`/route/{token}`) — no account, built for borrowed Blue
  Star drivers. Driver marks stops delivered (+photo) → customer gets a
  "delivered" email (`convex/emails.ts`).
- **Monthly refill (reminder, not auto-charge)**: a `mode:"monthly"` order
  writes a `refillEnrollments` row. There is NO Stripe subscription and NO
  `invoice.paid` — the Stripe webhook only handles `checkout.session.*`.
  Reminding the customer each cycle (text / email / phone) is an ops action;
  wire it to your reminder tooling of choice.
- **Support inbox**: `/contact` writes a `contactMessages` row, then
  `emails.sendContactEmail` mails it to `support@gracespringwater.com` with
  `replyTo` = the customer, so Reply answers them directly. Override the
  destination with the `SUPPORT_EMAIL` Convex env var. The row is written
  first and stamped with the send result — a Resend outage loses the
  notification, never the message.
- **Cart recovery**: hourly cron (`convex/crons.ts`) →
  `emails.sendAbandonedCartEmails`. A `pending` order is a cart that reached
  Stripe Checkout and never paid. Orders aged 1–24h are emailed ONCE; each is
  stamped (`abandonedEmailSentAt`) before its send, so retries and overlapping
  runs can't double-chase a customer.
- Gated by `users.isAdmin`; grant with
  `npx convex run admin:grantAdminByEmail '{"email":"..."}'` (add `--prod`
  for production). Owner's prod account: omari.j.prince@gmail.com

## Launch status (July 2026)

- Rebranded from the Alkaid template to the Grace Spring 5-gallon model:
  storefront (home/shop/cart/checkout), catalog, order engine, Stripe line
  items, schema, emails, ops dashboard, and copy are all on the new model.
- Real product photography is in `public/assets/` (alkaline/purified/natural
  5-gal, ALKAID 12- & 24-pack, 6-pack). `logo-mark.png` is a PLACEHOLDER
  water-drop — replace with the real Grace Spring wordmark/mark.
- Checkout demo-falls-back wherever Stripe keys are absent; paste live keys +
  webhook secret into prod Convex env vars to go live. See LAUNCH-CHECKLIST.md.
- Open items: verify `next build` in your env, supply real `logo-mark.png`,
  point `support@gracespringwater.com` at a real inbox, wire the monthly
  refill reminder to your SMS/email tooling.

## Convex CLI on Node 24 (Windows)

`npx convex login` crashes on exit with
`Assertion failed: !(handle->flags & UV_HANDLE_CLOSING), file src\win\async.c`
— a libuv/Node 24 teardown bug, NOT a login failure. The token is saved before
the crash: check with `npx convex login status` before retrying.

The interactive project picker in `convex dev` can hit the same crash. Skip it
by naming everything up front:


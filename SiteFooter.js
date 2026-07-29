# Grace Spring Water — Launch Checklist

This codebase is the Alkaid storefront **rebranded to Grace Spring's 5-gallon
delivery model**: green brand, three 5-gallon waters + cases, one-time bottle
deposit, flat shipping, an Avalon-cooler offer, and a monthly *reminder* refill
service (no auto-charge subscription). Work through this before going live.

## 0. Verify the build (do this first)
This was assembled in a sandbox with no package registry, so it was **not**
built here. In your environment:
```bash
npm install
npx convex dev          # creates your project, writes .env.local, generates convex/_generated
npm run dev             # http://localhost:4173
npm run build           # confirm a clean production build
```
If `npm run build` flags anything, it'll be a small copy/import fix — the model,
schema, and Stripe layer are already consistent.

## 1. Brand assets
- [ ] Replace `public/assets/logo-mark.png` — currently a PLACEHOLDER green
      water-drop. Supply the real Grace Spring mark (square, transparent; it
      sits on white in the header and on dark green in the footer).
- [ ] The wordmark renders as the **Anton** web font (header/footer). Swap for
      your real logo lockup if you prefer an image.
- [x] Product photos are real and in `public/assets/`:
      `alkaline-5gal.png` (ALKAID label), `purified-5gal.png` (Blue Star),
      `natural-5gal.png` (Grace Spring), `case-6pk.png`, `alkaid-24-16oz.png`,
      `alkaid-12-33oz.png`.

## 2. Prices & rules — all in `lib/catalog.js` (single source of truth)
- [ ] `CATALOG` prices: Alkaline 8.50 · Purified 7.25 · Natural 8.99 · 6-pack
      9.00 · ALKAID 24×16oz 21.99 · ALKAID 12×33.8oz 19.49.
- [ ] `DEPOSIT.perBottle` = 5.00 (one-time, first order, refundable).
- [ ] `DELIVERY.shipping` = 5.00 (flat per delivery).
- [ ] `COOLER.price` = 180.00, buy-only; auto-grants 5 free bottles + a stand.
      `COOLER.freeBottleId` = which water the 5 free bottles are (default
      natural). Confirm loader/color options.
- [ ] `ZIP_PREFIXES`: NJ 070–079 + NYC 100–104, 110–114. Trim/extend to your
      real routes.
- Changing any of these here updates the cart, checkout, Stripe line items,
  order rows, emails, and all on-site copy automatically.

## 3. Stripe (you're setting this up)
- [ ] Create your Stripe account; add `STRIPE_SECRET_KEY` to Convex env
      (`npx convex env set STRIPE_SECRET_KEY sk_...`, repeat with `--prod`).
- [ ] Add the webhook endpoint `https://<deployment>.convex.site/stripe/webhook`
      and subscribe to `checkout.session.completed` and
      `checkout.session.expired`; put the signing secret in
      `STRIPE_WEBHOOK_SECRET`. **No `invoice.paid`** — there are no auto-charge
      subscriptions in this model.
- Until keys exist, checkout **demo-falls-back** (confirms without charging).

## 4. Convex / Resend / Vercel
- [ ] `npx convex env set AUTH_RESEND_KEY re_...`, `EMAIL_FROM`,
      `SITE_URL https://gracespringwater.com`, `SUPPORT_EMAIL ...` (dev + prod).
- [ ] Verify your sending domain in Resend; point `support@gracespringwater.com`
      at a real inbox before `/contact` is useful.
- [ ] Deploy on Vercel; `vercel.json` deploys Convex prod functions on
      production builds. Grant yourself admin:
      `npx convex run admin:grantAdminByEmail '{"email":"you@..."}'` (`--prod`).

## 5. Monthly refill reminders (ops)
- A `mode:"monthly"` order writes a `refillEnrollments` row with the customer's
  `notifyMethod` (text/email/phone) and last items. There is **no** automatic
  billing. Wire the day-before reminder to your SMS/email tool (e.g. a Convex
  cron + Twilio/Resend). The hooks and data are in place; the send is yours.

## 6. Copy & legal
- [ ] The site avoids health claims; "9.5 pH / electrolytes" appear only as
      ALKAID product attributes. Keep that discipline.
- [ ] Confirm the deposit-refund and damaged/stolen policies are true for you
      (FAQ + `/admin` Replace/Refund actions).
- [ ] Spanish copy is natural EN/ES via `L("en","es")` — have a native speaker
      skim the rebranded strings.

## What changed from the Alkaid template
Removed: auto-charge subscriptions, "Buy 6 get 1 free," the Manhattan SEO
landing page, Saratoga SKUs. Added: bottle deposit, flat shipping, Avalon
cooler + free-bundle, monthly-reminder refill (text/email/phone), the
green/cream Grace Spring brand, and real product photography.

## Added in this iteration
- **Automatic route planning** (`convex/routes.ts`): creating a route now orders
  stops by nearest-neighbor from the Paterson depot, and every route exposes a
  `mapsUrl` — a Google Maps directions link (depot → stops in order → depot, no
  API key). Admin Routes tab has "Open route in Google Maps" + "Auto-optimize
  order"; the driver's tokenized page has "Navigate the whole route." Swap
  `coordFor()` for a real geocoder + Directions API for house-level optimization.
- **Account order history** (`app/account/AccountClient.js`) now shows each
  order's delivery address, window, status, and deposit — plus monthly-refill
  enrollment. Account creation is Convex Auth (email/password) on `/login`.
- **Admin dashboard** (`/admin`): live order board (amounts, addresses, items,
  status pipeline), metrics tiles, customers, and the route planner above.

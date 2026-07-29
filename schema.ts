# Deploy Grace Spring — GitHub → Vercel → Convex

This app has three linked pieces: **GitHub** (your code), **Vercel** (hosting +
builds), and **Convex** (the backend/database the site talks to). Set up Convex
first, because Vercel's production build deploys your Convex functions and the
site needs the Convex URL to run. Do the steps in order.

Prereqs: Node 18+ installed, a GitHub account, a Vercel account, a Convex
account (free). Open a terminal in the unzipped `gracespring` folder.

---

## A. Put the code in Git
```bash
git init
git add .
git commit -m "Grace Spring Water — initial"
```
(`.gitignore` already excludes `node_modules`, `.next`, and `.env.local`, so
secrets and build output won't be committed.)

## B. Push to GitHub
**Easiest (GitHub CLI):**
```bash
gh repo create grace-spring-water --private --source=. --push
```
**Or via the website:** create a new empty repo at github.com (no README), then:
```bash
git remote add origin https://github.com/<your-username>/grace-spring-water.git
git branch -M main
git push -u origin main
```

## C. Set up Convex (do before Vercel)
```bash
npm install
npx convex dev      # opens browser to log in, creates your project,
                    # writes .env.local with NEXT_PUBLIC_CONVEX_URL,
                    # and generates convex/_generated. Ctrl-C once it says "Convex functions ready".
```
Set your backend secrets on Convex (repeat each with `--prod` for production):
```bash
npx convex env set SITE_URL https://gracespringwater.com
npx convex env set AUTH_RESEND_KEY re_xxx
npx convex env set EMAIL_FROM "Grace Spring Water <orders@gracespringwater.com>"
npx convex env set SUPPORT_EMAIL support@gracespringwater.com
# Stripe (when your account is ready):
npx convex env set STRIPE_SECRET_KEY sk_live_xxx
npx convex env set STRIPE_WEBHOOK_SECRET whsec_xxx
```
Then in the **Convex dashboard → Settings → Deploy Keys**, generate a
**Production deploy key** and copy it (used in the next step).
Also copy your **Production deployment URL** (looks like
`https://<name>.convex.cloud`) from the dashboard.

## D. Import to Vercel
1. Go to **vercel.com → Add New → Project → Import Git Repository**. Authorize
   Vercel to access GitHub if it's your first time, and pick the repo you pushed.
2. Framework preset auto-detects **Next.js**. Leave the build command as-is —
   it comes from `vercel.json` (production builds run `convex deploy` for you).
3. Open **Environment Variables** and add:
   - `NEXT_PUBLIC_CONVEX_URL` = your **production** Convex URL from step C
   - `CONVEX_DEPLOY_KEY` = the **production deploy key** from step C
4. Click **Deploy**. From now on, every `git push` to `main` auto-deploys.

## E. After the first deploy
- **Domain:** Vercel → your project → Settings → Domains → add
  `gracespringwater.com` and follow the DNS instructions.
- **Stripe webhook:** in Stripe, add endpoint
  `https://<your-convex-deployment>.convex.site/stripe/webhook`, subscribe to
  `checkout.session.completed` + `checkout.session.expired`, and put the signing
  secret in `STRIPE_WEBHOOK_SECRET` (Convex, prod).
- **Make yourself admin** (so `/admin` works):
  ```bash
  npx convex run admin:grantAdminByEmail '{"email":"you@example.com"}' --prod
  ```

## Everyday workflow
Edit code → `git push` → Vercel rebuilds and redeploys automatically. Backend
changes deploy with it (via `convex deploy` in the production build). Change
prices/rules in `lib/catalog.js` only.

## Common gotchas
- **Build fails: "NEXT_PUBLIC_CONVEX_URL is not defined"** → add it in Vercel env vars (step D3).
- **Build fails on `convex deploy`** → `CONVEX_DEPLOY_KEY` missing/typo in Vercel.
- **Payments don't charge** → Stripe keys not set on Convex yet; checkout demo-falls-back until they are.
- **Never commit `.env.local`** → it's already git-ignored; keep it that way.

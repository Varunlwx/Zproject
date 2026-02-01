# Deployment Readiness — Vercel + Firebase (Zcloths)

Step-by-step production deployment guide for the Zcloths e-commerce platform.

---

## 1. Pre-deployment checklist

### 1.1 Secrets and environment

- [ ] All variables from `.env.example` are set in Vercel (Project → Settings → Environment Variables).
- [ ] No `.env.local` or secrets committed; `.gitignore` includes `.env*` (except `.env.example`).
- [ ] Razorpay: use **live** keys (`live_*`); remove or override `test_` keys.
- [ ] Firebase Admin: production service account JSON or `FIREBASE_PROJECT_ID` + `FIREBASE_CLIENT_EMAIL` + `FIREBASE_PRIVATE_KEY`; ensure `FIREBASE_PRIVATE_KEY` newlines are correct (e.g. `\n` as actual newline in Vercel).
- [ ] Upstash Redis: production Redis created; `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` set (required for rate limiting).
- [ ] Shiprocket: live API credentials; optional `SHIPROCKET_PICKUP_PINCODE` for rates.
- [ ] Razorpay webhook: `RAZORPAY_WEBHOOK_SECRET` set and webhook URL configured in Razorpay Dashboard.

### 1.2 Code and build

- [ ] Run `npm run lint` and fix blocking issues.
- [ ] Run `npx tsc --noEmit` (no type errors).
- [ ] Run `npm run build` on a clean clone (no `ANALYZE` or extra env) and fix build errors.
- [ ] Resolve **Critical** and **High** items in `docs/SECURITY-AUDIT.md` before going live (especially payment amount and Firestore rules).

### 1.3 Firebase

- [ ] Deploy rules: `firebase deploy --only firestore:rules,storage`.
- [ ] Deploy indexes: `firebase deploy --only firestore:indexes`; wait for composite indexes to finish building.
- [ ] Confirm Firestore rules: `isAdmin()` is null-safe (see Security Audit).
- [ ] Plan: upgrade to **Blaze** if you expect to exceed Spark limits (reads/writes, auth, etc.).

---

## 2. Environment variable mapping (Vercel)

Set these in **Vercel → Project → Settings → Environment Variables**. Use **Production** (and Preview if you want same behavior there).

| Variable | Required | Notes |
|----------|----------|--------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Yes | Firebase client config |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Yes | e.g. `project-id.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Yes | |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Yes | |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Yes | FCM |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Yes | |
| `FIREBASE_PROJECT_ID` | Yes* | Server; can match `NEXT_PUBLIC_*` |
| `FIREBASE_CLIENT_EMAIL` | Yes* | Service account |
| `FIREBASE_PRIVATE_KEY` | Yes* | Full key; newlines as `\n` in UI |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Yes | Live key for checkout UI |
| `RAZORPAY_KEY_SECRET` | Yes | Server only |
| `RAZORPAY_WEBHOOK_SECRET` | Yes | From Razorpay webhook config |
| `SHIPROCKET_EMAIL` | Yes | If using shipping |
| `SHIPROCKET_PASSWORD` | Yes | |
| `UPSTASH_REDIS_REST_URL` | Yes | For rate limiting |
| `UPSTASH_REDIS_REST_TOKEN` | Yes | |
| `NEXT_PUBLIC_SITE_URL` | Yes | e.g. `https://zcloths.com` (no trailing slash) |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | No | Analytics |
| `NEXT_PUBLIC_SENTRY_DSN` | No | Error tracking |
| `NEXT_PUBLIC_FIREBASE_VAPID_KEY` | No | Push notifications |

\* Or use a single `FIREBASE_SERVICE_ACCOUNT` JSON string (e.g. for local or CI).

---

## 3. Domain and SSL

- [ ] In Vercel: add custom domain (e.g. `zcloths.com`, `www.zcloths.com`) and follow DNS instructions.
- [ ] SSL is automatic (Vercel + Let’s Encrypt); wait for certificate to be active.
- [ ] Set `NEXT_PUBLIC_SITE_URL` to your canonical URL (e.g. `https://zcloths.com`).
- [ ] In Razorpay: set webhook URL to `https://your-domain.com/api/razorpay/webhook`.

---

## 4. Build and optimization

### 4.1 Next.js

- **Build command:** `next build` (or `npm run build`; ensure it uses `next build`).
- **Output:** default (no static export for this app).
- **Install command:** `npm ci` (recommended for reproducible builds).

### 4.2 Optional

- **Bundle analysis:** set `ANALYZE=true` in Vercel env (or locally) to generate report; remove after tuning.
- **PWA:** `next-pwa` is configured; ensure `public/sw.js` and `public/workbox-*.js` are not ignored and are deployed.
- **Images:** `next/image` with `remotePatterns` and CDN (Vercel Image or your CDN) as needed.

### 4.3 Project structure (Vercel)

- Root: `package.json`, `next.config.ts`, `src/`, `public/`.
- No need to set “Root Directory” unless the app lives in a subfolder.
- API routes under `src/app/api/` are picked up automatically.

---

## 5. API routing and behavior

- **Razorpay:** `/api/razorpay/create-order`, `/api/razorpay/verify` (auth + rate limit + CSRF); `/api/razorpay/webhook` (signature + rate limit, no auth).
- **Shiprocket:** `/api/shiprocket/*` require auth; add CSRF and rate limiting (see Security Audit).
- **Test:** Remove or strictly guard `/api/test-shiprocket` in production (e.g. disable when `NEXT_PUBLIC_SITE_URL` is production).

---

## 6. Image and CDN

- Product images: use `next/image` with appropriate `sizes` for LCP.
- If using Vercel Image Optimization: keep `images.domains`/`remotePatterns` in sync with image hostnames.
- Optional: put static assets behind a CDN and set `ASSET_PREFIX` if required by your setup.

---

## 7. Error logging and monitoring

- [ ] **Sentry:** set `NEXT_PUBLIC_SENTRY_DSN`; add Sentry SDK and error boundary reporting (see Security Audit).
- [ ] **Vercel:** enable “Web Vitals” / Analytics if desired.
- [ ] **Logs:** use Vercel Functions logs and/or external log aggregation; avoid logging secrets or full tokens.

---

## 8. Rollback strategy

- **Vercel:** use “Promotions” to roll back to a previous deployment (Deployments → … → Promote to Production).
- **Firebase:** keep a backup of `firestore.rules` and `storage.rules` in git; redeploy previous version if needed.
- **Env:** document last-known-good env set; avoid changing multiple secrets at once.

---

## 9. Post-deployment verification

- [ ] Homepage and key pages load (/, /shop, /product/..., /cart, /checkout when logged in).
- [ ] Auth: sign up, sign in, sign out; redirect after login (e.g. from checkout) works if implemented.
- [ ] Cart: add/remove items; for logged-in user, cart persists (Firestore).
- [ ] Checkout: run a **small live payment** (then refund in Razorpay Dashboard); confirm order appears in Firestore and (if implemented) webhook updates status.
- [ ] COD: place a test COD order and confirm it appears under user orders.
- [ ] Rate limit: trigger 429 on a critical endpoint (e.g. create-order) when over limit.
- [ ] Sitemap/robots: open `https://your-domain.com/sitemap.xml` and `robots.txt` (or `/robots` if used).

---

## 10. CI/CD readiness

- **Branch protection:** require passing build (and optionally lint/test) before merge to `main`.
- **Vercel:** connect repo; production branch = `main` (or your choice); previews for PRs.
- **Checks to run in CI:** `npm ci`, `npm run lint`, `npx tsc --noEmit`, `npm run build`. Add `npm audit` and fail on high/critical (see Security Audit).
- **Secrets:** never commit env; use Vercel env (or GitHub Actions secrets only for non-Vercel CI).

---

## 11. Scaling readiness

- **Serverless:** Next.js API routes and Vercel serverless scale with traffic; no app-level scaling config needed.
- **Firebase:** monitor Firestore read/write and auth usage; upgrade plan and add indexes as needed.
- **Rate limiting:** Upstash Redis is shared; ensure plan supports expected QPS.
- **Razorpay / Shiprocket:** respect their rate limits; use retries with backoff for transient errors.

---

## 12. Performance suggestions

- Use `next/image` with `sizes` and AVIF/WebP where applicable.
- Lazy-load below-the-fold sections and heavy components (e.g. reviews).
- Consider ISR or caching for product listing if data is not strictly real-time.
- Minimize client-side Firebase listeners (e.g. one subscription per collection per user).

---

*End of Deployment Guide.*

# Deployment Readiness & Production Guide: Zcloths

This guide provides a professional, step-by-step roadmap for deploying the Zcloths e-commerce platform to production. It follows industry best practices for security, performance, and reliability.

---

## 1. Pre-Deployment Checklist

### 🔑 Secret Management
- [ ] **Environment Variables**: Ensure all variables from `.env.example` are configured in the Vercel Dashboard.
- [ ] **Razorpay Keys**: Switch from `test_` keys to `live_` keys in Razorpay Dashboard.
- [ ] **Firebase Admin SDK**: Generate a production service account JSON and set `FIREBASE_PRIVATE_KEY` correctly (handle newlines).
- [ ] **Upstash Redis**: Ensure production database is created and REST credentials are set.
- [ ] **Shiprocket**: Verify API credentials for the live Shiprocket account.

### 📦 Build & Code Quality
- [ ] **Lint Clean-up**: Address the 43 critical lint errors identified during audit.
- [ ] **TypeScript Check**: Run `npx tsc --noEmit` to ensure type safety.
- [ ] **Local Build**: Verify `npm run build` succeeds on a fresh clone.

---

## 2. Backend & Database Validation

### 🔥 Firebase Setup
- [ ] **Security Rules**: Deploy `firestore.rules` and `storage.rules`. Verify `isAdmin()` logic works with your production user IDs.
- [ ] **Indexes**: Ensure `firestore.indexes.json` is deployed. Non-indexed queries will fail in production.
- [ ] **Data Plan**: Upgrade from Firebase Spark (Free) to Blaze (Pay-as-you-go) before launch to avoid limit-related crashes.

### 💳 Payment Integrity
- [ ] **Webhook Configuration**: Set the Razorpay webhook URL to `https://your-domain.com/api/razorpay/webhook`.
- [ ] **Webhook Secret**: Ensure `RAZORPAY_WEBHOOK_SECRET` is configured to prevent spoofing.
- [ ] **Idempotency**: Verify `processed_payments` collection is being populated to prevent double-charging.

---

## 3. Security Hardening

### 🔒 Access Control
- [ ] **Admin Panel**: Restrict `/zadmin` (or its separate domain) to specific IP ranges or enforce MFA via Firebase Auth.
- [ ] **CORS**: Update `NEXT_PUBLIC_SITE_URL` in environment variables to your production domain to enable CSRF protection.

### 🛡️ Vulnerability Mitigation
- [ ] **Rate Limiting**: Verify Upstash Redis is active. Test by making 60+ requests to `/api/razorpay/create-order` and checking for 429 status.
- [ ] **Dependency Audit**: Run `npm audit` and fix high/critical vulnerabilities.

---

## 4. Performance Optimization

### ⚡ Asset & Delivery
- [ ] **Image Optimization**: Ensure all product images use `next/image` with appropriate `sizes` attributes for LCP optimization.
- [ ] **Production Analytics**: Enable Google Analytics by setting `NEXT_PUBLIC_GA_MEASUREMENT_ID`.
- [ ] **PWA**: Verify service worker is active and caching strategy is set in `next.config.ts`.

---

## 5. CI/CD & Hosting (Vercel)

### 🚀 Pipeline Setup
- [ ] **Branch Protection**: Protect `main` branch. Require passing builds before merging.
- [ ] **Preview Deployments**: Use Vercel's automatic previews for testing new features.
- [ ] **Custom Domain**: Connect `zcloths.com` (or your chosen domain) to Vercel and verify SSL status.

---

## 6. Monitoring & Operations

### 📈 Logging & Metrics
- [ ] **Sentry**: (Recommended) Setup Sentry for real-time error tracking beyond browser consoles.
- [ ] **Vercel Analytics**: Enable "Web Vitals" in Vercel to monitor Core Web Vitals (LCP, CLS, INP).

### 💾 Backups & Rollback
- [ ] **Firestore Backups**: Schedule daily exports to a Cloud Storage bucket via GCP Console.
- [ ] **Instant Rollback**: Familiarize yourself with Vercel's "Promote to Production" feature for quick rollbacks.

---

## 7. Post-Deployment Testing

### ✅ Smoke Tests
- [ ] **Core Flow**: Complete a real purchase with a live payment (can refund later).
- [ ] **Admin Flow**: Verify a product can be added/edited via the Admin panel.
- [ ] **SEO**: Use Google Search Console to submit `sitemap.xml`.

### 🛠️ Maintenance Plan
- [ ] **Weekly Dependency Checks**: Run `npm outdated` every Monday.
- [ ] **Monthly Rule Review**: Review Firebase Security Rules for any "shadow" collections.

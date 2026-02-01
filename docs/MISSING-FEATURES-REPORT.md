# Missing Features Report — Zcloths vs Modern Ecommerce Standard

Gap analysis of the Zcloths platform against production e-commerce expectations.

---

## 1. Customer experience

| Feature | Status | Notes |
|--------|--------|--------|
| Product listing with filters | ✅ | Shop page, category/subcategory, client-side search |
| Product detail (images, sizes, add to cart) | ✅ | Product page, sizes, cart/wishlist |
| Cart (guest + logged-in) | ✅ | LocalStorage guest; Firestore sync for logged-in |
| Checkout (address, payment, COD) | ✅ | Address form, Razorpay, COD; coupon UI present |
| Post-login redirect | ❌ | Login/signup ignore `?redirect=`; user lands on home |
| Order history & detail | ✅ | Orders list, order detail with status |
| Order tracking (Shiprocket) | ✅ | API and UI for AWB/shipmentId; response maps courier name incorrectly (low) |
| Wishlist | ✅ | Wishlist context and page |
| Saved addresses | ✅ | Address context, checkout selection |
| Coupons at checkout | ⚠️ | UI and client validation only; **discount not applied server-side for online payment** (critical) |
| Reviews (submit, display) | ✅ | Order-context addReview, ReviewCard, useReviews |
| Review moderation | ❌ | Reviews have `status: pending` but no admin flow to approve/reject |
| Search (full-text) | ⚠️ | Client-side only; no Algolia/Firestore extension or backend search |
| Size guide / fit info | ❌ | No size chart or fit recommendations |
| Recently viewed | ❌ | No “recently viewed” products |
| Compare products | ❌ | No compare feature |
| Notify when back in stock | ❌ | No sign-up for restock alerts |
| Guest checkout (no account) | ❌ | Checkout requires login |
| Multi-language / i18n | ❌ | English only |
| Accessibility (a11y) | ⚠️ | Basic markup; no formal a11y audit or ARIA/roles review |

---

## 2. Admin panel

| Feature | Status | Notes |
|--------|--------|--------|
| Admin dashboard | ❌ | Admin routes removed (per git status) |
| Product CRUD | ❌ | ProductService has add/update/delete but no admin UI |
| Order management | ❌ | No list/update orders, status, or notes |
| User management | ❌ | No list users, roles, or disable |
| Inventory / stock | ❌ | StockService exists; no admin UI to view or update stock |
| Coupon CRUD | ❌ | No UI to create/edit coupons |
| Review moderation | ❌ | No UI to approve/reject reviews |
| Banners / homepage | ❌ | Firestore `banners` exists; no admin UI |
| Reports / analytics | ❌ | No sales, revenue, or product reports |
| Shipment creation from order | ❌ | Shiprocket create-shipment API exists; no admin flow to create shipment from order |
| Razorpay refunds | ❌ | No refund flow in app (manual in Razorpay Dashboard) |

---

## 3. Inventory management

| Feature | Status | Notes |
|--------|--------|--------|
| Stock per size | ✅ | Product has `stock: { [size]: number }`; StockService |
| Stock validation at add-to-cart | ❌ | No check that selected size has stock before add |
| Stock deduction on order | ❌ | StockService.reduceStock / batchReduceStock not called on order creation |
| Low-stock / out-of-stock UI | ⚠️ | StockService helpers exist; product/cart UI may not consistently show |
| Restock alerts | ❌ | No sign-up or notifications |
| Inventory history / audit | ❌ | No log of stock changes |

---

## 4. Payments and invoicing

| Feature | Status | Notes |
|--------|--------|--------|
| Razorpay (online) | ✅ | Create order, verify, webhook; **amount must include coupon server-side** (critical fix) |
| COD | ✅ | Order created client-side; **no server-side cart/total validation** (high risk) |
| Refunds (in-app) | ❌ | No refund UI; manual in Razorpay |
| Invoices (PDF) | ❌ | No order invoice generation or download |
| GST/tax breakdown | ❌ | No tax fields or GST-inclusive display |
| Payment method per order | ✅ | Stored in order (online/cod) |
| Payment status sync | ⚠️ | Webhook does not update order status (TODO in code) |

---

## 5. Order tracking

| Feature | Status | Notes |
|--------|--------|--------|
| Shiprocket integration | ✅ | Rates, create shipment, track by AWB/shipmentId |
| Track link on order page | ✅ | Order detail can show tracking |
| Webhook / auto status from courier | ❌ | No webhook from Shiprocket to update order status |
| ETA / delivery date | ⚠️ | API returns EDD; ensure it’s shown in UI |
| Multiple shipments per order | ❌ | Single shipment per order model |

---

## 6. Security

| Feature | Status | Notes |
|--------|--------|--------|
| Firebase Auth (email, Google) | ✅ | Sign in, sign up, sign out |
| Protected routes (client redirect) | ✅ | Checkout, orders redirect if not logged in |
| API auth (Bearer token) | ✅ | requireAuth on payment and Shiprocket APIs |
| CSRF (Origin/Referer) | ⚠️ | Razorpay APIs use requireValidOrigin; Shiprocket does not; **no Origin/Referer = allow** (high) |
| Rate limiting | ⚠️ | Razorpay + webhook use Upstash; Shiprocket does not; **fail-open on Redis error** (medium) |
| Input validation (Zod) | ✅ | Create-order, verify, webhook |
| Firestore rules | ✅ | Per-user and admin; **isAdmin() can throw** (critical fix) |
| Storage rules | ✅ | Products, users, reviews, banners |
| No secrets in client | ✅ | Only NEXT_PUBLIC_* and key id in client |
| Security headers | ❌ | No explicit X-Frame-Options, CSP, etc. (low) |

---

## 7. SEO

| Feature | Status | Notes |
|--------|--------|--------|
| Metadata (title, description) | ✅ | layout.tsx metadata, template |
| Open Graph / Twitter | ✅ | layout metadata |
| Sitemap | ✅ | sitemap.ts |
| robots.txt | ✅ | robots.ts |
| Structured data (JSON-LD) | ✅ | ClothingStore in layout |
| Canonical URL | ⚠️ | metadataBase set; per-page canonical not verified |
| Product schema | ❌ | No Product schema on product pages |
| Breadcrumbs schema | ❌ | Breadcrumb component present; no schema |

---

## 8. Analytics

| Feature | Status | Notes |
|--------|--------|--------|
| Google Analytics | ⚠️ | Component exists; needs NEXT_PUBLIC_GA_MEASUREMENT_ID |
| Page views | ✅ | usePageTracking in Analytics |
| E-commerce events | ✅ | ecommerceEvents (view_item, add_to_cart, purchase, etc.); usage in app not verified |
| Server-side / backend events | ❌ | No server-side analytics (e.g. order created, payment verified) |
| Conversion funnel | ❌ | No defined funnel or goals in doc |
| Error tracking | ❌ | Sentry DSN mentioned in .env.example; not wired in ErrorBoundary |

---

## 9. Performance

| Feature | Status | Notes |
|--------|--------|--------|
| next/image | ✅ | Used on product, cart, etc. |
| PWA | ✅ | next-pwa, manifest, service worker |
| Lazy loading / dynamic | ✅ | e.g. ReviewCard dynamic import |
| Bundle optimization | ⚠️ | optimizePackageImports references packages not in package.json |
| Firestore indexes | ✅ | firestore.indexes.json; ensure all queries covered |
| Caching (ISR/static) | ❌ | Product list is real-time; no ISR or static product pages |
| CDN for assets | ⚠️ | Optional ASSET_PREFIX; not required for Vercel default |

---

## 10. Legal and compliance (India)

| Feature | Status | Notes |
|--------|--------|--------|
| Privacy policy | ✅ | Page exists |
| Terms of use | ✅ | Page exists |
| Refund policy | ✅ | Page exists |
| Cookie consent | ✅ | CookieConsent component |
| GST/tax display | ❌ | No GST breakdown or “GST inclusive” messaging |
| Tax-inclusive pricing | ⚠️ | Prices are display-only; no explicit “inclusive of taxes” or tax breakdown |
| Invoice with GST number | ❌ | No invoice; no place for GSTIN |
| Data retention / deletion | ❌ | No user data export or account deletion flow |
| Consent for marketing | ❌ | No explicit opt-in for email/SMS marketing |

---

## 11. Summary and priority

**Critical (fix before launch)**  
- Apply coupon discount **server-side** for online payment and align Razorpay order amount with client.  
- Validate COD orders **server-side** (cart + totals).  
- Make Firestore `isAdmin()` null-safe.  
- Stop storing Razorpay signature in Firestore.

**High (soon after)**  
- Implement Razorpay webhook handlers to update order status and send confirmation.  
- Add CSRF and rate limiting to Shiprocket APIs; tighten CSRF when Origin/Referer missing.  
- Reduce or remove auth logging in production.

**Important gaps for “full” ecommerce**  
- Admin panel (orders, products, coupons, reviews, stock).  
- Stock deduction and stock checks at add-to-cart and checkout.  
- Invoices (PDF) and optional GST/tax display.  
- Post-login redirect (e.g. back to checkout).  
- Review moderation UI.  
- Refund flow (or clear “refund via support” and Razorpay manual process).

**Nice to have**  
- Full-text search (Algolia or Firestore extension).  
- Guest checkout.  
- Restock alerts, size guide, recently viewed.  
- Security headers and Sentry in ErrorBoundary.  
- Product and breadcrumb structured data for SEO.

---

*End of Missing Features Report.*

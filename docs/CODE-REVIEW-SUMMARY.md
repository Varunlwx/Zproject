# Code Review Summary — Logic, Reliability, State

Concise review of logic flow, reliability risks, and state management. For security and deployment see `SECURITY-AUDIT.md` and `DEPLOYMENT-GUIDE.md`.

---

## Logic flow

- **Checkout (online):** Client → create-order API (cart validated server-side, Razorpay order created) → client opens Razorpay with **client-computed** `finalTotal` → user pays → verify API (signature + idempotency) → addOrder in Firestore. **Gap:** Razorpay order amount does not include coupon; client uses discounted total (see SECURITY-AUDIT Critical #1).
- **Checkout (COD):** Client builds order, calls `addOrder()` only; no server validation of cart or totals (SECURITY-AUDIT High #8).
- **Cart:** Guest = localStorage; logged-in = Firestore subscription. On login, local cart is merged with Firestore and then cleared from localStorage. Flow is coherent; no infinite loop observed.
- **Auth:** Firebase onAuthStateChanged → context updates → children re-render. Login/signup/signOut throw to caller; callers use try/catch and toast. Redirect after login is always `/` (redirect param not used).

---

## Infinite loops / memory leaks

- **Subscriptions:** ProductContext, OrderContext, CartContext, AddressContext, UserService subscribe to Firestore with `onSnapshot`. Each `useEffect` returns an `unsubscribe()` that is called on cleanup. No obvious leak.
- **Cart merge:** CartContext uses `isSubscribedRef` to distinguish first callback (merge) from later ones; cleanup resets ref and unsubscribes. No loop observed.
- **No `setState` in render:** No obvious state update during render that would cause a loop.

---

## Race conditions

- **Cart merge on login:** Local cart is read once when subscription is set up; merge runs in first callback. If user adds to cart (local) after login but before first Firestore callback, that add could be overwritten by Firestore data. Low impact; acceptable for current design.
- **Payment verify + webhook:** Client calls verify after payment; Razorpay may send webhook around the same time. Idempotency by `payment_id` in verify and by `event_id` in webhook prevents double-processing. Order creation today is only in verify flow; when webhook is implemented, ensure only one path creates/updates order (e.g. webhook as source of truth, verify only for client UX).
- **Stock:** StockService has transactional reduce/increase; stock is not currently decremented on order creation, so no order-vs-stock race yet. When you add deduction, do it in a single transaction or behind an API that checks stock and creates order atomically.

---

## Crash-prone components

- **Firestore rules:** `isAdmin()` can throw if user doc is missing (SECURITY-AUDIT Critical #3). Can cause “permission denied” or rule evaluation errors for new users.
- **Product/order parsing:** ProductService and UserService use defensive `asString`, `asNumber`, array checks, and fallbacks. Missing or malformed docs should not crash the app.
- **ErrorBoundary:** Layout wraps children in ErrorBoundary; uncaught React errors show fallback. Root `error.tsx` handles route-level errors. Good.
- **API routes:** create-order and verify use try/catch and return JSON errors; body is parsed once. Double `request.json()` would throw; currently not an issue.

---

## Unhandled promise rejections

- **Auth:** signIn, signUp, signInWithGoogle, signOut throw; login/signup pages use try/catch and showToast. Handled.
- **Cart clearCart:** `UserService.clearCart(user.uid).catch(...)` logs and swallows; acceptable.
- **Checkout:** create-order and verify fetches use try/catch; Razorpay success handler has try/catch; failure handler sets `isSubmitting(false)`. Handled.
- **Firestore subscriptions:** UserService/ProductService pass an error callback to `onSnapshot` and call `callback([])` or log. Prevents unhandled rejection from breaking the app.

---

## API failure points

- **Razorpay create-order:** Missing/invalid env, Firestore errors, Razorpay API errors → caught, appropriate status and message returned.
- **Razorpay verify:** Invalid signature, missing secret, Firestore write failure → caught and returned.
- **Razorpay webhook:** Signature failure → 401; parsing/validation failure → 400; processing error → 500 (retry). Good.
- **Shiprocket:** No rate limit or CSRF; auth errors return 401. Network or Shiprocket errors propagate; caller should handle (e.g. toast). Add rate limit and validation (SECURITY-AUDIT High #6).
- **Firebase Admin:** If env is missing, getFirebaseAdminApp() throws; API routes catch and return 500. Acceptable.

---

## State management

- **Contexts:** Auth, Cart, Order, Product, Address, Wishlist, Toast. Single provider per context; no conflicting sources of truth for the same data.
- **Cart:** Cart items live in CartContext; persisted to localStorage (guest) or Firestore (logged-in). Sync on login is merge-then-clear-local; no duplicate source for “current cart” at once.
- **Orders:** OrderContext subscribes to `users/{uid}/orders`; addOrder writes to same subcollection. Single source of truth.
- **Products:** ProductContext subscribes to Firestore with optional filters; getProductById can fall back to ProductService.getProductById. Coherent.
- **No global store:** No Redux/Zustand; context is sufficient for current scope. No observed state撕裂 or inconsistent reads.

---

## UI failure flows

- **Checkout empty cart:** Redirect to shop with empty-state message. Good.
- **Checkout not logged in:** Redirect to login with `?redirect=/checkout`; login does not use redirect (MEDIUM in SECURITY-AUDIT).
- **Payment failure:** Razorpay modal onFailure and verify non-ok response set error toast and `isSubmitting(false)`. User can retry. Good.
- **Order not found:** Order detail page shows “Order Not Found” and link to orders list. Good.
- **Product not found:** getProductById returns undefined; product page should handle (e.g. not-found or redirect). Not re-verified in this pass.
- **Network/API error on checkout:** Fetch throws or returns !ok; caught, toast, isSubmitting false. Handled.

---

## Recommendations

1. Fix payment amount (coupon) and COD validation on the server (see SECURITY-AUDIT and MISSING-FEATURES-REPORT).
2. Make Firestore `isAdmin()` null-safe.
3. Implement Razorpay webhook order-status updates.
4. Add post-login redirect from `?redirect=` (and validate path).
5. When adding stock deduction, do it in a single flow (e.g. server API that validates cart, reserves/deducts stock, creates order).

---

*End of Code Review Summary.*

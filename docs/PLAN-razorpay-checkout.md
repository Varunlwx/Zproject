# 🔌 Razorpay Checkout Integration Plan

> **Goal:** Connect Razorpay payment to checkout page  
> **File to Modify:** `src/app/checkout/page.tsx`  
> **Dependencies:** Already created in Phase 2

---

## 📊 Current Flow vs New Flow

```
CURRENT FLOW:
Form Submit → Validate → Create Order → Redirect to Confirmation

NEW FLOW (with Razorpay):
Form Submit → Validate → Create Razorpay Order → Open Payment Modal
    ↓ (on success)
Verify Payment → Create Order in Firebase → Redirect to Confirmation
```

---

## 📋 Implementation Steps

### Step 1: Add Import
```typescript
// Add at top of checkout/page.tsx
import { loadRazorpayScript, createRazorpayPayment, RazorpaySuccessResponse } from '@/lib/razorpay';
```

### Step 2: Add New Payment Method Option
Change payment methods from `'upi' | 'cod'` to include `'online'`:

```typescript
// Line ~24: Update type
const [paymentMethod, setPaymentMethod] = useState<'online' | 'cod'>('online');
```

### Step 3: Modify handleSubmit Function

Replace the current `handleSubmit` (lines 83-146) with this logic:

```typescript
const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Existing validation...
    if (!formData.fullName || !formData.phone || ...) { ... }

    setIsSubmitting(true);

    try {
        const orderData = { /* existing order data */ };

        if (paymentMethod === 'cod') {
            // COD: Create order directly (existing logic)
            const order = await addOrder(orderData);
            clearCart();
            router.push(`/order-confirmation/${order.id}`);
        } else {
            // ONLINE: Use Razorpay
            // 1. Create Razorpay order via API
            const response = await fetch('/api/razorpay/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: cartTotal * 100, // Convert to paise
                    receipt: `order_${Date.now()}`,
                    notes: { userId: user?.uid },
                }),
            });

            const { orderId } = await response.json();

            // 2. Open Razorpay payment modal
            await createRazorpayPayment(
                {
                    amount: cartTotal * 100,
                    orderId,
                    customerName: formData.fullName,
                    customerEmail: formData.email,
                    customerPhone: formData.phone,
                },
                // On Success
                async (paymentResponse: RazorpaySuccessResponse) => {
                    // 3. Verify payment
                    const verifyRes = await fetch('/api/razorpay/verify', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(paymentResponse),
                    });

                    if (verifyRes.ok) {
                        // 4. Create order in Firebase
                        const order = await addOrder({
                            ...orderData,
                            paymentId: paymentResponse.razorpay_payment_id,
                        });
                        clearCart();
                        showToast('Payment successful!', 'success');
                        router.push(`/order-confirmation/${order.id}`);
                    } else {
                        showToast('Payment verification failed', 'error');
                    }
                },
                // On Failure
                (error: string) => {
                    showToast(error, 'error');
                    setIsSubmitting(false);
                }
            );
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('Failed to process order', 'error');
    } finally {
        setIsSubmitting(false);
    }
};
```

### Step 4: Update Payment Method UI

Change the payment selection UI (around lines 350-400) to show:

```tsx
<div className="payment-methods">
    <label className={`payment-option ${paymentMethod === 'online' ? 'active' : ''}`}>
        <input
            type="radio"
            name="payment"
            value="online"
            checked={paymentMethod === 'online'}
            onChange={() => setPaymentMethod('online')}
        />
        <span>💳 Pay Online (UPI, Cards, Netbanking)</span>
    </label>
    
    <label className={`payment-option ${paymentMethod === 'cod' ? 'active' : ''}`}>
        <input
            type="radio"
            name="payment"
            value="cod"
            checked={paymentMethod === 'cod'}
            onChange={() => setPaymentMethod('cod')}
        />
        <span>🏠 Cash on Delivery</span>
    </label>
</div>
```

---

## ⚙️ Before Testing

### 1. Add Razorpay Test Credentials
Edit `.env.local`:
```env
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_XXXXXXXXX
RAZORPAY_KEY_SECRET=XXXXXXXXXXXXXXXXXX
```

Get from: https://dashboard.razorpay.com/app/keys

### 2. Test Cards (Razorpay Test Mode)
| Card Number | CVV | Expiry |
|-------------|-----|--------|
| 4111111111111111 | Any 3 digits | Any future date |
| 5267318187975449 | Any | Any |

### 3. Test UPI
Use UPI ID: `success@razorpay` for successful payments

---

## ✅ Verification Checklist

- [ ] Razorpay modal opens when clicking "Pay Online"
- [ ] Test card payment succeeds
- [ ] Order created in Firebase after payment
- [ ] Redirects to order confirmation
- [ ] COD still works as before
- [ ] Error handling works (try declining a payment)

---

## 📁 Files to Modify

| File | Changes |
|------|---------|
| `src/app/checkout/page.tsx` | Add import, update handleSubmit, update UI |

**Estimated Time:** 15-20 minutes

---

> **Ready to implement?** Reply "yes" and I'll make these changes for you!

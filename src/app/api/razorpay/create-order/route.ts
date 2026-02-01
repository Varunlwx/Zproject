import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { requireAuth } from '@/lib/auth-middleware';
import { getAdminDb } from '@/lib/firebase-admin';
import { requireValidOrigin, csrfErrorResponse } from '@/lib/csrf-protection';
import { criticalLimiter, getRateLimitIdentifier, rateLimit } from '@/lib/rate-limit';
import { createOrderSchema, validateRequest, formatValidationErrors } from '@/lib/validation-schemas';
import { FieldPath } from 'firebase-admin/firestore';

// Initialize Razorpay instance
const getRazorpayInstance = () => {
    const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
        throw new Error('Razorpay credentials not configured');
    }

    return new Razorpay({
        key_id: keyId,
        key_secret: keySecret,
    });
};

interface OrderCartItem {
    id: string;
    quantity: number;
}

export async function POST(request: NextRequest) {
    try {
        // 1. Validate request origin (CSRF protection)
        requireValidOrigin(request);

        // 2. Verify user authentication
        const user = await requireAuth(request);

        // 3. Apply rate limiting (10 req/min per user)
        const identifier = getRateLimitIdentifier(request, user.uid);
        const rateLimitResponse = await rateLimit(criticalLimiter, identifier);

        if (rateLimitResponse) {
            return rateLimitResponse; // 429 Too Many Requests
        }

        // 4. Parse and validate request body
        const body = await request.json();
        const validation = validateRequest(createOrderSchema, body);

        if (!validation.success) {
            console.error('Validation failed:', {
                body: JSON.stringify(body),
                errors: formatValidationErrors(validation.errors),
            });
            return NextResponse.json(
                {
                    error: 'Invalid request data',
                    details: formatValidationErrors(validation.errors),
                },
                { status: 400 }
            );
        }

        const { cartItems, receipt, notes, couponCode } = validation.data;

        // 5. Fetch product prices from Firestore (server-side)
        const adminDb = getAdminDb();
        // Deduplicate product IDs to optimize queries
        const uniqueProductIds = Array.from(new Set(cartItems.map((item: OrderCartItem) => item.id)));

        // Firestore 'in' query is limited to 10 items. Chunk the IDs to stay within limits.
        const snapshots = [];
        for (let i = 0; i < uniqueProductIds.length; i += 10) {
            const chunk = uniqueProductIds.slice(i, i + 10);
            // Robust search: Check both the custom 'id' field AND the auto-generated Firestore document ID
            const [byField, byDocId] = await Promise.all([
                adminDb.collection('products').where('id', 'in', chunk).get(),
                adminDb.collection('products').where(FieldPath.documentId(), 'in', chunk).get()
            ]);
            snapshots.push(byField, byDocId);
        }

        // Build price map from Firestore results
        const productPrices = new Map<string, number>();
        snapshots.forEach(snapshot => {
            snapshot.forEach(doc => {
                const data = doc.data();
                // Parse price string (e.g., "₹1,599" -> 1599)
                const priceStr = data.price?.toString() || '0';
                const price = parseFloat(priceStr.replace(/[^\d.]/g, ''));

                // Map both document ID and data.id field to handle both patterns
                productPrices.set(doc.id, price);
                if (data.id) {
                    productPrices.set(data.id.toString(), price);
                }
            });
        });

        // 4. Calculate verified total on server
        let verifiedTotal = 0;
        const verificationDetails = [];

        for (const item of cartItems) {
            const serverPrice = productPrices.get(item.id);

            if (!serverPrice) {
                return NextResponse.json(
                    { error: `Product not found: ${item.id}` },
                    { status: 400 }
                );
            }

            if (item.quantity <= 0 || item.quantity > 100) {
                return NextResponse.json(
                    { error: `Invalid quantity for product ${item.id}` },
                    { status: 400 }
                );
            }

            const itemTotal = serverPrice * item.quantity;
            verifiedTotal += itemTotal;

            verificationDetails.push({
                productId: item.id,
                quantity: item.quantity,
                unitPrice: serverPrice,
                itemTotal: itemTotal,
            });
        }

        // 5. Server-side coupon validation
        let discount = 0;
        let appliedCouponData = null;

        if (couponCode) {
            const couponSnapshot = await adminDb.collection('coupons')
                .where('code', '==', couponCode.toUpperCase())
                .where('isActive', '==', true)
                .limit(1)
                .get();

            if (couponSnapshot.empty) {
                return NextResponse.json(
                    { error: 'Invalid or inactive coupon code' },
                    { status: 400 }
                );
            }

            const couponDoc = couponSnapshot.docs[0];
            const coupon = couponDoc.data();

            // Check expiry
            const now = new Date();
            const expiryDate = coupon.expiryDate?.toDate ? coupon.expiryDate.toDate() : new Date(coupon.expiryDate);
            if (expiryDate < now) {
                return NextResponse.json(
                    { error: 'This coupon has expired' },
                    { status: 400 }
                );
            }

            // Check usage limit
            if (coupon.usageCount >= coupon.usageLimit) {
                return NextResponse.json(
                    { error: 'This coupon has reached its usage limit' },
                    { status: 400 }
                );
            }

            // Check minimum order amount
            if (verifiedTotal < coupon.minOrderAmount) {
                return NextResponse.json(
                    { error: `Minimum order amount of ₹${coupon.minOrderAmount} required` },
                    { status: 400 }
                );
            }

            // Calculate discount
            if (coupon.type === 'percentage') {
                discount = Math.floor((verifiedTotal * coupon.value) / 100);
            } else {
                discount = Math.min(coupon.value, verifiedTotal);
            }
            appliedCouponData = { code: couponCode, discount };
        }

        const finalTotal = verifiedTotal - discount;

        // 6. Validate minimum order amount
        if (finalTotal < 1) {
            return NextResponse.json(
                { error: 'Invalid order total. Minimum is ₹1' },
                { status: 400 }
            );
        }

        // 7. Create Razorpay order with VERIFIED amount
        const razorpay = getRazorpayInstance();

        const order = await razorpay.orders.create({
            amount: Math.round(finalTotal * 100), // Convert to paise
            currency: 'INR',
            receipt: receipt || `order_${Date.now()}`,
            notes: {
                ...notes,
                userId: user.uid,
                itemCount: cartItems.length.toString(),
                verifiedTotal: verifiedTotal.toString(),
                discount: discount.toString(),
                couponCode: couponCode || 'NONE',
            },
        });

        // 8. Return order details with verification info
        return NextResponse.json({
            orderId: order.id,
            amount: order.amount, // This is the discounted amount in paise
            currency: order.currency,
            verifiedTotal: verifiedTotal,
            discount: discount,
            finalTotal: finalTotal,
            verificationDetails: verificationDetails,
        });
    } catch (error) {
        console.error('Razorpay order creation error:', error);

        // Handle specific error types
        if (error instanceof Error) {
            // CSRF validation error
            if (error.message === 'Invalid request origin') {
                return csrfErrorResponse('Cross-site request blocked');
            }

            if (error.message === 'Authentication required') {
                return NextResponse.json(
                    { error: 'Please sign in to complete your order' },
                    { status: 401 }
                );
            }

            if (error.message.includes('credentials')) {
                return NextResponse.json(
                    { error: 'Payment gateway not configured' },
                    { status: 503 }
                );
            }

            if (error.message.includes('Firebase Admin SDK')) {
                return NextResponse.json(
                    { error: 'Server configuration error' },
                    { status: 500 }
                );
            }
        }

        return NextResponse.json(
            { error: 'Failed to create payment order' },
            { status: 500 }
        );
    }
}

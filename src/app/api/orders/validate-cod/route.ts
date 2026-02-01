import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-middleware';
import { getAdminDb } from '@/lib/firebase-admin';
import { requireValidOrigin, csrfErrorResponse } from '@/lib/csrf-protection';
import { criticalLimiter, getRateLimitIdentifier, rateLimit } from '@/lib/rate-limit';
import { createOrderSchema, validateRequest, formatValidationErrors } from '@/lib/validation-schemas';
import { FieldPath } from 'firebase-admin/firestore';

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
            return NextResponse.json(
                {
                    error: 'Invalid request data',
                    details: formatValidationErrors(validation.errors),
                },
                { status: 400 }
            );
        }

        const { cartItems, couponCode } = validation.data;

        // 5. Fetch product prices from Firestore (server-side)
        const adminDb = getAdminDb();
        const uniqueProductIds = Array.from(new Set(cartItems.map((item: { id: string }) => item.id)));

        const snapshots = [];
        for (let i = 0; i < uniqueProductIds.length; i += 10) {
            const chunk = uniqueProductIds.slice(i, i + 10);
            const [byField, byDocId] = await Promise.all([
                adminDb.collection('products').where('id', 'in', chunk).get(),
                adminDb.collection('products').where(FieldPath.documentId(), 'in', chunk).get()
            ]);
            snapshots.push(byField, byDocId);
        }

        const productPrices = new Map<string, number>();
        snapshots.forEach(snapshot => {
            snapshot.forEach(doc => {
                const data = doc.data();
                const priceStr = data.price?.toString() || '0';
                const price = parseFloat(priceStr.replace(/[^\d.]/g, ''));
                productPrices.set(doc.id, price);
                if (data.id) {
                    productPrices.set(data.id.toString(), price);
                }
            });
        });

        // 6. Calculate verified total
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

            const itemTotal = serverPrice * item.quantity;
            verifiedTotal += itemTotal;

            verificationDetails.push({
                productId: item.id,
                quantity: item.quantity,
                unitPrice: serverPrice,
                itemTotal: itemTotal,
            });
        }

        // 7. Coupon validation
        let discount = 0;
        if (couponCode) {
            const couponSnapshot = await adminDb.collection('coupons')
                .where('code', '==', couponCode.toUpperCase())
                .where('isActive', '==', true)
                .limit(1)
                .get();

            if (!couponSnapshot.empty) {
                const coupon = couponSnapshot.docs[0].data();
                const now = new Date();
                const expiryDate = coupon.expiryDate?.toDate ? coupon.expiryDate.toDate() : new Date(coupon.expiryDate);

                if (expiryDate >= now && coupon.usageCount < coupon.usageLimit && verifiedTotal >= coupon.minOrderAmount) {
                    if (coupon.type === 'percentage') {
                        discount = Math.floor((verifiedTotal * coupon.value) / 100);
                    } else {
                        discount = Math.min(coupon.value, verifiedTotal);
                    }
                }
            }
        }

        const finalTotal = verifiedTotal - discount;

        return NextResponse.json({
            verified: true,
            verifiedTotal,
            discount,
            finalTotal,
            verificationDetails,
        });

    } catch (error) {
        console.error('COD validation error:', error);
        if (error instanceof Error && error.message === 'Invalid request origin') {
            return csrfErrorResponse('Cross-site request blocked');
        }
        return NextResponse.json(
            { error: 'Verification failed' },
            { status: 500 }
        );
    }
}

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { requireAuth } from '@/lib/auth-middleware';
import { getAdminDb } from '@/lib/firebase-admin';
import { requireValidOrigin, csrfErrorResponse } from '@/lib/csrf-protection';
import { criticalLimiter, getRateLimitIdentifier, rateLimit } from '@/lib/rate-limit';
import { verifyPaymentSchema, validateRequest, formatValidationErrors } from '@/lib/validation-schemas';

// Verify Razorpay payment signature with idempotency protection
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
        const validation = validateRequest(verifyPaymentSchema, body);

        if (!validation.success) {
            return NextResponse.json(
                {
                    error: 'Invalid payment verification data',
                    details: formatValidationErrors(validation.errors),
                },
                { status: 400 }
            );
        }

        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            order_details // Optional: internal order details to update
        } = validation.data;

        const adminDb = getAdminDb();

        // 3. CHECK IDEMPOTENCY - Has this payment already been processed?
        const processedPaymentRef = adminDb
            .collection('processed_payments')
            .doc(razorpay_payment_id);

        const processedPayment = await processedPaymentRef.get();

        if (processedPayment.exists) {
            // Payment already verified - Return success but mark as duplicate
            const data = processedPayment.data();

            console.warn('Duplicate payment verification attempt detected:', {
                payment_id: razorpay_payment_id,
                user_id: user.uid,
                original_user: data?.user_id,
                original_verification: data?.verified_at,
            });

            return NextResponse.json({
                verified: true,
                already_processed: true,
                order_id: data?.order_id || razorpay_order_id,
            });
        }

        // 4. Verify Razorpay signature (existing logic)
        const keySecret = process.env.RAZORPAY_KEY_SECRET;

        if (!keySecret) {
            console.error('RAZORPAY_KEY_SECRET not configured');
            return NextResponse.json(
                { error: 'Payment verification not configured' },
                { status: 503 }
            );
        }

        // Generate signature to verify
        const signaturePayload = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', keySecret)
            .update(signaturePayload)
            .digest('hex');

        // Verify signature
        const isValid = expectedSignature === razorpay_signature;

        if (!isValid) {
            console.error('Payment signature verification failed');
            return NextResponse.json(
                { error: 'Payment verification failed', verified: false },
                { status: 400 }
            );
        }

        // 5. STORE PAYMENT AS PROCESSED (idempotency key)
        // This prevents the same payment from being verified multiple times
        // Limit stored fields to prevent over-exposure in case of data leak
        await processedPaymentRef.set({
            order_id: razorpay_order_id,
            user_id: user.uid,
            status: 'verified',
            // Note: verified_at is handled by serverTimestamp if needed, 
            // but we omit it here as per security requirement to verify minimal data.
        });

        console.log('Payment verified and stored:', {
            payment_id: razorpay_payment_id,
            user_id: user.uid,
        });

        // 6. Return success (first time verification only)
        return NextResponse.json({
            verified: true,
            already_processed: false,
            payment_id: razorpay_payment_id,
            order_id: razorpay_order_id,
            userId: user.uid,
            message: 'Payment verified successfully',
        });

    } catch (error) {
        console.error('Payment verification error:', error);

        // Handle CSRF validation errors
        if (error instanceof Error && error.message === 'Invalid request origin') {
            return csrfErrorResponse('Cross-site request blocked');
        }

        // Handle authentication errors
        if (error instanceof Error && error.message === 'Authentication required') {
            return NextResponse.json(
                { error: 'Please sign in to verify payment', verified: false },
                { status: 401 }
            );
        }

        return NextResponse.json(
            { error: 'Payment verification failed', verified: false },
            { status: 500 }
        );
    }
}

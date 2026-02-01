import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getAdminDb } from '@/lib/firebase-admin';
import { webhookLimiter, getRateLimitIdentifier, rateLimit } from '@/lib/rate-limit';
import { webhookEventSchema, validateRequest } from '@/lib/validation-schemas';

// Razorpay Webhook Handler with Idempotency Protection
// Configure this URL in Razorpay Dashboard: /api/razorpay/webhook
export async function POST(request: NextRequest) {
    try {
        // 1. Apply rate limiting (100 req/min per IP)
        // Protects against webhook flooding and brute-force signature attacks
        const identifier = getRateLimitIdentifier(request);
        const rateLimitResponse = await rateLimit(webhookLimiter, identifier);

        if (rateLimitResponse) {
            return rateLimitResponse; // 429 Too Many Requests
        }

        const body = await request.text();
        const signature = request.headers.get('x-razorpay-signature');
        const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

        if (!webhookSecret) {
            console.error('RAZORPAY_WEBHOOK_SECRET not configured');
            return NextResponse.json(
                { error: 'Webhook not configured' },
                { status: 503 }
            );
        }

        if (!signature) {
            console.error('Missing webhook signature');
            return NextResponse.json(
                { error: 'Missing signature' },
                { status: 400 }
            );
        }

        // Verify webhook signature
        const expectedSignature = crypto
            .createHmac('sha256', webhookSecret)
            .update(body)
            .digest('hex');

        if (expectedSignature !== signature) {
            console.error('Webhook signature verification failed');
            return NextResponse.json(
                { error: 'Invalid signature' },
                { status: 401 }
            );
        }

        // Parse the webhook payload
        const event = JSON.parse(body);

        // Validate webhook event structure
        const validation = validateRequest(webhookEventSchema, event);

        if (!validation.success) {
            console.warn('Invalid webhook event structure:', validation.errors);
            return NextResponse.json(
                { error: 'Invalid webhook event structure' },
                { status: 400 }
            );
        }

        const validatedEvent = validation.data;
        const eventId = validatedEvent.id;
        const eventType = validatedEvent.event;

        console.log(`Razorpay webhook received: ${eventType} (ID: ${eventId})`);

        const adminDb = getAdminDb();

        // CHECK IDEMPOTENCY - Has this event already been processed?
        const webhookEventRef = adminDb
            .collection('webhook_events')
            .doc(eventId);

        const webhookEvent = await webhookEventRef.get();

        if (webhookEvent.exists) {
            // Event already processed - Return success but skip processing
            const data = webhookEvent.data();

            console.log('Duplicate webhook event detected (idempotency check):', {
                event_id: eventId,
                event_type: eventType,
                original_processing: data?.processed_at,
            });

            return NextResponse.json({
                received: true,
                already_processed: true,
                event_id: eventId,
                message: 'Event already processed',
            });
        }

        // PROCESS EVENT - Handle different event types
        let processingSuccess = true;
        let paymentId: string | null = null;

        try {
            switch (eventType) {
                case 'payment.authorized':
                    // Payment authorized but not yet captured
                    const authPayment = event.payload.payment.entity;
                    paymentId = authPayment.id;
                    console.log('Payment authorized:', paymentId);
                    // TODO: Update order status in Firebase
                    // await updateOrderStatus(authPayment.notes.order_id, 'authorized');
                    break;

                case 'payment.captured':
                    // Payment successfully captured
                    const payment = event.payload.payment.entity;
                    paymentId = payment.id;
                    console.log('Payment captured:', paymentId);

                    // TODO: Update order status in Firebase
                    // await updateOrderStatus(payment.notes.order_id, 'paid');
                    // await sendOrderConfirmationEmail(payment.notes.customer_email);
                    break;

                case 'payment.failed':
                    // Payment failed
                    const failedPayment = event.payload.payment.entity;
                    paymentId = failedPayment.id;
                    console.log('Payment failed:', paymentId, failedPayment.error_description);

                    // TODO: Update order status and notify customer
                    // await updateOrderStatus(failedPayment.notes.order_id, 'failed');
                    break;

                case 'order.paid':
                    // Order fully paid
                    const order = event.payload.order.entity;
                    console.log('Order paid:', order.id);
                    break;

                case 'refund.created':
                    // Refund initiated
                    const refund = event.payload.refund.entity;
                    paymentId = refund.payment_id;
                    console.log('Refund created:', refund.id, 'for payment:', paymentId);

                    // TODO: Update order status to refunded
                    // await updateOrderStatus(refund.notes.order_id, 'refunded');
                    break;

                default:
                    console.log('Unhandled webhook event type:', eventType);
            }
        } catch (processingError) {
            console.error('Error processing webhook event:', processingError);
            processingSuccess = false;
        }

        // STORE EVENT AS PROCESSED (if successful)
        if (processingSuccess) {
            await webhookEventRef.set({
                event_id: eventId,
                event_type: eventType,
                payment_id: paymentId,
                processed_at: new Date().toISOString(),
                status: 'processed',
                retry_count: 0,
            });

            console.log('Webhook event processed successfully:', eventId);

            // Return 200 ONLY on successful processing
            return NextResponse.json({
                received: true,
                already_processed: false,
                event_id: eventId,
                event_type: eventType,
            });
        } else {
            // Return 500 on processing failure - Razorpay will retry
            console.error('Webhook processing failed for event:', eventId);
            return NextResponse.json(
                { error: 'Event processing failed', event_id: eventId },
                { status: 500 }
            );
        }

    } catch (error) {
        console.error('Webhook handler error:', error);

        // FIXED: Return 500 on error (not 200)
        // This allows Razorpay to retry the webhook
        return NextResponse.json(
            { error: 'Webhook processing error' },
            { status: 500 }
        );
    }
}

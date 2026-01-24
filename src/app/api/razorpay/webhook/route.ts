import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// Razorpay Webhook Handler
// Configure this URL in Razorpay Dashboard: /api/razorpay/webhook
export async function POST(request: NextRequest) {
    try {
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
        const eventType = event.event;

        console.log(`Razorpay webhook received: ${eventType}`);

        // Handle different event types
        switch (eventType) {
            case 'payment.authorized':
                // Payment authorized but not yet captured
                console.log('Payment authorized:', event.payload.payment.entity.id);
                break;

            case 'payment.captured':
                // Payment successfully captured
                const payment = event.payload.payment.entity;
                console.log('Payment captured:', payment.id);

                // TODO: Update order status in Firebase
                // await updateOrderStatus(payment.notes.order_id, 'paid');
                // await sendOrderConfirmationEmail(payment.notes.customer_email);
                break;

            case 'payment.failed':
                // Payment failed
                const failedPayment = event.payload.payment.entity;
                console.log('Payment failed:', failedPayment.id, failedPayment.error_description);

                // TODO: Update order status and notify customer
                break;

            case 'order.paid':
                // Order fully paid
                const order = event.payload.order.entity;
                console.log('Order paid:', order.id);
                break;

            case 'refund.created':
                // Refund initiated
                const refund = event.payload.refund.entity;
                console.log('Refund created:', refund.id);

                // TODO: Update order status to refunded
                break;

            default:
                console.log('Unhandled webhook event:', eventType);
        }

        // Always return 200 to acknowledge receipt
        return NextResponse.json({ received: true });

    } catch (error) {
        console.error('Webhook processing error:', error);
        // Still return 200 to prevent Razorpay from retrying
        return NextResponse.json({ received: true, error: 'Processing error' });
    }
}

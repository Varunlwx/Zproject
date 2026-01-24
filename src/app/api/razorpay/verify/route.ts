import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// Verify Razorpay payment signature
export async function POST(request: NextRequest) {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            order_details // Optional: internal order details to update
        } = await request.json();

        // Validate required fields
        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return NextResponse.json(
                { error: 'Missing payment verification details' },
                { status: 400 }
            );
        }

        const keySecret = process.env.RAZORPAY_KEY_SECRET;

        if (!keySecret) {
            console.error('RAZORPAY_KEY_SECRET not configured');
            return NextResponse.json(
                { error: 'Payment verification not configured' },
                { status: 503 }
            );
        }

        // Generate signature to verify
        const body = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', keySecret)
            .update(body)
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

        // Payment verified successfully
        // Here you would typically:
        // 1. Update order status in your database
        // 2. Send confirmation email
        // 3. Trigger any post-payment workflows

        return NextResponse.json({
            verified: true,
            payment_id: razorpay_payment_id,
            order_id: razorpay_order_id,
            message: 'Payment verified successfully',
        });

    } catch (error) {
        console.error('Payment verification error:', error);
        return NextResponse.json(
            { error: 'Payment verification failed', verified: false },
            { status: 500 }
        );
    }
}

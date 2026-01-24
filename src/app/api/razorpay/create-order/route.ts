import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';

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

export async function POST(request: NextRequest) {
    try {
        const { amount, currency = 'INR', receipt, notes } = await request.json();

        // Validate amount
        if (!amount || amount < 100) {
            return NextResponse.json(
                { error: 'Invalid amount. Minimum is ₹1 (100 paise)' },
                { status: 400 }
            );
        }

        const razorpay = getRazorpayInstance();

        // Create Razorpay order
        const order = await razorpay.orders.create({
            amount: Math.round(amount), // Amount in paise
            currency,
            receipt: receipt || `order_${Date.now()}`,
            notes: notes || {},
        });

        return NextResponse.json({
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
        });
    } catch (error) {
        console.error('Razorpay order creation error:', error);

        if (error instanceof Error && error.message.includes('credentials')) {
            return NextResponse.json(
                { error: 'Payment gateway not configured' },
                { status: 503 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to create payment order' },
            { status: 500 }
        );
    }
}

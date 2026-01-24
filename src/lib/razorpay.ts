// Razorpay client-side utilities
// NOTE: Server-side Razorpay instance should only be used in API routes

declare global {
    interface Window {
        Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
    }
}

export interface RazorpayOptions {
    key: string;
    amount: number;
    currency: string;
    name: string;
    description?: string;
    image?: string;
    order_id: string;
    handler: (response: RazorpaySuccessResponse) => void;
    prefill?: {
        name?: string;
        email?: string;
        contact?: string;
    };
    notes?: Record<string, string>;
    theme?: {
        color?: string;
    };
    modal?: {
        ondismiss?: () => void;
    };
}

export interface RazorpaySuccessResponse {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
}

export interface RazorpayInstance {
    open: () => void;
    close: () => void;
    on: (event: string, handler: () => void) => void;
}

export interface CreateOrderResponse {
    orderId: string;
    amount: number;
    currency: string;
}

// Load Razorpay script dynamically
export const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
        if (window.Razorpay) {
            resolve(true);
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

// Create Razorpay payment instance
export const createRazorpayPayment = async (
    orderDetails: {
        amount: number; // in paise (₹100 = 10000)
        orderId: string;
        customerName: string;
        customerEmail: string;
        customerPhone: string;
    },
    onSuccess: (response: RazorpaySuccessResponse) => void,
    onFailure: (error: string) => void
): Promise<void> => {
    const loaded = await loadRazorpayScript();

    if (!loaded) {
        onFailure('Failed to load payment gateway. Please try again.');
        return;
    }

    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

    if (!keyId) {
        onFailure('Payment gateway not configured. Please contact support.');
        return;
    }

    const options: RazorpayOptions = {
        key: keyId,
        amount: orderDetails.amount,
        currency: 'INR',
        name: 'Zcloths',
        description: 'Premium Indian Menswear',
        image: '/icons/icon-192x192.png',
        order_id: orderDetails.orderId,
        handler: onSuccess,
        prefill: {
            name: orderDetails.customerName,
            email: orderDetails.customerEmail,
            contact: orderDetails.customerPhone,
        },
        notes: {
            store: 'Zcloths',
        },
        theme: {
            color: '#E85D04',
        },
        modal: {
            ondismiss: () => onFailure('Payment cancelled by user'),
        },
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();
};

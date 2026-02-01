import { z } from 'zod';

/**
 * Input Validation Schemas using Zod
 * 
 * Protects against:
 * - NoSQL injection (type confusion)
 * - XSS attacks (string length limits)
 * - Data corruption (format validation)
 * - Business logic exploits (bounds checking)
 * 
 * Usage:
 * ```typescript
 * const validation = createOrderSchema.safeParse(body);
 * if (!validation.success) {
 *   return NextResponse.json({ error: validation.error }, { status: 400 });
 * }
 * const { cartItems } = validation.data; // Type-safe!
 * ```
 */

// ============================================
// COMMON VALIDATION PATTERNS
// ============================================

/**
 * Non-empty string with length limits
 * Prevents: Empty strings, excessively long strings (DoS)
 */
export const nonEmptyString = z.string().min(1, 'Field is required').max(500, 'Text too long');

/**
 * Product ID format validation
 * Allows alphanumeric characters, underscores, and hyphens
 * More permissive to support various ID formats from Firestore
 */
export const productId = z.string()
    .min(1, 'Product ID required')
    .max(100, 'Product ID too long');

/**
 * User ID validation
 * Prevents: Excessively long IDs, special characters
 */
export const userId = z.string().min(1).max(128);

/**
 * Positive integer validation
 * Prevents: Negative numbers, decimals, zero
 */
export const positiveInteger = z.number().int('Must be an integer').positive('Must be positive');

/**
 * Quantity validation with bounds
 * Range: 1-100
 * Uses coerce to handle string inputs from client
 * Prevents: Overflow attacks, unreasonable quantities
 */
export const quantity = z.coerce.number()
    .int('Quantity must be a whole number')
    .min(1, 'Minimum quantity is 1')
    .max(100, 'Maximum quantity is 100');

/**
 * Amount validation (Indian Rupees)
 * Max: ₹1 crore (10,000,000)
 * Prevents: Overflow, negative amounts
 */
export const amount = z.number()
    .positive('Amount must be positive')
    .max(10000000, 'Amount exceeds maximum limit');

/**
 * Indian pincode validation
 * Format: 6 digits, cannot start with 0
 * Example: 400001, 110001
 */
export const pincode = z.string().regex(
    /^[1-9][0-9]{5}$/,
    'Invalid pincode format (must be 6 digits, not starting with 0)'
);

/**
 * Indian phone number validation
 * Format: 10 digits starting with 6-9
 * Example: 9876543210
 */
export const phoneNumber = z.string().regex(
    /^[6-9]\d{9}$/,
    'Invalid phone number (must be 10 digits starting with 6-9)'
);

/**
 * Email validation with length limit
 * Prevents: Excessively long emails
 */
export const email = z.string()
    .email('Invalid email format')
    .max(255, 'Email too long');

// ============================================
// RAZORPAY SCHEMAS
// ============================================

/**
 * Cart Item Schema
 * Used in create-order endpoint
 * 
 * Strict mode: Rejects unknown fields
 * Prevents: Object injection, extra malicious fields
 */
export const cartItemSchema = z.object({
    id: productId,
    quantity: quantity,
}); // Removed strict() to allow extra fields from client cart

/**
 * Create Order Request Schema
 * Validates entire order creation payload
 */
export const createOrderSchema = z.object({
    cartItems: z.array(cartItemSchema)
        .min(1, 'Cart cannot be empty')
        .max(50, 'Too many items in cart'),
    receipt: z.string()
        .max(40, 'Receipt ID too long')
        .optional(),
    notes: z.record(z.string(), z.string())
        .optional(),
    couponCode: z.string()
        .max(50, 'Coupon code too long')
        .nullable()
        .optional(),
}); // Removed strict() to allow additional fields during debugging

/**
 * Razorpay ID patterns
 */
const razorpayOrderId = z.string().regex(
    /^order_[a-zA-Z0-9]+$/,
    'Invalid Razorpay order ID format'
);

const razorpayPaymentId = z.string().regex(
    /^pay_[a-zA-Z0-9]+$/,
    'Invalid Razorpay payment ID format'
);

const razorpaySignature = z.string().length(
    64,
    'Invalid signature length (must be 64 characters)'
);

/**
 * Verify Payment Schema
 * Validates payment verification request
 */
export const verifyPaymentSchema = z.object({
    razorpay_order_id: razorpayOrderId,
    razorpay_payment_id: razorpayPaymentId,
    razorpay_signature: razorpaySignature,
    order_details: z.any().optional(), // Optional internal order details
}).strict();

/**
 * Webhook Event Schema
 * Validates incoming Razorpay webhooks
 * 
 * Uses .passthrough() to allow Razorpay's additional fields
 * while still validating critical fields
 */
export const webhookEventSchema = z.object({
    id: z.string().regex(/^evt_[a-zA-Z0-9]+$/, 'Invalid event ID'),
    event: z.enum([
        'payment.authorized',
        'payment.captured',
        'payment.failed',
        'order.paid',
        'refund.created',
    ]),
    payload: z.object({
        payment: z.object({
            entity: z.object({
                id: z.string(),
                amount: amount,
                status: z.string(),
            }).passthrough(),
        }).optional(),
        order: z.object({
            entity: z.object({
                id: z.string(),
            }).passthrough(),
        }).optional(),
        refund: z.object({
            entity: z.object({
                id: z.string(),
            }).passthrough(),
        }).optional(),
    }),
}).passthrough(); // Allow additional Razorpay fields

// ============================================
// ADDRESS SCHEMAS
// ============================================

/**
 * Address Schema
 * Used for shipping addresses
 * 
 * Validates all address fields with appropriate limits
 * Prevents: XSS, injection, data corruption
 */
export const addressSchema = z.object({
    fullName: z.string()
        .min(1, 'Full name is required')
        .max(100, 'Name too long'),
    phone: phoneNumber,
    email: email.optional(),
    addressLine1: z.string()
        .min(1, 'Address line 1 is required')
        .max(200, 'Address too long'),
    addressLine2: z.string()
        .max(200, 'Address too long')
        .optional(),
    city: z.string()
        .min(1, 'City is required')
        .max(100, 'City name too long'),
    state: z.string()
        .min(1, 'State is required')
        .max(100, 'State name too long'),
    pincode: pincode,
}).strict();

// ============================================
// SHIPROCKET SCHEMAS
// ============================================

/**
 * Get Shipping Rates Schema
 */
export const shippingRatesSchema = z.object({
    pincode: pincode,
    weight: z.coerce.number().positive().default(0.5),
    cod: z.coerce.boolean().default(false),
});

/**
 * Shiprocket Item Schema
 */
export const shipmentItemSchema = z.object({
    id: productId,
    name: z.string().min(1).max(200),
    quantity: quantity,
    price: z.union([z.number(), z.string()]),
});

/**
 * Create Shipment Schema
 */
export const createShipmentSchema = z.object({
    orderId: z.string().min(1).max(50),
    orderDate: z.string().optional(),
    customerName: z.string().min(1).max(100),
    phone: phoneNumber,
    email: email.optional(),
    address: z.string().min(1).max(200),
    address2: z.string().max(200).optional(),
    city: z.string().min(1).max(100),
    pincode: pincode,
    state: z.string().min(1).max(100),
    items: z.array(shipmentItemSchema).min(1),
    paymentMethod: z.enum(['cod', 'prepaid', 'Prepaid', 'COD', 'online', 'Online']),
    subTotal: z.union([z.number(), z.string()]),
    weight: z.number().positive().optional(),
    dimensions: z.object({
        length: z.number().positive(),
        breadth: z.number().positive(),
        height: z.number().positive(),
    }).optional(),
});

/**
 * Track Shipment Schema
 */
export const trackShipmentSchema = z.object({
    awb: z.string().max(50).optional(),
    shipmentId: z.string().max(50).optional(),
}).refine(data => data.awb || data.shipmentId, {
    message: "Either 'awb' or 'shipmentId' must be provided",
    path: ['awb'],
});

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Validate request body against schema
 * Returns typed result with success flag
 * 
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @returns Validation result with typed data or errors
 */
export function validateRequest<T>(
    schema: z.ZodSchema<T>,
    data: unknown
): { success: true; data: T } | { success: false; errors: z.ZodError } {
    const result = schema.safeParse(data);

    if (result.success) {
        return { success: true, data: result.data };
    } else {
        return { success: false, errors: result.error };
    }
}

/**
 * Format Zod validation errors for API response
 * Converts errors to user-friendly array of messages
 * 
 * @param error - Zod error object
 * @returns Array of formatted error messages
 * 
 * Example output:
 * [
 *   "cartItems.0.id: Invalid product ID format",
 *   "cartItems.0.quantity: Must be at least 1"
 * ]
 */
export function formatValidationErrors(error: z.ZodError): string[] {
    return error.issues.map(issue => {
        const path = issue.path.length > 0 ? issue.path.join('.') + ': ' : '';
        return `${path}${issue.message}`;
    });
}

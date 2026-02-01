import { NextRequest, NextResponse } from 'next/server';
import { createShipment, ShipmentOrder } from '@/lib/shiprocket';
import { requireAuth } from '@/lib/auth-middleware';
import { requireValidOrigin } from '@/lib/csrf-protection';
import { withRateLimit, highLimiter } from '@/lib/rate-limit';
import { createShipmentSchema, formatValidationErrors } from '@/lib/validation-schemas';

export async function POST(request: NextRequest) {
    try {
        // 1. CSRF Protection
        requireValidOrigin(request);

        // 2. Authentication
        const user = await requireAuth(request);

        // 3. Rate Limiting
        const rateLimitResponse = await withRateLimit(request, highLimiter, user.uid);
        if (rateLimitResponse) return rateLimitResponse;

        const body = await request.json();

        // 4. Input Validation (Zod)
        const validation = createShipmentSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                {
                    error: 'Validation failed',
                    details: formatValidationErrors(validation.error)
                },
                { status: 400 }
            );
        }

        const {
            orderId,
            orderDate,
            customerName,
            phone,
            email,
            address,
            address2,
            city,
            pincode,
            state,
            items,
            paymentMethod,
            subTotal,
            weight = 0.5,
            dimensions = { length: 20, breadth: 15, height: 10 }
        } = validation.data;


        // Prepare shipment order for Shiprocket
        const shipmentOrder: ShipmentOrder = {
            order_id: orderId,
            order_date: orderDate || new Date().toISOString().split('T')[0],
            pickup_location: 'Primary', // Change to your pickup location name from Shiprocket dashboard
            billing_customer_name: customerName.split(' ')[0],
            billing_last_name: customerName.split(' ').slice(1).join(' ') || '',
            billing_address: address,
            billing_address_2: address2 || '',
            billing_city: city,
            billing_pincode: pincode,
            billing_state: state,
            billing_country: 'India',
            billing_email: email || '',
            billing_phone: phone,
            shipping_is_billing: true,
            order_items: items.map((item: { name: string; id: string; quantity: number; price: string | number }) => {
                const numericPrice = typeof item.price === 'number'
                    ? item.price
                    : parseFloat(item.price.replace(/[^\d.]/g, '')) || 0;

                return {
                    name: item.name,
                    sku: item.id,
                    units: item.quantity,
                    selling_price: numericPrice,
                };
            }),
            payment_method: paymentMethod === 'cod' ? 'COD' : 'Prepaid',
            sub_total: typeof subTotal === 'number'
                ? subTotal
                : parseFloat(subTotal.toString().replace(/[^\d.]/g, '')) || 0,
            length: dimensions.length,
            breadth: dimensions.breadth,
            height: dimensions.height,
            weight: weight,
        };

        // Log shipment creation for audit trail
        console.log(`Shipment created by user ${user.uid} for order ${orderId}`);

        const shipment = await createShipment(shipmentOrder);

        return NextResponse.json({
            success: true,
            shipmentId: shipment.shipment_id,
            orderId: shipment.order_id,
            awbCode: shipment.awb_code,
            courierName: shipment.courier_name,
            status: shipment.status,
            userId: user.uid,
        });
    } catch (error) {
        console.error('Shiprocket create shipment error:', error);

        // Handle authentication errors
        if (error instanceof Error && error.message === 'Authentication required') {
            return NextResponse.json(
                { error: 'Please sign in to create shipment' },
                { status: 401 }
            );
        }

        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to create shipment' },
            { status: 500 }
        );
    }
}

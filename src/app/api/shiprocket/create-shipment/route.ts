import { NextRequest, NextResponse } from 'next/server';
import { createShipment, ShipmentOrder } from '@/lib/shiprocket';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

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
            weight = 0.5, // Default weight in kg
            dimensions = { length: 20, breadth: 15, height: 10 } // Default dimensions in cm
        } = body;

        // Validate required fields
        if (!orderId || !customerName || !phone || !address || !city || !pincode || !state || !items?.length) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

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
            order_items: items.map((item: { name: string; id: string; quantity: number; price: number }) => ({
                name: item.name,
                sku: item.id,
                units: item.quantity,
                selling_price: item.price,
            })),
            payment_method: paymentMethod === 'cod' ? 'COD' : 'Prepaid',
            sub_total: subTotal,
            length: dimensions.length,
            breadth: dimensions.breadth,
            height: dimensions.height,
            weight: weight,
        };

        const shipment = await createShipment(shipmentOrder);

        return NextResponse.json({
            success: true,
            shipmentId: shipment.shipment_id,
            orderId: shipment.order_id,
            awbCode: shipment.awb_code,
            courierName: shipment.courier_name,
            status: shipment.status,
        });
    } catch (error) {
        console.error('Shiprocket create shipment error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to create shipment' },
            { status: 500 }
        );
    }
}

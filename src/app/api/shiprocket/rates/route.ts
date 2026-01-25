import { NextRequest, NextResponse } from 'next/server';
import { getShippingRates } from '@/lib/shiprocket';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const deliveryPincode = searchParams.get('pincode');
        const weight = parseFloat(searchParams.get('weight') || '0.5');
        const cod = searchParams.get('cod') === 'true';

        // Your warehouse/pickup pincode - change this to your actual pincode
        const pickupPincode = process.env.SHIPROCKET_PICKUP_PINCODE || '110001';

        if (!deliveryPincode) {
            return NextResponse.json(
                { error: 'Delivery pincode is required' },
                { status: 400 }
            );
        }

        const rates = await getShippingRates(pickupPincode, deliveryPincode, weight, cod);

        // Format rates for frontend
        const formattedRates = rates.map(rate => ({
            courierId: rate.courier_company_id,
            courierName: rate.courier_name,
            rate: rate.rate,
            estimatedDelivery: rate.etd,
            deliveryDays: rate.estimated_delivery_days,
        }));

        // Sort by rate (cheapest first)
        formattedRates.sort((a, b) => a.rate - b.rate);

        return NextResponse.json({
            success: true,
            rates: formattedRates,
            cheapest: formattedRates[0] || null,
            fastest: formattedRates.reduce((prev, curr) =>
                curr.deliveryDays < prev.deliveryDays ? curr : prev,
                formattedRates[0]
            ) || null,
        });
    } catch (error) {
        console.error('Shiprocket rates error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to get shipping rates' },
            { status: 500 }
        );
    }
}

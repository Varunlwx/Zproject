import { NextRequest, NextResponse } from 'next/server';
import { getShippingRates } from '@/lib/shiprocket';
import { requireAuth } from '@/lib/auth-middleware';
import { requireValidOrigin } from '@/lib/csrf-protection';
import { withRateLimit, mediumLimiter } from '@/lib/rate-limit';
import { shippingRatesSchema, formatValidationErrors } from '@/lib/validation-schemas';

export async function GET(request: NextRequest) {
    try {
        // 1. CSRF Protection
        requireValidOrigin(request);

        // 2. Authentication
        const user = await requireAuth(request);

        // 3. Rate Limiting
        const rateLimitResponse = await withRateLimit(request, mediumLimiter, user.uid);
        if (rateLimitResponse) return rateLimitResponse;

        // 4. Input Validation (Zod)
        const { searchParams } = new URL(request.url);
        const queryParams = Object.fromEntries(searchParams.entries());
        const validation = shippingRatesSchema.safeParse(queryParams);

        if (!validation.success) {
            return NextResponse.json(
                {
                    error: 'Validation failed',
                    details: formatValidationErrors(validation.error)
                },
                { status: 400 }
            );
        }

        const { pincode: deliveryPincode, weight, cod } = validation.data;

        // Your warehouse/pickup pincode - change this to your actual pincode
        const pickupPincode = process.env.SHIPROCKET_PICKUP_PINCODE || '110001';


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

        // Calculate cheapest and fastest
        const cheapest = formattedRates.length > 0 ? formattedRates[0] : null;
        const fastest = formattedRates.length > 0
            ? formattedRates.reduce((prev, curr) =>
                (curr.deliveryDays < prev.deliveryDays) ? curr : prev,
                formattedRates[0])
            : null;

        return NextResponse.json({
            success: true,
            rates: formattedRates,
            cheapest,
            fastest,
        });
    } catch (error) {
        console.error('[Shiprocket API] Rates Error:', error);

        // Handle authentication errors
        if (error instanceof Error && error.message === 'Authentication required') {
            return NextResponse.json(
                { error: 'Please sign in to get shipping rates' },
                { status: 401 }
            );
        }

        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to get shipping rates' },
            { status: 500 }
        );
    }
}

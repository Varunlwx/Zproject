import { NextRequest, NextResponse } from 'next/server';
import { trackShipment, trackByShipmentId } from '@/lib/shiprocket';
import { requireAuth } from '@/lib/auth-middleware';
import { requireValidOrigin } from '@/lib/csrf-protection';
import { withRateLimit, mediumLimiter } from '@/lib/rate-limit';
import { trackShipmentSchema, formatValidationErrors } from '@/lib/validation-schemas';

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
        const validation = trackShipmentSchema.safeParse(queryParams);

        if (!validation.success) {
            return NextResponse.json(
                {
                    error: 'Validation failed',
                    details: formatValidationErrors(validation.error)
                },
                { status: 400 }
            );
        }

        const { awb, shipmentId } = validation.data;


        const trackingData = awb
            ? await trackShipment(awb)
            : await trackByShipmentId(shipmentId!);

        // Extract relevant tracking info
        const track = trackingData.tracking_data;
        const shipment = track.shipment_track?.[0];
        const activities = track.shipment_track_activities || [];

        return NextResponse.json({
            success: true,
            status: shipment?.current_status || 'Unknown',
            awbCode: shipment?.awb_code,
            courierName: shipment?.courier_company_id,
            pickupDate: shipment?.pickup_date,
            deliveredDate: shipment?.delivered_date,
            destination: shipment?.destination,
            estimatedDelivery: shipment?.edd,
            trackUrl: track.track_url,
            activities: activities.map(activity => ({
                date: activity.date,
                status: activity.status,
                activity: activity.activity,
                location: activity.location,
            })),
        });
    } catch (error) {
        console.error('Shiprocket tracking error:', error);

        // Handle authentication errors
        if (error instanceof Error && error.message === 'Authentication required') {
            return NextResponse.json(
                { error: 'Please sign in to track shipment' },
                { status: 401 }
            );
        }

        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to track shipment' },
            { status: 500 }
        );
    }
}

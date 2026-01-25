import { NextRequest, NextResponse } from 'next/server';
import { trackShipment, trackByShipmentId } from '@/lib/shiprocket';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const awb = searchParams.get('awb');
        const shipmentId = searchParams.get('shipmentId');

        if (!awb && !shipmentId) {
            return NextResponse.json(
                { error: 'Either awb or shipmentId is required' },
                { status: 400 }
            );
        }

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
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to track shipment' },
            { status: 500 }
        );
    }
}

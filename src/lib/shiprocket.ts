/**
 * Shiprocket API Client
 * Server-side utilities for Shiprocket shipping integration
 */

const SHIPROCKET_API_BASE = 'https://apiv2.shiprocket.in/v1/external';

// Token cache to avoid re-authentication on every request
let tokenCache: { token: string; expiresAt: number } | null = null;

/**
 * Get authentication token from Shiprocket
 * Tokens are valid for 10 days, we cache them for 9 days
 */
export async function getShiprocketToken(): Promise<string> {
    // Return cached token if still valid
    if (tokenCache && tokenCache.expiresAt > Date.now()) {
        return tokenCache.token;
    }

    const email = process.env.SHIPROCKET_EMAIL;
    const password = process.env.SHIPROCKET_PASSWORD;

    if (!email || !password) {
        throw new Error('Shiprocket credentials not configured');
    }

    const response = await fetch(`${SHIPROCKET_API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
        throw new Error('Failed to authenticate with Shiprocket');
    }

    const data = await response.json();

    // Cache token for 9 days (Shiprocket tokens valid for 10 days)
    tokenCache = {
        token: data.token,
        expiresAt: Date.now() + 9 * 24 * 60 * 60 * 1000,
    };

    return data.token;
}

/**
 * Make authenticated request to Shiprocket API
 */
async function shiprocketRequest(
    endpoint: string,
    options: RequestInit = {}
): Promise<Response> {
    const token = await getShiprocketToken();

    return fetch(`${SHIPROCKET_API_BASE}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            ...options.headers,
        },
    });
}

// Types
export interface ShipmentOrder {
    order_id: string;
    order_date: string;
    pickup_location: string;
    billing_customer_name: string;
    billing_last_name?: string;
    billing_address: string;
    billing_address_2?: string;
    billing_city: string;
    billing_pincode: string;
    billing_state: string;
    billing_country: string;
    billing_email: string;
    billing_phone: string;
    shipping_is_billing: boolean;
    order_items: {
        name: string;
        sku: string;
        units: number;
        selling_price: number;
    }[];
    payment_method: 'Prepaid' | 'COD';
    sub_total: number;
    length: number;
    breadth: number;
    height: number;
    weight: number;
}

export interface ShipmentResponse {
    order_id: string;
    shipment_id: number;
    status: string;
    status_code: number;
    onboarding_completed_now: number;
    awb_code: string;
    courier_company_id: number;
    courier_name: string;
}

export interface TrackingResponse {
    tracking_data: {
        track_status: number;
        shipment_status: number;
        shipment_track: {
            id: number;
            awb_code: string;
            courier_company_id: number;
            shipment_id: number;
            order_id: number;
            pickup_date: string;
            delivered_date: string;
            weight: string;
            packages: number;
            current_status: string;
            delivered_to: string;
            destination: string;
            consignee_name: string;
            origin: string;
            courier_agent_details: string | null;
            edd: string | null;
        }[];
        shipment_track_activities: {
            date: string;
            status: string;
            activity: string;
            location: string;
        }[];
        track_url: string;
    };
}

export interface CourierRate {
    courier_company_id: number;
    courier_name: string;
    rate: number;
    etd: string;
    estimated_delivery_days: number;
}

/**
 * Create a new order/shipment in Shiprocket
 */
export async function createShipment(order: ShipmentOrder): Promise<ShipmentResponse> {
    const response = await shiprocketRequest('/orders/create/adhoc', {
        method: 'POST',
        body: JSON.stringify(order),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create shipment');
    }

    return response.json();
}

/**
 * Track shipment by AWB number
 */
export async function trackShipment(awbCode: string): Promise<TrackingResponse> {
    const response = await shiprocketRequest(`/courier/track/awb/${awbCode}`);

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to track shipment');
    }

    return response.json();
}

/**
 * Track shipment by Shiprocket shipment ID
 */
export async function trackByShipmentId(shipmentId: string): Promise<TrackingResponse> {
    const response = await shiprocketRequest(`/courier/track/shipment/${shipmentId}`);

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to track shipment');
    }

    return response.json();
}

/**
 * Get available courier rates for a shipment
 */
export async function getShippingRates(
    pickupPincode: string,
    deliveryPincode: string,
    weight: number, // in kg
    cod: boolean = false
): Promise<CourierRate[]> {
    const response = await shiprocketRequest(
        `/courier/serviceability/?pickup_postcode=${pickupPincode}&delivery_postcode=${deliveryPincode}&weight=${weight}&cod=${cod ? 1 : 0}`
    );

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to get shipping rates');
    }

    const data = await response.json();
    return data.data?.available_courier_companies || [];
}

/**
 * Cancel a shipment
 */
export async function cancelShipment(awbCodes: string[]): Promise<void> {
    const response = await shiprocketRequest('/orders/cancel', {
        method: 'POST',
        body: JSON.stringify({ awbs: awbCodes }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to cancel shipment');
    }
}

/**
 * Get all pickup locations
 */
export async function getPickupLocations(): Promise<{ pickup_locations: { id: number; pickup_location: string }[] }> {
    const response = await shiprocketRequest('/settings/company/pickup');

    if (!response.ok) {
        throw new Error('Failed to get pickup locations');
    }

    return response.json();
}

import { NextRequest, NextResponse } from 'next/server';
import { getShiprocketToken } from '@/lib/shiprocket';

export async function GET(request: NextRequest) {
    if (process.env.NODE_ENV !== 'development') {
        return NextResponse.json({ error: 'Only in dev' }, { status: 403 });
    }

    try {
        const token = await getShiprocketToken();
        return NextResponse.json({
            success: true,
            message: 'Authentication successful',
            tokenPrefix: token.substring(0, 10) + '...'
        });
    } catch (error) {
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}

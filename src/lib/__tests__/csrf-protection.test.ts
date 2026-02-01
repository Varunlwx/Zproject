// Mock next/server before importing anything that uses it
jest.mock('next/server', () => ({
    NextRequest: jest.fn(),
    NextResponse: {
        json: jest.fn((body, init) => ({ body, ...init }))
    }
}));

import { validateOrigin } from '../csrf-protection';

describe('CSRF Protection: validateOrigin', () => {
    const originalEnv = process.env;

    beforeEach(() => {
        jest.resetModules();
        process.env = { ...originalEnv };
    });

    afterAll(() => {
        process.env = originalEnv;
    });

    // Helper to create a mock request
    const createMockRequest = (headers: Record<string, string>) => {
        return {
            headers: {
                get: (name: string) => headers[name.toLowerCase()] || null
            },
            nextUrl: {
                pathname: '/api/test'
            }
        } as any;
    };

    test('allows explicitly allowed origin (localhost:3000)', () => {
        const request = createMockRequest({
            'origin': 'http://localhost:3000',
            'host': 'localhost:3000'
        });
        expect(validateOrigin(request)).toBe(true);
    });

    test('allows same-origin local IP based on Host header', () => {
        const request = createMockRequest({
            'origin': 'http://192.168.0.111:3000',
            'host': '192.168.0.111:3000'
        });
        expect(validateOrigin(request)).toBe(true);
    });

    test('allows same-origin referer based on Host header', () => {
        const request = createMockRequest({
            'referer': 'http://192.168.0.111:3000/checkout',
            'host': '192.168.0.111:3000'
        });
        expect(validateOrigin(request)).toBe(true);
    });

    test('blocks malicious cross-origin request', () => {
        const request = createMockRequest({
            'origin': 'http://malicious-site.com',
            'host': '192.168.0.111:3000'
        });
        expect(validateOrigin(request)).toBe(false);
    });

    test('blocks malicious referer hijack', () => {
        const request = createMockRequest({
            'referer': 'http://malicious-site.com/http://192.168.0.111:3000',
            'host': '192.168.0.111:3000'
        });
        expect(validateOrigin(request)).toBe(false);
    });

    test('allows request without origin/referer headers (default behavior)', () => {
        const request = createMockRequest({
            'host': '192.168.0.111:3000'
        });
        expect(validateOrigin(request)).toBe(true);
    });
});

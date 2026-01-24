require('@testing-library/jest-dom');

// Mock Next.js router
jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: jest.fn(),
        replace: jest.fn(),
        prefetch: jest.fn(),
        back: jest.fn(),
    }),
    usePathname: () => '/',
    useSearchParams: () => new URLSearchParams(),
    useParams: () => ({}),
}));

// Mock Next.js Image component
jest.mock('next/image', () => ({
    __esModule: true,
    default: function MockImage(props) {
        // Simple mock that just renders an img
        const { src, alt, ...rest } = props;
        return null; // Just mock, don't render
    },
}));

// Mock Firebase
jest.mock('@/lib/firebase', () => ({
    auth: {
        currentUser: null,
        onAuthStateChanged: jest.fn(),
    },
    db: {},
}));

// Suppress console errors in tests
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeAll(() => {
    console.error = jest.fn();
    console.warn = jest.fn();
});

afterAll(() => {
    console.error = originalConsoleError;
    console.warn = originalConsoleWarn;
});

import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Privacy Policy',
    description: 'Privacy Policy for Zcloths - Learn how we collect, use, and protect your personal information.',
};

export default function PrivacyPolicyPage() {
    return (
        <div className="page">
            <main style={{ padding: '120px 24px 80px', maxWidth: '800px', margin: '0 auto' }}>
                <h1 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '32px' }}>Privacy Policy</h1>

                <div style={{ lineHeight: 1.8, color: '#4B5563' }}>
                    <p style={{ marginBottom: '16px' }}><strong>Last updated:</strong> January 2026</p>

                    <section style={{ marginBottom: '32px' }}>
                        <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px', color: '#1A1A1A' }}>1. Information We Collect</h2>
                        <p>We collect information you provide directly to us, such as:</p>
                        <ul style={{ marginLeft: '24px', marginTop: '8px' }}>
                            <li>Name, email address, phone number</li>
                            <li>Shipping and billing address</li>
                            <li>Payment information (processed securely via Razorpay)</li>
                            <li>Order history and preferences</li>
                        </ul>
                    </section>

                    <section style={{ marginBottom: '32px' }}>
                        <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px', color: '#1A1A1A' }}>2. How We Use Your Information</h2>
                        <ul style={{ marginLeft: '24px' }}>
                            <li>Process and fulfill your orders</li>
                            <li>Send order confirmations and shipping updates</li>
                            <li>Respond to your inquiries and support requests</li>
                            <li>Improve our website and services</li>
                            <li>Send promotional communications (with your consent)</li>
                        </ul>
                    </section>

                    <section style={{ marginBottom: '32px' }}>
                        <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px', color: '#1A1A1A' }}>3. Information Sharing</h2>
                        <p>We share your information only with:</p>
                        <ul style={{ marginLeft: '24px', marginTop: '8px' }}>
                            <li><strong>Payment processors:</strong> Razorpay for secure payment processing</li>
                            <li><strong>Shipping partners:</strong> To deliver your orders</li>
                            <li><strong>Analytics providers:</strong> Google Analytics for website improvement</li>
                        </ul>
                        <p style={{ marginTop: '8px' }}>We never sell your personal information to third parties.</p>
                    </section>

                    <section style={{ marginBottom: '32px' }}>
                        <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px', color: '#1A1A1A' }}>4. Data Security</h2>
                        <p>We implement industry-standard security measures including:</p>
                        <ul style={{ marginLeft: '24px', marginTop: '8px' }}>
                            <li>SSL encryption for all data transmission</li>
                            <li>Secure authentication via Firebase</li>
                            <li>PCI-compliant payment processing through Razorpay</li>
                        </ul>
                    </section>

                    <section style={{ marginBottom: '32px' }}>
                        <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px', color: '#1A1A1A' }}>5. Your Rights</h2>
                        <p>You have the right to:</p>
                        <ul style={{ marginLeft: '24px', marginTop: '8px' }}>
                            <li>Access your personal data</li>
                            <li>Correct inaccurate information</li>
                            <li>Request deletion of your data</li>
                            <li>Opt-out of marketing communications</li>
                        </ul>
                    </section>

                    <section style={{ marginBottom: '32px' }}>
                        <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px', color: '#1A1A1A' }}>6. Cookies</h2>
                        <p>We use cookies to enhance your experience, analyze site traffic, and personalize content. You can manage cookie preferences in your browser settings.</p>
                    </section>

                    <section style={{ marginBottom: '32px' }}>
                        <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px', color: '#1A1A1A' }}>7. Contact Us</h2>
                        <p>For privacy-related inquiries, please contact us at:</p>
                        <p style={{ marginTop: '8px' }}><strong>Email:</strong> privacy@zcloths.com</p>
                    </section>
                </div>
            </main>
        </div>
    );
}

import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Terms of Service',
    description: 'Terms of Service for Zcloths - Read our terms and conditions for using our services.',
};

export default function TermsPage() {
    return (
        <div className="page">
            <main style={{ padding: '120px 24px 80px', maxWidth: '800px', margin: '0 auto' }}>
                <h1 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '32px' }}>Terms of Service</h1>

                <div style={{ lineHeight: 1.8, color: '#4B5563' }}>
                    <p style={{ marginBottom: '16px' }}><strong>Last updated:</strong> January 2026</p>

                    <section style={{ marginBottom: '32px' }}>
                        <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px', color: '#1A1A1A' }}>1. Acceptance of Terms</h2>
                        <p>By accessing and using Zcloths website, you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.</p>
                    </section>

                    <section style={{ marginBottom: '32px' }}>
                        <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px', color: '#1A1A1A' }}>2. Products and Pricing</h2>
                        <ul style={{ marginLeft: '24px' }}>
                            <li>All prices are displayed in Indian Rupees (₹)</li>
                            <li>Prices are subject to change without notice</li>
                            <li>Product availability is not guaranteed</li>
                            <li>We reserve the right to limit quantities</li>
                        </ul>
                    </section>

                    <section style={{ marginBottom: '32px' }}>
                        <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px', color: '#1A1A1A' }}>3. Orders and Payment</h2>
                        <ul style={{ marginLeft: '24px' }}>
                            <li>Orders are subject to acceptance and availability</li>
                            <li>Payment must be received before order processing</li>
                            <li>We accept UPI, credit/debit cards, and Cash on Delivery</li>
                            <li>All payments are processed securely via Razorpay</li>
                        </ul>
                    </section>

                    <section style={{ marginBottom: '32px' }}>
                        <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px', color: '#1A1A1A' }}>4. Shipping</h2>
                        <ul style={{ marginLeft: '24px' }}>
                            <li>We ship across India</li>
                            <li>Delivery times vary by location (typically 5-10 business days)</li>
                            <li>Shipping charges are calculated at checkout</li>
                            <li>Free shipping on orders above ₹1,999</li>
                        </ul>
                    </section>

                    <section style={{ marginBottom: '32px' }}>
                        <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px', color: '#1A1A1A' }}>5. User Accounts</h2>
                        <ul style={{ marginLeft: '24px' }}>
                            <li>You are responsible for maintaining account security</li>
                            <li>Provide accurate and complete information</li>
                            <li>Notify us immediately of unauthorized access</li>
                            <li>We may suspend accounts for violations</li>
                        </ul>
                    </section>

                    <section style={{ marginBottom: '32px' }}>
                        <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px', color: '#1A1A1A' }}>6. Intellectual Property</h2>
                        <p>All content on this website, including images, text, logos, and designs, is the property of Zcloths and protected by copyright laws. Unauthorized use is prohibited.</p>
                    </section>

                    <section style={{ marginBottom: '32px' }}>
                        <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px', color: '#1A1A1A' }}>7. Limitation of Liability</h2>
                        <p>Zcloths is not liable for any indirect, incidental, or consequential damages arising from the use of our services or products.</p>
                    </section>

                    <section style={{ marginBottom: '32px' }}>
                        <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px', color: '#1A1A1A' }}>8. Governing Law</h2>
                        <p>These terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts in India.</p>
                    </section>

                    <section style={{ marginBottom: '32px' }}>
                        <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px', color: '#1A1A1A' }}>9. Contact</h2>
                        <p>For questions about these terms, contact us at:</p>
                        <p style={{ marginTop: '8px' }}><strong>Email:</strong> support@zcloths.com</p>
                    </section>
                </div>
            </main>
        </div>
    );
}

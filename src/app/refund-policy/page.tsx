import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Refund & Return Policy',
    description: 'Refund and Return Policy for Zcloths - Learn about our return, exchange, and refund procedures.',
};

export default function RefundPolicyPage() {
    return (
        <div className="page">
            <main style={{ padding: '120px 24px 80px', maxWidth: '800px', margin: '0 auto' }}>
                <h1 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '32px' }}>Refund & Return Policy</h1>

                <div style={{ lineHeight: 1.8, color: '#4B5563' }}>
                    <p style={{ marginBottom: '16px' }}><strong>Last updated:</strong> January 2026</p>

                    <section style={{ marginBottom: '32px' }}>
                        <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px', color: '#1A1A1A' }}>1. Return Policy</h2>
                        <p>We want you to be completely satisfied with your purchase. If you&apos;re not happy with your order, you may return it within:</p>
                        <ul style={{ marginLeft: '24px', marginTop: '8px' }}>
                            <li><strong>7 days</strong> from delivery for exchange</li>
                            <li><strong>7 days</strong> from delivery for return and refund</li>
                        </ul>
                    </section>

                    <section style={{ marginBottom: '32px' }}>
                        <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px', color: '#1A1A1A' }}>2. Conditions for Returns</h2>
                        <p>To be eligible for a return, items must be:</p>
                        <ul style={{ marginLeft: '24px', marginTop: '8px' }}>
                            <li>Unused and unwashed</li>
                            <li>In original condition with tags attached</li>
                            <li>In original packaging</li>
                            <li>Not part of sale or promotional items (unless defective)</li>
                        </ul>
                    </section>

                    <section style={{ marginBottom: '32px' }}>
                        <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px', color: '#1A1A1A' }}>3. Non-Returnable Items</h2>
                        <ul style={{ marginLeft: '24px' }}>
                            <li>Customized or personalized items</li>
                            <li>Innerwear and accessories (for hygiene reasons)</li>
                            <li>Items damaged due to misuse</li>
                            <li>Items returned after the 7-day window</li>
                        </ul>
                    </section>

                    <section style={{ marginBottom: '32px' }}>
                        <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px', color: '#1A1A1A' }}>4. How to Initiate a Return</h2>
                        <ol style={{ marginLeft: '24px' }}>
                            <li>Go to your Orders page in your account</li>
                            <li>Select the order and item you wish to return</li>
                            <li>Choose &quot;Return&quot; or &quot;Exchange&quot; option</li>
                            <li>Our team will arrange pickup within 3-5 business days</li>
                        </ol>
                    </section>

                    <section style={{ marginBottom: '32px' }}>
                        <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px', color: '#1A1A1A' }}>5. Refund Process</h2>
                        <ul style={{ marginLeft: '24px' }}>
                            <li>Refunds are processed within <strong>7-10 business days</strong> after receiving the returned item</li>
                            <li>Amount will be credited to your original payment method</li>
                            <li>For COD orders, refund will be processed via bank transfer</li>
                            <li>Shipping charges are non-refundable (unless item was defective)</li>
                        </ul>
                    </section>

                    <section style={{ marginBottom: '32px' }}>
                        <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px', color: '#1A1A1A' }}>6. Exchanges</h2>
                        <ul style={{ marginLeft: '24px' }}>
                            <li>Exchanges are subject to availability</li>
                            <li>If the replacement item costs more, you&apos;ll need to pay the difference</li>
                            <li>If it costs less, the difference will be refunded</li>
                        </ul>
                    </section>

                    <section style={{ marginBottom: '32px' }}>
                        <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px', color: '#1A1A1A' }}>7. Damaged or Defective Items</h2>
                        <p>If you receive a damaged or defective item:</p>
                        <ul style={{ marginLeft: '24px', marginTop: '8px' }}>
                            <li>Report within 48 hours of delivery</li>
                            <li>Provide photos of the damage</li>
                            <li>We will arrange free pickup and replacement</li>
                        </ul>
                    </section>

                    <section style={{ marginBottom: '32px' }}>
                        <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px', color: '#1A1A1A' }}>8. Order Cancellation</h2>
                        <ul style={{ marginLeft: '24px' }}>
                            <li>Orders can be cancelled before shipping</li>
                            <li>Once shipped, cancellation is not possible</li>
                            <li>Full refund will be processed for cancelled orders</li>
                        </ul>
                    </section>

                    <section style={{ marginBottom: '32px' }}>
                        <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px', color: '#1A1A1A' }}>9. Contact Us</h2>
                        <p>For return and refund queries:</p>
                        <p style={{ marginTop: '8px' }}><strong>Email:</strong> returns@zcloths.com</p>
                    </section>
                </div>
            </main>
        </div>
    );
}

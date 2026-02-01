'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/contexts/toast-context';

export default function SignupPage() {
    const router = useRouter();
    const { signUp, signInWithGoogle } = useAuth();
    const { showToast } = useToast();
    const [formData, setFormData] = useState({
        displayName: '',
        email: '',
        phoneNumber: '',
        password: '',
        confirmPassword: '',
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (formData.password !== formData.confirmPassword) {
            showToast('Passwords do not match', 'error');
            return;
        }

        if (formData.password.length < 6) {
            showToast('Password must be at least 6 characters', 'error');
            return;
        }

        // Phone number validation (required)
        if (!formData.phoneNumber) {
            showToast('Phone number is required', 'error');
            return;
        }

        if (!/^[6-9]\d{9}$/.test(formData.phoneNumber)) {
            showToast('Invalid Indian phone number (10 digits starting with 6-9)', 'error');
            return;
        }

        setLoading(true);

        try {
            await signUp(
                formData.email,
                formData.password,
                formData.displayName,
                formData.phoneNumber
            );
            showToast('Account created successfully!', 'success');
            router.push('/');
        } catch (error: any) {
            const errorMessage = error.code === 'auth/email-already-in-use'
                ? 'Email already in use'
                : error.message || 'Failed to create account';
            showToast(errorMessage, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setLoading(true);
        try {
            await signInWithGoogle();
            showToast('Successfully signed in with Google!', 'success');
            router.push('/');
        } catch (error: any) {
            showToast(error.message || 'Failed to sign in with Google', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F5F5F6', padding: '20px' }}>
            <div style={{ background: 'white', borderRadius: '12px', padding: '40px', maxWidth: '400px', width: '100%', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#1A1A1A', marginBottom: '8px', textAlign: 'center' }}>Create Account</h1>
                <p style={{ fontSize: '14px', color: '#6B6B6B', marginBottom: '32px', textAlign: 'center' }}>Join us today</p>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#1A1A1A', marginBottom: '8px' }}>Full Name</label>
                        <input
                            type="text"
                            name="displayName"
                            value={formData.displayName}
                            onChange={handleChange}
                            required
                            style={{ width: '100%', padding: '12px', border: '1px solid #E5E5E5', borderRadius: '6px', fontSize: '14px', outline: 'none', transition: 'border-color 0.2s' }}
                            placeholder="John Doe"
                        />
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#1A1A1A', marginBottom: '8px' }}>Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            style={{ width: '100%', padding: '12px', border: '1px solid #E5E5E5', borderRadius: '6px', fontSize: '14px', outline: 'none', transition: 'border-color 0.2s' }}
                            placeholder="your@email.com"
                        />
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#1A1A1A', marginBottom: '8px' }}>
                            Phone Number <span style={{ color: '#E85D04', fontSize: '12px' }}>*</span>
                        </label>
                        <input
                            type="tel"
                            name="phoneNumber"
                            value={formData.phoneNumber}
                            onChange={handleChange}
                            required
                            style={{ width: '100%', padding: '12px', border: '1px solid #E5E5E5', borderRadius: '6px', fontSize: '14px', outline: 'none', transition: 'border-color 0.2s' }}
                            placeholder="9876543210"
                            maxLength={10}
                        />
                        <p style={{ fontSize: '12px', color: '#6B6B6B', marginTop: '4px' }}>Indian phone number (10 digits starting with 6-9)</p>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#1A1A1A', marginBottom: '8px' }}>Password</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            style={{ width: '100%', padding: '12px', border: '1px solid #E5E5E5', borderRadius: '6px', fontSize: '14px', outline: 'none', transition: 'border-color 0.2s' }}
                            placeholder="••••••••"
                        />
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#1A1A1A', marginBottom: '8px' }}>Confirm Password</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                            style={{ width: '100%', padding: '12px', border: '1px solid #E5E5E5', borderRadius: '6px', fontSize: '14px', outline: 'none', transition: 'border-color 0.2s' }}
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{ width: '100%', padding: '14px', background: '#E85D04', color: 'white', border: 'none', borderRadius: '6px', fontSize: '15px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, transition: 'all 0.2s' }}
                    >
                        {loading ? 'Creating account...' : 'Sign Up'}
                    </button>
                </form>

                <div style={{ margin: '24px 0', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ flex: 1, height: '1px', background: '#E5E5E5' }}></div>
                    <span style={{ fontSize: '13px', color: '#9CA3AF' }}>OR</span>
                    <div style={{ flex: 1, height: '1px', background: '#E5E5E5' }}></div>
                </div>

                <button
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                    style={{ width: '100%', padding: '14px', background: 'white', color: '#1A1A1A', border: '1px solid #E5E5E5', borderRadius: '6px', fontSize: '15px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', transition: 'all 0.2s' }}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Continue with Google
                </button>

                <p style={{ marginTop: '24px', textAlign: 'center', fontSize: '14px', color: '#6B6B6B' }}>
                    Already have an account?{' '}
                    <Link href="/login" style={{ color: '#E85D04', fontWeight: '600', textDecoration: 'none' }}>
                        Sign In
                    </Link>
                </p>
            </div>
        </div>
    );
}

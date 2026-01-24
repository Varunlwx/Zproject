'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/contexts/admin-auth-context';

export default function AdminLoginPage() {
    const router = useRouter();
    const { adminLogin, isAdminAuthenticated, isLoading } = useAdminAuth();

    const [adminId, setAdminId] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    // Redirect if already authenticated
    useEffect(() => {
        if (!isLoading && isAdminAuthenticated) {
            router.push('/admin/dashboard');
        }
    }, [isAdminAuthenticated, isLoading, router]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');

        if (!adminId.trim()) {
            setError('Please enter Admin ID');
            return;
        }
        if (!password) {
            setError('Please enter password');
            return;
        }

        setIsSubmitting(true);
        try {
            const success = await adminLogin(adminId, password);
            if (success) {
                router.push('/admin/dashboard');
            } else {
                setError('Invalid Admin ID or Password');
            }
        } catch {
            setError('Login failed. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="admin-loading">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="admin-container">
            <div className="admin-card">
                {/* Logo */}
                <div className="admin-logo">
                    <div className="admin-icon">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M12 15c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z" />
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                            <path d="M21 21v-2a4 4 0 0 0-3-3.87" />
                        </svg>
                    </div>
                    <h1>ZCLOTHS</h1>
                    <p>ADMIN PORTAL</p>
                </div>

                {/* Header */}
                <div className="admin-header">
                    <h2>Admin Login</h2>
                    <p>Sign in to manage your store</p>
                </div>

                {/* Error Alert */}
                {error && <div className="admin-alert error">{error}</div>}

                {/* Form */}
                <form onSubmit={handleSubmit} className="admin-form">
                    <div className="admin-form-group">
                        <label className="admin-label">Admin ID</label>
                        <input
                            type="text"
                            className="admin-input"
                            placeholder="Enter your Admin ID"
                            value={adminId}
                            onChange={(e) => setAdminId(e.target.value)}
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="admin-form-group">
                        <label className="admin-label">Password</label>
                        <div className="admin-input-wrapper">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                className="admin-input"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={isSubmitting}
                            />
                            <button
                                type="button"
                                className="admin-toggle-password"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                        <line x1="1" y1="1" x2="23" y2="23" />
                                    </svg>
                                ) : (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                        <circle cx="12" cy="12" r="3" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>

                    <button type="submit" className="admin-submit-btn" disabled={isSubmitting}>
                        {isSubmitting ? <span className="spinner-small"></span> : 'SIGN IN'}
                    </button>
                </form>

                {/* Footer */}
                <div className="admin-footer">
                    <p>Protected Area • Authorized Personnel Only</p>
                </div>
            </div>

            <style jsx>{`
        .admin-loading {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
        }

        .admin-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
          padding: 20px;
        }

        .admin-card {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          padding: 48px 40px;
          width: 100%;
          max-width: 420px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }

        .admin-logo {
          text-align: center;
          margin-bottom: 32px;
        }

        .admin-icon {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px;
          color: white;
        }

        .admin-logo h1 {
          font-size: 28px;
          font-weight: 700;
          color: white;
          letter-spacing: 4px;
          margin: 0;
        }

        .admin-logo p {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.6);
          letter-spacing: 3px;
          margin: 4px 0 0;
        }

        .admin-header {
          text-align: center;
          margin-bottom: 32px;
        }

        .admin-header h2 {
          font-size: 24px;
          font-weight: 600;
          color: white;
          margin: 0 0 8px;
        }

        .admin-header p {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.6);
          margin: 0;
        }

        .admin-alert {
          padding: 12px 16px;
          border-radius: 12px;
          margin-bottom: 24px;
          font-size: 14px;
          text-align: center;
        }

        .admin-alert.error {
          background: rgba(239, 68, 68, 0.2);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #fca5a5;
        }

        .admin-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .admin-form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .admin-label {
          font-size: 14px;
          font-weight: 500;
          color: rgba(255, 255, 255, 0.8);
        }

        .admin-input {
          width: 100%;
          padding: 14px 16px;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 12px;
          font-size: 15px;
          color: white;
          transition: all 0.3s ease;
          outline: none;
        }

        .admin-input::placeholder {
          color: rgba(255, 255, 255, 0.4);
        }

        .admin-input:focus {
          border-color: #667eea;
          background: rgba(255, 255, 255, 0.12);
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
        }

        .admin-input:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .admin-input-wrapper {
          position: relative;
        }

        .admin-input-wrapper .admin-input {
          padding-right: 48px;
        }

        .admin-toggle-password {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: rgba(255, 255, 255, 0.5);
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 0.2s;
        }

        .admin-toggle-password:hover {
          color: rgba(255, 255, 255, 0.8);
        }

        .admin-submit-btn {
          width: 100%;
          padding: 16px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          border-radius: 12px;
          font-size: 15px;
          font-weight: 600;
          color: white;
          letter-spacing: 1px;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-top: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 52px;
        }

        .admin-submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px -5px rgba(102, 126, 234, 0.4);
        }

        .admin-submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .admin-footer {
          text-align: center;
          margin-top: 32px;
          padding-top: 24px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .admin-footer p {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.4);
          margin: 0;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(255, 255, 255, 0.2);
          border-top-color: #667eea;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        .spinner-small {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 480px) {
          .admin-card {
            padding: 32px 24px;
          }

          .admin-logo h1 {
            font-size: 24px;
          }

          .admin-icon {
            width: 64px;
            height: 64px;
          }

          .admin-icon svg {
            width: 36px;
            height: 36px;
          }
        }
      `}</style>
        </div>
    );
}

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/contexts/admin-auth-context';

export default function AdminDashboard() {
  const router = useRouter();
  const { isAdminAuthenticated, isLoading, adminLogout } = useAdminAuth();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAdminAuthenticated) {
      router.push('/admin');
    }
  }, [isAdminAuthenticated, isLoading, router]);

  const handleLogout = () => {
    adminLogout();
    router.push('/admin');
  };

  if (isLoading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!isAdminAuthenticated) {
    return null;
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="dashboard-brand">
          <h1>ZCLOTHS</h1>
          <span>ADMIN</span>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16,17 21,12 16,7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Logout
        </button>
      </header>

      <main className="dashboard-main">
        <div className="dashboard-content">
          <h1 className="dashboard-title">Dashboard</h1>
          <p className="dashboard-subtitle">Manage your store components below.</p>

          <div className="dashboard-grid">
            <div className="dashboard-card" onClick={() => router.push('/admin/products')}>
              <div className="card-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3>Products</h3>
              <p>Add, edit, and delete products</p>
            </div>

            <div className="dashboard-card disabled">
              <div className="card-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
                  <rect x="9" y="3" width="6" height="4" rx="2" ry="2" />
                </svg>
              </div>
              <h3>Orders</h3>
              <p>Coming Soon</p>
            </div>

            <div className="dashboard-card disabled">
              <div className="card-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <h3>Customers</h3>
              <p>Coming Soon</p>
            </div>
          </div>
        </div>
      </main>

      <style jsx>{`
        .dashboard-loading {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
        }

        .dashboard-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
        }

        .dashboard-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 40px;
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .dashboard-brand {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .dashboard-brand h1 {
          font-size: 24px;
          font-weight: 700;
          color: white;
          letter-spacing: 3px;
          margin: 0;
        }

        .dashboard-brand span {
          font-size: 12px;
          font-weight: 500;
          color: #667eea;
          background: rgba(102, 126, 234, 0.2);
          padding: 4px 12px;
          border-radius: 20px;
          letter-spacing: 2px;
        }

        .logout-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 10px;
          color: white;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .logout-btn:hover {
          background: rgba(239, 68, 68, 0.2);
          border-color: rgba(239, 68, 68, 0.4);
        }

        .dashboard-main {
          display: flex;
          align-items: flex-start;
          justify-content: center;
          min-height: calc(100vh - 80px);
          padding: 60px 40px;
        }

        .dashboard-content {
          width: 100%;
          max-width: 1200px;
          text-align: center;
        }

        .dashboard-title {
          font-size: 56px;
          font-weight: 700;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin: 0 0 16px;
          letter-spacing: 2px;
        }

        .dashboard-subtitle {
          font-size: 18px;
          color: rgba(255, 255, 255, 0.6);
          margin: 0 0 60px;
        }

        .dashboard-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 30px;
        }

        .dashboard-card {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          padding: 40px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
        }

        .dashboard-card:hover:not(.disabled) {
          transform: translateY(-10px);
          background: rgba(255, 255, 255, 0.08);
          border-color: #667eea;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }

        .dashboard-card.disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .card-icon {
          width: 64px;
          height: 64px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .dashboard-card h3 {
          font-size: 24px;
          font-weight: 600;
          color: white;
          margin: 0;
        }

        .dashboard-card p {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.5);
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

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .dashboard-header {
            padding: 16px 20px;
          }

          .dashboard-brand h1 {
            font-size: 20px;
          }

          .dashboard-title {
            font-size: 48px;
          }

          .dashboard-subtitle {
            font-size: 16px;
          }

          .logout-btn span {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}

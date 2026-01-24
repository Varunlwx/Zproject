'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';

import { useAuth } from '@/contexts/auth-context';
import { useOrders, OrderStatus } from '@/contexts/order-context';
import { useAddresses, Address } from '@/contexts/address-context';
import { useToast } from '@/contexts/toast-context';
import { ProfilePageSkeleton } from '@/components/Skeletons';
import Navbar from '@/components/Navbar';
import Breadcrumb from '@/components/Breadcrumb';

export default function ProfilePage() {
    const { user, loading, logout, resetPassword } = useAuth();
    const { showToast } = useToast();


    const { addresses, addAddress, deleteAddress, updateAddress } = useAddresses();

    // Address Modal State
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [modalView, setModalView] = useState<'list' | 'form'>('list');
    const [editingAddress, setEditingAddress] = useState<Address | null>(null);
    const [addressForm, setAddressForm] = useState({
        fullName: '',
        phone: '',
        email: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        pincode: '',
        type: 'home' as const
    });

    // Initialize form when editing
    useEffect(() => {
        if (editingAddress) {
            setAddressForm({
                fullName: editingAddress.fullName,
                phone: editingAddress.phone,
                email: editingAddress.email,
                addressLine1: editingAddress.addressLine1,
                addressLine2: editingAddress.addressLine2 || '',
                city: editingAddress.city,
                state: editingAddress.state,
                pincode: editingAddress.pincode,
                type: (editingAddress.type as any) || 'home'
            });
        } else {
            setAddressForm({
                fullName: '',
                phone: '',
                email: '',
                addressLine1: '',
                addressLine2: '',
                city: '',
                state: '',
                pincode: '',
                type: 'home'
            });
        }
    }, [editingAddress]);

    const handleAddressSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingAddress) {
                await updateAddress(editingAddress.id, addressForm);
                showToast('Address updated successfully', 'success');
            } else {
                await addAddress(addressForm);
                showToast('Address added successfully', 'success');
            }
            setModalView('list');
            setEditingAddress(null);
        } catch (error) {
            console.error('Failed to save address:', error);
            showToast('Failed to save address', 'error');
        }
    };

    const handleDeleteAddress = async (id: string) => {
        console.log('[DEBUG] Delete button clicked, address ID:', id);
        try {
            console.log('[DEBUG] Calling deleteAddress...');
            await deleteAddress(id);
            console.log('[DEBUG] deleteAddress completed successfully');
            showToast('Address deleted successfully', 'success');
        } catch (error) {
            console.error('[DEBUG] Delete failed with error:', error);
            showToast('Failed to delete address', 'error');
        }
    };

    const openAddAddressModal = () => {
        setEditingAddress(null);
        setModalView('form');
    };

    const openAddressesModal = () => {
        setModalView('list');
        setShowAddressModal(true);
    };

    const openEditAddressModal = (address: Address) => {
        setEditingAddress(address);
        setModalView('form');
    };


    // Get status badge class
    const getStatusBadgeClass = (status: OrderStatus) => {
        switch (status) {
            case 'processing': return 'status-processing';
            case 'shipped': return 'status-shipped';
            case 'delivered': return 'status-delivered';
            case 'exchange': return 'status-exchange';
            case 'cancelled': return 'status-cancelled';
            default: return '';
        }
    };

    // Format date
    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    };


    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    const handlePasswordReset = async () => {
        if (!user?.email) return;
        try {
            await resetPassword(user.email);
            showToast('Password reset email sent to your inbox', 'success');
        } catch (error) {
            console.error('Password reset failed:', error);
            showToast('Failed to send reset email. Please try again.', 'error');
        }
    };

    if (loading) {
        return (
            <div className="page" style={{ background: '#FAFAFA', minHeight: '100vh' }}>
                <Navbar />
                <main style={{ paddingTop: '100px' }}>
                    <ProfilePageSkeleton />
                </main>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="not-logged-in">
                <div className="content">
                    <div className="icon-circle">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#E85D04" strokeWidth="1.5">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                        </svg>
                    </div>
                    <h2>Sign in to view your profile</h2>
                    <p>Access your orders, wishlist, and account settings</p>
                    <Link href="/login" className="sign-in-btn">Sign In</Link>
                    <Link href="/" className="back-home">← Back to Home</Link>
                </div>
                <style jsx>{`
                    .not-logged-in { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #FAFAFA; padding: 24px; }
                    .content { text-align: center; max-width: 400px; }
                    .icon-circle { width: 120px; height: 120px; margin: 0 auto 32px; background: rgba(232, 93, 4, 0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center; }
                    .content h2 { font-size: 22px; font-weight: 700; color: #1A1A1A; margin: 0 0 8px; }
                    .content p { font-size: 14px; color: #6B6B6B; margin: 0 0 32px; line-height: 1.5; }
                    .sign-in-btn { display: inline-flex; align-items: center; gap: 8px; padding: 14px 32px; background: #E85D04; color: white; text-decoration: none; border-radius: 12px; font-size: 15px; font-weight: 600; transition: background 0.2s; }
                    .sign-in-btn:hover { background: #1A1A1A; }
                    .back-home { display: block; margin-top: 20px; color: #6B6B6B; text-decoration: none; font-size: 14px; transition: color 0.2s; }
                    .back-home:hover { color: #1A1A1A; }
                `}</style>
            </div>
        );
    }

    return (
        <div className="page">
            {/* Website Header */}
            <Navbar />

            <main>
                {/* Page Title */}
                <section className="page-header">
                    <Breadcrumb items={[
                        { label: 'Home', href: '/' },
                        { label: 'Profile' }
                    ]} />
                    <h1>My Account</h1>
                </section>

                {/* Profile Content */}
                <section className="profile-content">
                    <div className="profile-grid">
                        {/* Profile Card */}
                        <div className="profile-card">
                            <div className="avatar-container">
                                <div className="avatar">
                                    {user.photoURL ? (
                                        <img src={user.photoURL} alt="Profile" />
                                    ) : (
                                        <span>{user.displayName?.[0] || user.email?.[0] || 'U'}</span>
                                    )}
                                </div>
                                <div className="provider-badge">
                                    {user.providerData?.[0]?.providerId === 'google.com' ? 'G' : '@'}
                                </div>
                            </div>
                            <div className="name-row">
                                <h2>{user.displayName || 'User'}</h2>
                                <button className="edit-btn">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                    </svg>
                                </button>
                            </div>
                            <p className="email">{user.email}</p>
                            <span className="provider-label">
                                {user.providerData?.[0]?.providerId === 'google.com' ? 'Google Account' : 'Email Account'}
                            </span>
                        </div>

                        {/* Menu Cards */}
                        <div className="menu-section">
                            <div className="menu-card">
                                <h3>Quick Links</h3>
                                <Link href="/orders" className="menu-tile">
                                    <div className="menu-icon">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" />
                                        </svg>
                                    </div>
                                    <div className="menu-text">
                                        <span className="menu-title">My Orders</span>
                                        <span className="menu-subtitle">View your order history</span>
                                    </div>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6B6B6B" strokeWidth="2">
                                        <polyline points="9 18 15 12 9 6" />
                                    </svg>
                                </Link>
                                <button className="menu-tile" onClick={(e) => { e.preventDefault(); openAddressesModal(); }}>
                                    <div className="menu-icon">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                                        </svg>
                                    </div>
                                    <div className="menu-text">
                                        <span className="menu-title">Addresses</span>
                                        <span className="menu-subtitle">Manage delivery addresses</span>
                                    </div>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6B6B6B" strokeWidth="2">
                                        <polyline points="9 18 15 12 9 6" />
                                    </svg>
                                </button>
                                <Link href="/wishlist" className="menu-tile">
                                    <div className="menu-icon">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                                        </svg>
                                    </div>
                                    <div className="menu-text">
                                        <span className="menu-title">Wishlist</span>
                                        <span className="menu-subtitle">View your saved items</span>
                                    </div>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6B6B6B" strokeWidth="2">
                                        <polyline points="9 18 15 12 9 6" />
                                    </svg>
                                </Link>
                            </div>

                            <div className="menu-card">
                                <h3>Account Settings</h3>
                                <button className="menu-tile" onClick={handlePasswordReset}>
                                    <div className="menu-icon">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                        </svg>
                                    </div>
                                    <div className="menu-text">
                                        <span className="menu-title">Change Password</span>
                                        <span className="menu-subtitle">Update your password</span>
                                    </div>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6B6B6B" strokeWidth="2">
                                        <polyline points="9 18 15 12 9 6" />
                                    </svg>
                                </button>
                                <button onClick={handleLogout} className="menu-tile">
                                    <div className="menu-icon logout">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
                                        </svg>
                                    </div>
                                    <div className="menu-text">
                                        <span className="menu-title">Sign Out</span>
                                        <span className="menu-subtitle">Log out of your account</span>
                                    </div>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6B6B6B" strokeWidth="2">
                                        <polyline points="9 18 15 12 9 6" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Orders Section Removed */}

                {/* Addresses Section Removed */}

                {/* Footer */}
                <footer className="footer">
                    <div className="footer-grid">
                        <div className="footer-brand">
                            <h2>ZCLOTHS</h2>
                            <p>Premium Indian Menswear</p>
                            <p className="footer-desc">Handcrafted clothing that blends traditional Indian aesthetics with modern design.</p>
                        </div>
                        <div className="footer-col">
                            <h4>Shop</h4>
                            <a href="#">Kurtas</a>
                            <a href="#">Hoodies</a>
                            <a href="#">Shirts</a>
                            <a href="#">T-Shirts</a>
                        </div>
                        <div className="footer-col">
                            <h4>Support</h4>
                            <a href="#">Contact Us</a>
                            <a href="#">FAQs</a>
                            <a href="#">Shipping</a>
                            <a href="#">Returns</a>
                        </div>
                        <div className="footer-col">
                            <h4>Company</h4>
                            <a href="#">About Us</a>
                            <a href="#">Careers</a>
                            <a href="#">Press</a>
                        </div>
                    </div>
                    <div className="footer-bottom">
                        <p>© 2024 Zcloths. All rights reserved.</p>
                        <div className="footer-links">
                            <a href="#">Privacy Policy</a>
                            <a href="#">Terms of Service</a>
                        </div>
                    </div>
                </footer>
            </main>

            {/* Address Modal */}
            {showAddressModal && (
                <div className="modal-overlay" onClick={() => setShowAddressModal(false)}>
                    <div className="modal-container" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{modalView === 'list' ? 'My Addresses' : (editingAddress ? 'Edit Address' : 'Add New Address')}</h3>
                            <button className="close-btn" onClick={() => setShowAddressModal(false)}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>

                        {modalView === 'list' ? (
                            <div className="modal-body list-view">
                                {addresses.map(address => (
                                    <div key={address.id} className="address-item" onClick={() => openEditAddressModal(address)}>
                                        <div className="address-item-content">
                                            <span className="address-type-badge">{address.type || 'Home'}</span>
                                            <h4>{address.fullName}</h4>
                                            <p>{address.addressLine1}, {address.city} - {address.pincode}</p>
                                        </div>
                                        <button
                                            className="delete-btn"
                                            onClick={(e) => { e.stopPropagation(); handleDeleteAddress(address.id); }}
                                            title="Delete Address"
                                        >
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                                <path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                            </svg>
                                        </button>
                                    </div>
                                ))}

                                {addresses.length < 3 ? (
                                    <button className="add-new-btn-container" onClick={openAddAddressModal}>
                                        <div className="add-icon-circle">
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                                            </svg>
                                        </div>
                                        <span>Add New Address</span>
                                    </button>
                                ) : (
                                    <div className="limit-reached">
                                        <p>Maximum limit of 3 addresses reached</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <form onSubmit={handleAddressSubmit} className="modal-body">
                                <div className="form-group full">
                                    <label>Full Name</label>
                                    <input
                                        required
                                        type="text"
                                        value={addressForm.fullName}
                                        onChange={e => setAddressForm({ ...addressForm, fullName: e.target.value })}
                                        placeholder="Enter full name"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Phone Number</label>
                                    <input
                                        required
                                        type="tel"
                                        value={addressForm.phone}
                                        onChange={e => setAddressForm({ ...addressForm, phone: e.target.value })}
                                        placeholder="10-digit mobile number"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Email (Optional)</label>
                                    <input
                                        type="email"
                                        value={addressForm.email}
                                        onChange={e => setAddressForm({ ...addressForm, email: e.target.value })}
                                        placeholder="For notifications"
                                    />
                                </div>
                                <div className="form-group full">
                                    <label>Address Line 1</label>
                                    <input
                                        required
                                        type="text"
                                        value={addressForm.addressLine1}
                                        onChange={e => setAddressForm({ ...addressForm, addressLine1: e.target.value })}
                                        placeholder="House/Flat No., Building Name"
                                    />
                                </div>
                                <div className="form-group full">
                                    <label>Address Line 2 (Optional)</label>
                                    <input
                                        type="text"
                                        value={addressForm.addressLine2}
                                        onChange={e => setAddressForm({ ...addressForm, addressLine2: e.target.value })}
                                        placeholder="Landmark, Area"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>City</label>
                                    <input
                                        required
                                        type="text"
                                        value={addressForm.city}
                                        onChange={e => setAddressForm({ ...addressForm, city: e.target.value })}
                                        placeholder="City"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>State</label>
                                    <input
                                        required
                                        type="text"
                                        value={addressForm.state}
                                        onChange={e => setAddressForm({ ...addressForm, state: e.target.value })}
                                        placeholder="State"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Pincode</label>
                                    <input
                                        required
                                        type="text"
                                        value={addressForm.pincode}
                                        onChange={e => setAddressForm({ ...addressForm, pincode: e.target.value })}
                                        placeholder="6-digit pincode"
                                        maxLength={6}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Address Type</label>
                                    <select
                                        value={addressForm.type}
                                        onChange={e => setAddressForm({ ...addressForm, type: e.target.value as any })}
                                    >
                                        <option value="home">Home</option>
                                        <option value="work">Work</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                <div className="form-actions">
                                    <button type="button" className="cancel-btn" onClick={() => setModalView('list')}>Back to List</button>
                                    <button type="submit" className="submit-btn">{editingAddress ? 'Update Address' : 'Save Address'}</button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}


            <style jsx>{`
                :root {
                    --primary: #1A1A1A;
                    --secondary: #E85D04;
                    --muted: #6B6B6B;
                    --bg: #FAFAFA;
                    --surface: #FFFFFF;
                    --border: #E5E5E5;
                }
                .page { background: var(--bg); min-height: 100vh; color: var(--primary); }
                .mobile-only { display: flex; }
                .desktop-only { display: none; }
                @media (min-width: 768px) {
                    .mobile-only { display: none !important; }
                    .desktop-only { display: flex; }
                }



                /* Page Header */
                main { padding-top: 70px; }
                @media (min-width: 768px) { main { padding-top: 80px; } }
                @media (min-width: 1200px) { main { padding-top: 90px; } }

                .page-header { padding: 20px 24px 16px; }
                @media (min-width: 768px) { .page-header { padding: 28px 48px 20px; } }
                @media (min-width: 1200px) { .page-header { padding: 36px 80px 24px; } }
                .page-header h1 { font-size: 26px; font-weight: 700; margin: 0; }
                @media (min-width: 768px) { .page-header h1 { font-size: 30px; } }

                /* Profile Content */
                .profile-content { padding: 0 24px 40px; }
                @media (min-width: 768px) { .profile-content { padding: 0 48px 56px; } }
                @media (min-width: 1200px) { .profile-content { padding: 0 80px 70px; } }
                .profile-grid { display: grid; gap: 10px; }
                @media (min-width: 768px) { .profile-grid { grid-template-columns: 300px 1fr; gap: 36px; align-items: start; } }
                @media (min-width: 1200px) { .profile-grid { grid-template-columns: 300px 1fr 1fr; gap: 40px; } }

                /* Profile Card */
                .profile-card { background: var(--surface); border-radius: 16px; border: 1px solid var(--border); padding: 28px 24px; text-align: center; height: fit-content; }
                @media (min-width: 1200px) { .profile-card { grid-row: span 2; } }
                .avatar-container { position: relative; width: 90px; height: 90px; margin: 0 auto 16px; }
                .avatar { width: 90px; height: 90px; border-radius: 50%; background: rgba(232, 93, 4, 0.15); display: flex; align-items: center; justify-content: center; overflow: hidden; }
                .avatar img { width: 100%; height: 100%; object-fit: cover; }
                .avatar span { font-size: 32px; font-weight: 700; color: var(--secondary); text-transform: uppercase; }
                .provider-badge { position: absolute; bottom: 0; right: 0; width: 26px; height: 26px; background: var(--secondary); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 11px; font-weight: 700; }
                .name-row { display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 4px; }
                .name-row h2 { font-size: 20px; font-weight: 700; margin: 0; }
                .edit-btn { width: 26px; height: 26px; background: var(--border); border: none; border-radius: 6px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--muted); transition: all 0.2s; }
                .edit-btn:hover { background: var(--primary); color: white; }
                .email { font-size: 14px; color: var(--muted); margin: 0 0 10px; }
                .provider-label { display: inline-block; padding: 6px 14px; background: rgba(232, 93, 4, 0.1); color: var(--secondary); font-size: 12px; font-weight: 600; border-radius: 18px; }

                /* Menu Section */
                .menu-section { display: flex; flex-direction: column; gap: 20px; }
                @media (min-width: 1200px) { .menu-section { display: contents; } }
                .menu-card { background: var(--surface); border-radius: 14px; border: 1px solid var(--border); padding: 20px; }
                .menu-card h3 { font-size: 13px; font-weight: 700; margin: 0 0 16px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.5px; }
                .menu-tile { display: flex !important; flex-direction: row !important; align-items: center !important; gap: 14px; padding: 14px 0; text-decoration: none; color: var(--primary); transition: opacity 0.2s; border: none; background: none; width: 100%; cursor: pointer; text-align: left; border-bottom: 1px solid var(--border); }
                .menu-tile:last-child { border-bottom: none; padding-bottom: 4px; }
                .menu-tile:first-of-type { padding-top: 4px; }
                .menu-tile:hover { opacity: 0.7; }
                .menu-icon { width: 44px; height: 44px; background: rgba(232, 93, 4, 0.1); border-radius: 12px; display: flex; align-items: center; justify-content: center; color: var(--secondary); flex-shrink: 0; }
                .menu-icon.logout { background: rgba(220, 38, 38, 0.1); color: #DC2626; }
                .menu-text { flex: 1; min-width: 0; }
                .menu-title { display: block; font-size: 14px; font-weight: 600; }
                .menu-subtitle { display: block; font-size: 11px; color: var(--muted); margin-top: 1px; }
                .menu-tile > svg:last-child { flex-shrink: 0; }
                .menu-tile.disabled { opacity: 0.5; cursor: not-allowed; }
                .menu-tile.disabled:hover { opacity: 0.5; }

                /* Footer */
                .footer { background: #111; color: white; padding: 48px 24px 40px; }
                @media (min-width: 768px) { .footer { padding: 64px 48px 40px; } }
                @media (min-width: 1200px) { .footer { padding: 80px 80px 48px; } }
                .footer-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-bottom: 32px; }
                .footer-brand { grid-column: 1 / -1; margin-bottom: 16px; }
                @media (min-width: 768px) { .footer-grid { grid-template-columns: 2fr 1fr 1fr 1fr; gap: 48px; } .footer-brand { grid-column: auto; margin-bottom: 0; } }
                .footer-brand h2 { font-size: 24px; font-weight: 700; letter-spacing: 3px; margin: 0 0 6px; }
                .footer-brand > p:first-of-type { font-size: 11px; color: var(--secondary); margin: 0 0 12px; }
                .footer-desc { font-size: 13px; color: rgba(255,255,255,0.6); line-height: 1.5; max-width: 280px; }
                .footer-col h4 { font-size: 13px; font-weight: 600; margin: 0 0 16px; }
                .footer-col a { display: block; font-size: 13px; color: rgba(255,255,255,0.6); text-decoration: none; margin-bottom: 10px; transition: color 0.2s; }
                .footer-col a:hover { color: white; }
                .footer-bottom { padding-top: 24px; border-top: 1px solid rgba(255,255,255,0.1); display: flex; flex-direction: column; gap: 12px; align-items: center; }
                @media (min-width: 768px) { .footer-bottom { flex-direction: row; justify-content: space-between; } }
                .footer-bottom p { font-size: 12px; opacity: 0.5; margin: 0; }
                .footer-links { display: flex; gap: 20px; }
                .footer-links a { font-size: 12px; color: rgba(255,255,255,0.5); text-decoration: none; }
                .footer-links a:hover { color: white; }

                /* Orders Section */
                .orders-section { padding: 0 24px 40px; }
                @media (min-width: 768px) { .orders-section { padding: 0 48px 56px; } }
                @media (min-width: 1200px) { .orders-section { padding: 0 80px 70px; } }
                .section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
                .section-header h2 { font-size: 22px; font-weight: 700; margin: 0; }
                .order-count { font-size: 13px; color: var(--muted); background: var(--bg); padding: 6px 12px; border-radius: 20px; }
                
                .no-orders { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 48px 24px; text-align: center; }
                .no-orders-icon { width: 80px; height: 80px; margin: 0 auto 16px; background: var(--bg); border-radius: 50%; display: flex; align-items: center; justify-content: center; }
                .no-orders p { color: var(--muted); margin: 0 0 20px; }
                .shop-now-btn { display: inline-flex; align-items: center; gap: 8px; padding: 12px 24px; background: var(--secondary); color: white; text-decoration: none; border-radius: 10px; font-size: 14px; font-weight: 600; transition: background 0.2s; }
                .shop-now-btn:hover { background: var(--primary); }
                
                .orders-list { display: flex; flex-direction: column; gap: 16px; }
                .order-card { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; overflow: hidden; }
                .order-header { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; border-bottom: 1px solid var(--border); }
                .order-info { display: flex; flex-direction: column; gap: 2px; }
                .order-id { font-size: 14px; font-weight: 600; color: var(--primary); }
                .order-date { font-size: 12px; color: var(--muted); }
                
                .status-badge { padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; text-transform: capitalize; }
                .status-processing { background: #FEF3C7; color: #D97706; }
                .status-shipped { background: #DBEAFE; color: #2563EB; }
                .status-delivered { background: #D1FAE5; color: #059669; }
                .status-exchange { background: #FFEDD5; color: #EA580C; }
                .status-cancelled { background: #FEE2E2; color: #DC2626; }
                
                .order-items { padding: 16px 20px; }
                .order-item { display: flex; align-items: center; gap: 12px; padding: 8px 0; }
                .order-item:not(:last-child) { border-bottom: 1px solid var(--border); }
                .order-item-image { position: relative; width: 50px; height: 60px; border-radius: 8px; overflow: hidden; flex-shrink: 0; }
                .order-item-details { flex: 1; min-width: 0; }
                .order-item-name { display: block; font-size: 14px; font-weight: 500; color: var(--primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                .order-item-qty { display: block; font-size: 12px; color: var(--muted); margin-top: 2px; }
                .order-item-price { font-size: 14px; font-weight: 600; color: var(--primary); flex-shrink: 0; }
                .more-items { font-size: 12px; color: var(--muted); margin: 8px 0 0; }
                
                .order-footer { padding: 16px 20px; background: var(--bg); border-top: 1px solid var(--border); }
                .order-total { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
                .order-total span:first-child { font-size: 13px; color: var(--muted); }
                .order-total .total-amount { font-size: 18px; font-weight: 700; color: var(--secondary); }
                .status-message { font-size: 13px; color: var(--muted); margin: 0; line-height: 1.4; padding-left: 4px; border-left: 3px solid var(--secondary); }

                .address-item { position: relative; border: 1px solid #404040; border-radius: 12px; padding: 16px; cursor: pointer; transition: all 0.2s; display: flex; flex-direction: column; gap: 8px; background: #FFFFFF; }
                .address-item:hover { border-color: #E85D04; background: #FFF7ED; }
                .address-item-content { display: flex; flex-direction: column; gap: 8px; padding-right: 32px; }
                .address-type-badge { align-self: flex-start; font-size: 10px; font-weight: 700; text-transform: uppercase; color: #1A1A1A; background: #FFE8D6; padding: 4px 8px; border-radius: 4px; letter-spacing: 0.5px; }
                .address-item h4 { font-size: 16px; font-weight: 600; margin: 4px 0 0; color: #1A1A1A; }
                .address-item p { font-size: 14px; color: #666; margin: 0; line-height: 1.5; }
                
                .delete-btn { position: absolute; top: 16px; right: 16px; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border: 1px solid transparent; background: transparent; color: #BCBCBC; cursor: pointer; border-radius: 50%; transition: all 0.2s; }
                .delete-btn:hover { background: #FEE2E2; color: #DC2626; border-color: #FEE2E2; }
                
                .add-new-btn-container { margin-top: 24px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; background: transparent; border: none; cursor: pointer; width: 100%; padding: 20px 0; }
                .add-new-btn-container:hover .add-icon-circle { transform: scale(1.05); box-shadow: 0 4px 12px rgba(232, 93, 4, 0.15); }
                .add-icon-circle { width: 48px; height: 48px; background: #FFE8D6; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #1A1A1A; transition: all 0.2s; }
                .add-new-btn-container span { font-size: 14px; font-weight: 600; color: #1A1A1A; }
                
                .limit-reached { padding: 16px; text-align: center; background: #F9F9F9; border-radius: 12px; border: 1px dashed #E5E5E5; margin-top: 16px; }
                .limit-reached p { font-size: 13px; color: #888; margin: 0; font-weight: 500; }
                
                .modal-body.list-view { display: flex; flex-direction: column; gap: 8px; padding-bottom: 20px; }
                
                /* Addresses Section Removed */
                



                
                /* Modal Styles */
                .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; backdrop-filter: blur(4px); }
                .modal-container { background: white; border-radius: 20px; width: 100%; max-width: 500px; max-height: 90vh; display: flex; flex-direction: column; box-shadow: 0 20px 40px rgba(0,0,0,0.2); }
                .modal-header { padding: 24px 24px 16px; border-bottom: none; display: flex; align-items: center; justify-content: space-between; }
                .modal-header h3 { margin: 0; font-size: 20px; font-weight: 700; color: #1A1A1A; }
                .close-btn { background: none; border: none; cursor: pointer; color: #1A1A1A; padding: 8px; border-radius: 50%; display: flex; transition: background 0.2s; }
                .close-btn:hover { background: #F5F5F5; }
                
                .modal-body { padding: 24px; overflow-y: auto; display: grid; gap: 16px; grid-template-columns: 1fr 1fr; }
                .form-group { display: flex; flex-direction: column; gap: 6px; }
                .form-group.full { grid-column: 1 / -1; }
                .form-group label { font-size: 13px; font-weight: 600; color: #1A1A1A; }
                .form-group input, .form-group select { padding: 11px 14px; border-radius: 8px; border: 1px solid #404040; font-size: 14px; outline: none; transition: border-color 0.2s; background: #FFFFFF; }
                .form-group input:focus, .form-group select:focus { border-color: #E85D04; box-shadow: 0 0 0 3px rgba(232, 93, 4, 0.1); }
                
                .form-actions { grid-column: 1 / -1; display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 24px; padding-top: 20px; border-top: 1px solid var(--border); }
                .submit-btn, .cancel-btn { padding: 14px; border-radius: 12px; font-weight: 600; font-size: 15px; cursor: pointer; border: none; transition: all 0.2s; display: flex; align-items: center; justify-content: center; }
                .submit-btn { background: #E85D04; color: white; box-shadow: 0 4px 12px rgba(232, 93, 4, 0.2); }
                .submit-btn:hover { background: #1A1A1A; transform: translateY(-1px); }
                .cancel-btn { background: #F5F5F5; color: #1A1A1A; }
                .cancel-btn:hover { background: #E5E5E5; }
            `}</style>
        </div>
    );
}

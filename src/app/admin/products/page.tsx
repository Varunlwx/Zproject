'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/contexts/admin-auth-context';
import { ProductService, Product } from '@/services/product-service';
import { categories } from '@/data/products';

type ProductFormData = Omit<Product, 'id'>;

const emptyProduct: ProductFormData = {
    name: '',
    price: '',
    originalPrice: '',
    tag: '',
    category: '',
    subcategory: '',
    image: '',
    images: [],
    rating: 0,
    reviewCount: 0,
    description: '',
    sizes: []
};

export default function AdminProductsPage() {
    const router = useRouter();
    const { isAdminAuthenticated, isLoading: authLoading, adminLogout } = useAdminAuth();

    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [formData, setFormData] = useState<ProductFormData>(emptyProduct);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Redirect if not authenticated
    useEffect(() => {
        if (!authLoading && !isAdminAuthenticated) {
            router.push('/admin');
        }
    }, [isAdminAuthenticated, authLoading, router]);

    // Subscribe to products
    useEffect(() => {
        const unsubscribe = ProductService.subscribeToProducts((fetchedProducts) => {
            setProducts(fetchedProducts);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleLogout = () => {
        adminLogout();
        router.push('/admin');
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.subcategory.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const openAddForm = () => {
        setEditingProduct(null);
        setFormData(emptyProduct);
        setShowForm(true);
        setError('');
    };

    const openEditForm = (product: Product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            price: product.price,
            originalPrice: product.originalPrice,
            tag: product.tag,
            category: product.category,
            subcategory: product.subcategory,
            image: product.image,
            images: product.images,
            rating: product.rating,
            reviewCount: product.reviewCount,
            description: product.description,
            sizes: product.sizes
        });
        setShowForm(true);
        setError('');
    };

    const closeForm = () => {
        setShowForm(false);
        setEditingProduct(null);
        setFormData(emptyProduct);
        setError('');
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!formData.name.trim() || !formData.price.trim() || !formData.category || !formData.subcategory) {
            setError('Please fill in all required fields');
            return;
        }

        setIsSubmitting(true);
        try {
            if (editingProduct) {
                await ProductService.updateProduct(editingProduct.id, formData);
                setSuccess(`Product "${formData.name}" updated successfully`);
            } else {
                await ProductService.addProduct(formData);
                setSuccess(`Product "${formData.name}" added successfully`);
            }
            closeForm();
        } catch (err) {
            setError(`Failed to ${editingProduct ? 'update' : 'add'} product. Please try again.`);
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await ProductService.deleteProduct(id);
            setSuccess('Product deleted successfully');
            setDeleteConfirm(null);
        } catch (err) {
            setError('Failed to delete product');
            console.error(err);
        }
    };

    const getSubcategories = () => {
        const cat = categories.find(c => c.name === formData.category);
        return cat?.subcategories || [];
    };

    const handleSizesChange = (sizeStr: string) => {
        const sizes = sizeStr.split(',').map(s => s.trim()).filter(Boolean);
        setFormData(prev => ({ ...prev, sizes }));
    };

    const handleImagesChange = (imageStr: string) => {
        const images = imageStr.split(',').map(s => s.trim()).filter(Boolean);
        setFormData(prev => ({ ...prev, images, image: images[0] || '' }));
    };

    if (authLoading || !isAdminAuthenticated) {
        return (
            <div className="admin-loading">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="products-container">
            {/* Header */}
            <header className="products-header">
                <div className="header-left">
                    <button className="back-btn" onClick={() => router.push('/admin/dashboard')}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M19 12H5M12 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <div className="header-brand">
                        <h1>ZCLOTHS</h1>
                        <span>PRODUCTS</span>
                    </div>
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

            {/* Messages */}
            {error && <div className="message error">{error}</div>}
            {success && <div className="message success">{success}</div>}

            {/* Toolbar */}
            <div className="toolbar">
                <div className="search-box">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <button className="add-btn" onClick={openAddForm}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Add Product
                </button>
            </div>

            {/* Products Table */}
            <div className="table-container">
                {loading ? (
                    <div className="table-loading">
                        <div className="spinner"></div>
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="empty-state">
                        <p>No products found</p>
                    </div>
                ) : (
                    <table className="products-table">
                        <thead>
                            <tr>
                                <th>Image</th>
                                <th>Name</th>
                                <th>Price</th>
                                <th>Category</th>
                                <th>Tag</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.map(product => (
                                <tr key={product.id}>
                                    <td>
                                        <div className="product-img">
                                            <img src={product.image} alt={product.name} />
                                        </div>
                                    </td>
                                    <td className="product-name">{product.name}</td>
                                    <td>
                                        <span className="price">{product.price}</span>
                                        {product.originalPrice && (
                                            <span className="original-price">{product.originalPrice}</span>
                                        )}
                                    </td>
                                    <td>{product.category} / {product.subcategory}</td>
                                    <td>{product.tag && <span className="tag">{product.tag}</span>}</td>
                                    <td>
                                        <div className="actions">
                                            <button className="edit-btn" onClick={() => openEditForm(product)}>
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                                </svg>
                                            </button>
                                            <button className="delete-btn" onClick={() => setDeleteConfirm(product.id)}>
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <polyline points="3,6 5,6 21,6" />
                                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                                </svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {deleteConfirm && (
                <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
                    <div className="modal delete-modal" onClick={e => e.stopPropagation()}>
                        <h3>Delete Product?</h3>
                        <p>This action cannot be undone.</p>
                        <div className="modal-actions">
                            <button className="cancel-btn" onClick={() => setDeleteConfirm(null)}>Cancel</button>
                            <button className="confirm-delete-btn" onClick={() => handleDelete(deleteConfirm)}>Delete</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add/Edit Form Modal */}
            {showForm && (
                <div className="modal-overlay" onClick={closeForm}>
                    <div className="modal form-modal" onClick={e => e.stopPropagation()}>
                        <h3>{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
                        <form onSubmit={handleSubmit}>
                            <div className="form-grid">
                                <div className="form-group full">
                                    <label>Name *</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                        placeholder="Product name"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Price *</label>
                                    <input
                                        type="text"
                                        value={formData.price}
                                        onChange={e => setFormData(prev => ({ ...prev, price: e.target.value }))}
                                        placeholder="₹1,999"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Original Price</label>
                                    <input
                                        type="text"
                                        value={formData.originalPrice}
                                        onChange={e => setFormData(prev => ({ ...prev, originalPrice: e.target.value }))}
                                        placeholder="₹2,499 (optional)"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Category *</label>
                                    <select
                                        value={formData.category}
                                        onChange={e => setFormData(prev => ({ ...prev, category: e.target.value, subcategory: '' }))}
                                    >
                                        <option value="">Select category</option>
                                        {categories.map(cat => (
                                            <option key={cat.slug} value={cat.name}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Subcategory *</label>
                                    <select
                                        value={formData.subcategory}
                                        onChange={e => setFormData(prev => ({ ...prev, subcategory: e.target.value }))}
                                        disabled={!formData.category}
                                    >
                                        <option value="">Select subcategory</option>
                                        {getSubcategories().map(sub => (
                                            <option key={sub.slug} value={sub.name}>{sub.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Tag</label>
                                    <select
                                        value={formData.tag}
                                        onChange={e => setFormData(prev => ({ ...prev, tag: e.target.value }))}
                                    >
                                        <option value="">No tag</option>
                                        <option value="New">New</option>
                                        <option value="Bestseller">Bestseller</option>
                                        <option value="Sale">Sale</option>
                                        <option value="Limited">Limited</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Sizes (comma separated)</label>
                                    <input
                                        type="text"
                                        value={formData.sizes.join(', ')}
                                        onChange={e => handleSizesChange(e.target.value)}
                                        placeholder="S, M, L, XL"
                                    />
                                </div>

                                <div className="form-group full">
                                    <label>Image URLs (comma separated)</label>
                                    <input
                                        type="text"
                                        value={formData.images.join(', ')}
                                        onChange={e => handleImagesChange(e.target.value)}
                                        placeholder="/images/products/example.jpg"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Rating (0-5)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="5"
                                        step="0.1"
                                        value={formData.rating}
                                        onChange={e => setFormData(prev => ({ ...prev, rating: parseFloat(e.target.value) || 0 }))}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Review Count</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={formData.reviewCount}
                                        onChange={e => setFormData(prev => ({ ...prev, reviewCount: parseInt(e.target.value) || 0 }))}
                                    />
                                </div>

                                <div className="form-group full">
                                    <label>Description</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                        placeholder="Product description..."
                                        rows={3}
                                    />
                                </div>
                            </div>

                            <div className="form-actions">
                                <button type="button" className="cancel-btn" onClick={closeForm}>Cancel</button>
                                <button type="submit" className="submit-btn" disabled={isSubmitting}>
                                    {isSubmitting ? <span className="spinner-small"></span> : (editingProduct ? 'Update' : 'Add Product')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style jsx>{`
                .admin-loading {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
                }

                .products-container {
                    min-height: 100vh;
                    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
                    color: white;
                }

                .products-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 20px 40px;
                    background: rgba(255, 255, 255, 0.05);
                    backdrop-filter: blur(10px);
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                }

                .header-left {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                }

                .back-btn {
                    padding: 10px;
                    background: rgba(255, 255, 255, 0.1);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    border-radius: 10px;
                    color: white;
                    cursor: pointer;
                    transition: all 0.3s;
                }

                .back-btn:hover {
                    background: rgba(255, 255, 255, 0.2);
                }

                .header-brand {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .header-brand h1 {
                    font-size: 24px;
                    font-weight: 700;
                    letter-spacing: 3px;
                    margin: 0;
                }

                .header-brand span {
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
                    cursor: pointer;
                    transition: all 0.3s;
                }

                .logout-btn:hover {
                    background: rgba(239, 68, 68, 0.2);
                    border-color: rgba(239, 68, 68, 0.4);
                }

                .message {
                    margin: 20px 40px 0;
                    padding: 12px 16px;
                    border-radius: 10px;
                    font-size: 14px;
                }

                .message.error {
                    background: rgba(239, 68, 68, 0.2);
                    border: 1px solid rgba(239, 68, 68, 0.3);
                    color: #fca5a5;
                }

                .message.success {
                    background: rgba(34, 197, 94, 0.2);
                    border: 1px solid rgba(34, 197, 94, 0.3);
                    color: #86efac;
                }

                .toolbar {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 20px 40px;
                    gap: 20px;
                }

                .search-box {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    flex: 1;
                    max-width: 400px;
                    padding: 12px 16px;
                    background: rgba(255, 255, 255, 0.08);
                    border: 1px solid rgba(255, 255, 255, 0.15);
                    border-radius: 12px;
                }

                .search-box svg {
                    color: rgba(255, 255, 255, 0.5);
                }

                .search-box input {
                    flex: 1;
                    background: none;
                    border: none;
                    color: white;
                    font-size: 14px;
                    outline: none;
                }

                .search-box input::placeholder {
                    color: rgba(255, 255, 255, 0.4);
                }

                .add-btn {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 12px 24px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    border: none;
                    border-radius: 12px;
                    color: white;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s;
                }

                .add-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 10px 25px -5px rgba(102, 126, 234, 0.4);
                }

                .table-container {
                    margin: 0 40px 40px;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 16px;
                    overflow: hidden;
                }

                .table-loading, .empty-state {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 60px;
                    color: rgba(255, 255, 255, 0.5);
                }

                .products-table {
                    width: 100%;
                    border-collapse: collapse;
                }

                .products-table th {
                    text-align: left;
                    padding: 16px 20px;
                    background: rgba(255, 255, 255, 0.05);
                    font-size: 12px;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    color: rgba(255, 255, 255, 0.6);
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                }

                .products-table td {
                    padding: 16px 20px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                    vertical-align: middle;
                }

                .products-table tr:hover {
                    background: rgba(255, 255, 255, 0.03);
                }

                .product-img {
                    width: 50px;
                    height: 50px;
                    border-radius: 8px;
                    overflow: hidden;
                    background: rgba(255, 255, 255, 0.1);
                }

                .product-img img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .product-name {
                    font-weight: 500;
                }

                .price {
                    font-weight: 600;
                    color: #22c55e;
                }

                .original-price {
                    margin-left: 8px;
                    text-decoration: line-through;
                    color: rgba(255, 255, 255, 0.4);
                    font-size: 12px;
                }

                .tag {
                    display: inline-block;
                    padding: 4px 10px;
                    background: rgba(102, 126, 234, 0.2);
                    color: #a5b4fc;
                    border-radius: 20px;
                    font-size: 11px;
                    font-weight: 600;
                }

                .actions {
                    display: flex;
                    gap: 8px;
                }

                .edit-btn, .delete-btn {
                    padding: 8px;
                    border-radius: 8px;
                    border: none;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .edit-btn {
                    background: rgba(59, 130, 246, 0.2);
                    color: #93c5fd;
                }

                .edit-btn:hover {
                    background: rgba(59, 130, 246, 0.4);
                }

                .delete-btn {
                    background: rgba(239, 68, 68, 0.2);
                    color: #fca5a5;
                }

                .delete-btn:hover {
                    background: rgba(239, 68, 68, 0.4);
                }

                .modal-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.7);
                    backdrop-filter: blur(4px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    padding: 20px;
                }

                .modal {
                    background: #1e293b;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 16px;
                    padding: 24px;
                    max-width: 600px;
                    width: 100%;
                    max-height: 90vh;
                    overflow-y: auto;
                }

                .modal h3 {
                    margin: 0 0 20px;
                    font-size: 20px;
                    font-weight: 600;
                }

                .delete-modal {
                    max-width: 400px;
                    text-align: center;
                }

                .delete-modal p {
                    color: rgba(255, 255, 255, 0.6);
                    margin-bottom: 24px;
                }

                .modal-actions, .form-actions {
                    display: flex;
                    gap: 12px;
                    justify-content: flex-end;
                }

                .cancel-btn {
                    padding: 12px 24px;
                    background: rgba(255, 255, 255, 0.1);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    border-radius: 10px;
                    color: white;
                    font-size: 14px;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .cancel-btn:hover {
                    background: rgba(255, 255, 255, 0.2);
                }

                .confirm-delete-btn {
                    padding: 12px 24px;
                    background: #ef4444;
                    border: none;
                    border-radius: 10px;
                    color: white;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .confirm-delete-btn:hover {
                    background: #dc2626;
                }

                .form-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 16px;
                    margin-bottom: 24px;
                }

                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }

                .form-group.full {
                    grid-column: 1 / -1;
                }

                .form-group label {
                    font-size: 12px;
                    font-weight: 500;
                    color: rgba(255, 255, 255, 0.7);
                }

                .form-group input,
                .form-group select,
                .form-group textarea {
                    padding: 12px 14px;
                    background: rgba(255, 255, 255, 0.08);
                    border: 1px solid rgba(255, 255, 255, 0.15);
                    border-radius: 10px;
                    color: white;
                    font-size: 14px;
                    outline: none;
                    transition: all 0.2s;
                }

                .form-group input:focus,
                .form-group select:focus,
                .form-group textarea:focus {
                    border-color: #667eea;
                    background: rgba(255, 255, 255, 0.12);
                }

                .form-group select {
                    cursor: pointer;
                }

                .form-group select option {
                    background: #1e293b;
                }

                .form-group textarea {
                    resize: vertical;
                    min-height: 80px;
                }

                .submit-btn {
                    padding: 12px 24px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    border: none;
                    border-radius: 10px;
                    color: white;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s;
                    min-width: 120px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .submit-btn:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 10px 25px -5px rgba(102, 126, 234, 0.4);
                }

                .submit-btn:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
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
                    width: 18px;
                    height: 18px;
                    border: 2px solid rgba(255, 255, 255, 0.3);
                    border-top-color: white;
                    border-radius: 50%;
                    animation: spin 0.8s linear infinite;
                }

                @keyframes spin {
                    to { transform: rotate(360deg); }
                }

                @media (max-width: 768px) {
                    .products-header, .toolbar, .table-container {
                        padding: 16px 20px;
                        margin: 0 20px;
                    }

                    .toolbar {
                        flex-direction: column;
                        align-items: stretch;
                    }

                    .search-box {
                        max-width: none;
                    }

                    .form-grid {
                        grid-template-columns: 1fr;
                    }

                    .form-group.full {
                        grid-column: 1;
                    }
                }
            `}</style>
        </div>
    );
}

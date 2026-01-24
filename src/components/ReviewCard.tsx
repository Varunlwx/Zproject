import Image from 'next/image';

interface ReviewCardProps {
    productName: string;
    productImage: string;
    rating: number;
    comment: string;
    userName: string;
    verified: boolean;
    images?: string[];
}

export default function ReviewCard({
    productName,
    productImage,
    rating,
    comment,
    userName,
    verified,
    images = []
}: ReviewCardProps) {
    // Helper to ensure image paths are valid for next/image
    const formatSrc = (src: string) => {
        if (!src) return '';
        if (src.startsWith('http') || src.startsWith('/')) return src;
        // If it starts with 'assets/', it's likely an old path, remove it and ensure leading slash
        if (src.startsWith('assets/')) {
            return `/${src.replace('assets/', '')}`;
        }
        return `/${src}`;
    };

    const safeProductImage = formatSrc(productImage);
    const safeImages = images.map(formatSrc);

    return (
        <div className="review-card">
            <div className="review-header">
                <div className="user-info">
                    <div className="user-avatar">
                        {userName.charAt(0).toUpperCase()}
                    </div>
                    <div className="user-details">
                        <h4>{userName}</h4>
                        {verified && (
                            <span className="verified-badge">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="#D1FAE5" />
                                </svg>
                                Verified Purchase
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className="rating-stars">
                {[1, 2, 3, 4, 5].map(star => (
                    <span key={star} className={`star ${rating >= star ? 'filled' : ''}`}>
                        ★
                    </span>
                ))}
            </div>

            <p className="review-comment">{comment}</p>

            <div className="product-info">
                <div className="product-image">
                    <Image src={safeProductImage} alt={productName} fill style={{ objectFit: 'cover' }} />
                </div>
                <span className="product-name">{productName}</span>
            </div>

            {safeImages && safeImages.length > 0 && (
                <div className="review-images">
                    {safeImages.slice(0, 3).map((img, idx) => (
                        <div key={idx} className="review-image">
                            <Image src={img} alt={`Review ${idx + 1}`} fill style={{ objectFit: 'cover' }} />
                        </div>
                    ))}
                </div>
            )}

            <style jsx>{`
                .review-card {
                    min-width: 320px;
                    max-width: 320px;
                    background: white;
                    border: 1px solid #E5E5E5;
                    border-radius: 16px;
                    padding: 20px;
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                    transition: all 0.3s ease;
                }

                .review-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
                    border-color: #E85D04;
                }

                .review-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }

                .user-info {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .user-avatar {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #E85D04 0%, #F97316 100%);
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 600;
                    font-size: 16px;
                }

                .user-details {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .user-details h4 {
                    margin: 0;
                    font-size: 14px;
                    font-weight: 600;
                    color: #1A1A1A;
                }

                .verified-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                    font-size: 11px;
                    color: #059669;
                    font-weight: 500;
                }

                .rating-stars {
                    display: flex;
                    gap: 4px;
                }

                .star {
                    font-size: 18px;
                    color: #E5E5E5;
                }

                .star.filled {
                    color: #F59E0B;
                }

                .review-comment {
                    margin: 0;
                    font-size: 14px;
                    line-height: 1.6;
                    color: #4B5563;
                    display: -webkit-box;
                    -webkit-line-clamp: 3;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }

                .product-info {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding-top: 12px;
                    border-top: 1px solid #F3F4F6;
                }

                .product-image {
                    position: relative;
                    width: 40px;
                    height: 50px;
                    border-radius: 8px;
                    overflow: hidden;
                    flex-shrink: 0;
                }

                .product-name {
                    font-size: 13px;
                    color: #6B7280;
                    font-weight: 500;
                }

                .review-images {
                    display: flex;
                    gap: 8px;
                }

                .review-image {
                    position: relative;
                    width: 60px;
                    height: 60px;
                    border-radius: 8px;
                    overflow: hidden;
                }
            `}</style>
        </div>
    );
}

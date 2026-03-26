import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductById, getProductReviews, addReview, getProductsByCategory, addToWishlist, removeFromWishlist, isInWishlist } from '../services/firebase';
import { Product, Review } from '../types';
import { Button } from '../components/Button';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Star, Truck, ShieldCheck, Heart, Share2, ChevronLeft, ChevronRight, Send } from 'lucide-react';

export const ProductDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { user } = useAuth();

    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedSize, setSelectedSize] = useState<string>('');
    const [adding, setAdding] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [inWishlist, setInWishlist] = useState(false);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewComment, setReviewComment] = useState('');
    const [submittingReview, setSubmittingReview] = useState(false);
    const [touchStart, setTouchStart] = useState(0);

    useEffect(() => {
        const fetchProduct = async () => {
            if (!id) return;
            setLoading(true);
            const p = await getProductById(id);
            if (p) {
                setProduct(p);
                if (p.sizes && p.sizes.length > 0) setSelectedSize(p.sizes[0]);
                setCurrentImageIndex(0);

                // Fetch related — don't let sub-query failures block the page
                try {
                    const [revs, related] = await Promise.all([
                        getProductReviews(id).catch(() => []),
                        p.category ? getProductsByCategory(p.category, 5).catch(() => []) : Promise.resolve([]),
                    ]);
                    setReviews(revs);
                    setRelatedProducts(related.filter(r => r.id !== id).slice(0, 4));
                } catch { /* reviews/related are non-critical */ }

                if (user) {
                    try { const w = await isInWishlist(user.uid, id); setInWishlist(w); } catch {}
                }
            } else {
                navigate('/catalog');
            }
            setLoading(false);
        };
        fetchProduct();
    }, [id, navigate, user]);

    const handleAddToCart = () => {
        if (!product || !selectedSize) return;
        setAdding(true);
        addToCart(product, selectedSize);
        setTimeout(() => setAdding(false), 500);
    };

    const toggleWishlist = async () => {
        if (!user || !product) { navigate('/login'); return; }
        if (inWishlist) {
            await removeFromWishlist(user.uid, product.id);
            setInWishlist(false);
        } else {
            await addToWishlist(user.uid, product.id);
            setInWishlist(true);
        }
    };

    const handleShare = async () => {
        if (navigator.share && product) {
            await navigator.share({ title: product.name, text: product.description, url: window.location.href });
        }
    };

    const handleSubmitReview = async () => {
        if (!user || !product || !reviewComment.trim()) return;
        setSubmittingReview(true);
        await addReview(product.id, {
            userId: user.uid,
            userName: user.displayName || 'Anonymous',
            rating: reviewRating,
            comment: reviewComment,
        });
        const updatedReviews = await getProductReviews(product.id);
        setReviews(updatedReviews);
        setShowReviewForm(false);
        setReviewComment('');
        setReviewRating(5);
        setSubmittingReview(false);
    };

    const images = product ? (product.images && product.images.length > 0 ? product.images : [product.image]) : [];
    const discount = product?.originalPrice && product.originalPrice > product.price
        ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-pudava-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
    );
    if (!product) return null;

    return (
        <div className="min-h-screen pb-20 md:pb-0 bg-pudava-bg page-enter">
            <div className="md:grid md:grid-cols-2 min-h-screen">
                {/* Image Section with carousel */}
                <div className="relative h-[45vh] md:h-screen md:sticky md:top-0 w-full overflow-hidden bg-gray-900">
                    <button
                        onClick={() => navigate(-1)}
                        className="absolute top-3 left-3 md:top-4 md:left-4 z-20 w-10 h-10 md:w-11 md:h-11 flex items-center justify-center bg-black/50 backdrop-blur-md rounded-full text-white hover:bg-black/70 transition-colors btn-press"
                    >
                        <ArrowLeft size={18} />
                    </button>

                    <div className="absolute top-3 right-3 md:top-4 md:right-4 z-20 flex gap-2">
                        <button onClick={toggleWishlist} className={`w-10 h-10 md:w-11 md:h-11 flex items-center justify-center backdrop-blur-md rounded-full transition-colors btn-press ${inWishlist ? 'bg-pudava-primary text-white' : 'bg-black/50 text-white hover:bg-black/70'}`}>
                            <Heart size={18} fill={inWishlist ? 'currentColor' : 'none'} />
                        </button>
                        <button onClick={handleShare} className="w-10 h-10 md:w-11 md:h-11 flex items-center justify-center bg-black/50 backdrop-blur-md rounded-full text-white hover:bg-black/70 transition-colors btn-press">
                            <Share2 size={18} />
                        </button>
                    </div>

                    {/* Image */}
                    <img
                        src={images[currentImageIndex]}
                        alt={product.name}
                        className="w-full h-full object-cover animate-fade-in-blur"
                        onTouchStart={e => setTouchStart(e.touches[0].clientX)}
                        onTouchEnd={e => {
                            const diff = touchStart - e.changedTouches[0].clientX;
                            if (Math.abs(diff) > 50) {
                                if (diff > 0 && currentImageIndex < images.length - 1) setCurrentImageIndex(i => i + 1);
                                if (diff < 0 && currentImageIndex > 0) setCurrentImageIndex(i => i - 1);
                            }
                        }}
                    />

                    {/* Desktop arrows */}
                    {images.length > 1 && (
                        <>
                            <button onClick={() => setCurrentImageIndex(i => Math.max(0, i - 1))} className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/40 backdrop-blur-sm rounded-full text-white hover:bg-black/60">
                                <ChevronLeft size={20} />
                            </button>
                            <button onClick={() => setCurrentImageIndex(i => Math.min(images.length - 1, i + 1))} className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/40 backdrop-blur-sm rounded-full text-white hover:bg-black/60">
                                <ChevronRight size={20} />
                            </button>
                        </>
                    )}

                    {/* Dots */}
                    {images.length > 1 && (
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                            {images.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrentImageIndex(i)}
                                    className={`rounded-full transition-all duration-300 ${i === currentImageIndex ? 'w-6 h-2 bg-white' : 'w-2 h-2 bg-white/40'}`}
                                />
                            ))}
                        </div>
                    )}

                    {/* Badges */}
                    <div className="absolute bottom-4 left-4 md:bottom-8 md:left-8 flex gap-2">
                        {discount > 0 && <span className="bg-green-500/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{discount}% OFF</span>}
                        {product.isBestSeller && <span className="bg-pudava-primary/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">Best Seller</span>}
                        {product.isNewArrival && <span className="bg-pudava-secondary/90 text-black text-[10px] font-bold px-2 py-0.5 rounded-full">NEW</span>}
                    </div>

                    <div className="absolute inset-0 bg-gradient-to-t from-pudava-bg via-transparent to-transparent md:hidden opacity-90"></div>
                </div>

                {/* Details Section */}
                <div className="relative px-4 py-4 md:p-8 flex flex-col -mt-12 md:mt-0 z-10 bg-pudava-bg md:bg-transparent rounded-t-[2rem] md:rounded-none md:overflow-y-auto md:max-h-screen">
                    <div className="max-w-md mx-auto w-full space-y-3 md:space-y-4 animate-slide-up">
                        <div>
                            <div className="flex justify-between items-start mb-0.5 md:mb-1">
                                <span className="text-pudava-secondary text-xs md:text-sm font-bold tracking-[0.1em] md:tracking-[0.15em] uppercase">{product.category}</span>
                                {product.stock !== undefined && product.stock <= 5 && product.stock > 0 && (
                                    <span className="text-orange-400 text-xs font-medium">Only {product.stock} left</span>
                                )}
                            </div>
                            <h1 className="text-2xl md:text-4xl font-serif leading-tight mb-1 md:mb-2">{product.name}</h1>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <p className="text-xl md:text-2xl font-light">₹{product.price.toLocaleString()}</p>
                                    {product.originalPrice && product.originalPrice > product.price && (
                                        <p className="text-sm text-gray-500 line-through">₹{product.originalPrice.toLocaleString()}</p>
                                    )}
                                </div>
                                {product.averageRating > 0 && (
                                    <div className="flex items-center gap-1 text-yellow-500 text-xs">
                                        <Star size={12} fill="currentColor" />
                                        <span>{product.averageRating.toFixed(1)}</span>
                                        <span className="text-gray-500">({product.reviewCount})</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="prose prose-invert prose-sm text-gray-400 leading-relaxed text-xs md:text-sm">
                            <p>{product.description}</p>
                        </div>

                        {/* Size Selector */}
                        {product.sizes && product.sizes.length > 0 && (
                            <div>
                                <span className="text-xs md:text-sm text-gray-500 uppercase tracking-widest block mb-2 font-bold">Select Size</span>
                                <div className="flex gap-2 flex-wrap">
                                    {product.sizes.map(size => (
                                        <button
                                            key={size}
                                            onClick={() => setSelectedSize(size)}
                                            className={`h-10 md:h-11 min-w-[40px] md:min-w-[44px] px-3 md:px-4 rounded-lg border flex items-center justify-center text-xs md:text-sm font-medium transition-all duration-300 btn-press ${selectedSize === size
                                                    ? 'bg-white text-black border-white shadow-lg scale-105'
                                                    : 'border-white/10 text-gray-400 hover:border-white/30 hover:text-white bg-white/5'
                                                }`}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Tags */}
                        {product.tags && product.tags.length > 0 && (
                            <div className="flex gap-2 flex-wrap">
                                {product.tags.map(tag => (
                                    <span key={tag} className="text-xs text-gray-400 bg-white/5 border border-white/5 px-2.5 py-1 rounded-full">{tag}</span>
                                ))}
                            </div>
                        )}

                        {/* Actions */}
                        <div className="pt-1 md:pt-2 space-y-2 md:space-y-3">
                            {product.stock !== undefined && product.stock <= 0 ? (
                                <Button fullWidth variant="secondary" disabled className="h-11 md:h-12 text-xs md:text-sm opacity-50 cursor-not-allowed">
                                    Out of Stock
                                </Button>
                            ) : (
                                <Button fullWidth variant="gold" onClick={handleAddToCart} className="h-11 md:h-12 text-xs md:text-sm">
                                    {adding ? '✓ Added to Bag' : 'Add to Cart'}
                                </Button>
                            )}

                            <div className="flex justify-center gap-6 pt-2">
                                <div className="flex items-center gap-2 text-xs text-gray-400 uppercase tracking-wide">
                                    <Truck size={14} />
                                    <span>Free Shipping</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-gray-400 uppercase tracking-wide">
                                    <ShieldCheck size={14} />
                                    <span>Secure Payment</span>
                                </div>
                            </div>
                        </div>

                        {/* Reviews Section */}
                        <div className="pt-4 md:pt-5 border-t border-white/5">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-base md:text-lg font-serif">Reviews ({reviews.length})</h3>
                                {user && (
                                    <button
                                        onClick={() => setShowReviewForm(!showReviewForm)}
                                        className="text-xs text-pudava-secondary hover:text-white transition-colors"
                                    >
                                        Write a Review
                                    </button>
                                )}
                            </div>

                            {/* Review Form */}
                            {showReviewForm && user && (
                                <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-4 space-y-3">
                                    <div>
                                        <span className="text-[10px] text-gray-400 block mb-1">Your Rating</span>
                                        <div className="flex gap-1">
                                            {[1, 2, 3, 4, 5].map(s => (
                                                <button key={s} onClick={() => setReviewRating(s)}>
                                                    <Star size={18} className={s <= reviewRating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'} />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <textarea
                                        value={reviewComment}
                                        onChange={e => setReviewComment(e.target.value)}
                                        placeholder="Share your experience..."
                                        className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-pudava-secondary resize-none h-20"
                                    />
                                    <button
                                        onClick={handleSubmitReview}
                                        disabled={submittingReview || !reviewComment.trim()}
                                        className="flex items-center gap-2 px-4 py-2 bg-pudava-primary text-white text-xs rounded-lg hover:bg-pudava-primary/80 disabled:opacity-50 transition-colors"
                                    >
                                        <Send size={12} />
                                        {submittingReview ? 'Posting...' : 'Post Review'}
                                    </button>
                                </div>
                            )}

                            {/* Review List */}
                            {reviews.length > 0 ? (
                                <div className="space-y-3">
                                    {reviews.slice(0, 5).map(review => (
                                        <div key={review.id} className="bg-white/[0.02] border border-white/5 rounded-xl p-3 md:p-4">
                                            <div className="flex justify-between items-start mb-1">
                                                <div>
                                                    <span className="text-xs font-medium text-white">{review.userName}</span>
                                                    <div className="flex gap-0.5 mt-0.5">
                                                        {[1, 2, 3, 4, 5].map(s => (
                                                            <Star key={s} size={9} className={s <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'} />
                                                        ))}
                                                    </div>
                                                </div>
                                                <span className="text-xs text-gray-500">
                                                    {review.createdAt?.toDate ? new Date(review.createdAt.toDate()).toLocaleDateString() : ''}
                                                </span>
                                            </div>
                                <span className="text-xs text-gray-400 mt-1">{review.comment}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs text-gray-500 text-center py-4">No reviews yet. Be the first to review!</p>
                            )}
                        </div>

                        {/* Related Products */}
                        {relatedProducts.length > 0 && (
                            <div className="pt-6 md:pt-8 border-t border-white/5">
                                <h3 className="text-base md:text-lg font-serif mb-4">You May Also Like</h3>
                                <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                                    {relatedProducts.map(rp => (
                                        <div
                                            key={rp.id}
                                            className="flex-shrink-0 w-[120px] md:w-[160px] cursor-pointer group"
                                            onClick={() => navigate(`/product/${rp.id}`)}
                                        >
                                            <div className="aspect-[3/4] overflow-hidden rounded-lg md:rounded-xl mb-2 border border-white/5">
                                                <img src={rp.image} alt={rp.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                                            </div>
                                            <h4 className="text-xs md:text-sm font-medium line-clamp-1 group-hover:text-pudava-primary transition-colors">{rp.name}</h4>
                                            <span className="text-xs text-gray-400">₹{rp.price.toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
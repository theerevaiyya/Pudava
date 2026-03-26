import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getWishlist, removeFromWishlist, getProductById } from '../services/firebase';
import { Product, WishlistItem } from '../types';
import { ProductCard } from '../components/ProductCard';
import { EmptyState } from '../components/EmptyState';
import { LoadingSkeleton } from '../components/LoadingSkeleton';

export const Wishlist: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }

    const fetchWishlist = async () => {
      setLoading(true);
      try {
        const items = await getWishlist(user.uid);
        const ids = new Set(items.map(i => i.productId));
        setWishlistIds(ids);

        const productPromises = items.map(i => getProductById(i.productId));
        const fetchedProducts = await Promise.all(productPromises);
        setProducts(fetchedProducts.filter(Boolean) as Product[]);
      } catch (err) {
        console.error('Error fetching wishlist:', err);
      }
      setLoading(false);
    };
    fetchWishlist();
  }, [user, navigate]);

  const handleWishlistToggle = async (productId: string) => {
    if (!user) return;
    try {
      await removeFromWishlist(user.uid, productId);
      setProducts(prev => prev.filter(p => p.id !== productId));
      setWishlistIds(prev => { const next = new Set(prev); next.delete(productId); return next; });
    } catch (err) {
      console.error('Error removing from wishlist:', err);
    }
  };

  return (
    <div className="min-h-screen pt-14 md:pt-18 pb-20 px-4 md:px-8 max-w-6xl mx-auto page-enter">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-white/5 text-white md:hidden">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-xl md:text-2xl font-serif font-bold text-white">Wishlist</h1>
          <p className="text-xs text-gray-400 mt-0.5">{products.length} item{products.length !== 1 ? 's' : ''} saved</p>
        </div>
      </div>

      {loading ? (
        <LoadingSkeleton type="product-card" count={4} />
      ) : products.length === 0 ? (
        <EmptyState
          type="wishlist"
          action={{ label: 'Browse Collection', onClick: () => navigate('/catalog') }}
        />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {products.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              isWishlisted={true}
              onWishlistToggle={handleWishlistToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
};

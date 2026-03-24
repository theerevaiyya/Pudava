import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Star, ShoppingBag } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onWishlistToggle?: (productId: string) => void;
  isWishlisted?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onWishlistToggle, isWishlisted }) => {
  const navigate = useNavigate();

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div
      className="group relative bg-pudava-surface border border-white/5 rounded-2xl overflow-hidden card-glow cursor-pointer"
      onClick={() => navigate(`/product/${product.id}`)}
    >
      {/* Image */}
      <div className="relative aspect-[3/4] overflow-hidden bg-white/5">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover parallax-img"
          loading="lazy"
        />

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.isBestSeller && (
            <span className="px-2 py-0.5 bg-yellow-500/90 text-black text-[10px] font-bold rounded-full uppercase tracking-wider">
              Bestseller
            </span>
          )}
          {product.isNewArrival && (
            <span className="px-2 py-0.5 bg-green-500/90 text-black text-[10px] font-bold rounded-full uppercase tracking-wider">
              New
            </span>
          )}
          {discount > 0 && (
            <span className="px-2 py-0.5 bg-red-500/90 text-white text-[10px] font-bold rounded-full">
              -{discount}%
            </span>
          )}
        </div>

        {/* Wishlist button */}
        {onWishlistToggle && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onWishlistToggle(product.id);
            }}
            className="absolute top-2 right-2 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center transition-all active:scale-90"
          >
            <Heart
              size={18}
              fill={isWishlisted ? '#ec4899' : 'none'}
              stroke={isWishlisted ? '#ec4899' : 'white'}
              strokeWidth={1.5}
            />
          </button>
        )}

        {/* Quick add on hover (desktop) */}
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300 hidden md:block">
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/product/${product.id}`);
            }}
            className="w-full py-2 rounded-lg bg-white/20 backdrop-blur-sm text-white text-xs font-semibold flex items-center justify-center gap-2 hover:bg-white/30 transition-colors"
          >
            <ShoppingBag size={14} />
            Quick View
          </button>
        </div>

        {/* Out of stock overlay */}
        {product.stock <= 0 && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="text-white text-sm font-semibold px-4 py-1.5 rounded-full border border-white/20">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="text-sm font-semibold text-white truncate">{product.name}</h3>
        <p className="text-xs text-gray-400 mt-0.5 capitalize">{product.category}</p>

        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-white">₹{product.price.toLocaleString('en-IN')}</span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-xs text-gray-500 line-through">₹{product.originalPrice.toLocaleString('en-IN')}</span>
            )}
          </div>

          {(product.averageRating ?? 0) > 0 && (
            <div className="flex items-center gap-1">
              <Star size={12} fill="#facc15" stroke="#facc15" />
              <span className="text-xs text-gray-300">{product.averageRating?.toFixed(1)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

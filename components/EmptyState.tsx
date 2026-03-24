import React from 'react';
import { ShoppingBag, Heart, Search, Package } from 'lucide-react';

interface EmptyStateProps {
  type: 'cart' | 'wishlist' | 'search' | 'orders';
  title?: string;
  message?: string;
  action?: { label: string; onClick: () => void };
}

const configs = {
  cart: { icon: ShoppingBag, title: 'Your cart is empty', message: 'Browse our collection and add items to your cart.', color: 'text-pudava-secondary' },
  wishlist: { icon: Heart, title: 'No saved items yet', message: 'Tap the heart icon on products you love to save them here.', color: 'text-pudava-primary' },
  search: { icon: Search, title: 'No results found', message: 'Try different keywords or browse our categories.', color: 'text-pudava-accent' },
  orders: { icon: Package, title: 'No orders yet', message: 'Start shopping and your orders will appear here.', color: 'text-pudava-secondary' },
};

export const EmptyState: React.FC<EmptyStateProps> = ({ type, title, message, action }) => {
  const config = configs[type];
  const Icon = config.icon;

  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center animate-fade-in-blur">
      <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-6 border border-white/5">
        <Icon size={40} className={config.color} strokeWidth={1.5} />
      </div>
      <h3 className="text-xl font-serif text-white mb-2">{title || config.title}</h3>
      <p className="text-sm text-gray-400 max-w-xs leading-relaxed">{message || config.message}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="mt-8 px-8 py-3 rounded-full orchid-gradient text-white text-sm font-semibold btn-press shadow-lg shadow-pudava-primary/20"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};

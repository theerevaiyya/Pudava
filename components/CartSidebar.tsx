import React from 'react';
import { X, Plus, Minus, Trash2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Button } from './Button';
import { useNavigate } from 'react-router-dom';

export const CartSidebar: React.FC = () => {
  const { cart, removeFromCart, updateQuantity, isCartOpen, setIsCartOpen, cartTotal } = useCart();
  const navigate = useNavigate();

  if (!isCartOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-md z-[60] animate-fade-in-blur"
        onClick={() => setIsCartOpen(false)}
      />
      <div className="fixed inset-y-0 right-0 w-full md:w-96 bg-[#0d041a] border-l border-white/10 z-[70] shadow-2xl flex flex-col animate-slide-in-right">
        <div className="p-4 md:p-5 flex items-center justify-between border-b border-white/10 bg-white/5">
          <h2 className="text-lg md:text-xl font-bold">Your Bag ({cart.length})</h2>
          <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-white/10 rounded-full btn-press transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-5 space-y-3 md:space-y-4">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-4 animate-slide-up">
              <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center">
                <Trash2 size={32} className="text-gray-500" />
              </div>
              <div className="text-center">
                <p className="text-base font-medium text-white mb-1">Your bag is empty</p>
                <p className="text-sm text-gray-500">Discover our curated collection</p>
              </div>
              <Button variant="secondary" onClick={() => { setIsCartOpen(false); navigate('/catalog'); }} className="text-xs mt-2">
                Start Shopping
              </Button>
            </div>
          ) : (
            cart.map((item, idx) => (
              <div
                key={`${item.id}-${item.selectedSize}`}
                className="flex gap-3 md:gap-4 p-3 md:p-3.5 bg-white/5 rounded-xl border border-white/10 card-glow"
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                <img src={item.image} alt={item.name} className="w-18 h-18 md:w-20 md:h-20 object-cover rounded-lg flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm line-clamp-2">{item.name}</h3>
                  <p className="text-xs text-gray-400 mb-2">Size: {item.selectedSize} · ₹{item.price.toLocaleString('en-IN')}</p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 bg-black/30 rounded-lg">
                      <button
                        onClick={() => updateQuantity(item.id, item.selectedSize, -1)}
                        className="w-9 h-9 flex items-center justify-center hover:text-white text-gray-400 hover:bg-white/10 rounded-l-lg btn-press"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.selectedSize, 1)}
                        className="w-9 h-9 flex items-center justify-center hover:text-white text-gray-400 hover:bg-white/10 rounded-r-lg btn-press"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id, item.selectedSize)}
                      className="text-red-400 hover:text-red-300 w-9 h-9 flex items-center justify-center hover:bg-red-500/10 rounded-lg transition-colors btn-press"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="p-4 md:p-6 bg-white/5 border-t border-white/10 space-y-3 md:space-y-4">
            <div className="flex justify-between items-center text-base md:text-lg font-bold">
              <span>Total</span>
              <span>₹{cartTotal.toLocaleString()}</span>
            </div>
            <Button fullWidth variant="gold" onClick={() => { setIsCartOpen(false); navigate('/checkout'); }} className="h-11 md:h-12 text-xs">
              Checkout
            </Button>
          </div>
        )}
      </div>
    </>
  );
};
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
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-white/5 flex items-center justify-center">
                <Trash2 size={28} />
              </div>
              <p className="text-sm">Your cart is empty</p>
              <Button variant="secondary" onClick={() => { setIsCartOpen(false); navigate('/catalog'); }} className="text-xs">
                Start Shopping
              </Button>
            </div>
          ) : (
            cart.map((item, idx) => (
              <div
                key={`${item.id}-${item.selectedSize}`}
                className="flex gap-3 md:gap-4 p-2.5 md:p-3 bg-white/5 rounded-xl border border-white/10 card-glow"
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                <img src={item.image} alt={item.name} className="w-16 h-16 md:w-20 md:h-20 object-cover rounded-lg" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-xs md:text-sm line-clamp-1">{item.name}</h3>
                  <p className="text-[10px] md:text-xs text-gray-400 mb-1.5 md:mb-2">Size: {item.selectedSize} | ₹{item.price}</p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 md:gap-3 bg-black/30 rounded-lg px-1.5 md:px-2 py-0.5 md:py-1">
                      <button
                        onClick={() => updateQuantity(item.id, item.selectedSize, -1)}
                        className="p-1 hover:text-white text-gray-400 hover:bg-white/10 rounded btn-press"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="text-xs md:text-sm font-medium w-4 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.selectedSize, 1)}
                        className="p-1 hover:text-white text-gray-400 hover:bg-white/10 rounded btn-press"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id, item.selectedSize)}
                      className="text-red-400 hover:text-red-300 p-1.5 md:p-2 hover:bg-red-500/10 rounded-lg transition-colors btn-press"
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
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
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
        onClick={() => setIsCartOpen(false)}
      />
      <div className="fixed inset-y-0 right-0 w-full md:w-96 bg-[#1a1a2e] border-l border-white/10 z-[70] shadow-2xl flex flex-col transform transition-transform duration-300">
        <div className="p-5 flex items-center justify-between border-b border-white/10 bg-white/5">
          <h2 className="text-xl font-bold">Your Bag ({cart.length})</h2>
          <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-white/10 rounded-full">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-4">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                 <Trash2 size={32} />
              </div>
              <p>Your cart is empty</p>
              <Button variant="secondary" onClick={() => { setIsCartOpen(false); navigate('/catalog'); }}>
                Start Shopping
              </Button>
            </div>
          ) : (
            cart.map((item) => (
              <div key={`${item.id}-${item.selectedSize}`} className="flex gap-4 p-3 bg-white/5 rounded-xl border border-white/10">
                <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-lg" />
                <div className="flex-1">
                  <h3 className="font-semibold text-sm line-clamp-1">{item.name}</h3>
                  <p className="text-xs text-gray-400 mb-2">Size: {item.selectedSize} | ₹{item.price}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 bg-black/20 rounded-lg px-2 py-1">
                      <button 
                        onClick={() => updateQuantity(item.id, item.selectedSize, -1)} 
                        className="p-1 hover:text-white text-gray-400 hover:bg-white/10 rounded"
                        title="Decrease quantity"
                      >
                         <Minus size={14} />
                      </button>
                      <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.selectedSize, 1)} 
                        className="p-1 hover:text-white text-gray-400 hover:bg-white/10 rounded"
                        title="Increase quantity"
                      >
                         <Plus size={14} />
                      </button>
                    </div>
                    <button 
                        onClick={() => removeFromCart(item.id, item.selectedSize)} 
                        className="text-red-400 hover:text-red-300 p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="p-6 bg-white/5 border-t border-white/10 space-y-4">
            <div className="flex justify-between items-center text-lg font-bold">
              <span>Total</span>
              <span>₹{cartTotal.toLocaleString()}</span>
            </div>
            <Button fullWidth onClick={() => { setIsCartOpen(false); navigate('/checkout'); }}>
              Checkout
            </Button>
          </div>
        )}
      </div>
    </>
  );
};
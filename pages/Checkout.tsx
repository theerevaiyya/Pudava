import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { GlassCard } from '../components/GlassCard';
import { Button } from '../components/Button';
import { CreditCard, MapPin, CheckCircle, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Checkout: React.FC = () => {
    const { cart, cartTotal, clearCart } = useCart();
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    const handlePayment = () => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            setStep(3);
            clearCart();
        }, 2000);
    };

    if (cart.length === 0 && step !== 3) {
        return (
            <div className="container mx-auto px-4 py-20 text-center">
                <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
                <Button onClick={() => navigate('/catalog')}>Go to Catalog</Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 mt-16 mb-20 max-w-4xl">
            <h1 className="text-3xl font-bold mb-8 text-center">Checkout</h1>
            
            <div className="flex justify-center mb-8">
                <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 1 ? 'bg-pudava-secondary' : 'bg-white/10'}`}>1</div>
                    <div className={`h-1 w-16 ${step >= 2 ? 'bg-pudava-secondary' : 'bg-white/10'}`}></div>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 2 ? 'bg-pudava-secondary' : 'bg-white/10'}`}>2</div>
                    <div className={`h-1 w-16 ${step >= 3 ? 'bg-pudava-secondary' : 'bg-white/10'}`}></div>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 3 ? 'bg-green-500' : 'bg-white/10'}`}>3</div>
                </div>
            </div>

            {step === 1 && (
                <div className="grid md:grid-cols-2 gap-8">
                    <GlassCard className="p-6">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <MapPin size={20} className="text-pudava-secondary" /> 
                            Shipping Address
                        </h2>
                        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setStep(2); }}>
                            <div className="grid grid-cols-2 gap-4">
                                <input required placeholder="First Name" className="bg-white/5 border border-white/10 rounded-lg p-3 w-full focus:outline-none focus:border-pudava-secondary" />
                                <input required placeholder="Last Name" className="bg-white/5 border border-white/10 rounded-lg p-3 w-full focus:outline-none focus:border-pudava-secondary" />
                            </div>
                            <input required placeholder="Address Line 1" className="bg-white/5 border border-white/10 rounded-lg p-3 w-full focus:outline-none focus:border-pudava-secondary" />
                            <div className="grid grid-cols-2 gap-4">
                                <input required placeholder="City" className="bg-white/5 border border-white/10 rounded-lg p-3 w-full focus:outline-none focus:border-pudava-secondary" />
                                <input required placeholder="PIN Code" className="bg-white/5 border border-white/10 rounded-lg p-3 w-full focus:outline-none focus:border-pudava-secondary" />
                            </div>
                            <input required placeholder="Phone Number" type="tel" className="bg-white/5 border border-white/10 rounded-lg p-3 w-full focus:outline-none focus:border-pudava-secondary" />
                            <Button fullWidth type="submit" className="mt-4">Proceed to Payment</Button>
                        </form>
                    </GlassCard>
                    
                    <div className="space-y-4">
                        <GlassCard className="p-6">
                            <h2 className="text-xl font-bold mb-4">Order Summary</h2>
                            <div className="space-y-3 max-h-64 overflow-y-auto mb-4 custom-scrollbar">
                                {cart.map(item => (
                                    <div key={`${item.id}-${item.selectedSize}`} className="flex justify-between items-center text-sm">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center text-xs">{item.quantity}</div>
                                            <span>{item.name} ({item.selectedSize})</span>
                                        </div>
                                        <span>₹{(item.price * item.quantity).toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="border-t border-white/10 pt-4 flex justify-between items-center font-bold text-lg">
                                <span>Total</span>
                                <span>₹{cartTotal.toLocaleString()}</span>
                            </div>
                        </GlassCard>
                    </div>
                </div>
            )}

            {step === 2 && (
                <div className="max-w-md mx-auto">
                    <GlassCard className="p-8">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <CreditCard size={20} className="text-pudava-secondary" /> 
                            Payment Method
                        </h2>
                        <div className="space-y-4">
                             <div className="p-4 rounded-lg border border-pudava-secondary bg-pudava-secondary/10 flex justify-between items-center cursor-pointer">
                                <div className="flex items-center gap-3">
                                    <CreditCard />
                                    <span className="font-semibold">Credit / Debit Card</span>
                                </div>
                                <div className="w-4 h-4 rounded-full bg-pudava-secondary shadow-[0_0_10px_rgba(233,69,96,0.5)]"></div>
                             </div>

                             <div className="space-y-3 pt-4">
                                <input placeholder="Card Number" className="bg-white/5 border border-white/10 rounded-lg p-3 w-full" />
                                <div className="grid grid-cols-2 gap-4">
                                    <input placeholder="MM / YY" className="bg-white/5 border border-white/10 rounded-lg p-3 w-full" />
                                    <input placeholder="CVV" className="bg-white/5 border border-white/10 rounded-lg p-3 w-full" />
                                </div>
                                <input placeholder="Cardholder Name" className="bg-white/5 border border-white/10 rounded-lg p-3 w-full" />
                             </div>

                             <div className="flex items-center gap-2 text-xs text-gray-400 mt-2">
                                <ShieldCheck size={14} className="text-green-400" />
                                Payments are secure and encrypted.
                             </div>

                             <Button 
                                fullWidth 
                                onClick={handlePayment} 
                                disabled={loading}
                                className="mt-6"
                            >
                                {loading ? 'Processing...' : `Pay ₹${cartTotal.toLocaleString()}`}
                             </Button>
                             <button onClick={() => setStep(1)} className="w-full text-center text-sm text-gray-400 mt-4 hover:text-white">Back to Details</button>
                        </div>
                    </GlassCard>
                </div>
            )}

            {step === 3 && (
                <div className="max-w-md mx-auto text-center">
                    <GlassCard className="p-10 flex flex-col items-center">
                        <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-green-500/30">
                            <CheckCircle size={40} className="text-white" />
                        </div>
                        <h2 className="text-3xl font-bold mb-2">Order Confirmed!</h2>
                        <p className="text-gray-300 mb-8">Thank you for shopping with Pudava. Your order #78902 has been placed successfully.</p>
                        <Button fullWidth onClick={() => navigate('/catalog')}>Continue Shopping</Button>
                    </GlassCard>
                </div>
            )}
        </div>
    );
};
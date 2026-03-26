import React, { useState, useEffect, useCallback } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { GlassCard } from '../components/GlassCard';
import { Button } from '../components/Button';
import { AddressCard } from '../components/AddressCard';
import { CreditCard, MapPin, CheckCircle, ShieldCheck, Plus, Tag, X, Truck, Wallet, Banknote, Smartphone, AlertCircle, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getUserAddresses, saveAddress, createOrder, validateCoupon, applyCoupon } from '../services/firebase';
import { Address, Coupon, OrderItem } from '../types';

declare global {
  interface Window {
    Razorpay: any;
  }
}

const DELIVERY_THRESHOLD = 999;
const DELIVERY_FEE = 99;

export const Checkout: React.FC = () => {
    const { cart, cartTotal, clearCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
    const [showNewAddress, setShowNewAddress] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<'cod' | 'upi' | 'card' | 'netbanking'>('cod');
    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
    const [couponError, setCouponError] = useState('');
    const [orderId, setOrderId] = useState('');

    // New address form
    const [addrForm, setAddrForm] = useState({
        fullName: '', phone: '', addressLine1: '', addressLine2: '',
        city: '', state: '', pincode: '', type: 'home' as Address['type'], isDefault: false,
    });

    const deliveryFee = cartTotal >= DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
    const discount = appliedCoupon
        ? appliedCoupon.discountType === 'percentage'
            ? Math.min((cartTotal * appliedCoupon.discountValue) / 100, appliedCoupon.maxDiscount || Infinity)
            : appliedCoupon.discountValue
        : 0;
    const total = cartTotal - discount + deliveryFee;

    useEffect(() => {
        if (!user) { navigate('/login'); return; }
        const fetchAddrs = async () => {
            const addrs = await getUserAddresses(user.uid);
            setAddresses(addrs);
            const defaultAddr = addrs.find(a => a.isDefault) || addrs[0];
            if (defaultAddr) setSelectedAddress(defaultAddr);
        };
        fetchAddrs();
    }, [user, navigate]);

    const handleApplyCoupon = async () => {
        setCouponError('');
        if (!couponCode.trim()) return;
        const coupon = await validateCoupon(couponCode, cartTotal);
        if (coupon) {
            setAppliedCoupon(coupon);
        } else {
            setCouponError('Invalid or expired coupon code.');
        }
    };

    const handleSaveNewAddress = async () => {
        if (!user) return;
        const id = await saveAddress({ ...addrForm, userId: user.uid });
        const updatedAddrs = await getUserAddresses(user.uid);
        setAddresses(updatedAddrs);
        const newAddr = updatedAddrs.find(a => a.id === id);
        if (newAddr) setSelectedAddress(newAddr);
        setShowNewAddress(false);
    };

    const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID || '';

    const loadRazorpayScript = useCallback((): Promise<boolean> => {
        return new Promise((resolve) => {
            if (window.Razorpay) { resolve(true); return; }
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    }, []);

    const placeOrderInFirestore = async (paymentId?: string, razorpayOrderId?: string) => {
        if (!user || !selectedAddress) return '';
        const orderItems: OrderItem[] = cart.map(item => ({
            productId: item.id,
            name: item.name,
            image: item.image,
            price: item.price,
            quantity: item.quantity,
            size: item.selectedSize,
            variant: item.selectedVariant,
        }));

        const isPaid = paymentMethod !== 'cod' && paymentId;
        const id = await createOrder({
            userId: user.uid,
            items: orderItems,
            subtotal: cartTotal,
            discount,
            deliveryFee,
            total,
            status: isPaid ? 'confirmed' : 'pending',
            shippingAddress: selectedAddress,
            paymentMethod,
            paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid',
            couponCode: appliedCoupon?.code,
            razorpayPaymentId: paymentId,
            razorpayOrderId: razorpayOrderId,
        });

        if (appliedCoupon) {
            await applyCoupon(appliedCoupon.id);
        }
        return id;
    };

    const handlePlaceOrder = async () => {
        if (!user || !selectedAddress || !user.emailVerified) return;
        setLoading(true);
        try {
            if (paymentMethod === 'cod') {
                // Direct order for Cash on Delivery
                const id = await placeOrderInFirestore();
                setOrderId(id);
                clearCart();
                setStep(3);
            } else {
                // Online payment via Razorpay
                const scriptLoaded = await loadRazorpayScript();
                if (!scriptLoaded) {
                    alert('Failed to load payment gateway. Please check your connection.');
                    setLoading(false);
                    return;
                }

                // Create Razorpay order on server
                const res = await fetch('/api/razorpay/create-order', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        amount: total,
                        currency: 'INR',
                        receipt: `pudava_${Date.now()}`,
                    }),
                });
                if (!res.ok) throw new Error('Failed to create payment order');
                const razorpayOrder = await res.json();

                const options = {
                    key: RAZORPAY_KEY,
                    amount: razorpayOrder.amount,
                    currency: razorpayOrder.currency,
                    name: 'Pudava',
                    description: `Order of ${cart.length} item(s)`,
                    order_id: razorpayOrder.id,
                    prefill: {
                        name: user.displayName || '',
                        email: user.email || '',
                        contact: selectedAddress.phone || '',
                    },
                    theme: { color: '#ec4899' },
                    handler: async (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => {
                        try {
                            // Verify payment on server
                            const verifyRes = await fetch('/api/razorpay/verify', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(response),
                            });
                            const verification = await verifyRes.json();
                            if (verification.verified) {
                                const id = await placeOrderInFirestore(response.razorpay_payment_id, response.razorpay_order_id);
                                setOrderId(id);
                                clearCart();
                                setStep(3);
                            } else {
                                alert('Payment verification failed. Please contact support.');
                            }
                        } catch (err) {
                            console.error('Payment verification error:', err);
                            alert('Payment verification failed. Please contact support.');
                        }
                        setLoading(false);
                    },
                    modal: {
                        ondismiss: () => { setLoading(false); },
                    },
                };

                const rzp = new window.Razorpay(options);
                rzp.on('payment.failed', (response: any) => {
                    console.error('Payment failed:', response.error);
                    alert(`Payment failed: ${response.error.description}. Please try again.`);
                    setLoading(false);
                });
                rzp.open();
                return; // Don't set loading(false) — handler/ondismiss will do it
            }
        } catch (err) {
            console.error('Order placement failed:', err);
        }
        setLoading(false);
    };

    if (cart.length === 0 && step !== 3) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center page-enter">
                <h2 className="text-xl font-bold mb-4">Your cart is empty</h2>
                <Button onClick={() => navigate('/catalog')}>Browse Collection</Button>
            </div>
        );
    }

    if (user && !user.emailVerified) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center page-enter">
                <GlassCard className="p-8 max-w-md w-full flex flex-col items-center">
                    <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mb-4">
                        <Mail size={32} className="text-yellow-400" />
                    </div>
                    <h2 className="text-xl font-serif font-bold mb-2 text-white">Verify Your Email</h2>
                    <p className="text-sm text-gray-400 mb-6">You need a verified email address to place orders. Please check your inbox for the verification link.</p>
                    <div className="flex flex-col gap-3 w-full">
                        <Button fullWidth onClick={() => navigate('/profile')} variant="orchid">Go to Profile</Button>
                        <Button fullWidth onClick={() => navigate('/catalog')} variant="secondary">Continue Shopping</Button>
                    </div>
                </GlassCard>
            </div>
        );
    }

    const paymentOptions = [
        { value: 'cod' as const, label: 'Cash on Delivery', icon: Banknote, desc: 'Pay when delivered' },
        { value: 'upi' as const, label: 'UPI', icon: Smartphone, desc: 'GPay, PhonePe, Paytm' },
        { value: 'card' as const, label: 'Credit/Debit Card', icon: CreditCard, desc: 'Visa, Mastercard, RuPay' },
        { value: 'netbanking' as const, label: 'Net Banking', icon: Wallet, desc: 'All major banks' },
    ];

    return (
        <div className="min-h-screen pt-14 md:pt-18 pb-20 px-4 md:px-8 max-w-4xl mx-auto page-enter">
            <h1 className="text-xl md:text-2xl font-serif font-bold mb-4 text-center text-white">Checkout</h1>

            {/* Progress Steps */}
            <div className="flex justify-center mb-5">
                <div className="flex items-center gap-2 md:gap-4">
                    {[
                        { n: 1, label: 'Address' },
                        { n: 2, label: 'Payment' },
                        { n: 3, label: 'Done' },
                    ].map(({ n, label }) => (
                        <React.Fragment key={n}>
                            {n > 1 && <div className={`h-0.5 w-8 md:w-16 ${step >= n ? 'orchid-gradient' : 'bg-white/10'}`} />}
                            <div className="flex flex-col items-center gap-1">
                                <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-xs md:text-sm font-bold transition-all ${
                                    step >= n ? (n === 3 && step === 3 ? 'bg-green-500' : 'orchid-gradient') : 'bg-white/10 text-gray-500'
                                } text-white`}>{n}</div>
                                <span className="text-[10px] md:text-xs text-gray-400">{label}</span>
                            </div>
                        </React.Fragment>
                    ))}
                </div>
            </div>

            {/* Step 1: Address + Order Summary */}
            {step === 1 && (
                <div className="grid md:grid-cols-5 gap-6">
                    <div className="md:col-span-3 space-y-4">
                        {/* Address Selection */}
                        <GlassCard className="p-5">
                            <h2 className="text-base font-semibold mb-4 flex items-center gap-2 text-white">
                                <MapPin size={16} className="text-pudava-secondary" /> Delivery Address
                            </h2>

                            {addresses.length > 0 && !showNewAddress && (
                                <div className="space-y-2 mb-3">
                                    {addresses.map(addr => (
                                        <AddressCard
                                            key={addr.id}
                                            address={addr}
                                            selected={selectedAddress?.id === addr.id}
                                            onSelect={() => setSelectedAddress(addr)}
                                            compact
                                        />
                                    ))}
                                </div>
                            )}

                            {showNewAddress ? (
                                <div className="space-y-3">
                                    <input placeholder="Full Name" value={addrForm.fullName}
                                        onChange={e => setAddrForm(p => ({ ...p, fullName: e.target.value }))}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-pudava-secondary placeholder-gray-500" />
                                    <input placeholder="Phone" type="tel" value={addrForm.phone}
                                        onChange={e => setAddrForm(p => ({ ...p, phone: e.target.value }))}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-pudava-secondary placeholder-gray-500" />
                                    <input placeholder="Address Line 1" value={addrForm.addressLine1}
                                        onChange={e => setAddrForm(p => ({ ...p, addressLine1: e.target.value }))}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-pudava-secondary placeholder-gray-500" />
                                    <div className="grid grid-cols-2 gap-3">
                                        <input placeholder="City" value={addrForm.city}
                                            onChange={e => setAddrForm(p => ({ ...p, city: e.target.value }))}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-pudava-secondary placeholder-gray-500" />
                                        <input placeholder="State" value={addrForm.state}
                                            onChange={e => setAddrForm(p => ({ ...p, state: e.target.value }))}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-pudava-secondary placeholder-gray-500" />
                                    </div>
                                    <input placeholder="PIN Code (6 digits)" value={addrForm.pincode} inputMode="numeric"
                                        onChange={e => setAddrForm(p => ({ ...p, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) }))}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-pudava-secondary placeholder-gray-500" />
                                    <div className="flex gap-2">
                                        <Button fullWidth onClick={handleSaveNewAddress} variant="orchid">Save & Use</Button>
                                        <Button onClick={() => setShowNewAddress(false)} variant="ghost">Cancel</Button>
                                    </div>
                                </div>
                            ) : (
                                <button onClick={() => setShowNewAddress(true)}
                                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-white/10 text-sm text-gray-400 hover:text-white hover:border-white/20 transition-all">
                                    <Plus size={14} /> Add New Address
                                </button>
                            )}
                        </GlassCard>

                        {/* Coupon */}
                        <GlassCard className="p-5">
                            <h2 className="text-base font-semibold mb-3 flex items-center gap-2 text-white">
                                <Tag size={16} className="text-pudava-secondary" /> Coupon
                            </h2>
                            {appliedCoupon ? (
                                <div className="flex items-center justify-between p-3 rounded-xl bg-green-500/10 border border-green-500/20">
                                    <div>
                                        <span className="text-sm text-green-300 font-semibold">{appliedCoupon.code}</span>
                                        <p className="text-xs text-green-400/70">-₹{discount.toLocaleString('en-IN')} off</p>
                                    </div>
                                    <button onClick={() => { setAppliedCoupon(null); setCouponCode(''); }} className="text-gray-400 hover:text-white">
                                        <X size={16} />
                                    </button>
                                </div>
                            ) : (
                                <div className="flex gap-2">
                                    <input placeholder="Enter coupon code" value={couponCode}
                                        onChange={e => { setCouponCode(e.target.value.toUpperCase()); setCouponError(''); }}
                                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-pudava-secondary placeholder-gray-500 uppercase"
                                    />
                                    <Button onClick={handleApplyCoupon} variant="outline">Apply</Button>
                                </div>
                            )}
                            {couponError && <p className="text-xs text-red-400 mt-2">{couponError}</p>}
                        </GlassCard>
                    </div>

                    {/* Order Summary */}
                    <div className="md:col-span-2">
                        <GlassCard className="p-5 sticky top-24">
                            <h2 className="text-base font-semibold mb-4 text-white">Order Summary</h2>
                            <div className="space-y-3 max-h-48 overflow-y-auto mb-4 no-scrollbar">
                                {cart.map(item => (
                                    <div key={`${item.id}-${item.selectedSize}`} className="flex items-center gap-3 text-sm">
                                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-white/5 flex-shrink-0">
                                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs text-white truncate">{item.name}</p>
                                            <p className="text-xs text-gray-500">{item.selectedSize} × {item.quantity}</p>
                                        </div>
                                        <span className="text-xs text-white font-medium">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-2 pt-3 border-t border-white/5 text-sm">
                                <div className="flex justify-between text-gray-400">
                                    <span>Subtotal</span>
                                    <span>₹{cartTotal.toLocaleString('en-IN')}</span>
                                </div>
                                {discount > 0 && (
                                    <div className="flex justify-between text-green-400">
                                        <span>Discount</span>
                                        <span>-₹{discount.toLocaleString('en-IN')}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-gray-400">
                                    <span className="flex items-center gap-1"><Truck size={12} /> Delivery</span>
                                    <span>{deliveryFee === 0 ? <span className="text-green-400">Free</span> : `₹${deliveryFee}`}</span>
                                </div>
                                {deliveryFee > 0 && (
                                    <p className="text-xs text-gray-500">Free delivery on orders above ₹{DELIVERY_THRESHOLD}</p>
                                )}
                                <div className="flex justify-between text-white font-bold pt-2 border-t border-white/5 text-base">
                                    <span>Total</span>
                                    <span>₹{total.toLocaleString('en-IN')}</span>
                                </div>
                            </div>

                            <Button fullWidth onClick={() => selectedAddress && setStep(2)}
                                disabled={!selectedAddress}
                                variant="gold" className="mt-4 h-12">
                                Continue to Payment
                            </Button>
                            {!selectedAddress && (
                                <p className="text-xs text-red-400 text-center mt-2">Please select a delivery address</p>
                            )}
                        </GlassCard>
                    </div>
                </div>
            )}

            {/* Step 2: Payment */}
            {step === 2 && (
                <div className="grid md:grid-cols-5 gap-6">
                    <div className="md:col-span-3">
                        <GlassCard className="p-5">
                            <h2 className="text-base font-semibold mb-4 flex items-center gap-2 text-white">
                                <CreditCard size={16} className="text-pudava-secondary" /> Payment Method
                            </h2>

                            <div className="space-y-2">
                                {paymentOptions.map(opt => (
                                    <button
                                        key={opt.value}
                                        onClick={() => setPaymentMethod(opt.value)}
                                        className={`w-full flex items-center gap-3 p-4 rounded-xl border transition-all ${
                                            paymentMethod === opt.value
                                                ? 'border-pudava-secondary/50 bg-pudava-secondary/5'
                                                : 'border-white/5 bg-white/[0.02] hover:border-white/10'
                                        }`}
                                    >
                                        <opt.icon size={20} className={paymentMethod === opt.value ? 'text-pudava-secondary' : 'text-gray-400'} />
                                        <div className="text-left flex-1">
                                            <p className="text-sm text-white font-medium">{opt.label}</p>
                                            <p className="text-xs text-gray-500">{opt.desc}</p>
                                        </div>
                                        <div className={`w-4 h-4 rounded-full border-2 ${
                                            paymentMethod === opt.value
                                                ? 'border-pudava-secondary bg-pudava-secondary'
                                                : 'border-gray-600'
                                        }`} />
                                    </button>
                                ))}
                            </div>

                            <div className="flex items-center gap-2 text-xs text-gray-400 mt-4">
                                <ShieldCheck size={14} className="text-green-400" />
                                100% secure & encrypted payments
                            </div>
                        </GlassCard>
                    </div>

                    <div className="md:col-span-2">
                        <GlassCard className="p-5 sticky top-24">
                            <h2 className="text-base font-semibold mb-3 text-white">Order Total</h2>
                            <div className="space-y-2 text-sm mb-4">
                                <div className="flex justify-between text-gray-400">
                                    <span>Items ({cart.reduce((a, i) => a + i.quantity, 0)})</span>
                                    <span>₹{cartTotal.toLocaleString('en-IN')}</span>
                                </div>
                                {discount > 0 && (
                                    <div className="flex justify-between text-green-400">
                                        <span>Discount</span>
                                        <span>-₹{discount.toLocaleString('en-IN')}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-gray-400">
                                    <span>Delivery</span>
                                    <span>{deliveryFee === 0 ? 'Free' : `₹${deliveryFee}`}</span>
                                </div>
                                <div className="flex justify-between text-white font-bold pt-2 border-t border-white/5 text-base">
                                    <span>Total</span>
                                    <span>₹{total.toLocaleString('en-IN')}</span>
                                </div>
                            </div>

                            {/* Delivery to */}
                            {selectedAddress && (
                                <div className="text-xs text-gray-400 mb-4 p-3 rounded-lg bg-white/[0.02] border border-white/5">
                                    <span className="text-gray-500">Delivering to:</span>
                                    <p className="text-white font-medium mt-0.5">{selectedAddress.fullName}</p>
                                    <p>{selectedAddress.city}, {selectedAddress.pincode}</p>
                                </div>
                            )}

                            <Button fullWidth onClick={handlePlaceOrder} disabled={loading} variant="gold" className="h-12">
                                {loading ? 'Placing Order...' : `Place Order · ₹${total.toLocaleString('en-IN')}`}
                            </Button>
                            <button onClick={() => setStep(1)} className="w-full text-center text-xs text-gray-400 mt-3 hover:text-white">
                                ← Back to Address
                            </button>
                        </GlassCard>
                    </div>
                </div>
            )}

            {/* Step 3: Confirmation */}
            {step === 3 && (
                <div className="max-w-md mx-auto text-center">
                    <GlassCard className="p-8 md:p-10 flex flex-col items-center">
                        <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-green-500/30 animate-scale-pop">
                            <CheckCircle size={40} className="text-white" />
                        </div>
                        <h2 className="text-2xl md:text-3xl font-serif font-bold mb-2">Order Confirmed!</h2>
                        <p className="text-gray-400 text-sm mb-2">Thank you for shopping with Pudava.</p>
                        <p className="text-xs text-gray-500 mb-6">
                            Order ID: <span className="text-white font-medium">#{orderId.slice(-8).toUpperCase()}</span>
                        </p>

                        <div className="flex flex-col gap-3 w-full">
                            <Button fullWidth onClick={() => navigate(`/orders/${orderId}`)} variant="orchid">
                                Track Order
                            </Button>
                            <Button fullWidth onClick={() => navigate('/catalog')} variant="secondary">
                                Continue Shopping
                            </Button>
                        </div>
                    </GlassCard>
                </div>
            )}
        </div>
    );
};
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Product } from '../types';
import { Button } from '../components/Button';
import { useCart } from '../context/CartContext';
import { ArrowLeft, Star, Truck, ShieldCheck } from 'lucide-react';

export const ProductDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedSize, setSelectedSize] = useState<string>('');
    const [adding, setAdding] = useState(false);

    useEffect(() => {
        const fetchProduct = async () => {
            if (!id) return;
            const docRef = doc(db, 'products', id);
            const docSnap = await getDoc(docRef);
            
            if (docSnap.exists()) {
                const data = docSnap.data() as Omit<Product, 'id'>;
                setProduct({ id: docSnap.id, ...data });
                if (data.sizes.length > 0) setSelectedSize(data.sizes[0]);
            } else {
                navigate('/catalog');
            }
            setLoading(false);
        };
        fetchProduct();
    }, [id, navigate]);

    const handleAddToCart = () => {
        if (!product || !selectedSize) return;
        setAdding(true);
        addToCart(product, selectedSize);
        setTimeout(() => setAdding(false), 500);
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    if (!product) return null;

    return (
        <div className="min-h-screen pb-24 md:pb-0 bg-pudava-bg">
            <div className="md:grid md:grid-cols-2 min-h-screen">
                {/* Image Section - Compact & Sticky */}
                <div className="relative h-[50vh] md:h-screen md:sticky md:top-0 w-full overflow-hidden bg-gray-900">
                    <button 
                        onClick={() => navigate(-1)} 
                        className="absolute top-4 left-4 z-20 p-2.5 bg-black/40 backdrop-blur-md rounded-full text-white hover:bg-black/60 transition-colors"
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <img 
                        src={product.image} 
                        alt={product.name} 
                        className="w-full h-full object-cover animate-fade-in"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-pudava-bg via-transparent to-transparent md:hidden opacity-80"></div>
                </div>

                {/* Details Section - Tighter Padding */}
                <div className="relative px-5 py-6 md:p-12 flex flex-col justify-center -mt-8 md:mt-0 z-10 bg-pudava-bg md:bg-transparent rounded-t-3xl md:rounded-none">
                    <div className="max-w-md mx-auto w-full space-y-6 animate-slide-up">
                        <div>
                            <div className="flex justify-between items-start mb-1">
                                <span className="text-pudava-secondary text-xs font-bold tracking-[0.2em] uppercase">{product.category}</span>
                                {product.isBestSeller && <span className="px-1.5 py-0.5 bg-white/10 text-[9px] uppercase tracking-wider rounded border border-white/10">Best Seller</span>}
                            </div>
                            <h1 className="text-3xl md:text-4xl font-serif leading-tight mb-2">{product.name}</h1>
                            <div className="flex items-center justify-between">
                                <p className="text-2xl font-light">₹{product.price.toLocaleString()}</p>
                                <div className="flex items-center gap-1 text-yellow-500 text-xs">
                                    <Star size={12} fill="currentColor"/><span>4.8</span>
                                </div>
                            </div>
                        </div>

                        <div className="prose prose-invert prose-sm text-gray-400 leading-relaxed text-sm">
                            <p>{product.description}</p>
                        </div>

                        {/* Size Selector - Compact */}
                        <div>
                            <span className="text-[10px] text-gray-500 uppercase tracking-widest block mb-2 font-bold">Select Size</span>
                            <div className="flex gap-2">
                                {product.sizes.map(size => (
                                    <button
                                        key={size}
                                        onClick={() => setSelectedSize(size)}
                                        className={`h-9 min-w-[36px] px-3 rounded-lg border flex items-center justify-center text-xs font-medium transition-all ${
                                            selectedSize === size 
                                            ? 'bg-white text-black border-white shadow-lg' 
                                            : 'border-white/10 text-gray-400 hover:border-white/30 hover:text-white bg-white/5'
                                        }`}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="pt-4 space-y-4">
                            <Button 
                                fullWidth 
                                variant="gold" 
                                onClick={handleAddToCart}
                                className="h-12 text-sm"
                            >
                                {adding ? 'Added to Bag' : 'Add to Cart'}
                            </Button>
                            
                            <div className="flex justify-center gap-6 pt-2">
                                <div className="flex items-center gap-2 text-[10px] text-gray-500 uppercase tracking-wide">
                                    <Truck size={14} />
                                    <span>Free Shipping</span>
                                </div>
                                <div className="flex items-center gap-2 text-[10px] text-gray-500 uppercase tracking-wide">
                                    <ShieldCheck size={14} />
                                    <span>Secure Payment</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
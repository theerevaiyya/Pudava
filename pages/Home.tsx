import React, { useEffect, useState } from 'react';
import { GlassCard } from '../components/GlassCard';
import { Button } from '../components/Button';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, Heart } from 'lucide-react';
import { collection, query, where, limit, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Product } from '../types';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const [bestSellers, setBestSellers] = useState<Product[]>([]);

  useEffect(() => {
    const fetchBestSellers = async () => {
        const q = query(collection(db, 'products'), where('isBestSeller', '==', true), limit(3));
        const snapshot = await getDocs(q);
        setBestSellers(snapshot.docs.map(d => ({id: d.id, ...d.data()} as Product)));
    };
    fetchBestSellers();
  }, []);

  return (
    <div className="pb-32">
      {/* Cinematic Hero */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
             <div className="absolute inset-0 bg-[#05010d]/60 z-10 backdrop-blur-[2px]"></div>
             <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#05010d] z-20"></div>
             <img 
                src="https://images.unsplash.com/photo-1583391733958-e026b143f282?q=80&w=1920&auto=format&fit=crop" 
                className="w-full h-full object-cover animate-float-slow scale-110"
                alt="Background"
             />
        </div>

        <div className="relative z-30 text-center px-4 max-w-5xl mx-auto flex flex-col items-center gap-8 animate-fade-in-blur">
          <div className="inline-flex items-center gap-3 px-6 py-2 border border-white/10 rounded-full text-[9px] tracking-[0.5em] uppercase text-pudava-primary font-bold backdrop-blur-2xl bg-white/5 shadow-2xl">
            <Sparkles size={14} className="animate-pulse" /> Royal Orchid Edition
          </div>
          <h1 className="text-6xl md:text-9xl font-serif font-bold leading-[1] text-white tracking-tighter">
            Royal <br />
            <span className="orchid-text-gradient italic">Reflections</span>
          </h1>
          <p className="text-base md:text-xl text-gray-400 max-w-2xl font-light leading-relaxed tracking-wide">
            A sanctuary of hand-woven masterpieces where timeless heritage meets modern silhouettes.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 w-full sm:w-auto mt-4">
            <Button variant="orchid" onClick={() => navigate('/catalog')} className="px-12 h-14">The Collection</Button>
            <Button variant="secondary" onClick={() => navigate('/about')} className="px-12 h-14">Our Story</Button>
          </div>
        </div>

        {/* Floating scroll indicator */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 opacity-30">
            <span className="text-[8px] uppercase tracking-[0.4em]">Scroll</span>
            <div className="w-px h-16 bg-gradient-to-b from-white to-transparent"></div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="container mx-auto px-6 py-32">
        <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
            <div className="reveal-container">
                <span className="text-pudava-primary font-black tracking-[0.4em] uppercase text-[9px] mb-2 block">Curation</span>
                <h2 className="text-5xl md:text-6xl font-serif leading-none">Curated Realms</h2>
            </div>
            <Button variant="ghost" onClick={() => navigate('/catalog')} className="border border-white/5 bg-white/5 px-8">Exploration <ArrowRight size={16} /></Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 h-auto md:h-[700px] stagger-in">
             <div 
                className="md:col-span-8 relative group overflow-hidden rounded-[2.5rem] cursor-pointer h-[450px] md:h-full border border-white/5 shadow-2xl"
                onClick={() => navigate('/catalog?filter=Women')}
             >
                <img src="https://images.unsplash.com/photo-1610030469983-98e55041d04f?q=80&w=1200" className="w-full h-full object-cover parallax-img" alt="Women"/>
                <div className="absolute inset-0 bg-gradient-to-t from-[#05010d] via-transparent to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-700"></div>
                <div className="absolute bottom-12 left-12">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-[1px] bg-pudava-primary"></div>
                        <span className="text-[10px] tracking-[0.4em] uppercase text-pudava-primary font-black">Empress Series</span>
                    </div>
                    <h3 className="text-5xl md:text-6xl font-serif text-white">Women</h3>
                </div>
             </div>

             <div className="md:col-span-4 flex flex-col gap-8">
                <div 
                    className="flex-1 relative group overflow-hidden rounded-[2.5rem] cursor-pointer border border-white/5 shadow-xl"
                    onClick={() => navigate('/catalog?filter=Men')}
                >
                    <img src="https://images.unsplash.com/photo-1597983073493-88cd357a28e0?q=80&w=800" className="w-full h-full object-cover parallax-img" alt="Men"/>
                    <div className="absolute inset-0 bg-gradient-to-t from-[#05010d] via-transparent to-transparent opacity-70"></div>
                    <div className="absolute bottom-10 left-10">
                         <h3 className="text-3xl font-serif text-white">Royal Gent</h3>
                    </div>
                </div>
                <div 
                    className="flex-1 relative group overflow-hidden rounded-[2.5rem] cursor-pointer border border-white/5 shadow-xl"
                    onClick={() => navigate('/catalog?filter=Kids')}
                >
                     <img src="https://images.unsplash.com/photo-1627885732159-4c8d28cb1745?q=80&w=800" className="w-full h-full object-cover parallax-img" alt="Kids"/>
                     <div className="absolute inset-0 bg-gradient-to-t from-[#05010d] via-transparent to-transparent opacity-70"></div>
                     <div className="absolute bottom-10 left-10">
                         <h3 className="text-3xl font-serif text-white">Youthful Essence</h3>
                    </div>
                </div>
             </div>
        </div>
      </section>

      {/* Modern Marquee */}
      <div className="w-full py-12 overflow-hidden border-y border-white/5 backdrop-blur-3xl bg-white/[0.02]">
        <div className="flex gap-24 whitespace-nowrap overflow-x-auto no-scrollbar px-12">
            {["Artisan Silk", "Hand-Embroidered", "Midnight Velvet", "Sustainable Luxe", "Ethically Sourced"].map((item, i) => (
                <div key={i} className="flex items-center gap-6 text-pudava-primary/40 uppercase tracking-[0.6em] text-[10px] font-black italic">
                    <Sparkles size={16} className="text-pudava-primary animate-pulse" />
                    <span>{item}</span>
                </div>
            ))}
        </div>
      </div>

      {/* Trending Selection */}
      <section className="container mx-auto px-6 py-32">
         <div className="flex items-center gap-6 mb-16">
            <h2 className="text-4xl font-serif">Aura Selection</h2>
            <div className="h-px flex-1 bg-gradient-to-r from-pudava-primary/30 to-transparent"></div>
         </div>
         
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
            {bestSellers.map((product, idx) => (
                <div 
                    key={product.id} 
                    className="group cursor-pointer flex flex-col bg-white/[0.02] p-5 rounded-[2.5rem] border border-white/5 hover:border-pudava-primary/30 transition-all duration-700 hover:shadow-[0_20px_60px_rgba(236,72,153,0.1)]" 
                    onClick={() => navigate(`/product/${product.id}`)}
                    style={{ animationDelay: `${idx * 0.15}s` }}
                >
                    <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] mb-6">
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                        <div className="absolute top-6 right-6 bg-white/10 backdrop-blur-2xl border border-white/10 rounded-full p-3 text-white hover:bg-pudava-primary transition-colors">
                            <Heart size={16} />
                        </div>
                    </div>
                    <div className="px-3">
                        <span className="text-[9px] text-pudava-primary font-black uppercase tracking-[0.3em] mb-2 block">{product.category}</span>
                        <div className="flex justify-between items-end">
                            <h3 className="font-serif text-3xl leading-tight group-hover:text-pudava-primary transition-colors">{product.name}</h3>
                        </div>
                        <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center">
                            <span className="text-xs text-gray-500">Retail Value</span>
                            <span className="font-serif text-2xl">₹{product.price.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            ))}
         </div>
      </section>
    </div>
  );
};
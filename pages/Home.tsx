import React, { useEffect, useState, useMemo } from 'react';
import { GlassCard } from '../components/GlassCard';
import { Button } from '../components/Button';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, Heart, Star, ChevronRight, Truck, Shield, Repeat, Clock } from 'lucide-react';
import { getFeaturedProducts, getNewArrivals, getActiveBanners } from '../services/firebase';
import { Product, Banner } from '../types';
import { useAuth } from '../context/AuthContext';
import { addToWishlist, removeFromWishlist, isInWishlist } from '../services/firebase';

// Floating animated particles — layered for depth
const FloatingParticles: React.FC = () => {
  const particles = useMemo(() =>
    Array.from({ length: 24 }, (_, i) => {
      const layer = i < 8 ? 'far' : i < 18 ? 'mid' : 'near';
      const baseSize = layer === 'far' ? 2 : layer === 'mid' ? 3.5 : 5;
      const sizeVariance = layer === 'far' ? 1 : layer === 'mid' ? 2 : 3;
      const size = baseSize + Math.random() * sizeVariance;
      const colors = ['#ec4899', '#a855f7', '#d946ef', '#f472b6', '#c084fc'];
      return {
        id: i,
        size,
        x: Math.random() * 100,
        y: Math.random() * 100,
        // Slower = further away, creates parallax feel
        duration: layer === 'far' ? 35 + Math.random() * 20 : layer === 'mid' ? 22 + Math.random() * 12 : 14 + Math.random() * 8,
        delay: Math.random() * -30,
        opacity: layer === 'far' ? 0.08 + Math.random() * 0.06 : layer === 'mid' ? 0.12 + Math.random() * 0.1 : 0.15 + Math.random() * 0.15,
        color: colors[i % colors.length],
        blur: layer === 'far' ? 2 : layer === 'mid' ? 1 : 0,
        animName: `particleDrift${(i % 4) + 1}`,
        // Subtle pulsing for sparkle effect
        pulseSpeed: 3 + Math.random() * 4,
      };
    }), []
  );

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 1 }}>
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute rounded-full"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            top: `${p.y}%`,
            background: p.color,
            boxShadow: `0 0 ${p.size * 2}px ${p.color}40`,
            opacity: p.opacity,
            animation: `${p.animName} ${p.duration}s cubic-bezier(0.37, 0, 0.63, 1) ${p.delay}s infinite, particlePulse ${p.pulseSpeed}s ease-in-out infinite`,
            filter: `blur(${p.blur}px)`,
            willChange: 'transform, opacity',
          }}
        />
      ))}
    </div>
  );
};

// Animated gradient orbs — large ambient light sources
const GradientOrbs: React.FC = () => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
    {/* Primary warm orb — top left drift */}
    <div className="absolute w-[45vw] h-[45vw] max-w-[700px] max-h-[700px] rounded-full"
      style={{
        top: '-10%', left: '-8%',
        background: 'radial-gradient(circle at 40% 40%, rgba(236, 72, 153, 0.12), rgba(236, 72, 153, 0.04) 50%, transparent 70%)',
        animation: 'orbDrift1 30s cubic-bezier(0.37, 0, 0.63, 1) infinite',
        willChange: 'transform',
      }}
    />
    {/* Secondary cool orb — bottom right */}
    <div className="absolute w-[40vw] h-[40vw] max-w-[600px] max-h-[600px] rounded-full"
      style={{
        bottom: '-5%', right: '-5%',
        background: 'radial-gradient(circle at 60% 60%, rgba(168, 85, 247, 0.10), rgba(168, 85, 247, 0.03) 50%, transparent 70%)',
        animation: 'orbDrift2 36s cubic-bezier(0.37, 0, 0.63, 1) infinite',
        willChange: 'transform',
      }}
    />
    {/* Accent orb — center wanderer */}
    <div className="absolute w-[35vw] h-[35vw] max-w-[550px] max-h-[550px] rounded-full"
      style={{
        top: '30%', left: '40%',
        background: 'radial-gradient(circle at 50% 50%, rgba(217, 70, 239, 0.07), rgba(217, 70, 239, 0.02) 50%, transparent 70%)',
        animation: 'orbDrift3 25s cubic-bezier(0.37, 0, 0.63, 1) infinite',
        willChange: 'transform',
      }}
    />
    {/* Subtle warm fill — very slow breathing */}
    <div className="absolute w-[50vw] h-[50vw] max-w-[800px] max-h-[800px] rounded-full"
      style={{
        top: '50%', left: '20%',
        background: 'radial-gradient(circle, rgba(244, 114, 182, 0.04), transparent 60%)',
        animation: 'orbBreath 20s ease-in-out infinite',
        willChange: 'transform, opacity',
      }}
    />
  </div>
);

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchData = async () => {
      const [featured, arrivals, activeBanners] = await Promise.all([
        getFeaturedProducts(6),
        getNewArrivals(4),
        getActiveBanners(),
      ]);
      setBestSellers(featured);
      setNewArrivals(arrivals);
      setBanners(activeBanners);
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!user) return;
    const checkWishlist = async () => {
      const ids = new Set<string>();
      for (const p of [...bestSellers, ...newArrivals]) {
        if (await isInWishlist(user.uid, p.id)) ids.add(p.id);
      }
      setWishlistIds(ids);
    };
    if (bestSellers.length || newArrivals.length) checkWishlist();
  }, [user, bestSellers, newArrivals]);

  const toggleWishlist = async (e: React.MouseEvent, productId: string) => {
    e.stopPropagation();
    if (!user) { navigate('/login'); return; }
    if (wishlistIds.has(productId)) {
      await removeFromWishlist(user.uid, productId);
      setWishlistIds(prev => { const s = new Set(prev); s.delete(productId); return s; });
    } else {
      const product = [...bestSellers, ...newArrivals].find(p => p.id === productId);
      if (product) {
        await addToWishlist(user.uid, product.id);
        setWishlistIds(prev => new Set(prev).add(productId));
      }
    }
  };

  return (
    <div className="pb-24 md:pb-32 relative">
      {/* Global animated background */}
      <FloatingParticles />
      <GradientOrbs />

      {/* Cinematic Hero */}
      <section className="relative h-[85vh] md:h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[#05010d]/60 z-10 backdrop-blur-[2px]"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#05010d] z-20"></div>
          {/* Animated shimmer streaks over hero */}
          <div className="absolute inset-0 z-[15] pointer-events-none overflow-hidden">
            {/* Diagonal light sweep — primary */}
            <div className="absolute w-[250%] h-[1px] top-[35%] -left-[75%]"
              style={{
                background: 'linear-gradient(90deg, transparent 0%, transparent 40%, rgba(236,72,153,0.15) 48%, rgba(236,72,153,0.25) 50%, rgba(236,72,153,0.15) 52%, transparent 60%, transparent 100%)',
                animation: 'shimmerSweep 10s cubic-bezier(0.25, 0.1, 0.25, 1) infinite',
                transform: 'rotate(-8deg)',
              }} />
            {/* Diagonal light sweep — secondary */}
            <div className="absolute w-[250%] h-[1px] top-[62%] -left-[75%]"
              style={{
                background: 'linear-gradient(90deg, transparent 0%, transparent 40%, rgba(168,85,247,0.12) 48%, rgba(168,85,247,0.20) 50%, rgba(168,85,247,0.12) 52%, transparent 60%, transparent 100%)',
                animation: 'shimmerSweep 14s cubic-bezier(0.25, 0.1, 0.25, 1) 4s infinite',
                transform: 'rotate(-5deg)',
              }} />
            {/* Vertical soft beam */}
            <div className="absolute w-[1px] h-[250%] left-[30%] -top-[75%]"
              style={{
                background: 'linear-gradient(180deg, transparent 0%, transparent 42%, rgba(217,70,239,0.08) 48%, rgba(217,70,239,0.14) 50%, rgba(217,70,239,0.08) 52%, transparent 58%, transparent 100%)',
                animation: 'shimmerSweepV 18s cubic-bezier(0.25, 0.1, 0.25, 1) 2s infinite',
              }} />
            {/* Wide atmospheric glow sweep */}
            <div className="absolute w-[200%] h-[80px] top-[45%] -left-[50%] opacity-[0.03]"
              style={{
                background: 'linear-gradient(90deg, transparent 0%, transparent 35%, rgba(244,114,182,0.8) 50%, transparent 65%, transparent 100%)',
                animation: 'shimmerSweep 16s cubic-bezier(0.25, 0.1, 0.25, 1) 7s infinite',
                filter: 'blur(30px)',
              }} />
          </div>
          <img
            src="https://images.unsplash.com/photo-1583391733958-e026b143f282?q=80&w=1920&auto=format&fit=crop"
            className="w-full h-full object-cover animate-float-slow scale-110"
            alt=""
          />
        </div>

        <div className="relative z-30 text-center px-5 md:px-4 max-w-5xl mx-auto flex flex-col items-center gap-5 md:gap-8 animate-fade-in-blur">
          <div className="inline-flex items-center gap-2 md:gap-3 px-4 md:px-6 py-1.5 md:py-2 border border-white/10 rounded-full text-[10px] md:text-xs tracking-[0.3em] md:tracking-[0.4em] uppercase text-pudava-primary font-bold backdrop-blur-2xl bg-white/5 shadow-2xl">
            <Sparkles size={12} className="animate-pulse" /> Royal Orchid Edition
          </div>
          <h1 className="text-5xl md:text-9xl font-serif font-bold leading-[0.95] text-white tracking-tighter">
            Royal <br />
            <span className="orchid-text-gradient italic">Reflections</span>
          </h1>
          <p className="text-sm md:text-xl text-gray-400 max-w-md md:max-w-2xl font-light leading-relaxed tracking-wide">
            A sanctuary of hand-woven masterpieces where timeless heritage meets modern silhouettes.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 md:gap-6 w-full sm:w-auto mt-2 md:mt-4">
            <Button variant="orchid" onClick={() => navigate('/catalog')} className="px-8 md:px-12 h-12 md:h-14 text-sm btn-press">The Collection</Button>
            <Button variant="secondary" onClick={() => navigate('/about')} className="px-8 md:px-12 h-12 md:h-14 text-sm btn-press">Our Story</Button>
          </div>
        </div>

        {/* Floating scroll indicator - hidden on mobile */}
        <div className="hidden md:flex absolute bottom-12 left-1/2 -translate-x-1/2 flex-col items-center gap-4 opacity-30">
          <span className="text-[8px] uppercase tracking-[0.4em]">Scroll</span>
          <div className="w-px h-16 bg-gradient-to-b from-white to-transparent"></div>
        </div>
      </section>

      {/* Promotional Banners */}
      {banners.length > 0 && (
        <section className="container mx-auto px-4 md:px-6 py-6 md:py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
            {banners.slice(0, 2).map((banner) => (
              <div
                key={banner.id}
                className="relative overflow-hidden rounded-2xl md:rounded-3xl cursor-pointer group h-32 md:h-48 border border-white/5"
                onClick={() => banner.link && navigate(banner.link)}
              >
                <img src={banner.image} alt={banner.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#05010d]/80 to-transparent"></div>
                <div className="absolute bottom-4 left-4 md:bottom-6 md:left-8">
                  <h3 className="text-lg md:text-2xl font-serif text-white">{banner.title}</h3>
                  {banner.subtitle && <p className="text-xs text-gray-300 mt-1">{banner.subtitle}</p>}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Featured Categories */}
      <section className="container mx-auto px-4 md:px-6 py-12 md:py-32">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 md:mb-20 gap-4 md:gap-8">
          <div className="reveal-container">
            <span className="text-pudava-primary font-black tracking-[0.2em] md:tracking-[0.3em] uppercase text-[10px] md:text-xs mb-1 md:mb-2 block">Curation</span>
            <h2 className="text-3xl md:text-6xl font-serif leading-none">Curated Realms</h2>
          </div>
          <Button variant="ghost" onClick={() => navigate('/catalog')} className="border border-white/5 bg-white/5 px-6 md:px-8 h-10 md:h-auto text-xs btn-press">Explore <ArrowRight size={14} /></Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-12 gap-3 md:gap-8 md:h-[700px] stagger-in">
          <div
            className="col-span-2 md:col-span-8 relative group overflow-hidden rounded-2xl md:rounded-[2.5rem] cursor-pointer h-[200px] md:h-full border border-white/5 shadow-2xl card-glow"
            onClick={() => navigate('/catalog?filter=Women')}
          >
            <img src="https://images.unsplash.com/photo-1610030469983-98e55041d04f?q=80&w=1200" className="w-full h-full object-cover parallax-img" alt="Women" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#05010d] via-transparent to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-700"></div>
            <div className="absolute bottom-4 left-4 md:bottom-12 md:left-12">
              <div className="flex items-center gap-2 md:gap-3 mb-1 md:mb-3">
                <div className="w-4 md:w-8 h-[1px] bg-pudava-primary"></div>
                <span className="text-[10px] md:text-xs tracking-[0.2em] md:tracking-[0.3em] uppercase text-pudava-primary font-black">Empress Series</span>
              </div>
              <h3 className="text-2xl md:text-6xl font-serif text-white">Women</h3>
            </div>
          </div>

          <div className="col-span-1 md:col-span-4 flex flex-col gap-3 md:gap-8">
            <div
              className="flex-1 relative group overflow-hidden rounded-2xl md:rounded-[2.5rem] cursor-pointer border border-white/5 shadow-xl card-glow min-h-[140px]"
              onClick={() => navigate('/catalog?filter=Men')}
            >
              <img src="https://images.unsplash.com/photo-1597983073493-88cd357a28e0?q=80&w=800" className="w-full h-full object-cover parallax-img" alt="Men" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#05010d] via-transparent to-transparent opacity-70"></div>
              <div className="absolute bottom-3 left-3 md:bottom-10 md:left-10">
                <h3 className="text-lg md:text-3xl font-serif text-white">Royal Gent</h3>
              </div>
            </div>
            <div
              className="flex-1 relative group overflow-hidden rounded-2xl md:rounded-[2.5rem] cursor-pointer border border-white/5 shadow-xl card-glow min-h-[140px]"
              onClick={() => navigate('/catalog?filter=Kids')}
            >
              <img src="https://images.unsplash.com/photo-1627885732159-4c8d28cb1745?q=80&w=800" className="w-full h-full object-cover parallax-img" alt="Kids" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#05010d] via-transparent to-transparent opacity-70"></div>
              <div className="absolute bottom-3 left-3 md:bottom-10 md:left-10">
                <h3 className="text-lg md:text-3xl font-serif text-white">Youthful Essence</h3>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modern Marquee — auto-scrolling */}
      <div className="w-full py-6 md:py-12 overflow-hidden border-y border-white/5 backdrop-blur-3xl bg-white/[0.02] relative">
        <div className="flex gap-12 md:gap-24 whitespace-nowrap animate-marquee">
          {["Artisan Silk", "Hand-Embroidered", "Midnight Velvet", "Sustainable Luxe", "Ethically Sourced", "Artisan Silk", "Hand-Embroidered", "Midnight Velvet", "Sustainable Luxe", "Ethically Sourced"].map((item, i) => (
            <div key={i} className="flex items-center gap-3 md:gap-6 text-pudava-primary/60 uppercase tracking-[0.3em] md:tracking-[0.5em] text-[10px] md:text-xs font-black italic flex-shrink-0">
              <Sparkles size={12} className="text-pudava-primary animate-pulse" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Best Sellers */}
      <section className="container mx-auto px-4 md:px-6 py-12 md:py-32">
        <div className="flex items-center gap-4 md:gap-6 mb-8 md:mb-16">
          <h2 className="text-2xl md:text-4xl font-serif">Aura Selection</h2>
          <div className="h-px flex-1 bg-gradient-to-r from-pudava-primary/30 to-transparent"></div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-12 stagger-in">
          {bestSellers.slice(0, 3).map((product, idx) => (
            <div
              key={product.id}
              className="group cursor-pointer flex flex-col bg-white/[0.02] p-3 md:p-5 rounded-xl md:rounded-[2.5rem] border border-white/5 hover:border-pudava-primary/30 transition-all duration-500 card-glow"
              onClick={() => navigate(`/product/${product.id}`)}
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              <div className="relative aspect-[4/5] overflow-hidden rounded-lg md:rounded-[2rem] mb-3 md:mb-6">
                <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                {product.isBestSeller && (
                  <div className="absolute top-3 left-3 bg-pudava-primary/90 backdrop-blur-sm text-white text-[10px] md:text-xs font-bold px-2.5 py-1 rounded-full">Best Seller</div>
                )}
                <button
                  onClick={(e) => toggleWishlist(e, product.id)}
                  className={`absolute top-3 right-3 md:top-6 md:right-6 backdrop-blur-2xl border border-white/10 rounded-full w-10 h-10 md:w-12 md:h-12 flex items-center justify-center transition-colors btn-press ${wishlistIds.has(product.id) ? 'bg-pudava-primary text-white' : 'bg-white/10 text-white hover:bg-pudava-primary'}`}
                >
                  <Heart size={18} fill={wishlistIds.has(product.id) ? 'currentColor' : 'none'} />
                </button>
                {product.originalPrice && product.originalPrice > product.price && (
                  <div className="absolute top-3 left-3 md:top-6 md:left-6 bg-green-500/90 text-white text-[10px] md:text-xs font-bold px-2.5 py-1 rounded-full">
                    {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                  </div>
                )}
              </div>
              <div className="px-1 md:px-3">
                <span className="text-[10px] md:text-xs text-pudava-primary font-black uppercase tracking-[0.15em] md:tracking-[0.2em] mb-1 md:mb-2 block">{product.category}</span>
                <div className="flex justify-between items-end">
                  <h3 className="font-serif text-base md:text-3xl leading-tight group-hover:text-pudava-primary transition-colors line-clamp-1">{product.name}</h3>
                </div>
                {product.averageRating > 0 && (
                  <div className="flex items-center gap-1 mt-1">
                    <Star size={12} className="text-yellow-400 fill-yellow-400" />
                    <span className="text-xs text-gray-400">{product.averageRating.toFixed(1)}</span>
                  </div>
                )}
                <div className="mt-2 md:mt-4 pt-2 md:pt-4 border-t border-white/5 flex justify-between items-center">
                  {product.originalPrice && product.originalPrice > product.price ? (
                    <div className="flex items-center gap-2">
                      <span className="font-serif text-sm md:text-2xl">₹{product.price.toLocaleString()}</span>
                      <span className="text-[10px] md:text-xs text-gray-500 line-through">₹{product.originalPrice.toLocaleString()}</span>
                    </div>
                  ) : (
                    <span className="font-serif text-sm md:text-2xl">₹{product.price.toLocaleString()}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-8 md:mt-12">
          <Button variant="ghost" onClick={() => navigate('/catalog')} className="border border-white/10 px-8 h-12 text-xs btn-press">
            View All Products <ArrowRight size={14} />
          </Button>
        </div>
      </section>

      {/* New Arrivals */}
      {newArrivals.length > 0 && (
        <section className="container mx-auto px-4 md:px-6 py-8 md:py-20">
          <div className="flex justify-between items-center mb-6 md:mb-12">
            <div>
              <span className="text-pudava-secondary font-black tracking-[0.2em] uppercase text-[10px] md:text-xs mb-1 block">Just Arrived</span>
              <h2 className="text-2xl md:text-4xl font-serif">New Arrivals</h2>
            </div>
            <Button variant="ghost" onClick={() => navigate('/catalog?sort=newest')} className="text-xs border border-white/5 bg-white/5 px-4 h-9 btn-press">
              See All <ChevronRight size={14} />
            </Button>
          </div>

          <div className="flex gap-3 md:gap-6 overflow-x-auto no-scrollbar pb-4">
            {newArrivals.map((product) => (
              <div
                key={product.id}
                className="flex-shrink-0 w-[160px] md:w-[280px] cursor-pointer group"
                onClick={() => navigate(`/product/${product.id}`)}
              >
                <div className="relative aspect-[3/4] overflow-hidden rounded-xl md:rounded-2xl mb-3 border border-white/5">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-2 left-2 bg-pudava-secondary/90 text-black text-[8px] font-bold px-2 py-0.5 rounded-full">NEW</div>
                  <button
                    onClick={(e) => toggleWishlist(e, product.id)}
                    className={`absolute top-2 right-2 backdrop-blur-xl rounded-full w-9 h-9 flex items-center justify-center transition-colors ${wishlistIds.has(product.id) ? 'bg-pudava-primary text-white' : 'bg-black/40 text-white'}`}
                  >
                    <Heart size={16} fill={wishlistIds.has(product.id) ? 'currentColor' : 'none'} />
                  </button>
                </div>
                <h4 className="text-sm md:text-base font-medium line-clamp-1 group-hover:text-pudava-primary transition-colors">{product.name}</h4>
                <span className="text-xs md:text-sm text-gray-400">₹{product.price.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Trust Badges */}
      <section className="container mx-auto px-4 md:px-6 py-8 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
          {[
            { icon: Truck, label: "Free Shipping", desc: "On orders above ₹999" },
            { icon: Shield, label: "Authentic", desc: "100% genuine products" },
            { icon: Repeat, label: "Easy Returns", desc: "7-day return policy" },
            { icon: Clock, label: "Fast Delivery", desc: "3-5 business days" },
          ].map(({ icon: Icon, label, desc }, i) => (
            <div key={i} className="flex flex-col items-center text-center p-4 md:p-6 rounded-2xl border border-white/5 bg-white/[0.02]">
              <Icon size={24} className="text-pudava-primary mb-2 md:mb-3" strokeWidth={1.5} />
              <span className="text-xs md:text-sm font-semibold text-white">{label}</span>
              <span className="text-xs text-gray-400 mt-0.5">{desc}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
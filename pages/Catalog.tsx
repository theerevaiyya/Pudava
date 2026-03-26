import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db, seedProductsIfEmpty, addToWishlist, removeFromWishlist, isInWishlist } from '../services/firebase';
import { Product } from '../types';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Edit2, X, Heart, Star, SlidersHorizontal, ArrowUpDown, ChevronDown } from 'lucide-react';
import { Button } from '../components/Button';

type SortOption = 'default' | 'price-low' | 'price-high' | 'newest' | 'rating';

export const Catalog: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchParams, setSearchParams] = useSearchParams();
    const filterParam = searchParams.get('filter');
    const searchParam = searchParams.get('search');
    const sortParam = searchParams.get('sort');

    const [filter, setFilter] = useState<'All' | 'Men' | 'Women' | 'Kids'>(filterParam as any || 'All');
    const [sortBy, setSortBy] = useState<SortOption>((sortParam as SortOption) || 'default');
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000]);
    const [showFilters, setShowFilters] = useState(false);
    const [showSort, setShowSort] = useState(false);
    const [seeding, setSeeding] = useState(false);
    const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());

    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (filterParam) setFilter(filterParam as any);
        else setFilter('All');
    }, [filterParam]);

    const fetchProducts = async () => {
        setLoading(true);
        seedProductsIfEmpty().catch(() => {});
        try {
            const snapshot = await getDocs(collection(db, 'products'));
            const fetched: Product[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
            setProducts(fetched);
        } catch (err) {
            console.error("Failed to fetch products", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchProducts(); }, []);

    useEffect(() => {
        if (!user || products.length === 0) return;
        const check = async () => {
            const ids = new Set<string>();
            for (const p of products) {
                if (await isInWishlist(user.uid, p.id)) ids.add(p.id);
            }
            setWishlistIds(ids);
        };
        check();
    }, [user, products]);

    // Filter & Sort Logic
    useEffect(() => {
        let result = products;

        if (filter !== 'All') {
            result = result.filter(p => p.category === filter);
        }

        if (searchParam) {
            const lowerQuery = searchParam.toLowerCase();
            result = result.filter(p =>
                p.name.toLowerCase().includes(lowerQuery) ||
                p.description.toLowerCase().includes(lowerQuery) ||
                (p.tags && p.tags.some(t => t.toLowerCase().includes(lowerQuery)))
            );
        }

        result = result.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

        switch (sortBy) {
            case 'price-low': result = [...result].sort((a, b) => a.price - b.price); break;
            case 'price-high': result = [...result].sort((a, b) => b.price - a.price); break;
            case 'newest': result = [...result].sort((a, b) => (b.isNewArrival ? 1 : 0) - (a.isNewArrival ? 1 : 0)); break;
            case 'rating': result = [...result].sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0)); break;
        }

        setFilteredProducts(result);
    }, [products, filter, searchParam, sortBy, priceRange]);

    const handleFilterChange = (newFilter: any) => {
        setFilter(newFilter);
        const newParams: any = {};
        if (newFilter !== 'All') newParams.filter = newFilter;
        if (searchParam) newParams.search = searchParam;
        if (sortBy !== 'default') newParams.sort = sortBy;
        setSearchParams(newParams);
    };

    const clearSearch = () => {
        const newParams: any = {};
        if (filter !== 'All') newParams.filter = filter;
        setSearchParams(newParams);
    };

    const toggleWishlist = async (e: React.MouseEvent, product: Product) => {
        e.stopPropagation();
        if (!user) { navigate('/login'); return; }
        if (wishlistIds.has(product.id)) {
            await removeFromWishlist(user.uid, product.id);
            setWishlistIds(prev => { const s = new Set(prev); s.delete(product.id); return s; });
        } else {
            await addToWishlist(user.uid, product.id);
            setWishlistIds(prev => new Set(prev).add(product.id));
        }
    };

    const handleManualSeed = async () => {
        setSeeding(true);
        try {
            const result = await seedProductsIfEmpty();
            if (result) {
                setTimeout(() => window.location.reload(), 1500);
            } else {
                alert("Database already has data or permission was denied.");
            }
        } catch {
            alert("Failed to seed data. Ensure you are logged in.");
        } finally {
            setSeeding(false);
        }
    };

    const sortOptions: { value: SortOption; label: string }[] = [
        { value: 'default', label: 'Default' },
        { value: 'price-low', label: 'Price: Low to High' },
        { value: 'price-high', label: 'Price: High to Low' },
        { value: 'newest', label: 'Newest First' },
        { value: 'rating', label: 'Top Rated' },
    ];

    return (
        <div className="min-h-screen pt-14 md:pt-16 pb-20 container mx-auto px-3 md:px-6 page-enter">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-4 md:mb-8 gap-3 md:gap-4">
                <div className="flex flex-col gap-0.5 md:gap-1">
                    <h1 className="text-2xl md:text-3xl font-serif">
                        {searchParam ? `Search: "${searchParam}"` : 'Collection'}
                    </h1>
                    {searchParam ? (
                        <button onClick={clearSearch} className="text-xs md:text-sm text-pudava-secondary flex items-center gap-1 hover:text-white btn-press">
                            <X size={12} /> Clear Search
                        </button>
                    ) : (
                        <p className="text-gray-400 text-xs md:text-sm">{filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}</p>
                    )}
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                    <div className="glass-panel p-1 rounded-full flex gap-0.5 md:gap-1 overflow-x-auto max-w-full no-scrollbar flex-1 md:flex-none">
                        {['All', 'Women', 'Men', 'Kids'].map((cat) => (
                            <button
                                key={cat}
                                onClick={() => handleFilterChange(cat)}
                                className={`px-4 md:px-5 py-2 md:py-2 rounded-full text-xs font-bold tracking-wider transition-all duration-300 whitespace-nowrap uppercase ${filter === cat
                                        ? 'bg-white text-black shadow-lg scale-105'
                                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Sort & Filter Bar */}
            <div className="flex items-center gap-2 mb-4 md:mb-6">
                <div className="relative">
                    <button
                        onClick={() => { setShowSort(!showSort); setShowFilters(false); }}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs text-gray-300 hover:text-white transition-colors"
                    >
                        <ArrowUpDown size={12} />
                        <span className="hidden sm:inline">{sortOptions.find(s => s.value === sortBy)?.label || 'Sort'}</span>
                        <span className="sm:hidden">Sort</span>
                        <ChevronDown size={10} />
                    </button>
                    {showSort && (
                        <div className="absolute top-full left-0 mt-1 z-30 bg-pudava-surface border border-white/10 rounded-xl overflow-hidden shadow-2xl min-w-[200px] max-w-[calc(100vw-2rem)]">
                            {sortOptions.map(opt => (
                                <button
                                    key={opt.value}
                                    onClick={() => { setSortBy(opt.value); setShowSort(false); }}
                                    className={`w-full text-left px-4 py-3 text-sm transition-colors ${sortBy === opt.value ? 'bg-pudava-primary/20 text-pudava-primary' : 'text-gray-300 hover:bg-white/5'}`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="relative">
                    <button
                        onClick={() => { setShowFilters(!showFilters); setShowSort(false); }}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs text-gray-300 hover:text-white transition-colors"
                    >
                        <SlidersHorizontal size={12} />
                        <span>Price</span>
                        {(priceRange[0] > 0 || priceRange[1] < 50000) && (
                            <span className="w-1.5 h-1.5 rounded-full bg-pudava-primary"></span>
                        )}
                    </button>
                    {showFilters && (
                        <div className="absolute top-full left-0 mt-1 z-30 bg-pudava-surface border border-white/10 rounded-xl p-4 shadow-2xl min-w-[260px] max-w-[calc(100vw-2rem)]">
                            <p className="text-sm text-gray-400 mb-3">Price Range</p>
                            <div className="flex items-center gap-2 mb-3">
                                <input
                                    type="number"
                                    value={priceRange[0]}
                                    onChange={e => setPriceRange([Number(e.target.value), priceRange[1]])}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white"
                                    placeholder="Min"
                                    min={0}
                                />
                                <span className="text-gray-500 text-xs">to</span>
                                <input
                                    type="number"
                                    value={priceRange[1]}
                                    onChange={e => setPriceRange([priceRange[0], Number(e.target.value)])}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white"
                                    placeholder="Max"
                                    min={0}
                                />
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => { setPriceRange([0, 50000]); setShowFilters(false); }}
                                    className="flex-1 text-xs py-1.5 rounded-lg border border-white/10 text-gray-400 hover:text-white"
                                >
                                    Reset
                                </button>
                                <button
                                    onClick={() => setShowFilters(false)}
                                    className="flex-1 text-xs py-1.5 rounded-lg bg-pudava-primary text-white"
                                >
                                    Apply
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Close dropdown on outside click */}
            {(showSort || showFilters) && (
                <div className="fixed inset-0 z-20" onClick={() => { setShowSort(false); setShowFilters(false); }}></div>
            )}

            {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 md:gap-4">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                        <div key={i} className="aspect-[3/4] bg-white/5 rounded-lg md:rounded-xl animate-pulse"></div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 md:gap-6 stagger-in">
                    {filteredProducts.map((product) => (
                        <div key={product.id} className="group flex flex-col gap-2 md:gap-3 cursor-pointer" onClick={() => navigate(`/product/${product.id}`)}>
                            <div className="relative aspect-[3/4] overflow-hidden rounded-lg md:rounded-xl bg-white/5 card-glow">
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    loading="lazy"
                                />

                                {/* Badges */}
                                <div className="absolute top-2 left-2 flex flex-col gap-1">
                                    {product.originalPrice && product.originalPrice > product.price && (
                                        <span className="bg-green-500/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                            {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                                        </span>
                                    )}
                                    {product.isNewArrival && (
                                        <span className="bg-pudava-secondary/90 text-black text-[10px] font-bold px-2 py-0.5 rounded-full">NEW</span>
                                    )}
                                    {product.stock !== undefined && product.stock <= 0 && (
                                        <span className="bg-red-500/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">SOLD OUT</span>
                                    )}
                                </div>

                                {/* Wishlist */}
                                <button
                                    onClick={(e) => toggleWishlist(e, product)}
                                    className={`absolute top-2 right-2 w-10 h-10 backdrop-blur-md rounded-full flex items-center justify-center transition-all btn-press ${wishlistIds.has(product.id) ? 'bg-pudava-primary text-white' : 'bg-black/40 text-white hover:bg-pudava-primary/70'}`}
                                >
                                    <Heart size={16} fill={wishlistIds.has(product.id) ? 'currentColor' : 'none'} />
                                </button>

                                {(user?.role === 'admin' || user?.role === 'manager') && (
                                    <div className="absolute bottom-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="p-1.5 md:p-2 bg-black/60 backdrop-blur-md rounded-full text-white hover:bg-white hover:text-black transition-colors btn-press" onClick={(e) => { e.stopPropagation(); alert('Edit clicked'); }}>
                                            <Edit2 size={10} />
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div>
                                <h3 className="text-sm md:text-base font-medium leading-tight group-hover:text-pudava-secondary transition-colors line-clamp-1">
                                    {product.name}
                                </h3>
                                <div className="flex justify-between items-center mt-1">
                                    <p className="text-[10px] md:text-xs text-gray-500 uppercase tracking-widest">{product.category}</p>
                                    <div className="flex items-center gap-1.5">
                                        {product.originalPrice && product.originalPrice > product.price && (
                                            <span className="text-xs text-gray-500 line-through">₹{product.originalPrice.toLocaleString()}</span>
                                        )}
                                        <span className="text-sm font-semibold">₹{product.price.toLocaleString()}</span>
                                    </div>
                                </div>
                                {product.averageRating > 0 && (
                                    <div className="flex items-center gap-1 mt-1">
                                        <Star size={11} className="text-yellow-400 fill-yellow-400" />
                                        <span className="text-xs text-gray-400">{product.averageRating.toFixed(1)} ({product.reviewCount})</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {!loading && filteredProducts.length === 0 && (
                <div className="text-center py-20 flex flex-col items-center gap-4">
                    <p className="text-lg text-gray-500">No products found.</p>
                    {products.length === 0 && (
                        <div className="flex flex-col items-center gap-2">
                            <Button onClick={handleManualSeed} variant="outline" disabled={seeding} className="text-sm py-2 px-4">
                                {seeding ? 'Initializing...' : 'Initialize Test Data'}
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
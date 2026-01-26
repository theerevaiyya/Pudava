import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db, seedProductsIfEmpty } from '../services/firebase';
import { Product } from '../types';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Edit2, X } from 'lucide-react';
import { Button } from '../components/Button';

export const Catalog: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchParams, setSearchParams] = useSearchParams();
    const filterParam = searchParams.get('filter');
    const searchParam = searchParams.get('search');

    const [filter, setFilter] = useState<'All' | 'Men' | 'Women' | 'Kids'>(filterParam as any || 'All');
    const [seeding, setSeeding] = useState(false);

    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (filterParam) setFilter(filterParam as any);
        else setFilter('All');
    }, [filterParam]);

    const fetchProducts = async () => {
        setLoading(true);
        // Attempt seed non-blocking
        seedProductsIfEmpty().catch(err => console.log("Auto-seed skipped/failed"));

        try {
            const productsRef = collection(db, 'products');
            // Fetch all for client-side search filtering (efficient for small catalogs)
            const snapshot = await getDocs(productsRef);
            const fetched: Product[] = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Product));
            setProducts(fetched);
        } catch (err) {
            console.error("Failed to fetch products", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    // Filter Logic
    useEffect(() => {
        let result = products;

        // 1. Category Filter
        if (filter !== 'All') {
            result = result.filter(p => p.category === filter);
        }

        // 2. Search Filter
        if (searchParam) {
            const lowerQuery = searchParam.toLowerCase();
            result = result.filter(p =>
                p.name.toLowerCase().includes(lowerQuery) ||
                p.description.toLowerCase().includes(lowerQuery)
            );
        }

        setFilteredProducts(result);
    }, [products, filter, searchParam]);

    const handleFilterChange = (newFilter: any) => {
        setFilter(newFilter);
        const newParams: any = {};
        if (newFilter !== 'All') newParams.filter = newFilter;
        if (searchParam) newParams.search = searchParam; // Keep search active
        setSearchParams(newParams);
    };

    const clearSearch = () => {
        const newParams: any = {};
        if (filter !== 'All') newParams.filter = filter;
        setSearchParams(newParams);
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
        } catch (e) {
            alert("Failed to seed data. Ensure you are logged in.");
        } finally {
            setSeeding(false);
        }
    }

    return (
        <div className="min-h-screen pt-16 md:pt-20 pb-24 container mx-auto px-3 md:px-6 page-enter">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 md:mb-8 gap-3 md:gap-4">
                <div className="flex flex-col gap-0.5 md:gap-1">
                    <h1 className="text-2xl md:text-3xl font-serif">
                        {searchParam ? `Search: "${searchParam}"` : 'Collection'}
                    </h1>
                    {searchParam ? (
                        <button onClick={clearSearch} className="text-xs md:text-sm text-pudava-secondary flex items-center gap-1 hover:text-white btn-press">
                            <X size={12} /> Clear Search
                        </button>
                    ) : (
                        <p className="text-gray-400 text-xs md:text-sm">Find your perfect style.</p>
                    )}
                </div>

                <div className="glass-panel p-1 rounded-full flex gap-0.5 md:gap-1 overflow-x-auto max-w-full no-scrollbar">
                    {['All', 'Women', 'Men', 'Kids'].map((cat) => (
                        <button
                            key={cat}
                            onClick={() => handleFilterChange(cat)}
                            className={`px-3 md:px-4 py-1 md:py-1.5 rounded-full text-[10px] md:text-xs font-bold tracking-wider transition-all duration-300 whitespace-nowrap uppercase ${filter === cat
                                    ? 'bg-white text-black shadow-lg scale-105'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

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
                                {(user?.role === 'admin' || user?.role === 'manager') && (
                                    <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="p-1.5 md:p-2 bg-black/60 backdrop-blur-md rounded-full text-white hover:bg-white hover:text-black transition-colors btn-press" onClick={(e) => { e.stopPropagation(); alert('Edit clicked') }}>
                                            <Edit2 size={10} />
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div>
                                <h3 className="text-xs md:text-base font-medium leading-tight group-hover:text-pudava-secondary transition-colors line-clamp-1">
                                    {product.name}
                                </h3>
                                <div className="flex justify-between items-center mt-0.5">
                                    <p className="text-[8px] md:text-[10px] text-gray-500 uppercase tracking-widest">{product.category}</p>
                                    <span className="text-xs md:text-sm font-semibold">₹{product.price.toLocaleString()}</span>
                                </div>
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
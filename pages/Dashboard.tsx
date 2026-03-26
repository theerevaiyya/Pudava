import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { GlassCard } from '../components/GlassCard';
import { Button } from '../components/Button';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, AreaChart, Area } from 'recharts';
import { Users, DollarSign, Package, TrendingUp, Settings, LogOut, Plus, Edit, Trash, Check, UserCircle, Shield, Briefcase, AlertTriangle, Filter, Lock, Activity, Search, Eye, EyeOff, MoreVertical, ClipboardList, ChevronDown, Truck, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getAllUsers, updateUserRole, deleteUserDocument, getProducts, saveProduct, deleteProduct, getAllOrders, updateOrderStatus } from '../services/firebase';
import { UserProfile, UserRole, Product, Order, OrderStatus } from '../types';
import { ProductForm } from '../components/ProductForm';

const PROTECTED_ADMIN_EMAILS = ['latheeshk@gmail.com', 'latheeshkal202601@gmail.com'];

const AdminOverview = () => {
    const data = [
        { name: 'Mon', sales: 4000, users: 400 },
        { name: 'Tue', sales: 3000, users: 300 },
        { name: 'Wed', sales: 2000, users: 500 },
        { name: 'Thu', sales: 2780, users: 600 },
        { name: 'Fri', sales: 4890, users: 800 },
        { name: 'Sat', sales: 6390, users: 950 },
        { name: 'Sun', sales: 7490, users: 1100 },
    ];
    
    return (
        <div className="space-y-12 animate-fade-in-blur">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                <GlassCard className="p-10 relative overflow-hidden group border-l-[6px] border-l-pudava-primary">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-pudava-primary/10 rounded-full -mr-16 -mt-16 group-hover:bg-pudava-primary/20 transition-all"></div>
                    <div className="flex items-center gap-8">
                        <div className="p-5 bg-pudava-primary/10 rounded-3xl text-pudava-primary group-hover:scale-110 transition-transform">
                            <DollarSign size={32} />
                        </div>
                        <div>
                            <p className="text-gray-500 text-xs uppercase font-bold tracking-[0.2em] mb-1">Gross Revenue</p>
                            <h3 className="text-4xl font-serif">₹18.4L</h3>
                        </div>
                    </div>
                </GlassCard>
                <GlassCard className="p-10 relative overflow-hidden group border-l-[6px] border-l-pudava-secondary">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-pudava-secondary/10 rounded-full -mr-16 -mt-16 group-hover:bg-pudava-secondary/20 transition-all"></div>
                    <div className="flex items-center gap-8">
                        <div className="p-5 bg-pudava-secondary/10 rounded-3xl text-pudava-secondary group-hover:scale-110 transition-transform">
                            <Users size={32} />
                        </div>
                        <div>
                            <p className="text-gray-500 text-xs uppercase font-bold tracking-[0.2em] mb-1">Total Users</p>
                            <h3 className="text-4xl font-serif">1,842</h3>
                        </div>
                    </div>
                </GlassCard>
                <GlassCard className="p-10 relative overflow-hidden group border-l-[6px] border-l-pudava-accent">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-pudava-accent/10 rounded-full -mr-16 -mt-16 group-hover:bg-pudava-accent/20 transition-all"></div>
                    <div className="flex items-center gap-8">
                        <div className="p-5 bg-pudava-accent/10 rounded-3xl text-pudava-accent group-hover:scale-110 transition-transform">
                            <Package size={32} />
                        </div>
                        <div>
                            <p className="text-gray-500 text-xs uppercase font-bold tracking-[0.2em] mb-1">Pending Dispatch</p>
                            <h3 className="text-4xl font-serif">52</h3>
                        </div>
                    </div>
                </GlassCard>
            </div>

            <GlassCard className="p-12">
                <div className="flex items-center justify-between mb-12">
                    <div>
                        <h3 className="text-3xl font-serif">Sales Overview</h3>
                        <p className="text-xs text-gray-500 mt-2 uppercase tracking-[0.2em] font-bold">7-Day Transaction Cycle</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-pudava-primary"></div>
                            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Revenue</span>
                        </div>
                    </div>
                </div>
                <div style={{ width: '100%', height: 450 }}>
                    <ResponsiveContainer>
                        <AreaChart data={data}>
                            <defs>
                                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#ec4899" stopOpacity={0.4}/>
                                    <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="name" stroke="#222" tick={{fill: '#444', fontSize: 10}} axisLine={false} tickLine={false} dy={10} />
                            <YAxis hide />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#0d041a', borderColor: '#ec4899', borderRadius: '24px', border: '1px solid rgba(236,72,153,0.2)', padding: '15px' }}
                                itemStyle={{ color: '#ec4899', fontSize: '12px', fontWeight: 'bold' }}
                                labelStyle={{ color: '#666', marginBottom: '5px', fontSize: '10px', textTransform: 'uppercase' }}
                                cursor={{stroke: '#ec4899', strokeWidth: 1}}
                            />
                            <Area type="monotone" dataKey="sales" stroke="#ec4899" fillOpacity={1} fill="url(#colorSales)" strokeWidth={4} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </GlassCard>
        </div>
    );
};

const UserManagement = () => {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');

    const fetchUsers = async () => {
        setError(null);
        setLoading(true);
        try {
            const data = await getAllUsers();
            setUsers(data);
        } catch (e: any) {
            console.error("User management fetch error", e);
            setError("Access denied. You don't have permission to view user data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        if (roleFilter === 'all') {
            setFilteredUsers(users);
        } else {
            setFilteredUsers(users.filter(u => u.role === roleFilter));
        }
    }, [users, roleFilter]);

    const handleRoleChange = async (uid: string, email: string | null, newRole: UserRole) => {
        if (email && PROTECTED_ADMIN_EMAILS.includes(email.toLowerCase())) {
            alert("This admin account is protected and cannot be modified.");
            return;
        }
        
        try {
            await updateUserRole(uid, newRole);
            setUsers(prev => prev.map(u => u.uid === uid ? { ...u, role: newRole } : u));
        } catch (e: any) {
            console.error("Failed to update role:", e);
            alert(`Failed to update role: ${e.code || e.message}`);
        }
    };

    const handleDeleteUser = async (uid: string, email: string | null, name: string) => {
        if (email && PROTECTED_ADMIN_EMAILS.includes(email.toLowerCase())) {
            alert("This admin account is protected and cannot be deleted.");
            return;
        }

        if (uid === currentUser?.uid) {
            alert("You cannot delete your own account. Go to Profile to manage your account.");
            return;
        }

        if (!confirm(`Delete user "${name || email || uid}"? This action cannot be undone.`)) return;
        
        try {
            await deleteUserDocument(uid);
            setUsers(prev => prev.filter(u => u.uid !== uid));
        } catch (e: any) {
            console.error("Error deleting user document:", e);
            alert("Failed to delete user. Check console for details.");
        }
    };

    if (loading) return (
        <div className="py-32 text-center flex flex-col items-center gap-8">
            <div className="w-16 h-16 border-[3px] border-pudava-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs font-bold tracking-[0.3em] uppercase text-pudava-primary/60">Loading users...</p>
        </div>
    );

    if (error) return (
        <GlassCard className="p-16 border-l-8 border-l-red-500/50 flex flex-col items-center gap-8 text-center">
            <AlertTriangle className="text-red-500/50" size={64} />
            <div className="space-y-4">
                <h3 className="text-4xl font-serif">Access Denied</h3>
                <p className="text-gray-500 max-w-sm text-sm font-light tracking-wide">{error}</p>
            </div>
            <Button variant="outline" onClick={() => window.location.reload()} className="mt-4 px-12">Retry</Button>
        </GlassCard>
    );

    return (
        <div className="space-y-12 animate-fade-in-blur">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10">
                <div>
                    <h2 className="text-4xl font-serif">Users</h2>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em] mt-2">{filteredUsers.length} Active Records</p>
                </div>
                
                <div className="flex items-center gap-2 bg-white/5 p-2 rounded-3xl border border-white/5 overflow-x-auto no-scrollbar max-w-full">
                    <button 
                        onClick={() => setRoleFilter('all')}
                        className={`px-8 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${roleFilter === 'all' ? 'orchid-gradient text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                    >
                        All
                    </button>
                    {(['admin', 'manager', 'user'] as UserRole[]).map(role => (
                        <button
                            key={role}
                            onClick={() => setRoleFilter(role)}
                            className={`px-8 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${roleFilter === role ? 'orchid-gradient text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                        >
                            {role}s
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid gap-8 stagger-in">
                {filteredUsers.length === 0 ? (
                    <div className="text-center py-40 glass-panel rounded-[3rem] text-gray-700 font-serif italic text-2xl">
                    No users found matching this filter.
                    </div>
                ) : (
                    filteredUsers.map((userItem, idx) => {
                        const isProtected = userItem.email && PROTECTED_ADMIN_EMAILS.includes(userItem.email.toLowerCase());
                        const isSelf = userItem.uid === currentUser?.uid;
                        
                        return (
                            <GlassCard key={userItem.uid} style={{animationDelay: `${idx * 0.1}s`}} className={`p-8 flex flex-col md:flex-row items-center justify-between gap-10 group transition-all duration-700 ${isProtected ? 'bg-pudava-primary/[0.03] border-pudava-primary/10' : ''}`}>
                                <div className="flex items-center gap-8 flex-1 w-full md:w-auto">
                                    <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center border shrink-0 transition-all duration-700 ${isProtected ? 'bg-pudava-primary/10 text-pudava-primary border-pudava-primary/20 rotate-6 group-hover:rotate-0' : 'bg-white/5 text-gray-600 border-white/10 group-hover:border-pudava-secondary/30 group-hover:bg-pudava-secondary/5'}`}>
                                        {isProtected ? <Lock size={32} /> : (userItem.displayName ? <span className="text-2xl font-serif font-bold">{userItem.displayName[0]}</span> : <UserCircle size={36}/>)}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-4">
                                            <h4 className="text-2xl font-serif truncate text-white">{userItem.displayName || 'Unknown User'}</h4>
                                            {isProtected && (
                                                <span className="text-[9px] orchid-gradient text-white px-4 py-1.5 rounded-full font-black uppercase tracking-[0.3em] shadow-lg">Admin</span>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-500 truncate mt-2 font-light tracking-wide">{userItem.email}</p>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                                    <div className={`flex items-center gap-2 bg-black/40 p-2 rounded-[1.5rem] border border-white/5 ${isProtected ? 'opacity-20 pointer-events-none' : ''}`}>
                                        {(['user', 'manager', 'admin'] as UserRole[]).map(role => (
                                            <button
                                                key={role}
                                                disabled={isProtected}
                                                onClick={() => handleRoleChange(userItem.uid, userItem.email, role)}
                                                className={`px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-tight transition-all ${
                                                    userItem.role === role 
                                                    ? 'bg-pudava-primary/20 text-pudava-primary border border-pudava-primary/20 shadow-lg' 
                                                    : 'text-gray-600 hover:text-white'
                                                }`}
                                            >
                                                {role}
                                            </button>
                                        ))}
                                    </div>

                                    {(!isProtected && !isSelf) && (
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteUser(userItem.uid, userItem.email, userItem.displayName || userItem.email || '');
                                            }}
                                            className="p-4 text-gray-700 hover:text-red-500 hover:bg-red-500/10 rounded-3xl transition-all"
                                            title="Delete User"
                                        >
                                            <Trash size={24} />
                                        </button>
                                    )}
                                </div>
                            </GlassCard>
                        );
                    })
                )}
            </div>
        </div>
    );
};

// ========================================
// INVENTORY MANAGEMENT
// ========================================
const InventoryManagement = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const data = await getProducts();
            setProducts(data);
        } catch (e) {
            console.error('Error fetching products:', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchProducts(); }, []);

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this product? This cannot be undone.')) return;
        setDeletingId(id);
        try {
            await deleteProduct(id);
            setProducts(prev => prev.filter(p => p.id !== id));
        } catch (e) {
            console.error('Error deleting product:', e);
        }
        setDeletingId(null);
    };

    const handleProductSaved = (product: Product) => {
        if (editingProduct) {
            setProducts(prev => prev.map(p => p.id === product.id ? product : p));
        } else {
            setProducts(prev => [product, ...prev]);
        }
        setShowForm(false);
        setEditingProduct(null);
    };

    const filtered = products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (showForm || editingProduct) {
        return (
            <InventoryFormWrapper
                product={editingProduct}
                onSave={handleProductSaved}
                onCancel={() => { setShowForm(false); setEditingProduct(null); }}
            />
        );
    }

    if (loading) return (
        <div className="py-32 text-center flex flex-col items-center gap-8">
            <div className="w-16 h-16 border-[3px] border-pudava-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs font-bold tracking-[0.3em] uppercase text-pudava-primary/60">Loading products...</p>
        </div>
    );

    return (
        <div className="space-y-8 animate-fade-in-blur">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl md:text-4xl font-serif text-white">Product Catalog</h2>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em] mt-2">{products.length} Products</p>
                </div>
                <Button onClick={() => setShowForm(true)} variant="orchid" className="h-11 px-6">
                    <span className="flex items-center gap-2"><Plus size={18} /> Add Product</span>
                </Button>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                <input
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search by name, SKU, or category..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-pudava-secondary/50 placeholder-gray-600"
                />
            </div>

            {/* Product Grid */}
            {filtered.length === 0 ? (
                <div className="text-center py-20 glass-panel rounded-2xl">
                    <Package size={48} className="mx-auto text-gray-700 mb-4" />
                    <p className="text-gray-500 text-lg">{searchQuery ? 'No products match your search.' : 'No products yet. Add your first product!'}</p>
                </div>
            ) : (
                <div className="grid gap-4 stagger-in">
                    {filtered.map((product, idx) => (
                        <GlassCard
                            key={product.id}
                            style={{ animationDelay: `${Math.min(idx * 0.05, 0.5)}s` }}
                            className="p-4 flex items-center gap-4 group hover:border-white/10 transition-all"
                        >
                            {/* Thumbnail */}
                            <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden bg-white/5 flex-shrink-0">
                                {product.image ? (
                                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-600">
                                        <Package size={24} />
                                    </div>
                                )}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h4 className="text-sm md:text-base font-semibold text-white truncate">{product.name}</h4>
                                    {product.isPublished === false && (
                                        <span className="text-[10px] bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full font-bold">DRAFT</span>
                                    )}
                                    {product.isFeatured && (
                                        <span className="text-[10px] bg-pudava-primary/20 text-pudava-primary px-2 py-0.5 rounded-full font-bold">FEATURED</span>
                                    )}
                                </div>
                                <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                                    <span>{product.category}</span>
                                    {product.clothingType && <span>· {product.clothingType}</span>}
                                    {product.sku && <span>· {product.sku}</span>}
                                </div>
                            </div>

                            {/* Price & Stock */}
                            <div className="text-right flex-shrink-0 hidden md:block">
                                <p className="text-sm font-bold text-white">₹{product.price.toLocaleString('en-IN')}</p>
                                {product.originalPrice && product.originalPrice > product.price && (
                                    <p className="text-xs text-gray-500 line-through">₹{product.originalPrice.toLocaleString('en-IN')}</p>
                                )}
                            </div>

                            <div className="text-right flex-shrink-0 hidden md:block">
                                <p className={`text-sm font-semibold ${product.stock > 10 ? 'text-green-400' : product.stock > 0 ? 'text-yellow-400' : 'text-red-400'}`}>
                                    {product.stock}
                                </p>
                                <p className="text-[10px] text-gray-600 uppercase">In Stock</p>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-1 flex-shrink-0">
                                <button
                                    onClick={() => setEditingProduct(product)}
                                    className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-500 hover:text-pudava-secondary hover:bg-pudava-secondary/10 transition-colors"
                                    title="Edit product"
                                >
                                    <Edit size={16} />
                                </button>
                                <button
                                    onClick={() => handleDelete(product.id)}
                                    disabled={deletingId === product.id}
                                    className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                                    title="Delete product"
                                >
                                    <Trash size={16} />
                                </button>
                            </div>
                        </GlassCard>
                    ))}
                </div>
            )}
        </div>
    );
};

const InventoryFormWrapper = ({ product, onSave, onCancel }: { product: Product | null; onSave: (p: Product) => void; onCancel: () => void }) => (
    <ProductForm product={product} onSave={onSave} onCancel={onCancel} />
);

// ========================================
// ORDER MANAGEMENT
// ========================================

const ORDER_STATUSES: { value: OrderStatus; label: string; color: string }[] = [
    { value: 'pending', label: 'Pending', color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' },
    { value: 'confirmed', label: 'Confirmed', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
    { value: 'processing', label: 'Processing', color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
    { value: 'shipped', label: 'Shipped', color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' },
    { value: 'out_for_delivery', label: 'Out for Delivery', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' },
    { value: 'delivered', label: 'Delivered', color: 'text-green-400 bg-green-500/10 border-green-500/20' },
    { value: 'cancelled', label: 'Cancelled', color: 'text-red-400 bg-red-500/10 border-red-500/20' },
    { value: 'returned', label: 'Returned', color: 'text-orange-400 bg-orange-500/10 border-orange-500/20' },
];

const getStatusMeta = (status: OrderStatus) => ORDER_STATUSES.find(s => s.value === status) || ORDER_STATUSES[0];

const OrderManagement = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState<'all' | OrderStatus>('all');
    const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [trackingInputs, setTrackingInputs] = useState<Record<string, string>>({});
    const [searchQuery, setSearchQuery] = useState('');

    const fetchOrders = async () => {
        setError(null);
        setLoading(true);
        try {
            const data = await getAllOrders();
            setOrders(data);
        } catch (e: any) {
            console.error('Order fetch error:', e);
            setError("Failed to load orders. You may not have permission.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchOrders(); }, []);

    const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
        setUpdatingId(orderId);
        try {
            const trackingId = trackingInputs[orderId]?.trim() || undefined;
            await updateOrderStatus(orderId, newStatus, newStatus === 'shipped' ? trackingId : undefined);
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus, ...(trackingId && newStatus === 'shipped' ? { trackingId } : {}) } : o));
        } catch (e) {
            console.error('Failed to update order status:', e);
            alert('Failed to update order status.');
        }
        setUpdatingId(null);
    };

    const filtered = orders.filter(o => {
        const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
        const q = searchQuery.toLowerCase();
        const matchesSearch = !q || o.id.toLowerCase().includes(q)
            || o.shippingAddress?.fullName?.toLowerCase().includes(q)
            || o.shippingAddress?.phone?.includes(q)
            || o.items.some(item => item.name.toLowerCase().includes(q));
        return matchesStatus && matchesSearch;
    });

    if (loading) return (
        <div className="py-32 text-center flex flex-col items-center gap-8">
            <div className="w-16 h-16 border-[3px] border-pudava-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs font-bold tracking-[0.3em] uppercase text-pudava-primary/60">Loading orders...</p>
        </div>
    );

    if (error) return (
        <GlassCard className="p-16 border-l-8 border-l-red-500/50 flex flex-col items-center gap-8 text-center">
            <AlertTriangle className="text-red-500/50" size={64} />
            <div className="space-y-4">
                <h3 className="text-4xl font-serif">Access Denied</h3>
                <p className="text-gray-500 max-w-sm text-sm font-light tracking-wide">{error}</p>
            </div>
            <Button variant="outline" onClick={fetchOrders} className="mt-4 px-12">Retry</Button>
        </GlassCard>
    );

    return (
        <div className="space-y-8 animate-fade-in-blur">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl md:text-4xl font-serif text-white">Orders</h2>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em] mt-2">{orders.length} Total · {orders.filter(o => o.status === 'pending').length} Pending</p>
                </div>
                <Button onClick={fetchOrders} variant="outline" className="h-10 px-5 text-xs">
                    Refresh
                </Button>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                <input
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search by order ID, customer name, phone..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-pudava-secondary/50 placeholder-gray-600"
                />
            </div>

            {/* Status filter */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
                <button onClick={() => setStatusFilter('all')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${statusFilter === 'all' ? 'orchid-gradient text-white shadow-lg' : 'bg-white/5 text-gray-500 hover:text-white border border-white/5'}`}>
                    All ({orders.length})
                </button>
                {ORDER_STATUSES.map(s => {
                    const count = orders.filter(o => o.status === s.value).length;
                    if (count === 0) return null;
                    return (
                        <button key={s.value} onClick={() => setStatusFilter(s.value)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${statusFilter === s.value ? 'orchid-gradient text-white shadow-lg' : 'bg-white/5 text-gray-500 hover:text-white border border-white/5'}`}>
                            {s.label} ({count})
                        </button>
                    );
                })}
            </div>

            {/* Order list */}
            {filtered.length === 0 ? (
                <div className="text-center py-20 glass-panel rounded-2xl">
                    <ClipboardList size={48} className="mx-auto text-gray-700 mb-4" />
                    <p className="text-gray-500 text-lg">No orders found.</p>
                </div>
            ) : (
                <div className="space-y-4 stagger-in">
                    {filtered.map((order, idx) => {
                        const statusMeta = getStatusMeta(order.status);
                        const isExpanded = expandedOrder === order.id;
                        const createdAt = order.createdAt?.toDate?.() ? order.createdAt.toDate() : (order.createdAt?.seconds ? new Date(order.createdAt.seconds * 1000) : null);

                        return (
                            <GlassCard key={order.id} style={{ animationDelay: `${Math.min(idx * 0.05, 0.5)}s` }}
                                className="p-4 md:p-5 transition-all">
                                {/* Order header row */}
                                <div className="flex items-center gap-3 md:gap-4 cursor-pointer" onClick={() => setExpandedOrder(isExpanded ? null : order.id)}>
                                    {/* Order thumbnail */}
                                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl overflow-hidden bg-white/5 flex-shrink-0">
                                        {order.items[0]?.image ? (
                                            <img src={order.items[0].image} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-600"><Package size={20} /></div>
                                        )}
                                    </div>

                                    {/* Order info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="text-sm font-semibold text-white">#{order.id.slice(-8).toUpperCase()}</span>
                                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${statusMeta.color}`}>{statusMeta.label}</span>
                                            {order.paymentMethod === 'cod' && (
                                                <span className="text-[10px] bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full font-bold border border-orange-500/20">COD</span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                                            <span>{order.shippingAddress?.fullName || 'N/A'}</span>
                                            <span>·</span>
                                            <span>{order.items.length} item{order.items.length > 1 ? 's' : ''}</span>
                                            {createdAt && (
                                                <><span>·</span><span>{createdAt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span></>
                                            )}
                                        </div>
                                    </div>

                                    {/* Total */}
                                    <div className="text-right flex-shrink-0">
                                        <p className="text-sm font-bold text-white">₹{order.total.toLocaleString('en-IN')}</p>
                                        <p className="text-[10px] text-gray-500 uppercase">{order.paymentStatus}</p>
                                    </div>

                                    {/* Expand arrow */}
                                    <ChevronDown size={16} className={`text-gray-500 flex-shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                </div>

                                {/* Expanded details */}
                                {isExpanded && (
                                    <div className="mt-4 pt-4 border-t border-white/5 space-y-4 animate-fade-in-blur">
                                        {/* Items */}
                                        <div className="space-y-2">
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Items</p>
                                            {order.items.map((item, i) => (
                                                <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-white/[0.02]">
                                                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-white/5 flex-shrink-0">
                                                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-xs text-white truncate">{item.name}</p>
                                                        <p className="text-[10px] text-gray-500">Size: {item.size} · Qty: {item.quantity}</p>
                                                    </div>
                                                    <span className="text-xs text-white font-medium">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Shipping address */}
                                        <div>
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Shipping Address</p>
                                            <div className="text-xs text-gray-300 p-3 rounded-lg bg-white/[0.02]">
                                                <p className="font-medium text-white">{order.shippingAddress?.fullName}</p>
                                                <p>{order.shippingAddress?.addressLine1}{order.shippingAddress?.addressLine2 ? `, ${order.shippingAddress.addressLine2}` : ''}</p>
                                                <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}</p>
                                                <p>Phone: {order.shippingAddress?.phone}</p>
                                            </div>
                                        </div>

                                        {/* Payment info */}
                                        <div className="flex items-center gap-6 text-xs text-gray-400">
                                            <span>Payment: <span className="text-white font-medium uppercase">{order.paymentMethod}</span></span>
                                            <span>Status: <span className={`font-medium ${order.paymentStatus === 'paid' ? 'text-green-400' : 'text-yellow-400'}`}>{order.paymentStatus}</span></span>
                                            {order.razorpayPaymentId && <span>Razorpay: <span className="text-white font-mono text-[10px]">{order.razorpayPaymentId}</span></span>}
                                            {order.trackingId && <span>Tracking: <span className="text-white font-medium">{order.trackingId}</span></span>}
                                        </div>

                                        {/* Status change */}
                                        <div className="pt-3 border-t border-white/5">
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Update Status</p>

                                            {/* Tracking ID input for shipping */}
                                            {order.status !== 'delivered' && order.status !== 'cancelled' && order.status !== 'returned' && (
                                                <div className="mb-3">
                                                    <input
                                                        placeholder="Tracking ID (optional, used when shipping)"
                                                        value={trackingInputs[order.id] || ''}
                                                        onChange={e => setTrackingInputs(prev => ({ ...prev, [order.id]: e.target.value }))}
                                                        className="w-full md:w-80 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-pudava-secondary/50 placeholder-gray-600"
                                                    />
                                                </div>
                                            )}

                                            <div className="flex flex-wrap gap-2">
                                                {ORDER_STATUSES.map(s => (
                                                    <button
                                                        key={s.value}
                                                        disabled={updatingId === order.id || order.status === s.value}
                                                        onClick={() => handleStatusChange(order.id, s.value)}
                                                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all disabled:opacity-30 disabled:cursor-not-allowed ${
                                                            order.status === s.value
                                                                ? `${s.color} ring-1 ring-current`
                                                                : 'border-white/5 text-gray-500 hover:text-white hover:border-white/20 bg-white/[0.02]'
                                                        }`}
                                                    >
                                                        {updatingId === order.id ? '...' : s.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </GlassCard>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

const UserProfileView = ({ user, signOutUser }: any) => (
    <div className="max-w-4xl mx-auto space-y-12 animate-fade-in-blur">
        <GlassCard className="p-16 md:p-24 text-center space-y-10 relative overflow-hidden border-t-4 border-t-pudava-primary/20">
             <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-pudava-primary/5 to-transparent"></div>
             <div className="relative">
                <div className="w-48 h-48 rounded-[3.5rem] bg-gradient-to-tr from-pudava-primary to-pudava-secondary mx-auto flex items-center justify-center text-6xl font-serif font-bold shadow-[0_30px_90px_rgba(236,72,153,0.3)] border-[8px] border-[#05010d] rotate-3 hover:rotate-0 transition-transform duration-700">
                    {user.displayName?.charAt(0) || 'U'}
                </div>
                <div className="mt-12 space-y-3">
                    <h2 className="text-5xl font-serif text-white tracking-tight">{user.displayName}</h2>
                    <p className="text-gray-500 font-light tracking-[0.1em]">{user.email}</p>
                    <div className="mt-10 inline-flex items-center gap-3 px-8 py-3 rounded-full bg-white/5 border border-white/10 text-xs uppercase tracking-[0.3em] text-pudava-primary font-bold shadow-2xl">
                        <Activity size={14} className="animate-pulse" /> {user.role}
                    </div>
                </div>
                <div className="mt-16 flex flex-col sm:flex-row justify-center gap-6">
                    <Button variant="orchid" className="px-14 h-14">Edit Profile</Button>
                    <Button variant="secondary" onClick={signOutUser} className="px-14 h-14 text-red-400 border-red-500/20 hover:bg-red-500/10">Sign Out</Button>
                </div>
            </div>
        </GlassCard>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <GlassCard className="p-10 group hover:border-pudava-primary/20 transition-all duration-700">
                <h3 className="text-2xl font-serif mb-8 flex items-center gap-4">
                    <Package size={28} className="text-pudava-primary" /> Order History
                </h3>
                <div className="text-center py-24 text-gray-600 bg-black/40 rounded-[2rem] border border-white/5 italic font-light">
                    Your order history will appear here.
                </div>
            </GlassCard>
            <GlassCard className="p-10 group hover:border-pudava-secondary/20 transition-all duration-700">
                <h3 className="text-2xl font-serif mb-8 flex items-center gap-4">
                    <Settings size={28} className="text-pudava-secondary" /> Settings
                </h3>
                 <div className="space-y-6">
                    {["Push Notifications", "Language", "Currency"].map((setting, i) => (
                         <div key={i} className="flex justify-between items-center p-6 hover:bg-white/5 rounded-[1.5rem] cursor-pointer group/item transition-all">
                            <span className="text-gray-400 group-hover/item:text-white transition-colors font-medium tracking-wide">{setting}</span>
                            <div className="w-14 h-7 bg-white/10 rounded-full relative transition-all overflow-hidden border border-white/5">
                                <div className="w-5 h-5 bg-pudava-primary rounded-full absolute top-1 left-1 group-hover/item:left-8 transition-all shadow-lg"></div>
                            </div>
                        </div>
                    ))}
                 </div>
            </GlassCard>
        </div>
    </div>
);

export const Dashboard: React.FC = () => {
    const { user, loading, signOutUser } = useAuth();
    const [activeTab, setActiveTab] = useState<'profile' | 'overview' | 'inventory' | 'users' | 'orders'>('profile');
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading && !user) navigate('/login');
    }, [user, loading, navigate]);

    if (loading) return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-8 bg-[#05010d]">
            <div className="w-16 h-16 border-[3px] border-pudava-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs tracking-[0.3em] text-pudava-primary font-bold uppercase">Loading...</p>
        </div>
    );
    if (!user) return null;

    const isAdmin = user.role === 'admin';
    const isManager = user.role === 'manager' || user.role === 'admin';

    return (
        <div className="container mx-auto px-6 py-16 mt-24 mb-40 md:mb-16">
            {/* Navigational Tabs */}
            {(isAdmin || isManager) && (
                <div className="flex items-center gap-3 mb-20 bg-white/5 p-2 rounded-[2.5rem] w-fit mx-auto md:mx-0 overflow-x-auto no-scrollbar border border-white/5 backdrop-blur-3xl shadow-2xl">
                    <button 
                        onClick={() => setActiveTab('profile')}
                        className={`flex items-center gap-4 px-10 py-4 rounded-[2rem] text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${activeTab === 'profile' ? 'orchid-gradient text-white shadow-2xl' : 'text-gray-500 hover:text-white'}`}
                    >
                        <UserCircle size={20} /> Profile
                    </button>
                    {isAdmin && (
                        <button 
                            onClick={() => setActiveTab('overview')}
                            className={`flex items-center gap-4 px-10 py-4 rounded-[2rem] text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${activeTab === 'overview' ? 'orchid-gradient text-white shadow-2xl' : 'text-gray-500 hover:text-white'}`}
                        >
                            <TrendingUp size={20} /> Overview
                        </button>
                    )}
                    {isManager && (
                        <button 
                            onClick={() => setActiveTab('inventory')}
                            className={`flex items-center gap-4 px-10 py-4 rounded-[2rem] text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${activeTab === 'inventory' ? 'orchid-gradient text-white shadow-2xl' : 'text-gray-500 hover:text-white'}`}
                        >
                            <Briefcase size={20} /> Inventory
                        </button>
                    )}
                    {isManager && (
                        <button 
                            onClick={() => setActiveTab('orders')}
                            className={`flex items-center gap-4 px-10 py-4 rounded-[2rem] text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${activeTab === 'orders' ? 'orchid-gradient text-white shadow-2xl' : 'text-gray-500 hover:text-white'}`}
                        >
                            <ClipboardList size={20} /> Orders
                        </button>
                    )}
                    {isAdmin && (
                        <button 
                            onClick={() => setActiveTab('users')}
                            className={`flex items-center gap-4 px-10 py-4 rounded-[2rem] text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${activeTab === 'users' ? 'orchid-gradient text-white shadow-2xl' : 'text-gray-500 hover:text-white'}`}
                        >
                            <Shield size={20} /> Users
                        </button>
                    )}
                </div>
            )}

            <div className="min-h-[70vh]">
                {activeTab === 'profile' && <UserProfileView user={user} signOutUser={signOutUser} />}
                {activeTab === 'overview' && isAdmin && <AdminOverview />}
                {activeTab === 'orders' && isManager && <OrderManagement />}
                {activeTab === 'users' && isAdmin && <UserManagement />}
                {activeTab === 'inventory' && isManager && <InventoryManagement />}
            </div>
        </div>
    );
};
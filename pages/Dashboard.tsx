import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { GlassCard } from '../components/GlassCard';
import { Button } from '../components/Button';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, AreaChart, Area } from 'recharts';
import { Users, DollarSign, Package, TrendingUp, Settings, LogOut, Plus, Edit, Trash, Check, UserCircle, Shield, Briefcase, AlertTriangle, Filter, Lock, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getAllUsers, updateUserRole, deleteUserDocument, getProducts, saveProduct, deleteProduct } from '../services/firebase';
import { UserProfile, UserRole, Product } from '../types';

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
                            <p className="text-gray-500 text-[10px] uppercase font-black tracking-[0.3em] mb-1">Gross Revenue</p>
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
                            <p className="text-gray-500 text-[10px] uppercase font-black tracking-[0.3em] mb-1">Total Souls</p>
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
                            <p className="text-gray-500 text-[10px] uppercase font-black tracking-[0.3em] mb-1">Pending Dispatch</p>
                            <h3 className="text-4xl font-serif">52</h3>
                        </div>
                    </div>
                </GlassCard>
            </div>

            <GlassCard className="p-12">
                <div className="flex items-center justify-between mb-12">
                    <div>
                        <h3 className="text-3xl font-serif">Market Velocity</h3>
                        <p className="text-[10px] text-gray-500 mt-2 uppercase tracking-[0.4em] font-bold">7-Day Transaction Cycle</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-pudava-primary"></div>
                            <span className="text-[9px] font-black uppercase tracking-widest text-gray-500">Revenue</span>
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
            setError("Access Restricted. Registry synchronization requires higher permissions.");
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
            alert("System Admin credentials are immutable.");
            return;
        }
        
        try {
            await updateUserRole(uid, newRole);
            setUsers(prev => prev.map(u => u.uid === uid ? { ...u, role: newRole } : u));
        } catch (e: any) {
            console.error("Failed to update role:", e);
            alert(`Role propagation failed: ${e.code || e.message}`);
        }
    };

    const handleDeleteUser = async (uid: string, email: string | null, name: string) => {
        if (email && PROTECTED_ADMIN_EMAILS.includes(email.toLowerCase())) {
            alert("Root administrator cannot be purged.");
            return;
        }

        if (uid === currentUser?.uid) {
            alert("Self-purging is restricted. Initiate departure via Profile.");
            return;
        }

        if (!confirm(`Purge user profile for "${name || email || uid}"? This is irreversible.`)) return;
        
        try {
            await deleteUserDocument(uid);
            setUsers(prev => prev.filter(u => u.uid !== uid));
        } catch (e: any) {
            console.error("Error deleting user document:", e);
            alert("Permission Denied. Consult technical logs.");
        }
    };

    if (loading) return (
        <div className="py-32 text-center flex flex-col items-center gap-8">
            <div className="w-16 h-16 border-[3px] border-pudava-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-[10px] font-black tracking-[0.6em] uppercase text-pudava-primary/60">Syncing Registry...</p>
        </div>
    );

    if (error) return (
        <GlassCard className="p-16 border-l-8 border-l-red-500/50 flex flex-col items-center gap-8 text-center">
            <AlertTriangle className="text-red-500/50" size={64} />
            <div className="space-y-4">
                <h3 className="text-4xl font-serif">Sanctum Blocked</h3>
                <p className="text-gray-500 max-w-sm text-sm font-light tracking-wide">{error}</p>
            </div>
            <Button variant="outline" onClick={() => window.location.reload()} className="mt-4 px-12">Refresh Portal</Button>
        </GlassCard>
    );

    return (
        <div className="space-y-12 animate-fade-in-blur">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10">
                <div>
                    <h2 className="text-4xl font-serif">Master Registry</h2>
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em] mt-2">{filteredUsers.length} Active Records</p>
                </div>
                
                <div className="flex items-center gap-2 bg-white/5 p-2 rounded-3xl border border-white/5 overflow-x-auto no-scrollbar max-w-full">
                    <button 
                        onClick={() => setRoleFilter('all')}
                        className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${roleFilter === 'all' ? 'orchid-gradient text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                    >
                        Universal
                    </button>
                    {(['admin', 'manager', 'user'] as UserRole[]).map(role => (
                        <button
                            key={role}
                            onClick={() => setRoleFilter(role)}
                            className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${roleFilter === role ? 'orchid-gradient text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                        >
                            {role}s
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid gap-8 stagger-in">
                {filteredUsers.length === 0 ? (
                    <div className="text-center py-40 glass-panel rounded-[3rem] text-gray-700 font-serif italic text-2xl">
                        No records found in this dimension.
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
                                            <h4 className="text-2xl font-serif truncate text-white">{userItem.displayName || 'Unnamed Being'}</h4>
                                            {isProtected && (
                                                <span className="text-[8px] orchid-gradient text-white px-4 py-1.5 rounded-full font-black uppercase tracking-[0.3em] shadow-lg">Root</span>
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
                                                className={`px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-tighter transition-all ${
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
                                            title="Purge Record"
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
                    <div className="mt-10 inline-flex items-center gap-3 px-8 py-3 rounded-full bg-white/5 border border-white/10 text-[10px] uppercase tracking-[0.5em] text-pudava-primary font-black shadow-2xl">
                        <Activity size={14} className="animate-pulse" /> {user.role} Identity
                    </div>
                </div>
                <div className="mt-16 flex flex-col sm:flex-row justify-center gap-6">
                    <Button variant="orchid" className="px-14 h-14">Modify Portrait</Button>
                    <Button variant="secondary" onClick={signOutUser} className="px-14 h-14 text-red-400 border-red-500/20 hover:bg-red-500/10">Departure</Button>
                </div>
            </div>
        </GlassCard>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <GlassCard className="p-10 group hover:border-pudava-primary/20 transition-all duration-700">
                <h3 className="text-2xl font-serif mb-8 flex items-center gap-4">
                    <Package size={28} className="text-pudava-primary" /> Acquisition Log
                </h3>
                <div className="text-center py-24 text-gray-600 bg-black/40 rounded-[2rem] border border-white/5 italic font-light">
                    The history of your acquisitions is empty...
                </div>
            </GlassCard>
            <GlassCard className="p-10 group hover:border-pudava-secondary/20 transition-all duration-700">
                <h3 className="text-2xl font-serif mb-8 flex items-center gap-4">
                    <Settings size={28} className="text-pudava-secondary" /> Dimension Config
                </h3>
                 <div className="space-y-6">
                    {["Haptic Notifications", "Linguistic Sync", "Monetary Paradigm"].map((setting, i) => (
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
    const [activeTab, setActiveTab] = useState<'profile' | 'overview' | 'inventory' | 'users'>('profile');
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading && !user) navigate('/login');
    }, [user, loading, navigate]);

    if (loading) return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-8 bg-[#05010d]">
            <div className="w-16 h-16 border-[3px] border-pudava-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-[10px] tracking-[0.6em] text-pudava-primary font-black uppercase">Opening Dimensional Portal...</p>
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
                        className={`flex items-center gap-4 px-10 py-4 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap ${activeTab === 'profile' ? 'orchid-gradient text-white shadow-2xl' : 'text-gray-500 hover:text-white'}`}
                    >
                        <UserCircle size={20} /> My Sanctum
                    </button>
                    {isAdmin && (
                        <button 
                            onClick={() => setActiveTab('overview')}
                            className={`flex items-center gap-4 px-10 py-4 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap ${activeTab === 'overview' ? 'orchid-gradient text-white shadow-2xl' : 'text-gray-500 hover:text-white'}`}
                        >
                            <TrendingUp size={20} /> Oracle
                        </button>
                    )}
                    {isManager && (
                        <button 
                            onClick={() => setActiveTab('inventory')}
                            className={`flex items-center gap-4 px-10 py-4 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap ${activeTab === 'inventory' ? 'orchid-gradient text-white shadow-2xl' : 'text-gray-500 hover:text-white'}`}
                        >
                            <Briefcase size={20} /> Treasury
                        </button>
                    )}
                    {isAdmin && (
                        <button 
                            onClick={() => setActiveTab('users')}
                            className={`flex items-center gap-4 px-10 py-4 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap ${activeTab === 'users' ? 'orchid-gradient text-white shadow-2xl' : 'text-gray-500 hover:text-white'}`}
                        >
                            <Shield size={20} /> Registry
                        </button>
                    )}
                </div>
            )}

            <div className="min-h-[70vh]">
                {activeTab === 'profile' && <UserProfileView user={user} signOutUser={signOutUser} />}
                {activeTab === 'overview' && isAdmin && <AdminOverview />}
                {activeTab === 'users' && isAdmin && <UserManagement />}
                {activeTab === 'inventory' && isManager && (
                    <div className="text-center py-40 font-serif italic text-4xl text-gray-700 animate-pulse">
                        Sourcing from The Treasury...
                    </div>
                )}
            </div>
        </div>
    );
};
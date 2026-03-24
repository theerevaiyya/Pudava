import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Home, ShoppingBag, User, ShoppingCart, LogOut, Heart, Search, X, Package } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export const Navbar: React.FC = () => {
  const { user, signOutUser } = useAuth();
  const { cart, setIsCartOpen } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/catalog?search=${encodeURIComponent(searchQuery)}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const MobileNavItem = ({ to, icon: Icon, label, badge }: { to: string; icon: any; label: string; badge?: number }) => {
    const isActive = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));
    return (
      <NavLink
        to={to}
        className={`flex flex-col items-center justify-center gap-0.5 w-14 h-14 rounded-xl transition-all duration-300 relative ${isActive
            ? 'text-white scale-110 dock-active'
            : 'text-gray-500 hover:text-white active:scale-95'
          }`}
      >
        <Icon size={22} strokeWidth={isActive ? 2 : 1.5} className={isActive ? 'animate-dock-bounce' : ''} />
        <span className="text-[10px] font-medium">{label}</span>
        {badge && badge > 0 && (
          <span className="absolute top-1 right-1 bg-pudava-secondary text-black text-[8px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
            {badge > 9 ? '9+' : badge}
          </span>
        )}
      </NavLink>
    );
  };

  return (
    <>
      {/* Desktop Navbar */}
      <nav
        className={`hidden md:flex fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-transparent ${scrolled ? 'bg-pudava-bg/90 backdrop-blur-md border-white/5 py-3' : 'bg-transparent py-5'
          }`}
      >
        <div className="container mx-auto px-6 flex justify-between items-center h-10">
          <div className="flex items-center gap-12 flex-1">
            <button className="cursor-pointer group flex-shrink-0 px-2 py-1 -ml-2 rounded-lg hover:bg-white/5 transition-colors" onClick={() => navigate('/')}>
              <h1 className="text-xl font-serif font-bold tracking-widest text-white group-hover:text-pudava-secondary transition-colors">PUDAVA</h1>
            </button>

            <div className="relative flex-1 max-w-md">
              {isSearchOpen ? (
                <form onSubmit={handleSearchSubmit} className="w-full relative animate-fade-in">
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search products..."
                    className="w-full bg-white/10 border border-white/10 rounded-full py-1.5 pl-4 pr-10 text-sm text-white focus:outline-none focus:border-pudava-secondary/50 placeholder-gray-400"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onBlur={() => !searchQuery && setIsSearchOpen(false)}
                  />
                  <button type="button" onClick={() => setIsSearchOpen(false)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                    <X size={14} />
                  </button>
                </form>
              ) : (
                <div className="flex items-center gap-6 animate-fade-in">
                  <NavLink to="/" className={({ isActive }) => `text-xs font-bold tracking-[0.2em] uppercase hover:text-pudava-secondary transition-colors ${isActive ? 'text-white' : 'text-gray-400'}`}>Home</NavLink>
                  <NavLink to="/catalog" className={({ isActive }) => `text-xs font-bold tracking-[0.2em] uppercase hover:text-pudava-secondary transition-colors ${isActive ? 'text-white' : 'text-gray-400'}`}>Collection</NavLink>
                  <NavLink to="/about" className={({ isActive }) => `text-xs font-bold tracking-[0.2em] uppercase hover:text-pudava-secondary transition-colors ${isActive ? 'text-white' : 'text-gray-400'}`}>Story</NavLink>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-5">
            {!isSearchOpen && (
              <button onClick={() => setIsSearchOpen(true)} className="text-gray-400 hover:text-white transition-colors">
                <Search size={18} strokeWidth={1.5} />
              </button>
            )}

            {user && (
              <NavLink to="/wishlist" className={({ isActive }) => `${isActive ? 'text-pudava-secondary' : 'text-gray-400'} hover:text-white transition-colors`}>
                <Heart size={18} strokeWidth={1.5} />
              </NavLink>
            )}

            <button
              onClick={() => setIsCartOpen(true)}
              className="relative text-gray-400 hover:text-white transition-colors"
            >
              <ShoppingCart size={18} strokeWidth={1.5} />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-pudava-secondary text-black text-[9px] font-bold w-3.5 h-3.5 flex items-center justify-center rounded-full">
                  {cartCount}
                </span>
              )}
            </button>

            <div className="h-3 w-px bg-white/20"></div>

            {user ? (
              <div className="flex items-center gap-4">
                {user.role !== 'user' && (
                  <NavLink to="/dashboard" className={({ isActive }) => `text-xs font-bold tracking-widest uppercase hover:text-pudava-secondary transition-colors ${isActive ? 'text-pudava-secondary' : 'text-white'}`}>
                    Dashboard
                  </NavLink>
                )}
                <NavLink to="/profile" className={({ isActive }) => `text-xs font-bold tracking-widest uppercase hover:text-pudava-secondary transition-colors ${isActive ? 'text-pudava-secondary' : 'text-white'}`}>
                  Account
                </NavLink>
                <button onClick={() => signOutUser()} className="text-gray-400 hover:text-red-400 transition-colors">
                  <LogOut size={18} strokeWidth={1.5} />
                </button>
              </div>
            ) : (
              <NavLink to="/login" className="text-xs font-bold tracking-widest hover:text-pudava-secondary transition-colors uppercase">
                Login
              </NavLink>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Top Bar */}
      <nav className={`md:hidden fixed top-0 left-0 right-0 z-40 px-4 transition-all duration-300 flex flex-col justify-center ${scrolled || isSearchOpen ? 'bg-pudava-bg/95 backdrop-blur-md border-b border-white/5 py-2.5' : 'bg-gradient-to-b from-pudava-bg/90 to-transparent py-3'}`}>
        <div className="flex justify-between items-center w-full">
          {!isSearchOpen ? (
            <>
              <button className="px-1 py-1 -ml-1 rounded-lg active:bg-white/5 transition-colors" onClick={() => navigate('/')}>
                <h1 className="text-lg font-serif font-bold tracking-widest text-white">PUDAVA</h1>
              </button>
              <div className="flex items-center">
                <button onClick={() => setIsSearchOpen(true)} className="w-11 h-11 flex items-center justify-center rounded-full text-white active:bg-white/10 transition-colors">
                  <Search size={20} strokeWidth={1.5} />
                </button>
                {user && (
                  <button onClick={() => navigate('/wishlist')} className="w-11 h-11 flex items-center justify-center rounded-full text-white active:bg-white/10 transition-colors">
                    <Heart size={20} strokeWidth={1.5} />
                  </button>
                )}
                <button onClick={() => setIsCartOpen(true)} className="relative w-11 h-11 flex items-center justify-center rounded-full text-white active:bg-white/10 transition-colors">
                  <ShoppingCart size={20} strokeWidth={1.5} />
                  {cartCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 bg-pudava-secondary text-black text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                      {cartCount}
                    </span>
                  )}
                </button>
              </div>
            </>
          ) : (
            <form onSubmit={handleSearchSubmit} className="w-full relative flex items-center gap-2 animate-fade-in-blur">
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search products..."
                className="w-full bg-white/10 border border-white/10 rounded-xl py-2.5 pl-4 pr-8 text-sm text-white focus:outline-none focus:border-pudava-secondary placeholder-gray-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="button" onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }} className="p-2 text-gray-300 shrink-0">
                <span className="text-sm font-medium">Cancel</span>
              </button>
            </form>
          )}
        </div>
      </nav>

      {/* Mobile Bottom Dock */}
      <nav className="md:hidden fixed bottom-3 left-3 right-3 z-50 safe-bottom">
        <div className="glass-panel gradient-border rounded-2xl px-2 py-1 flex justify-around items-center shadow-2xl shadow-black/60">
          <MobileNavItem to="/" icon={Home} label="Home" />
          <MobileNavItem to="/catalog" icon={ShoppingBag} label="Shop" />
          {user && <MobileNavItem to="/orders" icon={Package} label="Orders" />}
          {user ? (
            <MobileNavItem to="/profile" icon={User} label="Profile" />
          ) : (
            <MobileNavItem to="/login" icon={User} label="Login" />
          )}
        </div>
      </nav>
    </>
  );
};
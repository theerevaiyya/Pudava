import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Mail, Phone, MapPin, Plus, Edit2, LogOut, Package, Heart, ChevronRight, Shield, Camera } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getUserAddresses, saveAddress, deleteAddress } from '../services/firebase';
import { Address } from '../types';
import { AddressCard } from '../components/AddressCard';
import { BottomSheet } from '../components/BottomSheet';
import { GlassCard } from '../components/GlassCard';

export const Profile: React.FC = () => {
  const { user, signOutUser, updateProfile: updateUserProfileCtx } = useAuth();
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');

  // Address form state
  const [addrForm, setAddrForm] = useState({
    fullName: '', phone: '', addressLine1: '', addressLine2: '',
    city: '', state: '', pincode: '', type: 'home' as Address['type'], isDefault: false,
  });

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    setEditName(user.displayName || '');
    setEditPhone(user.phone || '');

    const fetchAddresses = async () => {
      const addrs = await getUserAddresses(user.uid);
      setAddresses(addrs);
    };
    fetchAddresses();
  }, [user, navigate]);

  const handleSaveProfile = async () => {
    try {
      await updateUserProfileCtx({ displayName: editName, phone: editPhone });
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating profile:', err);
    }
  };

  const handleAddressSubmit = async () => {
    if (!user) return;
    try {
      const addressData = {
        ...addrForm,
        userId: user.uid,
        ...(editingAddress ? { id: editingAddress.id } : {}),
      };
      await saveAddress(addressData);
      const updated = await getUserAddresses(user.uid);
      setAddresses(updated);
      setShowAddressForm(false);
      setEditingAddress(null);
      resetAddressForm();
    } catch (err) {
      console.error('Error saving address:', err);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    await deleteAddress(id);
    setAddresses(prev => prev.filter(a => a.id !== id));
  };

  const resetAddressForm = () => {
    setAddrForm({ fullName: '', phone: '', addressLine1: '', addressLine2: '', city: '', state: '', pincode: '', type: 'home', isDefault: false });
  };

  const openEditAddress = (addr: Address) => {
    setEditingAddress(addr);
    setAddrForm({
      fullName: addr.fullName, phone: addr.phone, addressLine1: addr.addressLine1,
      addressLine2: addr.addressLine2 || '', city: addr.city, state: addr.state,
      pincode: addr.pincode, type: addr.type, isDefault: addr.isDefault,
    });
    setShowAddressForm(true);
  };

  const menuItems = [
    { icon: Package, label: 'My Orders', onClick: () => navigate('/orders') },
    { icon: Heart, label: 'Wishlist', onClick: () => navigate('/wishlist') },
    { icon: MapPin, label: 'Saved Addresses', onClick: () => document.getElementById('addresses')?.scrollIntoView({ behavior: 'smooth' }) },
  ];

  if (!user) return null;

  return (
    <div className="min-h-screen pt-14 md:pt-18 pb-20 px-4 md:px-8 max-w-3xl mx-auto page-enter">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-white/5 text-white flex items-center justify-center md:hidden">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl md:text-2xl font-serif font-bold text-white">My Profile</h1>
      </div>

      {/* Profile Card */}
      <GlassCard className="p-5 mb-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-20 h-20 rounded-full orchid-gradient flex items-center justify-center text-white text-2xl font-bold">
              {user.photoURL ? (
                <img src={user.photoURL} alt="" className="w-full h-full rounded-full object-cover" />
              ) : (
                user.displayName?.charAt(0).toUpperCase() || 'U'
              )}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            {isEditing ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-pudava-secondary"
                  placeholder="Full Name"
                />
                <input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-pudava-secondary"
                  placeholder="Phone Number"
                />
                <div className="flex gap-2">
                  <button onClick={handleSaveProfile} className="px-4 py-1.5 rounded-lg orchid-gradient text-white text-xs font-semibold">Save</button>
                  <button onClick={() => setIsEditing(false)} className="px-4 py-1.5 rounded-lg bg-white/5 text-gray-400 text-xs">Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <h2 className="text-base font-semibold text-white truncate">{user.displayName || 'User'}</h2>
                {user.email && <p className="text-xs text-gray-400 flex items-center gap-1"><Mail size={12} />{user.email}</p>}
                {user.phone && <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5"><Phone size={12} />{user.phone}</p>}
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-2 py-0.5 bg-pudava-secondary/20 text-pudava-secondary text-xs font-bold rounded-full uppercase">
                    {user.role}
                  </span>
                  <button onClick={() => setIsEditing(true)} className="text-xs text-gray-500 hover:text-white flex items-center gap-1">
                    <Edit2 size={12} /> Edit
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </GlassCard>

      {/* Quick Menu */}
      <div className="space-y-1.5 mb-6">
        {menuItems.map(item => (
          <button
            key={item.label}
            onClick={item.onClick}
            className="w-full flex items-center gap-3 p-3.5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all active:scale-[0.98]"
          >
            <item.icon size={18} className="text-gray-400" strokeWidth={1.5} />
            <span className="text-sm text-white flex-1 text-left">{item.label}</span>
            <ChevronRight size={16} className="text-gray-500" />
          </button>
        ))}
      </div>

      {/* Addresses */}
      <div id="addresses" className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-white">Saved Addresses</h2>
          <button
            onClick={() => { resetAddressForm(); setEditingAddress(null); setShowAddressForm(true); }}
            className="flex items-center gap-1 text-xs text-pudava-secondary font-semibold"
          >
            <Plus size={14} /> Add New
          </button>
        </div>

        {addresses.length === 0 ? (
          <p className="text-sm text-gray-500 py-4">No saved addresses yet.</p>
        ) : (
          <div className="space-y-2">
            {addresses.map(addr => (
              <AddressCard
                key={addr.id}
                address={addr}
                onEdit={() => openEditAddress(addr)}
                onDelete={() => handleDeleteAddress(addr.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Sign Out */}
      <button
        onClick={signOutUser}
        className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border border-red-500/20 text-red-400 text-sm hover:bg-red-500/5 transition-colors"
      >
        <LogOut size={16} /> Sign Out
      </button>

      {/* Address Form Bottom Sheet */}
      <BottomSheet
        isOpen={showAddressForm}
        onClose={() => { setShowAddressForm(false); setEditingAddress(null); }}
        title={editingAddress ? 'Edit Address' : 'Add Address'}
        height="full"
      >
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Full Name"
            value={addrForm.fullName}
            onChange={e => setAddrForm(p => ({ ...p, fullName: e.target.value }))}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-pudava-secondary placeholder-gray-500"
          />
          <input
            type="tel"
            placeholder="Phone Number"
            value={addrForm.phone}
            onChange={e => setAddrForm(p => ({ ...p, phone: e.target.value }))}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-pudava-secondary placeholder-gray-500"
          />
          <input
            type="text"
            placeholder="Address Line 1"
            value={addrForm.addressLine1}
            onChange={e => setAddrForm(p => ({ ...p, addressLine1: e.target.value }))}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-pudava-secondary placeholder-gray-500"
          />
          <input
            type="text"
            placeholder="Address Line 2 (optional)"
            value={addrForm.addressLine2}
            onChange={e => setAddrForm(p => ({ ...p, addressLine2: e.target.value }))}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-pudava-secondary placeholder-gray-500"
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="City"
              value={addrForm.city}
              onChange={e => setAddrForm(p => ({ ...p, city: e.target.value }))}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-pudava-secondary placeholder-gray-500"
            />
            <input
              type="text"
              placeholder="State"
              value={addrForm.state}
              onChange={e => setAddrForm(p => ({ ...p, state: e.target.value }))}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-pudava-secondary placeholder-gray-500"
            />
          </div>
          <input
            type="text"
            placeholder="PIN Code"
            value={addrForm.pincode}
            onChange={e => setAddrForm(p => ({ ...p, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) }))}
            inputMode="numeric"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-pudava-secondary placeholder-gray-500"
          />

          {/* Address Type */}
          <div className="flex gap-2">
            {(['home', 'work', 'other'] as const).map(type => (
              <button
                key={type}
                onClick={() => setAddrForm(p => ({ ...p, type }))}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold capitalize transition-all ${
                  addrForm.type === type ? 'orchid-gradient text-white' : 'bg-white/5 text-gray-400'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
            <input
              type="checkbox"
              checked={addrForm.isDefault}
              onChange={e => setAddrForm(p => ({ ...p, isDefault: e.target.checked }))}
              className="rounded border-gray-600 bg-white/5 text-pudava-secondary focus:ring-pudava-secondary"
            />
            Set as default address
          </label>

          <button
            onClick={handleAddressSubmit}
            disabled={!addrForm.fullName || !addrForm.phone || !addrForm.addressLine1 || !addrForm.city || !addrForm.state || !addrForm.pincode}
            className="w-full py-3 rounded-xl orchid-gradient text-white font-semibold text-sm disabled:opacity-50 btn-press mt-2"
          >
            {editingAddress ? 'Update Address' : 'Save Address'}
          </button>
        </div>
      </BottomSheet>
    </div>
  );
};

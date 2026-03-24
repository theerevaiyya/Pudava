import React from 'react';
import { MapPin, Phone, Edit2, Trash2, CheckCircle } from 'lucide-react';
import { Address } from '../types';

interface AddressCardProps {
  address: Address;
  selected?: boolean;
  onSelect?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  compact?: boolean;
}

export const AddressCard: React.FC<AddressCardProps> = ({ address, selected, onSelect, onEdit, onDelete, compact }) => {
  const typeLabel = address.type === 'home' ? '🏠 Home' : address.type === 'work' ? '💼 Work' : '📍 Other';

  return (
    <div
      onClick={onSelect}
      className={`relative p-4 rounded-xl border transition-all ${
        selected
          ? 'border-pudava-secondary/50 bg-pudava-secondary/5'
          : 'border-white/5 bg-white/[0.02] hover:border-white/10'
      } ${onSelect ? 'cursor-pointer' : ''}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-gray-400">{typeLabel}</span>
            {address.isDefault && (
              <span className="px-1.5 py-0.5 bg-pudava-secondary/20 text-pudava-secondary text-[10px] font-bold rounded uppercase">
                Default
              </span>
            )}
          </div>

          <h4 className="text-sm font-semibold text-white">{address.fullName}</h4>

          {!compact && (
            <>
              <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                {address.addressLine1}
                {address.addressLine2 && `, ${address.addressLine2}`}
                <br />
                {address.city}, {address.state} - {address.pincode}
              </p>
              <div className="flex items-center gap-1 mt-1.5 text-xs text-gray-500">
                <Phone size={10} />
                {address.phone}
              </div>
            </>
          )}
        </div>

        {selected && (
          <CheckCircle size={20} className="text-pudava-secondary flex-shrink-0" />
        )}
      </div>

      {(onEdit || onDelete) && (
        <div className="flex gap-2 mt-3 pt-3 border-t border-white/5">
          {onEdit && (
            <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors">
              <Edit2 size={12} /> Edit
            </button>
          )}
          {onDelete && (
            <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-400 transition-colors">
              <Trash2 size={12} /> Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
};

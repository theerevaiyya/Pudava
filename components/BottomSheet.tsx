import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  height?: 'auto' | 'half' | 'full';
}

export const BottomSheet: React.FC<BottomSheetProps> = ({ isOpen, onClose, title, children, height = 'auto' }) => {
  const sheetRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const currentY = useRef(0);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleTouchStart = (e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    currentY.current = e.touches[0].clientY;
    const diff = currentY.current - startY.current;
    if (diff > 0 && sheetRef.current) {
      sheetRef.current.style.transform = `translateY(${diff}px)`;
    }
  };

  const handleTouchEnd = () => {
    const diff = currentY.current - startY.current;
    if (diff > 100) {
      onClose();
    }
    if (sheetRef.current) {
      sheetRef.current.style.transform = '';
    }
  };

  const heightClass = height === 'full' ? 'max-h-[95vh]' : height === 'half' ? 'max-h-[50vh]' : 'max-h-[80vh]';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60]">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div
        ref={sheetRef}
        className={`absolute bottom-0 left-0 right-0 ${heightClass} bg-pudava-surface border-t border-white/10 rounded-t-3xl overflow-hidden animate-slide-up transition-transform`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Drag handle */}
        <div className="flex flex-col items-center pt-3 pb-1 cursor-grab active:cursor-grabbing">
          <div className="w-12 h-1 rounded-full bg-white/30" />
        </div>

        {title && (
          <div className="flex items-center justify-between px-5 pb-3 border-b border-white/5">
            <h3 className="text-lg font-semibold text-white">{title}</h3>
            <button onClick={onClose} className="p-1.5 rounded-full bg-white/5 text-gray-400 hover:text-white">
              <X size={18} />
            </button>
          </div>
        )}

        <div className="overflow-y-auto p-5" style={{ maxHeight: 'calc(100% - 60px)' }}>
          {children}
        </div>
      </div>
    </div>
  );
};

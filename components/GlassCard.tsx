import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverEffect?: boolean;
  style?: React.CSSProperties;
}

export const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  className = '', 
  onClick, 
  hoverEffect = false,
  style 
}) => {
  return (
    <div 
      onClick={onClick}
      style={style}
      className={`
        glass-panel rounded-[2rem] transition-all duration-500 overflow-hidden
        ${hoverEffect ? 'hover:bg-white/[0.04] hover:border-pudava-primary/30 hover:-translate-y-1 cursor-pointer shadow-2xl hover:shadow-pudava-primary/20' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
};
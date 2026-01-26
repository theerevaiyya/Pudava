import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'orchid' | 'gold';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  fullWidth = false,
  className = '',
  ...props
}) => {
  const baseStyles = "px-6 md:px-8 py-3 md:py-4 rounded-full font-bold tracking-[0.15em] md:tracking-[0.2em] transition-all duration-300 flex items-center justify-center gap-2 md:gap-3 text-[9px] md:text-[10px] uppercase overflow-hidden relative group btn-press";

  const variants = {
    primary: "bg-white text-black hover:bg-gray-100 shadow-[0_10px_20px_rgba(255,255,255,0.05)] hover:shadow-[0_15px_30px_rgba(255,255,255,0.1)]",
    secondary: "bg-white/5 text-white border border-white/10 hover:border-white/20 hover:bg-white/10 backdrop-blur-md",
    outline: "border border-white/20 text-white hover:border-pudava-primary hover:bg-pudava-primary/5",
    ghost: "bg-transparent text-gray-400 hover:text-white hover:bg-white/5",
    orchid: "orchid-gradient text-white shadow-[0_12px_24px_rgba(236,72,153,0.3)] hover:shadow-[0_20px_40px_rgba(217,70,239,0.5)] hover:scale-[1.02]",
    gold: "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-[0_12px_24px_rgba(245,158,11,0.3)] hover:shadow-[0_20px_40px_rgba(245,158,11,0.5)] hover:scale-[1.02]",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      <span className="relative z-10 flex items-center gap-2">{children}</span>
      {(variant === 'orchid' || variant === 'gold') && (
        <span className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
      )}
    </button>
  );
};
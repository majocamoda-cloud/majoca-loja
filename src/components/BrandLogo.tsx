import React from 'react';

interface BrandLogoProps {
  variant?: 'compact' | 'square';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = 'compact',
  size = 'md',
  className = '',
}) => {
  if (variant === 'square') {
    const squareSizes = {
      sm: 'w-24 h-24 p-3 rounded-2xl',
      md: 'w-36 h-36 p-4 rounded-3xl',
      lg: 'w-48 h-48 p-6 rounded-3xl',
    };

    return (
      <div
        className={`bg-[#FF751F] text-white flex flex-col items-center justify-center shadow-md select-none transition-transform ${squareSizes[size]} ${className}`}
        style={{ backgroundColor: '#FF751F' }}
        aria-label="Majoca Moda - Moda Infanto-Juvenil"
      >
        <span className="font-heading font-black text-3xl sm:text-4xl text-white tracking-wider leading-none uppercase">
          MAJOCA
        </span>
        <span className="text-[10px] sm:text-xs font-semibold text-white/95 tracking-normal whitespace-nowrap mt-1.5 lowercase leading-none">
          • moda infanto-juvenil •
        </span>
      </div>
    );
  }

  // Header / Top Navigation Compact Logomark
  return (
    <div
      className={`h-11 sm:h-12 px-3.5 sm:px-4.5 py-1.5 rounded-xl flex flex-col items-center justify-center bg-[#FF751F] text-white shadow-xs select-none transition-all duration-200 ${className}`}
      style={{ backgroundColor: '#FF751F' }}
      aria-label="Majoca Moda - Moda Infanto-Juvenil"
    >
      <span className="font-heading font-black text-xl sm:text-[22px] text-white tracking-wider leading-none uppercase">
        MAJOCA
      </span>
      <span className="text-[8px] sm:text-[9px] font-medium text-white/95 tracking-tight sm:tracking-normal whitespace-nowrap mt-0.5 lowercase leading-none">
        • moda infanto-juvenil •
      </span>
    </div>
  );
};

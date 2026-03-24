import React from 'react';
import { Star } from 'lucide-react';

interface RatingStarsProps {
  rating: number;
  maxRating?: number;
  size?: number;
  interactive?: boolean;
  onChange?: (rating: number) => void;
}

export const RatingStars: React.FC<RatingStarsProps> = ({ 
  rating, 
  maxRating = 5, 
  size = 16, 
  interactive = false,
  onChange 
}) => {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: maxRating }, (_, i) => {
        const filled = i < Math.floor(rating);
        const halfFilled = !filled && i < rating;

        return (
          <button
            key={i}
            type="button"
            onClick={() => interactive && onChange?.(i + 1)}
            className={`${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}`}
            disabled={!interactive}
          >
            <Star
              size={size}
              fill={filled ? '#facc15' : halfFilled ? 'url(#halfGrad)' : 'none'}
              stroke={filled || halfFilled ? '#facc15' : '#4b5563'}
              strokeWidth={1.5}
            />
          </button>
        );
      })}
      {/* SVG gradient for half stars */}
      <svg width="0" height="0" className="absolute">
        <defs>
          <linearGradient id="halfGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="50%" stopColor="#facc15" />
            <stop offset="50%" stopColor="transparent" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};

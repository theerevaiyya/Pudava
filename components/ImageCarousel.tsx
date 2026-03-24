import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageCarouselProps {
  images: string[];
  alt: string;
}

export const ImageCarousel: React.FC<ImageCarouselProps> = ({ images, alt }) => {
  const [current, setCurrent] = useState(0);
  const [touchStart, setTouchStart] = useState(0);

  if (!images.length) return null;

  const goTo = (index: number) => {
    setCurrent((index + images.length) % images.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStart - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      goTo(diff > 0 ? current + 1 : current - 1);
    }
  };

  return (
    <div className="relative w-full">
      <div
        className="aspect-square md:aspect-[4/5] overflow-hidden rounded-2xl bg-white/5"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <img
          src={images[current]}
          alt={`${alt} - ${current + 1}`}
          className="w-full h-full object-cover transition-opacity duration-300"
        />
      </div>

      {/* Navigation arrows (desktop) */}
      {images.length > 1 && (
        <>
          <button
            onClick={() => goTo(current - 1)}
            className="hidden md:flex absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm items-center justify-center text-white hover:bg-black/60 transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => goTo(current + 1)}
            className="hidden md:flex absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm items-center justify-center text-white hover:bg-black/60 transition-colors"
          >
            <ChevronRight size={18} />
          </button>
        </>
      )}

      {/* Dots indicator */}
      {images.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`rounded-full transition-all duration-300 ${
                i === current ? 'bg-white w-5 h-2' : 'bg-white/40 w-2 h-2'
              }`}
            />
          ))}
        </div>
      )}

      {/* Thumbnails (desktop) */}
      {images.length > 1 && (
        <div className="hidden md:flex gap-2 mt-3">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                i === current ? 'border-pudava-secondary' : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              <img src={img} alt={`Thumbnail ${i + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

import React from 'react';

interface LoadingSkeletonProps {
  type: 'product-card' | 'product-detail' | 'order-card' | 'text' | 'avatar';
  count?: number;
}

const Shimmer: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`skeleton-shimmer rounded-lg ${className}`} />
);

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ type, count = 1 }) => {
  const items = Array.from({ length: count });

  if (type === 'product-card') {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
        {items.map((_, i) => (
          <div key={i} className="rounded-2xl overflow-hidden border border-white/5">
            <Shimmer className="aspect-[3/4] rounded-none" />
            <div className="p-3 space-y-2">
              <Shimmer className="h-4 w-3/4" />
              <Shimmer className="h-3 w-1/3" />
              <div className="flex justify-between">
                <Shimmer className="h-4 w-1/4" />
                <Shimmer className="h-3 w-1/5" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'product-detail') {
    return (
      <div className="pt-20 px-4 md:px-8 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Shimmer className="aspect-square rounded-2xl" />
          <div className="space-y-4 py-4">
            <Shimmer className="h-8 w-3/4" />
            <Shimmer className="h-4 w-1/4" />
            <Shimmer className="h-6 w-1/3" />
            <Shimmer className="h-20 w-full" />
            <div className="flex gap-2">
              {[1, 2, 3, 4].map(i => <Shimmer key={i} className="h-10 w-14" />)}
            </div>
            <Shimmer className="h-12 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (type === 'order-card') {
    return (
      <div className="space-y-3">
        {items.map((_, i) => (
          <div key={i} className="p-4 rounded-xl border border-white/5">
            <div className="flex justify-between mb-3">
              <Shimmer className="h-3 w-24" />
              <Shimmer className="h-5 w-20 rounded-full" />
            </div>
            <div className="flex gap-2 mb-3">
              {[1, 2].map(j => <Shimmer key={j} className="w-10 h-10 rounded-lg" />)}
            </div>
            <Shimmer className="h-4 w-20 mt-3" />
          </div>
        ))}
      </div>
    );
  }

  if (type === 'avatar') {
    return <Shimmer className="w-16 h-16 rounded-full" />;
  }

  // text
  return (
    <div className="space-y-2">
      {items.map((_, i) => (
        <Shimmer key={i} className="h-4 w-full" style={{ width: `${70 + Math.random() * 30}%` } as any} />
      ))}
    </div>
  );
};

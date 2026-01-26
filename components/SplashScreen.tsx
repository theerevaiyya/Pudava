import React from 'react';

export const SplashScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0a0118] text-white overflow-hidden">
      <div className="relative z-10">
        <svg className="w-[280px] md:w-[500px] h-[100px] md:h-[150px]" viewBox="0 0 500 120">
            <text 
                x="50%" 
                y="50%" 
                dominantBaseline="middle" 
                textAnchor="middle" 
                className="font-serif font-bold text-6xl md:text-8xl tracking-[0.25em] stroke-text"
            >
                PUDAVA
            </text>
        </svg>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4/5 h-32 bg-pink-500/10 blur-[80px] -z-10 animate-pulse"></div>
      </div>

      <div className="relative mt-2 h-[1px] bg-white/5 w-72 overflow-hidden rounded-full">
         <div className="absolute inset-0 bg-gradient-to-r from-transparent via-pink-500 to-transparent w-full h-full animate-shimmer"></div>
      </div>
      
      <p className="mt-8 text-[9px] uppercase tracking-[0.6em] text-pink-400/50 animate-fade-in opacity-0" style={{animationDelay: '2.4s', animationFillMode: 'forwards'}}>
        Royal Orchid Collection
      </p>

      <style>{`
        .stroke-text {
            fill: transparent;
            stroke: #ec4899; 
            stroke-width: 0.8px;
            stroke-dasharray: 1000;
            stroke-dashoffset: 1000;
            animation: stroke 2.8s cubic-bezier(0.16, 1, 0.3, 1) forwards, fill 1s ease-out 2.2s forwards;
        }

        @keyframes stroke {
            0% { stroke-dashoffset: 1000; }
            100% { stroke-dashoffset: 0; }
        }

        @keyframes fill {
            from { fill: transparent; stroke: #ec4899; }
            to { fill: #ec4899; stroke: transparent; }
        }

        @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
        }

        .animate-shimmer {
            animation: shimmer 2.5s infinite linear;
        }
      `}</style>
    </div>
  );
};
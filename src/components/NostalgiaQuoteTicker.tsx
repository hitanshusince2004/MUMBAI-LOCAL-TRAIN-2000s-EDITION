import React, { useState, useEffect } from 'react';
import { NOSTALGIC_QUOTES } from '../data/stations';

export const NostalgiaQuoteTicker: React.FC = () => {
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setQuoteIndex((prev) => (prev + 1) % NOSTALGIC_QUOTES.length);
        setFade(true);
      }, 400);
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative z-20 w-full max-w-4xl mx-auto px-4 py-2 my-1">
      <div className="bg-black/40 backdrop-blur-md border border-white/20 rounded-full px-5 sm:px-8 py-2.5 flex items-center justify-between gap-4 shadow-2xl">
        <div className="flex items-center gap-2 text-yellow-400 text-xs font-mono font-bold shrink-0">
          <span className="w-2 h-2 rounded-full bg-yellow-400 shadow-[0_0_10px_#fde047] animate-pulse" />
          <span className="hidden sm:inline uppercase tracking-widest text-[10px]">MUMBAI MEMORY</span>
        </div>

        <div className="h-4 w-px bg-white/10" />

        <div
          className={`flex-1 text-center text-sm sm:text-base font-serif italic text-white/90 tracking-wide transition-opacity duration-300 ${
            fade ? 'opacity-100' : 'opacity-0'
          }`}
        >
          "{NOSTALGIC_QUOTES[quoteIndex]}"
        </div>

        <div className="text-[10px] text-gray-400 font-mono hidden md:block shrink-0 uppercase tracking-wider">
          2000s ARCHIVE
        </div>
      </div>
    </div>
  );
};

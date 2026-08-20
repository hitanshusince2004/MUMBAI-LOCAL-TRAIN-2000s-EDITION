import React from 'react';
import { Station } from '../types';

interface HeroHeaderProps {
  currentStation: Station;
  journeyCount: number;
  isMonsoon: boolean;
  onToggleMonsoon: () => void;
  onTriggerHorn: () => void;
}

export const HeroHeader: React.FC<HeroHeaderProps> = ({
  currentStation,
  journeyCount,
  isMonsoon,
  onToggleMonsoon,
  onTriggerHorn,
}) => {
  return (
    <header className="relative z-30 w-full pt-6 pb-2 px-4 sm:px-8 max-w-7xl mx-auto flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
      {/* Cinematic Title & Nostalgic Subtitle */}
      <div className="text-center md:text-left">
        <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-600 shadow-[0_0_15px_rgba(220,38,38,0.8)] animate-pulse" />
          <span className="text-[10px] uppercase tracking-widest text-gray-400 font-mono">
            SUBURBAN EMU • 2000s ARCHIVE
          </span>
        </div>

        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-serif font-black tracking-tighter text-white leading-none drop-shadow-2xl">
          MUMBAI<br className="hidden sm:inline" /> <span className="text-yellow-400">LOCAL</span>
        </h1>

        <p className="text-lg sm:text-xl italic font-serif text-gray-300/90 mt-2">
          A Journey Through the 2000s
        </p>
      </div>

      {/* Atmospheric Indicator Panel & Quick Action Triggers */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Destination Information Board */}
        <div className="bg-black/40 backdrop-blur-md border border-white/20 p-5 rounded-xl w-72 shadow-2xl">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] uppercase tracking-widest text-gray-400 font-mono">
              Indicator
            </span>
            <span className="text-xs text-red-500 font-mono font-bold animate-pulse flex items-center gap-1">
              <span>●</span>
              <span>FAST LOCAL</span>
            </span>
          </div>

          <div className="font-mono text-left">
            <div className="text-[10px] text-gray-400 uppercase tracking-wider">NEXT STATION</div>
            <div className="text-2xl sm:text-3xl text-yellow-400 font-bold tracking-wider truncate">
              {currentStation.name}
            </div>
            <div className="text-[11px] text-slate-400 font-sans mt-0.5">
              {currentStation.nameMarathi} • {currentStation.nameHindi}
            </div>

            <div className="mt-3 pt-2 border-t border-white/10 flex justify-between items-end">
              <div>
                <div className="text-[10px] text-gray-400">TIME</div>
                <div className="text-base font-bold text-white">{currentStation.timeEstimate}</div>
              </div>
              <div className="text-center">
                <div className="text-[10px] text-gray-400">PF</div>
                <div className="text-base font-bold text-yellow-400">{currentStation.platform}</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-gray-400">TRIP</div>
                <div className="text-base font-bold text-slate-300">#{journeyCount}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Atmospheric Trigger Buttons */}
        <div className="flex sm:flex-col justify-center gap-2">
          <button
            id="toggle-monsoon-btn"
            onClick={onToggleMonsoon}
            className={`px-4 py-2.5 rounded-xl text-xs font-mono font-semibold transition-all border backdrop-blur-md flex items-center justify-center gap-2 shadow-xl active:scale-95 ${
              isMonsoon
                ? 'bg-blue-900/40 border-blue-400/50 text-blue-200 shadow-blue-950/50'
                : 'bg-white/10 border-white/15 text-gray-300 hover:text-white hover:bg-white/20'
            }`}
            title="Press [M] to toggle Monsoon Rain"
          >
            <span>🌧️</span>
            <span>Monsoon [M]</span>
          </button>

          <button
            id="trigger-horn-btn"
            onClick={onTriggerHorn}
            className="px-4 py-2.5 rounded-xl text-xs font-mono font-semibold bg-gradient-to-r from-[#7c2d12] to-[#431407] hover:from-[#9a3412] hover:to-[#5c1c0a] border border-yellow-400/40 text-yellow-300 backdrop-blur-md transition-all flex items-center justify-center gap-2 shadow-xl active:scale-95"
            title="Press [T] for authentic EMU train horn"
          >
            <span>🎺</span>
            <span>Horn [T]</span>
          </button>
        </div>
      </div>
    </header>
  );
};

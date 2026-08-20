import React, { useState, useEffect } from 'react';
import { Station, TimeOfDay } from '../types';

interface ParallaxEnvironmentProps {
  currentStation: Station;
  signalState: 'green' | 'yellow' | 'red';
  onSignalToggle: () => void;
  onStationBoardClick: () => void;
  onChaiClick: () => void;
  isMonsoon: boolean;
  timeOfDay: TimeOfDay;
  trainSpeed: number;
}

export const ParallaxEnvironment: React.FC<ParallaxEnvironmentProps> = ({
  currentStation,
  signalState,
  onSignalToggle,
  onStationBoardClick,
  onChaiClick,
  isMonsoon,
  timeOfDay,
  trainSpeed,
}) => {
  const [clockTime, setClockTime] = useState({ hours: 19, minutes: 42, seconds: 0 });
  const [chaiSteam, setChaiSteam] = useState(true);

  // Live analog clock ticks
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setClockTime({
        hours: now.getHours(),
        minutes: now.getMinutes(),
        seconds: now.getSeconds(),
      });
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const secAngle = clockTime.seconds * 6;
  const minAngle = clockTime.minutes * 6 + clockTime.seconds * 0.1;
  const hourAngle = (clockTime.hours % 12) * 30 + clockTime.minutes * 0.5;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
      {/* ============================================================ */}
      {/* LAYER 0: SKY GRADIENT & MONSOON ATMOSPHERE */}
      {/* ============================================================ */}
      <div
        className={`absolute inset-0 transition-colors duration-1000 ${
          timeOfDay === 'monsoon_evening'
            ? 'bg-gradient-to-b from-[#111827] via-[#1e1b4b] to-[#431407] opacity-80'
            : timeOfDay === 'sodium_night'
            ? 'bg-gradient-to-b from-[#0a0502] via-[#1e1b4b] to-[#7c2d12] opacity-80'
            : 'bg-gradient-to-b from-[#431407] via-[#7c2d12] to-[#1e1b4b] opacity-80'
        }`}
      />

      {/* Atmospheric Radial Color Blooms */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at 70% 30%, rgba(251, 146, 60, 0.14) 0%, transparent 50%), radial-gradient(circle at 20% 80%, rgba(30, 64, 175, 0.2) 0%, transparent 60%)',
        }}
      />

      {/* Atmospheric Vertical Light Pillars & Poles */}
      <div className="absolute left-20 bottom-[134px] w-2 h-48 bg-gradient-to-t from-[#1f2937] to-transparent opacity-50 pointer-events-none" />
      <div className="absolute left-[400px] bottom-[134px] w-2 h-64 bg-gradient-to-t from-[#1f2937] to-transparent opacity-30 pointer-events-none" />
      <div className="absolute left-[800px] bottom-[134px] w-2 h-40 bg-gradient-to-t from-[#1f2937] to-transparent opacity-40 pointer-events-none" />

      {/* Atmospheric Railway Horizon Tracks Line */}
      <div className="absolute bottom-32 w-full h-[2px] bg-[#374151] opacity-70 pointer-events-none" />
      <div className="absolute bottom-[130px] w-full h-[4px] bg-[#111827] opacity-90 pointer-events-none" />

      {/* Monsoon Rain Cloud Layer */}
      {isMonsoon && (
        <div className="absolute top-0 left-0 w-full h-48 bg-gradient-to-b from-[#111827]/90 via-[#1e1b4b]/40 to-transparent pointer-events-none animate-pulse opacity-85" />
      )}

      {/* ============================================================ */}
      {/* LAYER 1: DISTANT 2000s MUMBAI SKYLINE SILHOUETTE */}
      {/* ============================================================ */}
      <div className="absolute bottom-[44%] left-0 w-[200%] h-36 flex items-end opacity-40 z-0">
        <svg viewBox="0 0 1600 120" className="w-full h-full text-slate-800/80 fill-current preserve-3d">
          {/* Gothic Spire / CST Dome silhouette */}
          <path d="M 60 120 L 60 70 L 75 50 L 75 25 L 80 10 L 85 25 L 85 50 L 100 70 L 100 120 Z" />
          <path d="M 120 120 L 120 85 L 140 85 L 140 120 Z" />
          {/* Vintage Mills Chimney */}
          <path d="M 220 120 L 225 15 L 232 15 L 237 120 Z" />
          {/* Retro Low-rise Mumbai Chawls & Buildings */}
          <rect x="260" y="60" width="80" height="60" />
          <rect x="360" y="45" width="55" height="75" />
          <rect x="430" y="70" width="90" height="50" />
          {/* Palm Trees */}
          <path d="M 550 120 Q 555 70 560 50 C 540 40 530 20 560 30 C 570 10 585 20 575 35 C 600 30 600 50 570 50 Q 565 70 560 120 Z" />
          <path d="M 610 120 Q 615 75 620 55 C 600 45 590 25 620 35 C 630 15 645 25 635 40 C 660 35 660 55 630 55 Q 625 75 620 120 Z" />
          {/* Distant High-rises */}
          <rect x="680" y="40" width="70" height="80" />
          <rect x="770" y="55" width="45" height="65" />
          <rect x="830" y="30" width="90" height="90" />
          <path d="M 940 120 L 950 40 L 965 20 L 980 40 L 990 120 Z" />
          <rect x="1020" y="65" width="110" height="55" />
          <rect x="1150" y="50" width="60" height="70" />
          <rect x="1230" y="35" width="85" height="85" />
        </svg>
      </div>

      {/* ============================================================ */}
      {/* LAYER 2: OVERHEAD FOOTBRIDGE & CATENARY GANTRY */}
      {/* ============================================================ */}
      <div className="absolute top-[8%] left-[18%] w-56 h-28 hidden md:block opacity-60 pointer-events-none">
        <svg viewBox="0 0 200 100" className="w-full h-full stroke-slate-700 fill-none" strokeWidth="2">
          {/* Steel Truss Footbridge Structure */}
          <line x1="0" y1="40" x2="200" y2="40" />
          <line x1="0" y1="60" x2="200" y2="60" />
          <line x1="20" y1="40" x2="40" y2="60" />
          <line x1="40" y1="40" x2="60" y2="60" />
          <line x1="60" y1="40" x2="80" y2="60" />
          <line x1="80" y1="40" x2="100" y2="60" />
          <line x1="100" y1="40" x2="120" y2="60" />
          <line x1="120" y1="40" x2="140" y2="60" />
          <line x1="140" y1="40" x2="160" y2="60" />
          <line x1="160" y1="40" x2="180" y2="60" />
          {/* Bridge Pillar */}
          <line x1="30" y1="60" x2="30" y2="100" strokeWidth="4" />
          <line x1="170" y1="60" x2="170" y2="100" strokeWidth="4" />
        </svg>
      </div>

      {/* ============================================================ */}
      {/* LAYER 3: 2000s VINTAGE RETRO BILLBOARDS */}
      {/* ============================================================ */}
      <div className="absolute top-[12%] right-[8%] hidden lg:flex items-center gap-4 pointer-events-none opacity-85">
        {/* Retro Thums Up Billboard */}
        <div className="bg-gradient-to-r from-red-900 to-blue-900 border-2 border-slate-700/80 p-2 rounded shadow-2xl w-44">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-red-400 font-mono">
              THUMS UP • 2000s
            </span>
            <span className="text-[9px] bg-red-600 text-white px-1 font-bold rounded">₹10</span>
          </div>
          <p className="text-xs font-black text-amber-300 tracking-tight mt-0.5 font-sans">
            TASTE THE THUNDER!
          </p>
          <p className="text-[9px] text-slate-300">Toofani Thanda in Mumbai Locals</p>
        </div>

        {/* Vintage Hutch Pug Billboard */}
        <div className="bg-gradient-to-r from-pink-950 to-purple-950 border-2 border-slate-700/80 p-2 rounded shadow-2xl w-44">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-pink-300 font-mono">HUTCH 2004</span>
            <span className="text-[9px] text-emerald-400 font-mono">9820-XXXX</span>
          </div>
          <p className="text-xs font-bold text-white tracking-tight mt-0.5">
            "Wherever You Go, Our Network Follows"
          </p>
        </div>
      </div>

      {/* ============================================================ */}
      {/* LAYER 4: STATION PLATFORM VINTAGE ARTIFACTS */}
      {/* ============================================================ */}
      <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-[#0a0502] via-[#111827]/80 to-transparent z-15 pointer-events-auto">
        <div className="relative w-full h-full max-w-7xl mx-auto px-4 flex items-end justify-between pb-3">
          {/* Left Side: Station Board & Analog Platform Clock */}
          <div className="flex items-end gap-3 sm:gap-6">
            {/* Iconic Mumbai Yellow/Black Station Signboard */}
            <div
              id="vintage-station-signboard"
              onClick={onStationBoardClick}
              className="group cursor-pointer bg-gradient-to-b from-[#fde047] to-[#f59e0b] text-black border-4 border-[#431407] rounded-lg px-3 sm:px-6 py-2 shadow-2xl transform transition-all duration-300 hover:scale-105 active:scale-95"
              title="Click for Station Announcement Chime!"
            >
              <div className="text-center">
                <div className="text-xs sm:text-sm font-bold tracking-wider text-slate-950 font-sans">
                  {currentStation.nameMarathi} • {currentStation.nameHindi}
                </div>
                <div className="text-xl sm:text-3xl font-black tracking-widest font-mono uppercase text-black leading-none my-0.5">
                  {currentStation.name}
                </div>
                <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-slate-900">
                  <span className="bg-black text-yellow-400 px-2 py-0.5 rounded text-[9px] font-mono border border-yellow-400">
                    PF-{currentStation.platform}
                  </span>
                  <span>{currentStation.line.toUpperCase()} LINE</span>
                </div>
              </div>
            </div>

            {/* Vintage Analog Platform Clock */}
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-slate-100 border-4 border-[#431407] shadow-2xl relative flex items-center justify-center">
                {/* Clock Face Numbers */}
                <div className="absolute top-1 text-[9px] font-bold text-slate-800">12</div>
                <div className="absolute right-1.5 text-[9px] font-bold text-slate-800">3</div>
                <div className="absolute bottom-1 text-[9px] font-bold text-slate-800">6</div>
                <div className="absolute left-1.5 text-[9px] font-bold text-slate-800">9</div>
                
                {/* Hour Hand */}
                <div
                  className="absolute w-1 bg-slate-950 rounded origin-bottom"
                  style={{
                    height: '24%',
                    bottom: '50%',
                    transform: `rotate(${hourAngle}deg)`,
                  }}
                />
                {/* Minute Hand */}
                <div
                  className="absolute w-0.5 bg-slate-800 rounded origin-bottom"
                  style={{
                    height: '36%',
                    bottom: '50%',
                    transform: `rotate(${minAngle}deg)`,
                  }}
                />
                {/* Second Hand (Red) */}
                <div
                  className="absolute w-0.5 bg-red-600 rounded origin-bottom"
                  style={{
                    height: '42%',
                    bottom: '50%',
                    transform: `rotate(${secAngle}deg)`,
                  }}
                />
                {/* Center Pin */}
                <div className="w-2 h-2 rounded-full bg-slate-950 z-10" />
              </div>
              <span className="text-[10px] text-yellow-400 font-mono font-semibold mt-1">
                PLATFORM CLOCK
              </span>
            </div>

            {/* Steaming Cutting Chai Tapri Stall */}
            <div
              id="cutting-chai-tapri"
              onClick={onChaiClick}
              className="hidden sm:flex flex-col items-center cursor-pointer group bg-black/40 backdrop-blur-md border border-white/20 px-3 py-2 rounded-xl hover:border-yellow-400 transition-all shadow-xl"
              title="Click for hot Cutting Chai!"
            >
              <div className="flex items-center gap-2">
                <span className="text-xl group-hover:scale-125 transition-transform">☕</span>
                <div className="text-left">
                  <div className="text-xs font-bold text-yellow-300 leading-tight">Cutting Chai</div>
                  <div className="text-[9px] text-gray-300">Masala Adrak • ₹2.50</div>
                </div>
              </div>
              <span className="text-[8px] text-emerald-400 font-mono mt-1">TAPRI READY</span>
            </div>
          </div>

          {/* Right Side: Interactive 3-Aspect Railway Signal & Speed Gauge */}
          <div className="flex items-end gap-3 sm:gap-6">
            {/* Speed & Line indicator */}
            <div className="hidden md:flex flex-col items-end">
              <div className="bg-black/40 backdrop-blur-md border border-white/20 px-4 py-2 rounded-xl shadow-xl text-right">
                <div className="text-[10px] text-gray-400 uppercase font-mono">Suburban Speed</div>
                <div className="text-xl font-black text-yellow-400 font-mono flex items-baseline justify-end gap-1">
                  <span>{trainSpeed}</span>
                  <span className="text-xs font-normal text-gray-300">KM/H</span>
                </div>
              </div>
            </div>

            {/* Interactive 3-Aspect Railway Signal Mast */}
            <div
              id="railway-signal-mast"
              onClick={onSignalToggle}
              className="cursor-pointer group flex flex-col items-center bg-[#111827] border-2 border-white/20 rounded-full p-2.5 shadow-2xl hover:border-yellow-400 transition-all"
              title="Click to change signal (Red / Yellow / Green)"
            >
              <div className="flex flex-col gap-2">
                {/* Red Lamp */}
                <div
                  className={`w-5 h-5 rounded-full border border-red-950 transition-all duration-300 ${
                    signalState === 'red'
                      ? 'bg-red-600 shadow-[0_0_20px_rgba(220,38,38,0.9)] animate-pulse'
                      : 'bg-red-950/40'
                  }`}
                />
                {/* Yellow Lamp */}
                <div
                  className={`w-5 h-5 rounded-full border border-yellow-950 transition-all duration-300 ${
                    signalState === 'yellow'
                      ? 'bg-yellow-400 shadow-[0_0_20px_rgba(253,224,71,0.9)]'
                      : 'bg-yellow-950/40'
                  }`}
                />
                {/* Green Lamp */}
                <div
                  className={`w-5 h-5 rounded-full border border-green-950 transition-all duration-300 ${
                    signalState === 'green'
                      ? 'bg-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.9)]'
                      : 'bg-emerald-950/40'
                  }`}
                />
              </div>
              <span className="text-[8px] font-mono text-gray-300 mt-1.5 uppercase font-bold">
                {signalState}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

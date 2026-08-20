import React, { useState } from 'react';
import { Station, NostalgicMemory, TimeOfDay } from '../types';
import { STATIONS, NOSTALGIC_MEMORIES } from '../data/stations';
import { audioEngine } from '../utils/audioEngine';
import confetti from 'canvas-confetti';
import { Sparkles, Phone, Ticket, Coffee, Volume2, CloudRain, Sun, Moon, Compass, Bell, Info } from 'lucide-react';

interface InteractiveNostalgiaHubProps {
  currentStation: Station;
  onSelectStation: (station: Station) => void;
  isMonsoon: boolean;
  onToggleMonsoon: () => void;
  timeOfDay: TimeOfDay;
  onChangeTimeOfDay: (time: TimeOfDay) => void;
}

export const InteractiveNostalgiaHub: React.FC<InteractiveNostalgiaHubProps> = ({
  currentStation,
  onSelectStation,
  isMonsoon,
  onToggleMonsoon,
  timeOfDay,
  onChangeTimeOfDay,
}) => {
  const [activeTab, setActiveTab] = useState<'stations' | 'memories' | 'ticket' | 'nokia'>('stations');
  const [ticketPunched, setTicketPunched] = useState(false);
  const [nokiaMessageIndex, setNokiaMessageIndex] = useState(0);

  const nokiaMessages = [
    'Dad, train slow hai Dadar pe. 8:30 tak ghar pahunchunga.',
    'Virar fast pakad li hai. Window seat mili aaj!',
    'Platform 4 pe cutting chai peete hain aaja.',
    'Bhai, Borivali ka handkerchief wala seat reserved hai apna.',
    'Snake II score: 1420 points while crossing Bandra!',
  ];

  const handlePunchTicket = (e: React.MouseEvent) => {
    audioEngine.playGuardWhistle();
    setTicketPunched(true);

    const rect = e.currentTarget.getBoundingClientRect();
    confetti({
      particleCount: 25,
      spread: 45,
      origin: {
        x: (rect.left + rect.width / 2) / window.innerWidth,
        y: (rect.top + rect.height / 2) / window.innerHeight,
      },
      colors: ['#f59e0b', '#fbbf24', '#d97706'],
    });

    setTimeout(() => setTicketPunched(false), 2400);
  };

  const handleNokiaClick = () => {
    audioEngine.playNokiaRingtone();
    setNokiaMessageIndex((prev) => (prev + 1) % nokiaMessages.length);
  };

  return (
    <section className="relative z-20 w-full max-w-7xl mx-auto px-4 py-4 select-none">
      {/* Navigation Pills */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 border-b border-white/10 pb-3">
        <div className="flex items-center gap-2 overflow-x-auto py-1">
          <button
            id="tab-stations-btn"
            onClick={() => setActiveTab('stations')}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'stations'
                ? 'bg-gradient-to-r from-[#7c2d12] to-[#431407] border border-yellow-400/50 text-yellow-300 shadow-xl'
                : 'bg-white/5 backdrop-blur-md text-gray-300 hover:text-white hover:bg-white/10 border border-white/10'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-yellow-400" />
            <span>SUBURBAN STATIONS ({STATIONS.length})</span>
          </button>

          <button
            id="tab-ticket-btn"
            onClick={() => setActiveTab('ticket')}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'ticket'
                ? 'bg-gradient-to-r from-[#7c2d12] to-[#431407] border border-yellow-400/50 text-yellow-300 shadow-xl'
                : 'bg-white/5 backdrop-blur-md text-gray-300 hover:text-white hover:bg-white/10 border border-white/10'
            }`}
          >
            <Ticket className="w-3.5 h-3.5 text-yellow-400" />
            <span>UTS 2000s TICKET</span>
          </button>

          <button
            id="tab-nokia-btn"
            onClick={() => setActiveTab('nokia')}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'nokia'
                ? 'bg-gradient-to-r from-[#7c2d12] to-[#431407] border border-yellow-400/50 text-yellow-300 shadow-xl'
                : 'bg-white/5 backdrop-blur-md text-gray-300 hover:text-white hover:bg-white/10 border border-white/10'
            }`}
          >
            <Phone className="w-3.5 h-3.5 text-yellow-400" />
            <span>NOKIA 3310 SMS</span>
          </button>

          <button
            id="tab-memories-btn"
            onClick={() => setActiveTab('memories')}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'memories'
                ? 'bg-gradient-to-r from-[#7c2d12] to-[#431407] border border-yellow-400/50 text-yellow-300 shadow-xl'
                : 'bg-white/5 backdrop-blur-md text-gray-300 hover:text-white hover:bg-white/10 border border-white/10'
            }`}
          >
            <Coffee className="w-3.5 h-3.5 text-yellow-400" />
            <span>MEMORIES & TRIVIA</span>
          </button>
        </div>

        {/* Atmosphere & Lighting Control Toolbar */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-gray-400 uppercase hidden sm:inline">Lighting:</span>
          <div className="bg-black/40 backdrop-blur-md border border-white/15 rounded-xl p-1 flex items-center gap-1">
            <button
              onClick={() => onChangeTimeOfDay('monsoon_evening')}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                timeOfDay === 'monsoon_evening' ? 'bg-[#1e1b4b] border border-blue-400/50 text-blue-200 shadow' : 'text-gray-400 hover:text-white'
              }`}
              title="Monsoon Evening"
            >
              <CloudRain className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onChangeTimeOfDay('sodium_night')}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                timeOfDay === 'sodium_night' ? 'bg-[#431407] border border-yellow-400/50 text-yellow-300 shadow' : 'text-gray-400 hover:text-white'
              }`}
              title="Sodium Vapor Night"
            >
              <Moon className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onChangeTimeOfDay('golden_sunset')}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                timeOfDay === 'golden_sunset' ? 'bg-[#7c2d12] border border-orange-400/50 text-orange-300 shadow' : 'text-gray-400 hover:text-white'
              }`}
              title="Golden Sunset"
            >
              <Sun className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Tab 1: Stations List & Dynamic Jump */}
      {activeTab === 'stations' && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
          {STATIONS.map((st) => {
            const isCurrent = st.id === currentStation.id;
            return (
              <div
                key={st.id}
                id={`station-card-${st.id}`}
                onClick={() => {
                  audioEngine.playStationChime();
                  onSelectStation(st);
                }}
                className={`cursor-pointer rounded-xl p-3 text-left transition-all duration-300 border backdrop-blur-md ${
                  isCurrent
                    ? 'bg-gradient-to-b from-[#7c2d12]/70 via-[#431407]/80 to-[#1e1b4b]/60 border-yellow-400 shadow-[0_0_20px_rgba(253,224,71,0.3)] scale-102 text-yellow-300'
                    : 'bg-black/30 border-white/10 hover:border-white/25 hover:bg-white/5 text-gray-200'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                  <span className={isCurrent ? 'text-yellow-300 font-bold' : 'text-gray-400'}>
                    PF-{st.platform}
                  </span>
                  <span className="text-[9px] bg-white/10 px-1 py-0.2 rounded text-gray-300">
                    {st.code}
                  </span>
                </div>

                <div
                  className={`text-sm font-black font-mono uppercase tracking-wide truncate ${
                    isCurrent ? 'text-yellow-300' : 'text-white'
                  }`}
                >
                  {st.name}
                </div>
                <div className="text-[10px] text-gray-400 truncate">{st.nameMarathi}</div>

                <div className="mt-2 pt-1 border-t border-white/10 flex items-center justify-between text-[9px] text-gray-400 font-mono">
                  <span>{st.type}</span>
                  <span className="text-emerald-400">{st.timeEstimate.split(' ')[0]}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 2: Vintage UTS Railway Ticket */}
      {activeTab === 'ticket' && (
        <div className="max-w-xl mx-auto bg-[#e8e2cd] text-slate-900 p-4 sm:p-6 rounded-2xl shadow-2xl border-4 border-[#8c6d48] font-mono relative overflow-hidden">
          {/* Cardboard Ticket Texture Stripes */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-800/10 rounded-full blur-xl pointer-events-none" />

          <div className="flex items-center justify-between border-b-2 border-slate-700 pb-2 mb-3">
            <div className="text-left">
              <span className="text-[10px] font-bold tracking-widest text-red-900 uppercase">
                INDIAN RAILWAYS • SUBURBAN UTS
              </span>
              <div className="text-lg font-black text-slate-900 font-serif">
                MUMBAI LOCAL 2ND CLASS TICKET
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs font-bold text-slate-800 font-mono">₹4.00</div>
              <div className="text-[9px] text-slate-600">VALID 2 HOURS</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs mb-4">
            <div className="bg-[#dacfb2] p-2 rounded-lg">
              <span className="text-[9px] text-slate-600 uppercase block">FROM / पासून:</span>
              <span className="font-bold text-sm">CHURCHGATE (CCG)</span>
            </div>
            <div className="bg-[#dacfb2] p-2 rounded-lg">
              <span className="text-[9px] text-slate-600 uppercase block">TO / पर्यंत:</span>
              <span className="font-bold text-sm text-red-950">{currentStation.name} ({currentStation.code})</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-700 border-t border-dashed border-slate-500 pt-2 mb-4">
            <span>VIA: DIRECT FAST LINE</span>
            <span>TRAIN: 12-COACH EMU</span>
            <span>DATE: 19-AUG-2004</span>
          </div>

          {/* Ticket Puncher Action */}
          <div className="flex items-center justify-between">
            <div className="text-[10px] text-slate-600 italic font-serif">
              {ticketPunched ? '✓ PUNCHED BY TC • HAPPY JOURNEY!' : 'Click punch button below to validate ticket'}
            </div>

            <button
              id="punch-ticket-btn"
              onClick={handlePunchTicket}
              className="bg-[#7c2d12] hover:bg-[#9a3412] text-yellow-300 border border-yellow-400/40 text-xs font-bold px-5 py-2.5 rounded-xl shadow-lg transition-transform active:scale-95 flex items-center gap-2"
            >
              <span>🎟️</span>
              <span>{ticketPunched ? 'PUNCHED!' : 'PUNCH TICKET (TC)'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Tab 3: Nokia 3310 Classic Phone */}
      {activeTab === 'nokia' && (
        <div className="max-w-md mx-auto bg-black/40 backdrop-blur-md border border-white/20 rounded-3xl p-5 sm:p-6 shadow-2xl text-center">
          {/* Nokia Phone Frame */}
          <div className="bg-[#1e1b4b]/80 rounded-2xl p-4 border border-white/10 shadow-inner">
            <div className="text-[10px] font-bold font-mono text-yellow-400 tracking-widest uppercase mb-2">
              NOKIA 3310 • AIRTEL 2004
            </div>

            {/* Monochromatic Green LCD Screen */}
            <div
              onClick={handleNokiaClick}
              className="cursor-pointer bg-[#86efac] text-slate-950 p-4 rounded-xl font-mono text-left border-2 border-[#4ade80] shadow-inner transition-transform active:scale-98"
              title="Click to play Nokia Monophonic Ringtone!"
            >
              <div className="flex items-center justify-between text-[10px] font-bold border-b border-slate-900 pb-1 mb-2">
                <span>SMS INBOX (1/5)</span>
                <span>📶 ■■■■</span>
              </div>
              <div className="text-xs font-bold leading-relaxed min-h-[50px]">
                "{nokiaMessages[nokiaMessageIndex]}"
              </div>
              <div className="text-[9px] text-slate-700 mt-2 text-right">
                [CLICK FOR RINGTONE 🎵]
              </div>
            </div>

            {/* Phone Buttons */}
            <div className="grid grid-cols-3 gap-2 mt-4 text-xs font-bold font-mono text-gray-200">
              <button
                onClick={handleNokiaClick}
                className="bg-white/10 hover:bg-white/20 p-2.5 rounded-xl border border-white/10 shadow active:scale-95 transition-all"
              >
                1 [🔊]
              </button>
              <button
                onClick={handleNokiaClick}
                className="bg-white/10 hover:bg-white/20 p-2.5 rounded-xl border border-white/10 shadow active:scale-95 transition-all"
              >
                2 [ABC]
              </button>
              <button
                onClick={handleNokiaClick}
                className="bg-white/10 hover:bg-white/20 p-2.5 rounded-xl border border-white/10 shadow active:scale-95 transition-all"
              >
                3 [DEF]
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Nostalgic Memories & Trivia */}
      {activeTab === 'memories' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {NOSTALGIC_MEMORIES.map((mem) => (
            <div
              key={mem.id}
              className="bg-black/30 backdrop-blur-md border border-white/10 rounded-2xl p-4 text-left shadow-xl hover:border-yellow-400/40 transition-all group"
            >
              <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">{mem.icon}</div>
              <h4 className="text-sm font-bold text-yellow-400 font-serif">{mem.title}</h4>
              <p className="text-xs text-gray-300 mt-1.5 leading-relaxed">{mem.text}</p>
              <div className="mt-3 pt-2 border-t border-white/10 text-[10px] text-gray-400 font-mono">
                {mem.subtext}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Keyboard Shortcuts Bar */}
      <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[11px] font-mono text-gray-400">
        <span className="text-yellow-400 font-bold uppercase">Quick Keys:</span>
        <span><kbd className="bg-white/10 text-yellow-300 px-2 py-0.5 rounded border border-white/15 font-bold">T</kbd> Train Horn</span>
        <span><kbd className="bg-white/10 text-yellow-300 px-2 py-0.5 rounded border border-white/15 font-bold">M</kbd> Monsoon Rain</span>
        <span><kbd className="bg-white/10 text-yellow-300 px-2 py-0.5 rounded border border-white/15 font-bold">S</kbd> Railway Signal</span>
        <span><kbd className="bg-white/10 text-yellow-300 px-2 py-0.5 rounded border border-white/15 font-bold">H</kbd> High Beams</span>
        <span><kbd className="bg-white/10 text-yellow-300 px-2 py-0.5 rounded border border-white/15 font-bold">Space</kbd> Bollywood Radio</span>
      </div>
    </section>
  );
};

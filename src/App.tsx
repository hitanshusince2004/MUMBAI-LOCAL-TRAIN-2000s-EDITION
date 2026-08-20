import React, { useState, useEffect, useCallback } from 'react';
import { Station, TimeOfDay } from './types';
import { STATIONS } from './data/stations';
import { audioEngine } from './utils/audioEngine';
import { HeroHeader } from './components/HeroHeader';
import { Train3DCanvas } from './components/Train3DCanvas';
import { ParallaxEnvironment } from './components/ParallaxEnvironment';
import { NostalgiaQuoteTicker } from './components/NostalgiaQuoteTicker';
import { InteractiveNostalgiaHub } from './components/InteractiveNostalgiaHub';
import { MusicPlayer } from './components/MusicPlayer';
import { Volume2, VolumeX, Sparkles, AlertCircle } from 'lucide-react';

export default function App() {
  const [stationIndex, setStationIndex] = useState(0);
  const [journeyCount, setJourneyCount] = useState(1);
  const [signalState, setSignalState] = useState<'green' | 'yellow' | 'red'>('green');
  const [isMonsoon, setIsMonsoon] = useState(true);
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('monsoon_evening');
  const [isHeadlightHigh, setIsHeadlightHigh] = useState(true);
  const [trainSpeedKmph, setTrainSpeedKmph] = useState(78);
  const [announcementBanner, setAnnouncementBanner] = useState<string | null>(null);
  const [audioStarted, setAudioStarted] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const currentStation = STATIONS[stationIndex];
  const nextStation = STATIONS[(stationIndex + 1) % STATIONS.length];

  // Initialize Web Audio Engine upon user interaction
  const handleStartAudio = () => {
    audioEngine.init();
    audioEngine.startTrackSoundLoop();
    if (isMonsoon) {
      audioEngine.startMonsoonRain();
    }
    setAudioStarted(true);
  };

  // Synchronized Destination Progression when train finishes crossing screen
  const handleJourneyComplete = useCallback(() => {
    setStationIndex((prev) => (prev + 1) % STATIONS.length);
    setJourneyCount((prev) => prev + 1);

    const nextSt = STATIONS[(stationIndex + 1) % STATIONS.length];
    setAnnouncementBanner(`Next Station: ${nextSt.name} (${nextSt.nameMarathi}) • Platform ${nextSt.platform}`);

    // Play railway station chime
    audioEngine.playStationChime();

    setTimeout(() => {
      setAnnouncementBanner(null);
    }, 4500);
  }, [stationIndex]);

  // Train Horn Trigger
  const handleTriggerHorn = () => {
    if (!audioStarted) handleStartAudio();
    audioEngine.playTrainHorn();
  };

  // Signal state toggle (cycles Green -> Yellow -> Red -> Green)
  const handleSignalToggle = () => {
    if (!audioStarted) handleStartAudio();
    setSignalState((prev) => {
      if (prev === 'green') return 'yellow';
      if (prev === 'yellow') return 'red';
      return 'green';
    });
  };

  // Monsoon Toggle
  const handleToggleMonsoon = () => {
    if (!audioStarted) handleStartAudio();
    setIsMonsoon((prev) => {
      const next = !prev;
      if (next) {
        audioEngine.startMonsoonRain();
      } else {
        audioEngine.stopMonsoonRain();
      }
      return next;
    });
  };

  // Station Board Click Trigger
  const handleStationBoardClick = () => {
    if (!audioStarted) handleStartAudio();
    audioEngine.playStationChime();
    setAnnouncementBanner(`Pudhil station... ${currentStation.name} • ${currentStation.nameMarathi} • Platform ${currentStation.platform}`);
    setTimeout(() => setAnnouncementBanner(null), 4000);
  };

  // Chai Stall Click
  const handleChaiClick = () => {
    if (!audioStarted) handleStartAudio();
    audioEngine.playChaiStallSound();
    setAnnouncementBanner('Ek cutting chai adrak maar ke garma garam ready hai! ☕');
    setTimeout(() => setAnnouncementBanner(null), 3000);
  };

  // Direct Station Jump
  const handleSelectStation = (station: Station) => {
    const idx = STATIONS.findIndex((s) => s.id === station.id);
    if (idx !== -1) {
      setStationIndex(idx);
      setAnnouncementBanner(`Destination set to: ${station.name} (${station.nameMarathi})`);
      setTimeout(() => setAnnouncementBanner(null), 3500);
    }
  };

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid firing inside input fields
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      const key = e.key.toLowerCase();
      if (key === 't') {
        e.preventDefault();
        handleTriggerHorn();
      } else if (key === 'm') {
        e.preventDefault();
        handleToggleMonsoon();
      } else if (key === 's') {
        e.preventDefault();
        handleSignalToggle();
      } else if (key === 'h') {
        e.preventDefault();
        setIsHeadlightHigh((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [audioStarted, isMonsoon]);

  // Master Mute
  const toggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    audioEngine.setMasterVolume(nextMute ? 0 : 0.7);
  };

  return (
    <div className="relative min-h-screen bg-[#0a0502] text-white flex flex-col justify-between overflow-x-hidden font-sans select-none">
      {/* Background Gradient Layer: Deep Midnight -> Indigo -> Burnt Rust */}
      <div className="fixed inset-0 bg-gradient-to-b from-[#111827] via-[#1e1b4b] to-[#431407] opacity-85 pointer-events-none" />

      {/* Radial Atmospheric Lighting */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at 70% 30%, rgba(251, 146, 60, 0.15) 0%, transparent 50%), radial-gradient(circle at 20% 80%, rgba(30, 64, 175, 0.2) 0%, transparent 60%)',
        }}
      />

      {/* Subtle Vertical Cinematic Ambient Light Ray Dividers */}
      <div className="fixed top-0 left-[35%] w-px h-full bg-gradient-to-b from-transparent via-white/5 to-transparent pointer-events-none z-10" />
      <div className="fixed top-0 right-[22%] w-px h-full bg-gradient-to-b from-transparent via-white/5 to-transparent pointer-events-none z-10" />

      {/* Film Grain Noise Texture Overlay */}
      <div className="fixed inset-0 bg-noise opacity-20 pointer-events-none z-40" />

      {/* Audio Enable Prompt Banner if not started */}
      {!audioStarted && (
        <div
          onClick={handleStartAudio}
          className="fixed top-3 left-1/2 -translate-x-1/2 z-50 cursor-pointer bg-gradient-to-r from-[#7c2d12] via-[#ea580c] to-[#f59e0b] text-white px-5 py-2 rounded-full font-mono text-xs font-bold shadow-2xl border border-yellow-400/40 flex items-center gap-2 hover:scale-105 transition-transform animate-bounce"
        >
          <Sparkles className="w-4 h-4 text-yellow-300" />
          <span className="tracking-wide">CLICK ANYWHERE TO START 2000s SOUNDSCAPE & AMBIENCE</span>
        </div>
      )}

      {/* Floating Station Announcement Toast */}
      {announcementBanner && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-[#111827]/90 border border-yellow-400/50 text-yellow-300 px-6 py-3 rounded-xl shadow-2xl backdrop-blur-xl font-mono text-sm font-bold flex items-center gap-3 animate-fade-in">
          <span className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.9)] animate-ping" />
          <span>📢 {announcementBanner}</span>
        </div>
      )}

      {/* Main Top Header & Journey Status */}
      <HeroHeader
        currentStation={currentStation}
        journeyCount={journeyCount}
        isMonsoon={isMonsoon}
        onToggleMonsoon={handleToggleMonsoon}
        onTriggerHorn={handleTriggerHorn}
      />

      {/* Nostalgic Quote Ticker */}
      <NostalgiaQuoteTicker />

      {/* ============================================================ */}
      {/* 3D TRAIN & PARALLAX SCENE CONTAINER */}
      {/* ============================================================ */}
      <main className="relative w-full my-auto flex-1 flex flex-col justify-center">
        {/* Parallax Background Environment (Skyline, Station, Platform, Signal) */}
        <ParallaxEnvironment
          currentStation={currentStation}
          signalState={signalState}
          onSignalToggle={handleSignalToggle}
          onStationBoardClick={handleStationBoardClick}
          onChaiClick={handleChaiClick}
          isMonsoon={isMonsoon}
          timeOfDay={timeOfDay}
          trainSpeed={trainSpeedKmph}
        />

        {/* 3D Three.js Local Train Viewport */}
        <Train3DCanvas
          currentStation={currentStation}
          nextStation={nextStation}
          signalState={signalState}
          isMonsoon={isMonsoon}
          timeOfDay={timeOfDay}
          isHeadlightHigh={isHeadlightHigh}
          onTrainClick={handleTriggerHorn}
          onJourneyComplete={handleJourneyComplete}
          onSpeedChange={setTrainSpeedKmph}
        />
      </main>

      {/* Interactive Nostalgia Hub (Stations, Ticket, Nokia, Memories) */}
      <InteractiveNostalgiaHub
        currentStation={currentStation}
        onSelectStation={handleSelectStation}
        isMonsoon={isMonsoon}
        onToggleMonsoon={handleToggleMonsoon}
        timeOfDay={timeOfDay}
        onChangeTimeOfDay={setTimeOfDay}
      />

      {/* Global Mute Toggle Button */}
      <button
        onClick={toggleMute}
        className="fixed bottom-4 left-4 z-40 p-3 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-yellow-400 hover:text-white shadow-2xl transition-transform active:scale-95"
        title={isMuted ? 'Unmute All Sounds' : 'Mute All Sounds'}
      >
        {isMuted ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5" />}
      </button>

      {/* Nostalgic Glassmorphism Music Player */}
      <MusicPlayer isTrainPassing={trainSpeedKmph > 20} />
    </div>
  );
}

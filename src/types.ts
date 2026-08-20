export interface Station {
  id: string;
  name: string;
  nameHindi: string;
  nameMarathi: string;
  code: string;
  line: 'Western' | 'Central' | 'Harbour';
  type: 'FAST' | 'SLOW' | 'SEMI-FAST';
  platform: number;
  timeEstimate: string;
  quote: string;
  funFact: string;
  landmark: string;
}

export type TimeOfDay = 'monsoon_evening' | 'sodium_night' | 'golden_sunset' | 'rainy_dawn';

export interface TrainState {
  currentStationIndex: number;
  direction: 'left-to-right' | 'right-to-left';
  speed: number; // 0 (stopped), 1 (caution), 2 (normal), 3 (fast)
  isHeadlightHigh: boolean;
  isHornBlowing: boolean;
  signalState: 'green' | 'yellow' | 'red';
  journeyCount: number;
  isTrainPassing: boolean;
  positionX: number; // -100 to 100 percentage
}

export interface SoundConfig {
  masterVolume: number;
  isMuted: boolean;
  isAmbiencePlaying: boolean;
  trainRumbleVolume: number;
  rainVolume: number;
  musicVolume: number;
}

export interface NostalgicMemory {
  id: string;
  title: string;
  category: 'chailover' | 'footboard' | 'monsoon' | 'dabbawala' | 'ticket' | 'nokia';
  text: string;
  subtext: string;
  icon: string;
}

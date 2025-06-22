import { SoundEffectType } from '../types';

// Sound effect URLs
const soundEffects: Record<SoundEffectType, string> = {
  correct: '/sounds/correct.mp3',
  wrong: '/sounds/wrong.mp3',
  gameOver: '/sounds/game-over.mp3',
  levelUp: '/sounds/level-up.mp3',
  attack: '/sounds/attack.mp3',
  shield: '/sounds/shield.mp3',
  click: '/sounds/click.mp3',
  countdown: '/sounds/countdown.mp3',
};

// Audio instances cache
const audioInstances: Partial<Record<SoundEffectType, HTMLAudioElement>> = {};

// Global sound enabled setting
let soundEnabled = true;

/**
 * Play a sound effect
 * @param type The type of sound effect to play
 * @param volume Optional volume (0.0 to 1.0)
 * @returns Promise that resolves when the sound has finished playing
 */
export const playSound = (type: SoundEffectType, volume = 1.0): Promise<void> => {
  if (!soundEnabled) return Promise.resolve();
  
  return new Promise((resolve) => {
    try {
      // Create or reuse audio instance
      if (!audioInstances[type]) {
        audioInstances[type] = new Audio(`${soundEffects[type]}`);
      }
      
      const audio = audioInstances[type]!;
      
      // Reset audio to beginning if it's already playing
      audio.pause();
      audio.currentTime = 0;
      
      // Set volume and play
      audio.volume = volume;
      
      // Handle completion
      const onEnded = () => {
        audio.removeEventListener('ended', onEnded);
        resolve();
      };
      
      audio.addEventListener('ended', onEnded);
      
      // Handle errors
      const onError = () => {
        console.error(`Error playing sound: ${type}`);
        audio.removeEventListener('error', onError);
        resolve();
      };
      
      audio.addEventListener('error', onError);
      
      // Play the sound
      audio.play().catch((error) => {
        console.error(`Failed to play sound: ${type}`, error);
        resolve();
      });
    } catch (error) {
      console.error(`Error setting up sound: ${type}`, error);
      resolve();
    }
  });
};

/**
 * Enable or disable all sounds
 * @param enabled Whether sounds should be enabled
 */
export const setSoundEnabled = (enabled: boolean): void => {
  soundEnabled = enabled;
  
  // Stop all currently playing sounds if disabled
  if (!enabled) {
    Object.values(audioInstances).forEach((audio) => {
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    });
  }
};

/**
 * Check if sound is currently enabled
 * @returns Current sound enabled state
 */
export const isSoundEnabled = (): boolean => {
  return soundEnabled;
};

/**
 * Preload all sound effects
 * @returns Promise that resolves when all sounds are preloaded
 */
export const preloadSounds = (): Promise<void[]> => {
  const preloadPromises = Object.entries(soundEffects).map(([type, url]) => {
    return new Promise<void>((resolve) => {
      const audio = new Audio(url);
      audioInstances[type as SoundEffectType] = audio;
      
      audio.addEventListener('canplaythrough', () => resolve());
      audio.addEventListener('error', () => {
        console.error(`Failed to preload sound: ${type}`);
        resolve();
      });
      
      // Start loading
      audio.load();
    });
  });
  
  return Promise.all(preloadPromises);
};
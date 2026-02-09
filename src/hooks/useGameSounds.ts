import { useEffect, useRef, useCallback, useState } from 'react';

export function useGameSounds() {
  const errorSoundRef = useRef<HTMLAudioElement | null>(null);
  const correctSoundRef = useRef<HTMLAudioElement | null>(null);
  const victorySoundRef = useRef<HTMLAudioElement | null>(null);
  const [audioUnlocked, setAudioUnlocked] = useState(false);

  useEffect(() => {
    // Preload audio files on mount
    errorSoundRef.current = new Audio('/sounds/error.mp3');
    correctSoundRef.current = new Audio('/sounds/correct.mp3');
    victorySoundRef.current = new Audio('/sounds/victory.mp3');

    // Preload the audio files
    errorSoundRef.current.load();
    correctSoundRef.current.load();
    victorySoundRef.current.load();

    return () => {
      // Clean up
      errorSoundRef.current = null;
      correctSoundRef.current = null;
      victorySoundRef.current = null;
    };
  }, []);

  // Must be called from a user interaction (click/tap) to unlock audio
  // playback in browsers that enforce autoplay policies.
  const unlockAudio = useCallback(async () => {
    const sounds = [errorSoundRef.current, correctSoundRef.current, victorySoundRef.current];

    await Promise.all(
      sounds.map(async (sound) => {
        if (sound) {
          sound.muted = true;
          try {
            await sound.play();
            sound.pause();
            sound.currentTime = 0;
          } catch {
            // Ignore – best-effort unlock
          } finally {
            sound.muted = false;
          }
        }
      }),
    );

    setAudioUnlocked(true);
  }, []);

  const playError = useCallback(() => {
    if (errorSoundRef.current) {
      errorSoundRef.current.currentTime = 0;
      errorSoundRef.current.play().catch((error) => {
        console.warn('Error playing error sound:', error);
      });
    }
  }, []);

  const playCorrect = useCallback(() => {
    if (correctSoundRef.current) {
      correctSoundRef.current.currentTime = 0;
      correctSoundRef.current.play().catch((error) => {
        console.warn('Error playing correct sound:', error);
      });
    }
  }, []);

  const playVictory = useCallback(() => {
    if (victorySoundRef.current) {
      victorySoundRef.current.currentTime = 0;
      victorySoundRef.current.play().catch((error) => {
        console.warn('Error playing victory sound:', error);
      });
    }
  }, []);

  return { playError, playCorrect, playVictory, unlockAudio, audioUnlocked };
}

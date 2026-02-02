"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type SoundType = "gain" | "loss" | "click";

const STORAGE_KEY = "portfolio-meme-rater-sound-enabled";

// Create synthesized sounds using Web Audio API
function createGainSound(audioContext: AudioContext) {
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.type = "sine";

  // Cash register "cha-ching" effect
  const now = audioContext.currentTime;
  oscillator.frequency.setValueAtTime(800, now);
  oscillator.frequency.setValueAtTime(1200, now + 0.1);
  oscillator.frequency.setValueAtTime(1000, now + 0.2);

  gainNode.gain.setValueAtTime(0.3, now);
  gainNode.gain.exponentialDecayTo(0.01, now + 0.4);

  oscillator.start(now);
  oscillator.stop(now + 0.4);
}

function createLossSound(audioContext: AudioContext) {
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.type = "sawtooth";

  // Sad trombone effect (descending notes)
  const now = audioContext.currentTime;
  oscillator.frequency.setValueAtTime(350, now);
  oscillator.frequency.linearRampToValueAtTime(300, now + 0.3);
  oscillator.frequency.linearRampToValueAtTime(250, now + 0.6);
  oscillator.frequency.linearRampToValueAtTime(200, now + 0.9);

  gainNode.gain.setValueAtTime(0.2, now);
  gainNode.gain.linearRampToValueAtTime(0.01, now + 1);

  oscillator.start(now);
  oscillator.stop(now + 1);
}

function createClickSound(audioContext: AudioContext) {
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.type = "square";

  const now = audioContext.currentTime;
  oscillator.frequency.setValueAtTime(600, now);

  gainNode.gain.setValueAtTime(0.2, now);
  gainNode.gain.exponentialDecayTo(0.01, now + 0.05);

  oscillator.start(now);
  oscillator.stop(now + 0.05);
}

// Polyfill for exponentialDecayTo
declare global {
  interface AudioParam {
    exponentialDecayTo(value: number, endTime: number): void;
  }
}

if (typeof AudioParam !== "undefined" && !AudioParam.prototype.exponentialDecayTo) {
  AudioParam.prototype.exponentialDecayTo = function (value: number, endTime: number) {
    this.exponentialRampToValueAtTime(Math.max(value, 0.0001), endTime);
  };
}

export function useSound() {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Load preference from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored !== null) {
        setSoundEnabled(stored === "true");
      }
    }
  }, []);

  const getAudioContext = useCallback(() => {
    if (typeof window === "undefined") return null;

    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  const toggleSound = useCallback(() => {
    setSoundEnabled((prev) => {
      const newValue = !prev;
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, String(newValue));
      }
      return newValue;
    });
  }, []);

  const playSound = useCallback(
    (type: SoundType) => {
      if (!soundEnabled) return;

      const audioContext = getAudioContext();
      if (!audioContext) return;

      // Resume context if suspended (autoplay policy)
      if (audioContext.state === "suspended") {
        audioContext.resume();
      }

      try {
        switch (type) {
          case "gain":
            createGainSound(audioContext);
            break;
          case "loss":
            createLossSound(audioContext);
            break;
          case "click":
            createClickSound(audioContext);
            break;
        }
      } catch {
        // Ignore audio errors
      }
    },
    [soundEnabled, getAudioContext]
  );

  const playForReturn = useCallback(
    (percentageReturn: number) => {
      if (percentageReturn >= 20) {
        playSound("gain");
      } else if (percentageReturn <= -20) {
        playSound("loss");
      }
    },
    [playSound]
  );

  return {
    soundEnabled,
    toggleSound,
    playSound,
    playForReturn,
  };
}

// Sound toggle button component
export function SoundToggle() {
  const { soundEnabled, toggleSound } = useSound();

  return (
    <button
      onClick={toggleSound}
      className="p-2 rounded-lg bg-gray-700/50 hover:bg-gray-600/50 transition-colors"
      title={soundEnabled ? "Sound On" : "Sound Off"}
    >
      {soundEnabled ? (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
        </svg>
      ) : (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
        </svg>
      )}
    </button>
  );
}

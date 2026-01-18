"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { ttsService } from "@/lib/services/tts-service";

interface UseAudioOptions {
  onEnd?: () => void;
  rate?: number;
  useHighQuality?: boolean; // Use OpenAI TTS (default: true)
}

export function useTextToSpeech(options: UseAudioOptions = {}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);

  // Store options in ref to avoid recreating speak on every render
  const optionsRef = useRef(options);

  // Update ref when options change (without triggering re-renders)
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  useEffect(() => {
    // Always supported since we have both OpenAI and browser fallback
    setIsSupported(true);
  }, []);

  // speak now has stable reference
  const speak = useCallback(
    async (text: string) => {
      const useHighQuality = optionsRef.current.useHighQuality !== false;

      setIsLoading(true);

      try {
        await ttsService.speak(text, {
          speed: optionsRef.current.rate ?? 0.9,
          onStart: () => {
            setIsLoading(false);
            setIsPlaying(true);
            setUsingFallback(ttsService.usingFallback);
          },
          onEnd: () => {
            setIsPlaying(false);
            optionsRef.current.onEnd?.();
          },
          onError: () => {
            setIsLoading(false);
            setIsPlaying(false);
          },
        });
      } catch {
        setIsLoading(false);
        setIsPlaying(false);
      }
    },
    []
  );

  const stop = useCallback(() => {
    ttsService.stop();
    setIsPlaying(false);
    setIsLoading(false);
  }, []);

  return { speak, stop, isPlaying, isLoading, isSupported, usingFallback };
}

interface UseSpeechRecognitionOptions {
  onResult?: (transcript: string, confidence: number) => void;
  onError?: (error: string) => void;
  language?: string;
}

export function useSpeechRecognition(options: UseSpeechRecognitionOptions = {}) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef<any>(null);

  // Store options in ref to avoid recreating startListening on every render
  const optionsRef = useRef(options);

  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    setIsSupported(!!SpeechRecognition);
  }, []);

  // startListening now has stable reference
  const startListening = useCallback(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      optionsRef.current.onError?.("Speech recognition not supported");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = optionsRef.current.language ?? "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      setTranscript("");
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const result = event.results[0][0];
      const text = result.transcript;
      const confidence = result.confidence;

      setTranscript(text);
      optionsRef.current.onResult?.(text, confidence);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      setIsListening(false);
      optionsRef.current.onError?.(event.error);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, []);

  return {
    startListening,
    stopListening,
    isListening,
    isSupported,
    transcript,
  };
}

export function useAudioFile() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const play = useCallback((url: string) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }

    setIsLoading(true);
    const audio = new Audio(url);
    audioRef.current = audio;

    audio.oncanplaythrough = () => {
      setIsLoading(false);
      audio.play();
      setIsPlaying(true);
    };

    audio.onended = () => {
      setIsPlaying(false);
    };

    audio.onerror = () => {
      setIsLoading(false);
      setIsPlaying(false);
    };

    audio.load();
  }, []);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  }, []);

  return { play, stop, isPlaying, isLoading };
}

// Type declarations imported from src/types/speech.d.ts

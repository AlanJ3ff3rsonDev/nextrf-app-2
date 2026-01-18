"use client";

import { useState, useCallback, useRef, useEffect } from "react";

interface UseAudioOptions {
  onEnd?: () => void;
  rate?: number;
}

export function useTextToSpeech(options: UseAudioOptions = {}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    setIsSupported("speechSynthesis" in window);
  }, []);

  const speak = useCallback(
    (text: string) => {
      if (!isSupported || !window.speechSynthesis) return;

      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      utterance.rate = options.rate ?? 0.9; // Slightly slower for learning
      utterance.pitch = 1;

      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => {
        setIsPlaying(false);
        options.onEnd?.();
      };
      utterance.onerror = () => setIsPlaying(false);

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    },
    [isSupported, options]
  );

  const stop = useCallback(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    }
  }, []);

  return { speak, stop, isPlaying, isSupported };
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

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    setIsSupported(!!SpeechRecognition);
  }, []);

  const startListening = useCallback(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      options.onError?.("Speech recognition not supported");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = options.language ?? "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      setTranscript("");
    };

    recognition.onresult = (event) => {
      const result = event.results[0][0];
      const text = result.transcript;
      const confidence = result.confidence;

      setTranscript(text);
      options.onResult?.(text, confidence);
    };

    recognition.onerror = (event) => {
      setIsListening(false);
      options.onError?.(event.error);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [options]);

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

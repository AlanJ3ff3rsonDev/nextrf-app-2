/**
 * TTS Service - Text-to-Speech with OpenAI and browser fallback
 *
 * Features:
 * - Uses OpenAI TTS API for high-quality voice
 * - Falls back to browser's Web Speech API if OpenAI fails
 * - Caches audio in memory to avoid repeated API calls
 * - Supports preloading common phrases
 */

type Voice = "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer";

interface TTSOptions {
  voice?: Voice;
  speed?: number;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: string) => void;
}

class TTSService {
  private cache: Map<string, string> = new Map();
  private currentAudio: HTMLAudioElement | null = null;
  private isUsingFallback = false;

  private get isBrowser(): boolean {
    return typeof window !== "undefined";
  }

  /**
   * Generate cache key for audio
   */
  private getCacheKey(text: string, voice: Voice, speed: number): string {
    return `${text}-${voice}-${speed}`;
  }

  /**
   * Speak text using OpenAI TTS (with fallback to browser)
   */
  async speak(text: string, options: TTSOptions = {}): Promise<void> {
    // Only run in browser
    if (!this.isBrowser) {
      return;
    }

    const {
      voice = "nova",
      speed = 0.9,
      onStart,
      onEnd,
      onError,
    } = options;

    // Stop any currently playing audio
    this.stop();

    const cacheKey = this.getCacheKey(text, voice, speed);

    try {
      // Check cache first
      let audioUrl = this.cache.get(cacheKey);

      if (!audioUrl) {
        // Fetch from OpenAI TTS API
        const response = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, voice, speed }),
        });

        if (!response.ok) {
          throw new Error(`TTS API error: ${response.status}`);
        }

        // Create blob URL from response
        const blob = await response.blob();
        audioUrl = URL.createObjectURL(blob);

        // Cache the audio URL
        this.cache.set(cacheKey, audioUrl);
        this.isUsingFallback = false;
      }

      // Play the audio
      return this.playAudio(audioUrl, onStart, onEnd, onError);
    } catch (error) {
      console.warn("OpenAI TTS failed, using browser fallback:", error);
      this.isUsingFallback = true;

      // Fallback to browser's Web Speech API
      return this.speakWithBrowser(text, speed, onStart, onEnd, onError);
    }
  }

  /**
   * Play audio from URL
   */
  private playAudio(
    url: string,
    onStart?: () => void,
    onEnd?: () => void,
    onError?: (error: string) => void
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const audio = new Audio(url);
      this.currentAudio = audio;

      audio.onplay = () => {
        onStart?.();
      };

      audio.onended = () => {
        this.currentAudio = null;
        onEnd?.();
        resolve();
      };

      audio.onerror = () => {
        this.currentAudio = null;
        const errorMsg = "Failed to play audio";
        onError?.(errorMsg);
        reject(new Error(errorMsg));
      };

      audio.play().catch((err) => {
        this.currentAudio = null;
        onError?.(err.message);
        reject(err);
      });
    });
  }

  /**
   * Fallback: Speak using browser's Web Speech API
   */
  private speakWithBrowser(
    text: string,
    speed: number,
    onStart?: () => void,
    onEnd?: () => void,
    onError?: (error: string) => void
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!("speechSynthesis" in window)) {
        const errorMsg = "Speech synthesis not supported";
        onError?.(errorMsg);
        reject(new Error(errorMsg));
        return;
      }

      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      utterance.rate = speed;
      utterance.pitch = 1;

      utterance.onstart = () => {
        onStart?.();
      };

      utterance.onend = () => {
        onEnd?.();
        resolve();
      };

      utterance.onerror = (event) => {
        onError?.(event.error);
        reject(new Error(event.error));
      };

      window.speechSynthesis.speak(utterance);
    });
  }

  /**
   * Stop any currently playing audio
   */
  stop(): void {
    if (!this.isBrowser) return;

    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }

    // Also stop browser speech if active
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  }

  /**
   * Check if currently playing
   */
  get isPlaying(): boolean {
    return this.currentAudio !== null && !this.currentAudio.paused;
  }

  /**
   * Check if using fallback (browser TTS)
   */
  get usingFallback(): boolean {
    return this.isUsingFallback;
  }

  /**
   * Preload phrases into cache
   */
  async preload(phrases: string[], options: TTSOptions = {}): Promise<void> {
    if (!this.isBrowser) return;

    const { voice = "nova", speed = 0.9 } = options;

    await Promise.all(
      phrases.map(async (text) => {
        const cacheKey = this.getCacheKey(text, voice, speed);

        // Skip if already cached
        if (this.cache.has(cacheKey)) return;

        try {
          const response = await fetch("/api/tts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text, voice, speed }),
          });

          if (response.ok) {
            const blob = await response.blob();
            const audioUrl = URL.createObjectURL(blob);
            this.cache.set(cacheKey, audioUrl);
          }
        } catch {
          // Silently fail preloading
        }
      })
    );
  }

  /**
   * Clear the cache
   */
  clearCache(): void {
    // Revoke all blob URLs
    this.cache.forEach((url) => {
      URL.revokeObjectURL(url);
    });
    this.cache.clear();
  }
}

// Export singleton instance (lazy initialization for SSR safety)
let _ttsService: TTSService | null = null;

export const ttsService = {
  get instance() {
    if (!_ttsService) {
      _ttsService = new TTSService();
    }
    return _ttsService;
  },
  speak: (text: string, options?: any) => {
    if (typeof window === "undefined") return Promise.resolve();
    if (!_ttsService) _ttsService = new TTSService();
    return _ttsService.speak(text, options);
  },
  stop: () => {
    if (typeof window === "undefined") return;
    if (!_ttsService) return;
    _ttsService.stop();
  },
  get isPlaying() {
    if (typeof window === "undefined") return false;
    if (!_ttsService) return false;
    return _ttsService.isPlaying;
  },
  get usingFallback() {
    if (!_ttsService) return false;
    return _ttsService.usingFallback;
  },
  preload: (phrases: string[], options?: any) => {
    if (typeof window === "undefined") return Promise.resolve();
    if (!_ttsService) _ttsService = new TTSService();
    return _ttsService.preload(phrases, options);
  },
  clearCache: () => {
    if (typeof window === "undefined") return;
    if (!_ttsService) return;
    _ttsService.clearCache();
  },
};

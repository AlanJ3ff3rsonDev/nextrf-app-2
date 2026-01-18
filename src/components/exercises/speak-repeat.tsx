"use client";

import { useState, useEffect } from "react";
import { cn, stringSimilarity } from "@/lib/utils";
import { useTextToSpeech, useSpeechRecognition } from "@/lib/hooks";
import { VolumeIcon, MicIcon } from "@/components/ui";

interface SpeakRepeatProps {
  text: string;
  audioUrl?: string;
  onAnswer: (correct: boolean, transcript: string, similarity: number) => void;
  onSkip?: () => void;
  disabled?: boolean;
}

export function SpeakRepeat({
  text,
  onAnswer,
  onSkip,
  disabled = false,
}: SpeakRepeatProps) {
  const [stage, setStage] = useState<"listen" | "record" | "result">("listen");
  const [transcript, setTranscript] = useState("");
  const [similarity, setSimilarity] = useState(0);
  const [hasListened, setHasListened] = useState(false);

  const { speak: ttsSpeak, isPlaying: ttsPlaying } = useTextToSpeech({
    onEnd: () => setHasListened(true),
  });

  const {
    startListening,
    stopListening,
    isListening,
    isSupported: speechSupported,
    transcript: liveTranscript,
  } = useSpeechRecognition({
    onResult: (result, confidence) => {
      const sim = stringSimilarity(result, text);
      setTranscript(result);
      setSimilarity(sim);
      setStage("result");

      // Consider correct if similarity > 70%
      const isCorrect = sim >= 0.7;
      onAnswer(isCorrect, result, sim);
    },
    onError: (error) => {
      console.error("Speech recognition error:", error);
      // Allow retry
      setStage("record");
    },
  });

  // Auto-play on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      ttsSpeak(text);
    }, 500);
    return () => clearTimeout(timer);
  }, [text, ttsSpeak]);

  const handleListen = () => {
    ttsSpeak(text);
  };

  const handleRecord = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleContinue = () => {
    if (!hasListened) {
      setStage("record");
    } else if (stage === "listen") {
      setStage("record");
    }
  };

  // Not supported fallback
  if (!speechSupported) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-warning-100 rounded-full flex items-center justify-center mb-4">
          <MicIcon className="w-10 h-10 text-warning-600" />
        </div>
        <h2 className="text-xl font-bold mb-2">
          Speech not supported
        </h2>
        <p className="text-muted-foreground mb-6">
          Your browser doesn&apos;t support speech recognition.
        </p>
        <button
          onClick={onSkip}
          className="text-primary-500 font-medium"
        >
          Skip this exercise
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Instructions */}
      <h2 className="text-xl font-bold text-center mb-2">
        Listen and repeat
      </h2>
      <p className="text-center text-muted-foreground mb-8">
        Tap to hear, then tap the mic to speak
      </p>

      {/* Text to speak */}
      <div className="bg-muted rounded-2xl p-6 mb-8 text-center">
        <p className="text-2xl font-bold">{text}</p>
      </div>

      {/* Controls */}
      <div className="flex-1 flex flex-col items-center justify-center gap-8">
        {stage === "listen" && (
          <>
            {/* Listen button */}
            <button
              onClick={handleListen}
              disabled={ttsPlaying}
              className={cn(
                "w-24 h-24 rounded-full",
                "bg-primary-500 text-white",
                "flex items-center justify-center",
                "shadow-medium hover:shadow-strong",
                "transition-all duration-200",
                "active:scale-95",
                ttsPlaying && "animate-pulse-slow"
              )}
            >
              <VolumeIcon className="w-12 h-12" />
            </button>
            <p className="text-muted-foreground">
              {ttsPlaying ? "Listening..." : "Tap to listen"}
            </p>

            {hasListened && (
              <button
                onClick={handleContinue}
                className={cn(
                  "px-8 py-3 rounded-2xl",
                  "bg-secondary-500 text-white font-semibold",
                  "transition-all duration-200",
                  "hover:bg-secondary-600",
                  "active:scale-95"
                )}
              >
                Ready to speak
              </button>
            )}
          </>
        )}

        {stage === "record" && (
          <>
            {/* Record button */}
            <button
              onClick={handleRecord}
              className={cn(
                "w-24 h-24 rounded-full",
                "flex items-center justify-center",
                "shadow-medium hover:shadow-strong",
                "transition-all duration-200",
                "active:scale-95",
                isListening
                  ? "bg-error-500 text-white animate-pulse"
                  : "bg-secondary-500 text-white"
              )}
            >
              <MicIcon className="w-12 h-12" />
            </button>
            <p className="text-muted-foreground">
              {isListening ? "Listening... Tap to stop" : "Tap to speak"}
            </p>

            {liveTranscript && (
              <p className="text-lg text-center mt-4">
                &quot;{liveTranscript}&quot;
              </p>
            )}
          </>
        )}

        {stage === "result" && (
          <div className="text-center">
            {/* Result indicator */}
            <div
              className={cn(
                "w-24 h-24 rounded-full mx-auto mb-4",
                "flex items-center justify-center",
                similarity >= 0.7
                  ? "bg-success-100 text-success-600"
                  : "bg-warning-100 text-warning-600"
              )}
            >
              <span className="text-4xl">
                {similarity >= 0.7 ? "👍" : "🔄"}
              </span>
            </div>

            {/* Feedback */}
            <p className="text-xl font-bold mb-2">
              {similarity >= 0.7 ? "Great job!" : "Nice try!"}
            </p>

            <p className="text-muted-foreground mb-2">
              You said: &quot;{transcript}&quot;
            </p>

            <p className="text-sm text-muted-foreground">
              Similarity: {Math.round(similarity * 100)}%
            </p>
          </div>
        )}
      </div>

      {/* Skip option */}
      {onSkip && stage !== "result" && (
        <button
          onClick={onSkip}
          className="mt-auto text-center text-muted-foreground text-sm py-4"
        >
          Can&apos;t use microphone? Skip
        </button>
      )}
    </div>
  );
}

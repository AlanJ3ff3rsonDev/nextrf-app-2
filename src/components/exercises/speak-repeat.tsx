"use client";

import { useState, useEffect, useRef, useCallback } from "react";
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
  const [stage, setStage] = useState<"ready" | "recording" | "result">("ready");
  const [transcript, setTranscript] = useState("");
  const [similarity, setSimilarity] = useState(0);

  // Ref to track if auto-play has already happened
  const hasAutoPlayed = useRef(false);

  // Stable callback for TTS end
  const handleTTSEnd = useCallback(() => {
    // TTS finished
  }, []);

  const { speak: ttsSpeak, isPlaying: ttsPlaying } = useTextToSpeech({
    onEnd: handleTTSEnd,
  });

  // Stable callback for speech recognition result
  const handleSpeechResult = useCallback((result: string, confidence: number) => {
    const sim = stringSimilarity(result, text);
    setTranscript(result);
    setSimilarity(sim);
    setStage("result");

    const isCorrect = sim >= 0.7;
    onAnswer(isCorrect, result, sim);
  }, [text, onAnswer]);

  // Stable callback for speech recognition error
  const handleSpeechError = useCallback((error: string) => {
    console.error("Speech recognition error:", error);
    setStage("ready");
  }, []);

  const {
    startListening,
    stopListening,
    isListening,
    isSupported: speechSupported,
    transcript: liveTranscript,
  } = useSpeechRecognition({
    onResult: handleSpeechResult,
    onError: handleSpeechError,
  });

  // Auto-play on mount (only once)
  useEffect(() => {
    if (hasAutoPlayed.current) return;

    const timer = setTimeout(() => {
      ttsSpeak(text);
      hasAutoPlayed.current = true;
    }, 500);

    return () => clearTimeout(timer);
  }, [text, ttsSpeak]);

  const handleListen = () => {
    ttsSpeak(text);
  };

  const handleStartRecording = () => {
    setStage("recording");
    startListening();
  };

  const handleStopRecording = () => {
    stopListening();
  };

  // Get current step number
  const currentStep = stage === "ready" ? 1 : stage === "recording" ? 2 : 3;

  // Not supported fallback
  if (!speechSupported) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-warning-100 rounded-full flex items-center justify-center mb-4">
          <MicIcon className="w-8 h-8 text-warning-600" />
        </div>
        <h2 className="text-lg font-bold mb-2">Microphone not available</h2>
        <p className="text-muted-foreground text-sm mb-4">
          Your browser doesn&apos;t support speech recognition.
        </p>
        <button
          onClick={onSkip}
          className="text-primary-500 font-medium text-sm"
        >
          Skip this exercise
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <h2 className="text-lg sm:text-xl font-bold text-center mb-1">
        Listen and repeat
      </h2>

      {/* Step indicator */}
      <div className="flex items-center justify-center gap-2 mb-4">
        <StepDot step={1} current={currentStep} label="Listen" />
        <div className="w-6 h-0.5 bg-border" />
        <StepDot step={2} current={currentStep} label="Speak" />
        <div className="w-6 h-0.5 bg-border" />
        <StepDot step={3} current={currentStep} label="Done" />
      </div>

      {/* Text to speak */}
      <div className="bg-primary-50 border-2 border-primary-200 rounded-2xl p-4 sm:p-6 mb-6 text-center">
        <p className="text-xl sm:text-2xl font-bold text-primary-900">{text}</p>
      </div>

      {/* Main interaction area */}
      <div className="flex-1 flex flex-col items-center justify-center">

        {/* Ready state - Both buttons visible */}
        {stage === "ready" && !isListening && (
          <div className="flex flex-col items-center gap-6">
            {/* Two action buttons side by side */}
            <div className="flex items-center gap-6">
              {/* Listen button */}
              <div className="flex flex-col items-center gap-2">
                <button
                  onClick={handleListen}
                  disabled={ttsPlaying}
                  className={cn(
                    "w-16 h-16 sm:w-20 sm:h-20 rounded-full",
                    "bg-primary-500 text-white",
                    "flex items-center justify-center",
                    "shadow-medium hover:shadow-strong",
                    "transition-all duration-200",
                    "active:scale-95",
                    ttsPlaying && "animate-pulse ring-4 ring-primary-300"
                  )}
                >
                  <VolumeIcon className="w-8 h-8 sm:w-10 sm:h-10" />
                </button>
                <span className="text-xs sm:text-sm text-muted-foreground">
                  {ttsPlaying ? "Playing..." : "Listen"}
                </span>
              </div>

              {/* Mic button */}
              <div className="flex flex-col items-center gap-2">
                <button
                  onClick={handleStartRecording}
                  disabled={ttsPlaying}
                  className={cn(
                    "w-16 h-16 sm:w-20 sm:h-20 rounded-full",
                    "bg-secondary-500 text-white",
                    "flex items-center justify-center",
                    "shadow-medium hover:shadow-strong",
                    "transition-all duration-200",
                    "active:scale-95",
                    ttsPlaying && "opacity-50"
                  )}
                >
                  <MicIcon className="w-8 h-8 sm:w-10 sm:h-10" />
                </button>
                <span className="text-xs sm:text-sm text-muted-foreground">Speak</span>
              </div>
            </div>

            <p className="text-sm text-muted-foreground text-center max-w-xs">
              Tap the speaker to hear, then tap the mic to record your voice
            </p>
          </div>
        )}

        {/* Recording state */}
        {(stage === "recording" || isListening) && (
          <div className="flex flex-col items-center gap-4">
            <button
              onClick={handleStopRecording}
              className={cn(
                "w-24 h-24 sm:w-28 sm:h-28 rounded-full",
                "bg-error-500 text-white",
                "flex items-center justify-center",
                "shadow-strong",
                "transition-all duration-200",
                "active:scale-95",
                "animate-pulse",
                "ring-4 ring-error-300"
              )}
            >
              <MicIcon className="w-12 h-12 sm:w-14 sm:h-14" />
            </button>

            <div className="flex items-center gap-2 text-error-600">
              <span className="w-2 h-2 bg-error-500 rounded-full animate-ping" />
              <span className="font-semibold">Recording...</span>
            </div>

            <p className="text-sm text-muted-foreground">
              Tap when finished
            </p>

            {liveTranscript && (
              <div className="bg-muted rounded-xl px-4 py-2 mt-2">
                <p className="text-base italic">&quot;{liveTranscript}&quot;</p>
              </div>
            )}
          </div>
        )}

        {/* Result state */}
        {stage === "result" && (
          <div className="flex flex-col items-center gap-4 w-full max-w-xs">
            {/* Result icon */}
            <div
              className={cn(
                "w-20 h-20 rounded-full",
                "flex items-center justify-center",
                "shadow-medium",
                similarity >= 0.7
                  ? "bg-success-100 ring-4 ring-success-200"
                  : "bg-warning-100 ring-4 ring-warning-200"
              )}
            >
              <span className="text-4xl">
                {similarity >= 0.9 ? "🎉" : similarity >= 0.7 ? "👍" : "💪"}
              </span>
            </div>

            {/* Feedback message */}
            <p className="text-xl font-bold">
              {similarity >= 0.9
                ? "Perfect!"
                : similarity >= 0.7
                ? "Great job!"
                : similarity >= 0.5
                ? "Almost there!"
                : "Keep practicing!"}
            </p>

            {/* What you said */}
            <div className="bg-muted rounded-xl p-3 w-full text-center">
              <p className="text-xs text-muted-foreground mb-1">You said:</p>
              <p className="font-medium">&quot;{transcript}&quot;</p>
            </div>

            {/* Similarity bar */}
            <div className="w-full">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Accuracy</span>
                <span className="font-semibold">{Math.round(similarity * 100)}%</span>
              </div>
              <div className="h-2 bg-border rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    similarity >= 0.7 ? "bg-success-500" : "bg-warning-500"
                  )}
                  style={{ width: `${Math.round(similarity * 100)}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Skip option */}
      {onSkip && stage !== "result" && (
        <button
          onClick={onSkip}
          className="text-center text-muted-foreground text-xs sm:text-sm py-3 hover:text-foreground transition-colors"
        >
          Can&apos;t use microphone? Skip
        </button>
      )}
    </div>
  );
}

// Step indicator dot component
function StepDot({
  step,
  current,
  label
}: {
  step: number;
  current: number;
  label: string;
}) {
  const isActive = step === current;
  const isComplete = step < current;

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={cn(
          "w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-xs font-bold",
          "transition-all duration-200",
          isActive && "bg-primary-500 text-white scale-110",
          isComplete && "bg-success-500 text-white",
          !isActive && !isComplete && "bg-muted text-muted-foreground"
        )}
      >
        {isComplete ? "✓" : step}
      </div>
      <span
        className={cn(
          "text-[10px] sm:text-xs",
          isActive && "text-primary-600 font-medium",
          !isActive && "text-muted-foreground"
        )}
      >
        {label}
      </span>
    </div>
  );
}

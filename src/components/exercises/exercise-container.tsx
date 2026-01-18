"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button, ProgressBar, XIcon, CheckIcon } from "@/components/ui";

interface ExerciseContainerProps {
  totalExercises: number;
  currentExercise: number;
  children: React.ReactNode;
  onClose?: () => void;
  feedback?: "correct" | "incorrect" | null;
  feedbackMessage?: string;
  canSubmit?: boolean;
  onSubmit?: () => void;
  submitLabel?: string;
  showSkip?: boolean;
  onSkip?: () => void;
}

export function ExerciseContainer({
  totalExercises,
  currentExercise,
  children,
  onClose,
  feedback,
  feedbackMessage,
  canSubmit = false,
  onSubmit,
  submitLabel = "Check",
  showSkip = false,
  onSkip,
}: ExerciseContainerProps) {
  const [showFeedback, setShowFeedback] = useState(false);

  useEffect(() => {
    if (feedback) {
      setShowFeedback(true);
    }
  }, [feedback]);

  const progress = ((currentExercise) / totalExercises) * 100;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="p-4 flex items-center gap-4">
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 -ml-2 hover:bg-muted rounded-full transition-colors"
          >
            <XIcon className="w-6 h-6 text-muted-foreground" />
          </button>
        )}
        <div className="flex-1">
          <ProgressBar
            value={progress}
            size="md"
            variant="primary"
          />
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 px-4 py-6 flex flex-col">
        {children}
      </div>

      {/* Footer - Submit/Continue Button */}
      <div className="p-4 pb-safe-bottom">
        {showSkip && !feedback && (
          <button
            onClick={onSkip}
            className="w-full text-center text-muted-foreground text-sm mb-3 py-2"
          >
            Skip this exercise
          </button>
        )}
        <Button
          variant={feedback === "correct" ? "primary" : feedback === "incorrect" ? "danger" : "primary"}
          size="lg"
          fullWidth
          disabled={!canSubmit && !feedback}
          onClick={onSubmit}
        >
          {feedback ? "Continue" : submitLabel}
        </Button>
      </div>

      {/* Feedback Overlay */}
      {showFeedback && feedback && (
        <FeedbackOverlay
          type={feedback}
          message={feedbackMessage}
          onDismiss={() => setShowFeedback(false)}
        />
      )}
    </div>
  );
}

interface FeedbackOverlayProps {
  type: "correct" | "incorrect";
  message?: string;
  onDismiss: () => void;
}

function FeedbackOverlay({ type, message, onDismiss }: FeedbackOverlayProps) {
  useEffect(() => {
    // Play sound
    const audio = new Audio(
      type === "correct" ? "/sounds/correct.mp3" : "/sounds/incorrect.mp3"
    );
    audio.volume = 0.5;
    audio.play().catch(() => {}); // Ignore if no audio file

    // Auto dismiss after delay
    const timer = setTimeout(onDismiss, 1500);
    return () => clearTimeout(timer);
  }, [type, onDismiss]);

  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 p-6 pb-safe-bottom",
        "animate-slide-up",
        type === "correct" ? "bg-success-500" : "bg-error-500"
      )}
    >
      <div className="flex items-center gap-3 text-white">
        <div
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center",
            type === "correct" ? "bg-success-600" : "bg-error-600"
          )}
        >
          {type === "correct" ? (
            <CheckIcon className="w-6 h-6" />
          ) : (
            <XIcon className="w-6 h-6" />
          )}
        </div>
        <div>
          <p className="font-bold text-lg">
            {type === "correct" ? "Correct!" : "Not quite..."}
          </p>
          {message && <p className="text-sm opacity-90">{message}</p>}
        </div>
      </div>
    </div>
  );
}

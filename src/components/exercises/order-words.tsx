"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface OrderWordsProps {
  sentencePt: string;
  words: string[];
  correctOrder: number[];
  onAnswer: (correct: boolean) => void;
  disabled?: boolean;
}

export function OrderWords({
  sentencePt,
  words,
  correctOrder,
  onAnswer,
  disabled = false,
}: OrderWordsProps) {
  const [selectedWords, setSelectedWords] = useState<number[]>([]);
  const [availableWords, setAvailableWords] = useState<number[]>(
    words.map((_, i) => i)
  );
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const handleWordSelect = (wordIndex: number) => {
    if (disabled || hasSubmitted) return;

    // Move word from available to selected
    setAvailableWords((prev) => prev.filter((i) => i !== wordIndex));
    setSelectedWords((prev) => [...prev, wordIndex]);
  };

  const handleWordDeselect = (position: number) => {
    if (disabled || hasSubmitted) return;

    const wordIndex = selectedWords[position];
    // Move word back to available
    setSelectedWords((prev) => prev.filter((_, i) => i !== position));
    setAvailableWords((prev) => [...prev, wordIndex].sort((a, b) => a - b));
  };

  const checkAnswer = () => {
    if (selectedWords.length !== words.length) return;

    const correct = selectedWords.every(
      (wordIndex, position) => wordIndex === correctOrder[position]
    );

    setHasSubmitted(true);
    setIsCorrect(correct);
    onAnswer(correct);
  };

  const isComplete = selectedWords.length === words.length;

  return (
    <div className="flex-1 flex flex-col">
      {/* Instructions */}
      <h2 className="text-xl font-bold text-center mb-2">
        Put the words in order
      </h2>

      {/* Translation hint */}
      <p className="text-center text-muted-foreground mb-8">
        &quot;{sentencePt}&quot;
      </p>

      {/* Answer area - selected words */}
      <div
        className={cn(
          "min-h-[120px] p-4 rounded-2xl mb-6",
          "border-2 border-dashed",
          hasSubmitted && isCorrect && "border-success-500 bg-success-50",
          hasSubmitted && !isCorrect && "border-error-500 bg-error-50",
          !hasSubmitted && "border-border bg-muted/50"
        )}
      >
        <div className="flex flex-wrap gap-2">
          {selectedWords.map((wordIndex, position) => (
            <button
              key={`selected-${position}`}
              onClick={() => handleWordDeselect(position)}
              disabled={disabled || hasSubmitted}
              className={cn(
                "px-4 py-2 rounded-xl",
                "border-2 font-medium",
                "transition-all duration-200",
                "active:scale-95",
                hasSubmitted && isCorrect && "border-success-500 bg-success-100",
                hasSubmitted && !isCorrect && "border-error-500 bg-error-100 animate-shake",
                !hasSubmitted && "border-primary-500 bg-primary-50 hover:bg-primary-100"
              )}
            >
              {words[wordIndex]}
            </button>
          ))}

          {selectedWords.length === 0 && (
            <p className="text-muted-foreground text-sm">
              Tap words below to build the sentence
            </p>
          )}
        </div>
      </div>

      {/* Word bank - available words */}
      <div className="flex flex-wrap gap-2 justify-center">
        {availableWords.map((wordIndex) => (
          <button
            key={`available-${wordIndex}`}
            onClick={() => handleWordSelect(wordIndex)}
            disabled={disabled || hasSubmitted}
            className={cn(
              "px-4 py-2 rounded-xl",
              "border-2 border-border bg-white",
              "font-medium",
              "transition-all duration-200",
              "hover:border-primary-300 hover:bg-primary-50",
              "active:scale-95"
            )}
          >
            {words[wordIndex]}
          </button>
        ))}
      </div>

      {/* Check button - only show if not auto-submitting */}
      {isComplete && !hasSubmitted && (
        <button
          onClick={checkAnswer}
          className={cn(
            "mt-auto mx-auto",
            "px-8 py-3 rounded-2xl",
            "bg-primary-500 text-white font-semibold",
            "transition-all duration-200",
            "hover:bg-primary-600",
            "active:scale-95"
          )}
        >
          Check
        </button>
      )}

      {/* Show correct answer if wrong */}
      {hasSubmitted && !isCorrect && (
        <div className="mt-4 p-3 bg-muted rounded-xl">
          <p className="text-sm text-muted-foreground text-center">
            Correct answer:{" "}
            <span className="font-medium text-foreground">
              {correctOrder.map((i) => words[i]).join(" ")}
            </span>
          </p>
        </div>
      )}
    </div>
  );
}

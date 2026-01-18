"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { Item } from "@/types";

interface ReadChooseProps {
  question: string;
  correctItem: Item;
  distractorItems: Item[];
  onAnswer: (correct: boolean, selectedItemId: string) => void;
  disabled?: boolean;
}

export function ReadChoose({
  question,
  correctItem,
  distractorItems,
  onAnswer,
  disabled = false,
}: ReadChooseProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Combine and shuffle options
  const [options] = useState(() => {
    const all = [correctItem, ...distractorItems];
    return all.sort(() => Math.random() - 0.5);
  });

  // Select and immediately submit answer (like ListenTapImage)
  const handleSelect = (itemId: string) => {
    if (disabled || selectedId) return;
    setSelectedId(itemId);
    onAnswer(itemId === correctItem.id, itemId);
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Question */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-center mb-2">
          Choose the correct answer
        </h2>
        <p className="text-lg text-center text-muted-foreground">
          {question}
        </p>
      </div>

      {/* Options */}
      <div className="space-y-3 flex-1">
        {options.map((item) => {
          const isSelected = selectedId === item.id;
          const isCorrect = item.id === correctItem.id;
          // Show result immediately after selection (selectedId !== null means submitted)
          const showResult = selectedId !== null;

          return (
            <button
              key={item.id}
              onClick={() => handleSelect(item.id)}
              disabled={disabled || selectedId !== null}
              className={cn(
                "w-full p-4 rounded-2xl",
                "border-2 text-left",
                "transition-all duration-200",
                "active:scale-[0.98]",
                // Default state
                !showResult && "border-border bg-white hover:border-primary-300",
                // Show results
                showResult && isCorrect && "border-success-500 bg-success-50",
                showResult && isSelected && !isCorrect && "border-error-500 bg-error-50 animate-shake",
                showResult && !isSelected && !isCorrect && "border-border bg-white opacity-60"
              )}
            >
              <div className="flex items-center gap-3">
                {/* Radio indicator */}
                <div
                  className={cn(
                    "w-6 h-6 rounded-full border-2 flex items-center justify-center",
                    !showResult && "border-border",
                    showResult && isCorrect && "border-success-500 bg-success-500",
                    showResult && isSelected && !isCorrect && "border-error-500 bg-error-500",
                    showResult && !isSelected && !isCorrect && "border-border"
                  )}
                >
                  {(isSelected || (showResult && isCorrect)) && (
                    <div
                      className={cn(
                        "w-3 h-3 rounded-full",
                        showResult && isCorrect && "bg-white",
                        showResult && isSelected && !isCorrect && "bg-white"
                      )}
                    />
                  )}
                </div>

                {/* Text */}
                <span className="font-medium">{item.text_pt}</span>
              </div>
            </button>
          );
        })}
      </div>
      {/* Button removed - ExerciseContainer handles the Continue button */}
    </div>
  );
}

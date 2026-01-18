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
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // Combine and shuffle options
  const [options] = useState(() => {
    const all = [correctItem, ...distractorItems];
    return all.sort(() => Math.random() - 0.5);
  });

  const handleSelect = (itemId: string) => {
    if (disabled || hasSubmitted) return;
    setSelectedId(itemId);
  };

  const handleSubmit = () => {
    if (!selectedId || hasSubmitted) return;
    setHasSubmitted(true);
    onAnswer(selectedId === correctItem.id, selectedId);
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
          const showResult = hasSubmitted;

          return (
            <button
              key={item.id}
              onClick={() => handleSelect(item.id)}
              disabled={disabled || hasSubmitted}
              className={cn(
                "w-full p-4 rounded-2xl",
                "border-2 text-left",
                "transition-all duration-200",
                "active:scale-[0.98]",
                // Default state
                !showResult && !isSelected && "border-border bg-white hover:border-primary-300",
                // Selected but not checked yet
                isSelected && !showResult && "border-primary-500 bg-primary-50",
                // Show results
                showResult && isCorrect && "border-success-500 bg-success-50",
                showResult && isSelected && !isCorrect && "border-error-500 bg-error-50 animate-shake"
              )}
            >
              <div className="flex items-center gap-3">
                {/* Radio indicator */}
                <div
                  className={cn(
                    "w-6 h-6 rounded-full border-2 flex items-center justify-center",
                    !showResult && !isSelected && "border-border",
                    isSelected && !showResult && "border-primary-500",
                    showResult && isCorrect && "border-success-500 bg-success-500",
                    showResult && isSelected && !isCorrect && "border-error-500 bg-error-500"
                  )}
                >
                  {isSelected && (
                    <div
                      className={cn(
                        "w-3 h-3 rounded-full",
                        !showResult && "bg-primary-500",
                        showResult && isCorrect && "bg-white",
                        showResult && !isCorrect && "bg-white"
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

      {/* Check button */}
      {selectedId && !hasSubmitted && (
        <button
          onClick={handleSubmit}
          className={cn(
            "mt-auto",
            "w-full py-4 rounded-2xl",
            "bg-primary-500 text-white font-semibold",
            "transition-all duration-200",
            "hover:bg-primary-600",
            "active:scale-[0.98]"
          )}
        >
          Check
        </button>
      )}
    </div>
  );
}

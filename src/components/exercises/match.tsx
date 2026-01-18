"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import type { Item } from "@/types";

interface MatchPair {
  item: Item;
  matchType: "word_to_image" | "word_to_translation";
}

interface MatchProps {
  pairs: MatchPair[];
  onComplete: (allCorrect: boolean, errors: number) => void;
}

export function Match({ pairs, onComplete }: MatchProps) {
  const [leftSelected, setLeftSelected] = useState<string | null>(null);
  const [rightSelected, setRightSelected] = useState<string | null>(null);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [wrongPair, setWrongPair] = useState<[string, string] | null>(null);
  const [errors, setErrors] = useState(0);

  // Create left and right columns
  const [leftColumn] = useState(() =>
    pairs.map((p) => ({ id: p.item.id, text: p.item.text_en })).sort(() => Math.random() - 0.5)
  );

  const [rightColumn] = useState(() =>
    pairs.map((p) => ({
      id: p.item.id,
      text: p.matchType === "word_to_translation" ? p.item.text_pt : p.item.text_en,
      isImage: p.matchType === "word_to_image",
    })).sort(() => Math.random() - 0.5)
  );

  const checkMatch = useCallback(
    (leftId: string, rightId: string) => {
      if (leftId === rightId) {
        // Correct match!
        const newMatched = new Set(matched);
        newMatched.add(leftId);
        setMatched(newMatched);
        setLeftSelected(null);
        setRightSelected(null);

        // Check if all matched
        if (newMatched.size === pairs.length) {
          setTimeout(() => onComplete(errors === 0, errors), 500);
        }
      } else {
        // Wrong match
        setWrongPair([leftId, rightId]);
        setErrors((e) => e + 1);
        setTimeout(() => {
          setWrongPair(null);
          setLeftSelected(null);
          setRightSelected(null);
        }, 500);
      }
    },
    [matched, pairs.length, errors, onComplete]
  );

  const handleLeftClick = (id: string) => {
    if (matched.has(id)) return;
    setLeftSelected(id);
    if (rightSelected) {
      checkMatch(id, rightSelected);
    }
  };

  const handleRightClick = (id: string) => {
    if (matched.has(id)) return;
    setRightSelected(id);
    if (leftSelected) {
      checkMatch(leftSelected, id);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Instructions */}
      <h2 className="text-xl font-bold text-center mb-6">
        Match the pairs
      </h2>

      {/* Progress indicator */}
      <p className="text-center text-muted-foreground mb-4">
        {matched.size} / {pairs.length} matched
      </p>

      {/* Match columns */}
      <div className="flex-1 flex gap-4">
        {/* Left column - English words */}
        <div className="flex-1 flex flex-col gap-3">
          {leftColumn.map((item) => {
            const isMatched = matched.has(item.id);
            const isSelected = leftSelected === item.id;
            const isWrong = wrongPair?.[0] === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleLeftClick(item.id)}
                disabled={isMatched}
                className={cn(
                  "py-4 px-4 rounded-2xl",
                  "border-2 transition-all duration-200",
                  "font-medium text-center",
                  // Default
                  !isMatched && !isSelected && !isWrong && "border-border bg-white hover:border-primary-300",
                  // Selected
                  isSelected && !isWrong && "border-primary-500 bg-primary-50",
                  // Matched
                  isMatched && "border-success-500 bg-success-50 opacity-50",
                  // Wrong
                  isWrong && "border-error-500 bg-error-50 animate-shake"
                )}
              >
                {item.text}
              </button>
            );
          })}
        </div>

        {/* Right column - Translations */}
        <div className="flex-1 flex flex-col gap-3">
          {rightColumn.map((item) => {
            const isMatched = matched.has(item.id);
            const isSelected = rightSelected === item.id;
            const isWrong = wrongPair?.[1] === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleRightClick(item.id)}
                disabled={isMatched}
                className={cn(
                  "py-4 px-4 rounded-2xl",
                  "border-2 transition-all duration-200",
                  "font-medium text-center",
                  // Default
                  !isMatched && !isSelected && !isWrong && "border-border bg-white hover:border-secondary-300",
                  // Selected
                  isSelected && !isWrong && "border-secondary-500 bg-secondary-50",
                  // Matched
                  isMatched && "border-success-500 bg-success-50 opacity-50",
                  // Wrong
                  isWrong && "border-error-500 bg-error-50 animate-shake"
                )}
              >
                {item.text}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useTextToSpeech } from "@/lib/hooks";
import { VolumeIcon } from "@/components/ui";
import type { Item } from "@/types";

interface ListenTapImageProps {
  audioText: string;
  correctItem: Item;
  distractorItems: Item[];
  onAnswer: (correct: boolean, selectedItemId: string) => void;
  disabled?: boolean;
}

export function ListenTapImage({
  audioText,
  correctItem,
  distractorItems,
  onAnswer,
  disabled = false,
}: ListenTapImageProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hasPlayed, setHasPlayed] = useState(false);
  const { speak, isPlaying } = useTextToSpeech();

  // Combine and shuffle options
  const [options] = useState(() => {
    const all = [correctItem, ...distractorItems];
    return all.sort(() => Math.random() - 0.5);
  });

  // Auto-play audio on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      speak(audioText);
      setHasPlayed(true);
    }, 500);
    return () => clearTimeout(timer);
  }, [audioText, speak]);

  const handleSelect = (itemId: string) => {
    if (disabled || selectedId) return;
    setSelectedId(itemId);
    onAnswer(itemId === correctItem.id, itemId);
  };

  const handlePlayAudio = () => {
    speak(audioText);
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Instructions */}
      <h2 className="text-lg sm:text-xl font-bold text-center mb-4">
        Tap what you hear
      </h2>

      {/* Audio Button */}
      <button
        onClick={handlePlayAudio}
        disabled={isPlaying}
        className={cn(
          "mx-auto mb-6 w-16 h-16 sm:w-20 sm:h-20 rounded-full",
          "bg-primary-500 text-white",
          "flex items-center justify-center",
          "shadow-medium hover:shadow-strong",
          "transition-all duration-200",
          "active:scale-95",
          isPlaying && "animate-pulse-slow"
        )}
      >
        <VolumeIcon className="w-8 h-8 sm:w-10 sm:h-10" />
      </button>

      {/* Options Grid - Mobile-first with constrained card sizes */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 w-full max-w-md mx-auto">
        {options.map((item) => {
          const isSelected = selectedId === item.id;
          const isCorrect = item.id === correctItem.id;
          const showResult = selectedId !== null;

          return (
            <button
              key={item.id}
              onClick={() => handleSelect(item.id)}
              disabled={disabled || selectedId !== null}
              className={cn(
                "relative rounded-2xl",
                "border-3 sm:border-4 bg-white",
                "transition-all duration-200",
                "active:scale-95",
                "overflow-hidden shadow-soft",
                // Fixed height instead of aspect-square to prevent giant cards
                "h-32 sm:h-40",
                // Default state
                !showResult && "border-border hover:border-primary-300 hover:shadow-medium",
                // Show results
                showResult && isCorrect && "border-success-500 bg-success-50",
                showResult && isSelected && !isCorrect && "border-error-500 bg-error-50 animate-shake",
                showResult && !isSelected && !isCorrect && "opacity-50"
              )}
            >
              {item.image_url ? (
                <Image
                  src={item.image_url}
                  alt={item.text_en}
                  fill
                  className="object-cover"
                />
              ) : (
                // Larger emoji for better visibility
                <div className="w-full h-full flex items-center justify-center pt-2">
                  <span className="text-5xl sm:text-6xl">
                    {getEmojiForWord(item.text_en)}
                  </span>
                </div>
              )}

              {/* Word label - improved readability */}
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-2 sm:p-3">
                <p className="text-white font-bold text-sm sm:text-base text-center drop-shadow-md">
                  {item.text_en}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Helper to get emoji for common words (fallback when no image)
function getEmojiForWord(word: string): string {
  const emojis: Record<string, string> = {
    // Greetings
    hello: "👋",
    hi: "👋",
    goodbye: "👋",
    bye: "👋",
    "good morning": "🌅",
    "good afternoon": "☀️",
    "good evening": "🌙",
    "how are you": "😊",
    "thank you": "🙏",
    please: "🙏",
    // Colors
    red: "🔴",
    blue: "🔵",
    green: "🟢",
    yellow: "🟡",
    orange: "🟠",
    purple: "🟣",
    pink: "💗",
    black: "⚫",
    white: "⚪",
    brown: "🟤",
    // Numbers
    one: "1️⃣",
    two: "2️⃣",
    three: "3️⃣",
    four: "4️⃣",
    five: "5️⃣",
    six: "6️⃣",
    seven: "7️⃣",
    eight: "8️⃣",
    nine: "9️⃣",
    ten: "🔟",
  };

  return emojis[word.toLowerCase()] || "❓";
}

"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Button, CircularProgress } from "@/components/ui";
import { Confetti } from "./confetti";
import type { Badge } from "@/types";

interface LessonCompleteProps {
  xpEarned: number;
  accuracy: number;
  correctCount: number;
  totalCount: number;
  earnedBadges?: Badge[];
  onContinue: () => void;
}

export function LessonComplete({
  xpEarned,
  accuracy,
  correctCount,
  totalCount,
  earnedBadges = [],
  onContinue,
}: LessonCompleteProps) {
  const [showConfetti, setShowConfetti] = useState(false);
  const [animatedXP, setAnimatedXP] = useState(0);

  useEffect(() => {
    // Show confetti
    setShowConfetti(true);

    // Animate XP counter
    const duration = 1500;
    const steps = 30;
    const increment = xpEarned / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= xpEarned) {
        setAnimatedXP(xpEarned);
        clearInterval(timer);
      } else {
        setAnimatedXP(Math.floor(current));
      }
    }, duration / steps);

    // Play success sound
    const audio = new Audio("/sounds/success.mp3");
    audio.volume = 0.5;
    audio.play().catch(() => {});

    return () => clearInterval(timer);
  }, [xpEarned]);

  const getMessage = () => {
    if (accuracy >= 90) return "Perfect!";
    if (accuracy >= 70) return "Great job!";
    if (accuracy >= 50) return "Good effort!";
    return "Keep practicing!";
  };

  const getEmoji = () => {
    if (accuracy >= 90) return "🌟";
    if (accuracy >= 70) return "🎉";
    if (accuracy >= 50) return "👍";
    return "💪";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-500 to-primary-700 flex flex-col items-center justify-center p-6 text-white">
      {showConfetti && <Confetti />}

      {/* Trophy/Star */}
      <div
        className={cn(
          "w-32 h-32 rounded-full",
          "bg-white/20 backdrop-blur-sm",
          "flex items-center justify-center",
          "mb-6 animate-scale-in"
        )}
      >
        <span className="text-7xl">{getEmoji()}</span>
      </div>

      {/* Message */}
      <h1 className="text-3xl font-bold mb-2 animate-slide-up">
        {getMessage()}
      </h1>
      <p className="text-primary-100 mb-8 animate-slide-up">
        Lesson complete
      </p>

      {/* Stats */}
      <div className="w-full max-w-xs space-y-6 mb-8">
        {/* XP Earned */}
        <div className="bg-white/10 rounded-2xl p-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">⚡</span>
              <div>
                <p className="text-sm text-primary-100">XP Earned</p>
                <p className="text-2xl font-bold">+{animatedXP}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Accuracy */}
        <div className="bg-white/10 rounded-2xl p-4 animate-fade-in">
          <div className="flex items-center gap-4">
            <CircularProgress
              value={accuracy}
              size={60}
              strokeWidth={6}
              variant="success"
              showValue={false}
            >
              <span className="text-sm font-bold">{accuracy}%</span>
            </CircularProgress>
            <div>
              <p className="text-sm text-primary-100">Accuracy</p>
              <p className="font-bold">
                {correctCount}/{totalCount} correct
              </p>
            </div>
          </div>
        </div>

        {/* Earned Badges */}
        {earnedBadges.length > 0 && (
          <div className="bg-white/10 rounded-2xl p-4 animate-fade-in">
            <p className="text-sm text-primary-100 mb-3">Badges Earned</p>
            <div className="flex justify-center gap-3">
              {earnedBadges.map((badge) => (
                <div
                  key={badge.id}
                  className="flex flex-col items-center"
                >
                  <div className="w-12 h-12 rounded-full bg-warning-100 flex items-center justify-center mb-1">
                    <span className="text-2xl">{badge.icon}</span>
                  </div>
                  <p className="text-xs font-medium">{badge.name}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Continue Button */}
      <Button
        variant="secondary"
        size="lg"
        fullWidth
        onClick={onContinue}
        className="max-w-xs animate-slide-up"
      >
        Continue
      </Button>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui";
import { Confetti } from "./confetti";
import type { Badge } from "@/types";

interface BadgeEarnedProps {
  badge: Badge;
  onClose: () => void;
}

export function BadgeEarned({ badge, onClose }: BadgeEarnedProps) {
  const [showConfetti, setShowConfetti] = useState(false);
  const [animationPhase, setAnimationPhase] = useState<"enter" | "show" | "exit">("enter");

  useEffect(() => {
    // Start confetti
    setShowConfetti(true);

    // Play achievement sound
    const audio = new Audio("/sounds/achievement.mp3");
    audio.volume = 0.6;
    audio.play().catch(() => {});

    // Animation phases
    const showTimer = setTimeout(() => {
      setAnimationPhase("show");
    }, 100);

    return () => {
      clearTimeout(showTimer);
    };
  }, []);

  const handleClose = () => {
    setAnimationPhase("exit");
    setTimeout(() => {
      onClose();
    }, 300);
  };

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center",
        "bg-black/70 backdrop-blur-sm",
        "transition-opacity duration-300",
        animationPhase === "enter" && "opacity-0",
        animationPhase === "show" && "opacity-100",
        animationPhase === "exit" && "opacity-0"
      )}
      onClick={handleClose}
    >
      {showConfetti && <Confetti />}

      <div
        className={cn(
          "bg-white rounded-3xl p-8 mx-4 max-w-sm w-full",
          "text-center transform transition-all duration-500",
          animationPhase === "enter" && "scale-50 opacity-0",
          animationPhase === "show" && "scale-100 opacity-100",
          animationPhase === "exit" && "scale-90 opacity-0"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title */}
        <p className="text-primary-500 font-bold text-sm uppercase tracking-wide mb-4">
          New Badge Unlocked!
        </p>

        {/* Badge Icon with glow effect */}
        <div className="relative mb-6">
          <div
            className={cn(
              "absolute inset-0 rounded-full",
              "bg-warning-300 blur-xl opacity-60",
              "animate-pulse"
            )}
            style={{
              transform: "scale(0.8)",
              top: "10%",
              left: "20%",
              right: "20%",
              bottom: "10%",
            }}
          />
          <div
            className={cn(
              "relative w-32 h-32 mx-auto rounded-full",
              "bg-gradient-to-br from-warning-100 to-warning-200",
              "flex items-center justify-center",
              "shadow-lg",
              "animate-bounce-soft"
            )}
          >
            <span className="text-7xl">{badge.icon}</span>
          </div>
        </div>

        {/* Badge Name */}
        <h2 className="text-2xl font-bold mb-2">{badge.name}</h2>

        {/* Badge Description */}
        <p className="text-muted-foreground mb-8">{badge.description}</p>

        {/* Close Button */}
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onClick={handleClose}
        >
          Awesome!
        </Button>
      </div>

      <style jsx>{`
        @keyframes bounce-soft {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        .animate-bounce-soft {
          animation: bounce-soft 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

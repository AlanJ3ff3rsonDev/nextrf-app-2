"use client";

import { cn } from "@/lib/utils";

export interface ProgressBarProps {
  value: number; // 0-100
  max?: number;
  variant?: "primary" | "secondary" | "success";
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
  animated?: boolean;
}

function ProgressBar({
  value,
  max = 100,
  variant = "primary",
  size = "md",
  showLabel = false,
  className,
  animated = true,
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const variants = {
    primary: "bg-primary-500",
    secondary: "bg-secondary-500",
    success: "bg-success-500",
  };

  const sizes = {
    sm: "h-2",
    md: "h-3",
    lg: "h-4",
  };

  return (
    <div className={cn("w-full", className)}>
      <div
        className={cn(
          "w-full bg-muted rounded-full overflow-hidden",
          sizes[size]
        )}
      >
        <div
          className={cn(
            "h-full rounded-full",
            variants[variant],
            animated && "transition-all duration-500 ease-out"
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <div className="flex justify-between mt-1 text-xs text-muted-foreground">
          <span>{value}</span>
          <span>{max}</span>
        </div>
      )}
    </div>
  );
}

// Circular progress for XP or completion
interface CircularProgressProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  variant?: "primary" | "secondary" | "success";
  showValue?: boolean;
  children?: React.ReactNode;
  className?: string;
}

function CircularProgress({
  value,
  max = 100,
  size = 80,
  strokeWidth = 8,
  variant = "primary",
  showValue = true,
  children,
  className,
}: CircularProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  const colors = {
    primary: "stroke-primary-500",
    secondary: "stroke-secondary-500",
    success: "stroke-success-500",
  };

  return (
    <div className={cn("relative inline-flex", className)}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          className="text-muted"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          className={cn(colors[variant], "transition-all duration-500 ease-out")}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      {(showValue || children) && (
        <div className="absolute inset-0 flex items-center justify-center">
          {children || (
            <span className="text-sm font-bold">{Math.round(percentage)}%</span>
          )}
        </div>
      )}
    </div>
  );
}

export { ProgressBar, CircularProgress };

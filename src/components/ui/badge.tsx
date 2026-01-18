"use client";

import { cn } from "@/lib/utils";

export interface BadgeProps {
  variant?: "default" | "primary" | "secondary" | "success" | "warning" | "error";
  size?: "sm" | "md";
  children: React.ReactNode;
  className?: string;
}

function Badge({
  variant = "default",
  size = "md",
  children,
  className,
}: BadgeProps) {
  const variants = {
    default: "bg-muted text-muted-foreground",
    primary: "bg-primary-100 text-primary-700",
    secondary: "bg-secondary-100 text-secondary-700",
    success: "bg-success-100 text-success-700",
    warning: "bg-warning-100 text-warning-700",
    error: "bg-error-100 text-error-700",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 font-semibold rounded-full",
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </span>
  );
}

// Specialized badges
interface XPBadgeProps {
  xp: number;
  size?: "sm" | "md";
  className?: string;
}

function XPBadge({ xp, size = "md", className }: XPBadgeProps) {
  const formatXP = (value: number) => {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toString();
  };

  return (
    <Badge variant="secondary" size={size} className={className}>
      <span className="text-base">⚡</span>
      {formatXP(xp)} XP
    </Badge>
  );
}

interface StreakBadgeProps {
  days: number;
  size?: "sm" | "md";
  className?: string;
}

function StreakBadge({ days, size = "md", className }: StreakBadgeProps) {
  return (
    <Badge variant="warning" size={size} className={className}>
      <span className="text-base">🔥</span>
      {days} {days === 1 ? "day" : "days"}
    </Badge>
  );
}

interface LevelBadgeProps {
  level: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

function LevelBadge({ level, size = "md", className }: LevelBadgeProps) {
  const sizes = {
    sm: "w-6 h-6 text-xs",
    md: "w-8 h-8 text-sm",
    lg: "w-10 h-10 text-base",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center",
        "rounded-full bg-primary-500 text-white font-bold",
        sizes[size],
        className
      )}
    >
      {level}
    </span>
  );
}

export { Badge, XPBadge, StreakBadge, LevelBadge };

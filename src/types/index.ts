export * from "./database";

// UI Component Types
export interface ButtonProps {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  loading?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  className?: string;
}

export interface InputProps {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export interface CardProps {
  variant?: "default" | "elevated" | "outline";
  padding?: "none" | "sm" | "md" | "lg";
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

// Exercise Engine Types
export interface ExerciseResult {
  exerciseId: string;
  correct: boolean;
  timeSpent: number;
  attempts: number;
}

export interface LessonSession {
  lessonId: string;
  exercises: ExerciseResult[];
  startedAt: Date;
  completedAt?: Date;
  totalXp: number;
  accuracy: number;
}

// Audio Types
export interface AudioState {
  isPlaying: boolean;
  isLoading: boolean;
  error?: string;
}

export interface SpeechRecognitionResult {
  transcript: string;
  confidence: number;
  isMatch: boolean;
}

// Navigation Types
export interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
}

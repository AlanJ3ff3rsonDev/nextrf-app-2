// Database Types for NextRF English App

export type UserRole = "teacher" | "student";
export type CEFRLevel = "A0" | "A1" | "A2" | "B1" | "B2";
export type ExerciseType =
  | "listen_tap_image"
  | "match"
  | "order_words"
  | "read_choose"
  | "speak_repeat";
export type MasteryStatus = "new" | "learning" | "reviewing" | "mastered";
export type LessonStatus = "locked" | "available" | "completed";

// User & Auth
export interface Profile {
  id: string;
  email?: string;
  name: string;
  role: UserRole;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Class {
  id: string;
  name: string;
  teacher_id: string;
  code: string; // Unique class code for joining
  created_at: string;
}

export interface Student {
  id: string;
  profile_id: string;
  class_id: string;
  username: string;
  level: CEFRLevel;
  total_xp: number;
  created_at: string;
  // Joined data
  profile?: Profile;
  class?: Class;
}

// Course Structure
export interface Course {
  id: string;
  name: string;
  description: string;
  created_at: string;
}

export interface Level {
  id: string;
  course_id: string;
  cefr_level: CEFRLevel;
  name: string;
  description: string;
  order: number;
}

export interface Unit {
  id: string;
  level_id: string;
  title: string;
  theme: string;
  description?: string;
  image_url?: string;
  order: number;
  // Joined data
  lessons?: Lesson[];
}

export interface Lesson {
  id: string;
  unit_id: string;
  title: string;
  description?: string;
  target_skills: string[];
  xp_reward: number;
  order: number;
  // Joined data
  exercises?: Exercise[];
}

// Content Items
export interface Item {
  id: string;
  text_en: string;
  text_pt: string;
  image_url?: string;
  audio_url?: string;
  tags: string[];
  created_at: string;
}

export interface LessonItem {
  lesson_id: string;
  item_id: string;
  order: number;
}

// Exercises
export interface Exercise {
  id: string;
  lesson_id: string;
  type: ExerciseType;
  config: ExerciseConfig;
  order: number;
}

export type ExerciseConfig =
  | ListenTapImageConfig
  | MatchConfig
  | OrderWordsConfig
  | ReadChooseConfig
  | SpeakRepeatConfig;

export interface ListenTapImageConfig {
  type: "listen_tap_image";
  audio_text: string;
  correct_item_id: string;
  distractor_item_ids: string[];
}

export interface MatchConfig {
  type: "match";
  pairs: Array<{
    item_id: string;
    match_type: "word_to_image" | "word_to_translation";
  }>;
}

export interface OrderWordsConfig {
  type: "order_words";
  sentence_en: string;
  sentence_pt: string;
  words: string[];
  correct_order: number[];
}

export interface ReadChooseConfig {
  type: "read_choose";
  question: string;
  correct_item_id: string;
  distractor_item_ids: string[];
}

export interface SpeakRepeatConfig {
  type: "speak_repeat";
  text: string;
  audio_url?: string;
}

// Progress Tracking
export interface StudentProgress {
  id: string;
  student_id: string;
  lesson_id: string;
  completed_at: string;
  xp_earned: number;
  accuracy: number; // 0-100
  time_spent_seconds: number;
}

export interface ItemMastery {
  id: string;
  student_id: string;
  item_id: string;
  status: MasteryStatus;
  correct_count: number;
  incorrect_count: number;
  streak: number;
  next_review: string; // ISO date
  last_reviewed: string;
}

// Gamification
export interface Streak {
  id: string;
  student_id: string;
  current_streak: number;
  longest_streak: number;
  last_practice_date: string; // ISO date
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  criteria: BadgeCriteria;
}

export interface BadgeCriteria {
  type: "lesson_complete" | "streak" | "unit_complete" | "xp_total" | "accuracy";
  value: number;
}

export interface StudentBadge {
  id: string;
  student_id: string;
  badge_id: string;
  earned_at: string;
  badge?: Badge;
}

// Missions
export interface Mission {
  id: string;
  class_id: string;
  title: string;
  description: string;
  goal_type: "minutes" | "lessons" | "xp" | "unit";
  goal_value: number;
  start_date: string;
  end_date: string;
  created_at: string;
}

export interface StudentMissionProgress {
  id: string;
  student_id: string;
  mission_id: string;
  progress_value: number;
  completed_at?: string;
}

// Activity Tracking
export interface ActivityLog {
  id: string;
  student_id: string;
  activity_type: "lesson_start" | "lesson_complete" | "exercise_complete" | "login";
  metadata?: Record<string, unknown>;
  created_at: string;
}

// Dashboard Types
export interface StudentDashboardData {
  student: Student;
  streak: Streak;
  recentBadges: StudentBadge[];
  currentMission?: Mission & { progress: number };
  itemsToReview: number;
  nextLesson?: Lesson & { unit: Unit };
}

export interface TeacherDashboardStudent {
  student: Student;
  status: "active" | "warning" | "inactive"; // Green, Yellow, Red
  minutesThisWeek: number;
  lessonsCompleted: number;
  averageAccuracy: number;
  currentLevel: CEFRLevel;
  lastActive: string;
}

export interface ClassStats {
  totalStudents: number;
  activeStudents: number;
  averageMinutesPerWeek: number;
  commonDifficulties: Array<{
    item: Item;
    errorCount: number;
  }>;
}

// Student Detail Types
export interface StudentDetailData {
  student: Student & { profile: Profile; class: Class };
  streak: Streak | null;
  badges: StudentBadge[];
  progress: StudentProgressWithLesson[];
  mastery: ItemMasteryWithItem[];
}

export interface StudentProgressWithLesson extends StudentProgress {
  lesson: Lesson & { unit?: Unit };
}

export interface ItemMasteryWithItem extends ItemMastery {
  item: Item;
}

export interface StudentOverviewStats {
  lessonsCompleted: number;
  totalTimeMinutes: number;
  overallAccuracy: number;
  totalXp: number;
  currentStreak: number;
  longestStreak: number;
}

export interface ProgressEntry {
  date: string;
  accuracy: number;
  lessonsCount: number;
  timeMinutes: number;
}

export interface SkillAnalysis {
  tag: string;
  accuracy: number;
  totalAttempts: number;
  status: "strength" | "needs_work" | "neutral";
}

export interface RecentLesson {
  id: string;
  title: string;
  unitTitle: string;
  completedAt: string;
  accuracy: number;
  timeSpentSeconds: number;
  xpEarned: number;
}

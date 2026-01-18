import { createClient } from "@/lib/supabase/client";
import type { Badge, StudentBadge, BadgeCriteria } from "@/types";

interface StudentStats {
  totalXp: number;
  lessonsCompleted: number;
  currentStreak: number;
  unitsCompleted: number;
}

interface LessonResult {
  accuracy: number;
  lessonId: string;
}

/**
 * Check and award badges to a student based on their progress
 * Returns array of newly earned badges
 */
export async function checkAndAwardBadges(
  studentId: string,
  lessonResult?: LessonResult
): Promise<Badge[]> {
  const supabase = createClient();
  const newlyEarnedBadges: Badge[] = [];

  // Get all badges
  const { data: allBadges } = await supabase
    .from("badges")
    .select("*") as { data: Badge[] | null };

  if (!allBadges) return [];

  // Get already earned badges
  const { data: earnedBadges } = await supabase
    .from("student_badges")
    .select("badge_id")
    .eq("student_id", studentId) as { data: { badge_id: string }[] | null };

  const earnedBadgeIds = new Set(earnedBadges?.map((b) => b.badge_id) || []);

  // Get student stats
  const stats = await getStudentStats(studentId);

  // Check each badge
  for (const badge of allBadges) {
    // Skip if already earned
    if (earnedBadgeIds.has(badge.id)) continue;

    const criteria = badge.criteria as BadgeCriteria;
    const earned = checkBadgeCriteria(criteria, stats, lessonResult);

    if (earned) {
      // Award badge
      const { error } = await (supabase.from("student_badges") as any).insert({
        student_id: studentId,
        badge_id: badge.id,
      });

      if (!error) {
        newlyEarnedBadges.push(badge);
      }
    }
  }

  return newlyEarnedBadges;
}

/**
 * Get student statistics for badge checking
 */
async function getStudentStats(studentId: string): Promise<StudentStats> {
  const supabase = createClient();

  // Get student XP
  const { data: student } = await supabase
    .from("students")
    .select("total_xp")
    .eq("id", studentId)
    .single() as { data: { total_xp: number } | null };

  // Get lessons completed count
  const { data: progress } = await supabase
    .from("student_progress")
    .select("lesson_id")
    .eq("student_id", studentId) as { data: { lesson_id: string }[] | null };

  const lessonsCompleted = progress?.length || 0;

  // Get current streak
  const { data: streak } = await supabase
    .from("streaks")
    .select("current_streak")
    .eq("student_id", studentId)
    .single() as { data: { current_streak: number } | null };

  // Get units completed (count units where all lessons are done)
  const unitsCompleted = await getUnitsCompleted(studentId, progress?.map((p) => p.lesson_id) || []);

  return {
    totalXp: student?.total_xp || 0,
    lessonsCompleted,
    currentStreak: streak?.current_streak || 0,
    unitsCompleted,
  };
}

/**
 * Count how many units the student has fully completed
 */
async function getUnitsCompleted(
  studentId: string,
  completedLessonIds: string[]
): Promise<number> {
  if (completedLessonIds.length === 0) return 0;

  const supabase = createClient();

  // Get all units with their lessons
  const { data: units } = await supabase
    .from("units")
    .select("id, lessons(id)") as { data: { id: string; lessons: { id: string }[] }[] | null };

  if (!units) return 0;

  const completedSet = new Set(completedLessonIds);
  let count = 0;

  for (const unit of units) {
    if (unit.lessons.length === 0) continue;
    const allLessonsComplete = unit.lessons.every((l) => completedSet.has(l.id));
    if (allLessonsComplete) count++;
  }

  return count;
}

/**
 * Check if badge criteria is met
 */
function checkBadgeCriteria(
  criteria: BadgeCriteria,
  stats: StudentStats,
  lessonResult?: LessonResult
): boolean {
  switch (criteria.type) {
    case "lesson_complete":
      return stats.lessonsCompleted >= criteria.value;

    case "streak":
      return stats.currentStreak >= criteria.value;

    case "unit_complete":
      return stats.unitsCompleted >= criteria.value;

    case "xp_total":
      return stats.totalXp >= criteria.value;

    case "accuracy":
      // Check if current lesson had perfect accuracy
      return lessonResult?.accuracy === criteria.value;

    default:
      return false;
  }
}

/**
 * Get all badges with student's progress toward each
 */
export async function getBadgesWithProgress(
  studentId: string
): Promise<(Badge & { earned: boolean; earnedAt?: string; progress: number })[]> {
  const supabase = createClient();

  // Get all badges
  const { data: allBadges } = await supabase
    .from("badges")
    .select("*") as { data: Badge[] | null };

  if (!allBadges) return [];

  // Get earned badges
  const { data: earnedBadges } = await supabase
    .from("student_badges")
    .select("badge_id, earned_at")
    .eq("student_id", studentId) as { data: { badge_id: string; earned_at: string }[] | null };

  const earnedMap = new Map(
    earnedBadges?.map((b) => [b.badge_id, b.earned_at]) || []
  );

  // Get stats for progress calculation
  const stats = await getStudentStats(studentId);

  return allBadges.map((badge) => {
    const earned = earnedMap.has(badge.id);
    const earnedAt = earnedMap.get(badge.id);
    const progress = calculateProgress(badge.criteria as BadgeCriteria, stats);

    return {
      ...badge,
      earned,
      earnedAt,
      progress,
    };
  });
}

/**
 * Calculate progress percentage toward a badge
 */
function calculateProgress(criteria: BadgeCriteria, stats: StudentStats): number {
  let current = 0;
  const target = criteria.value;

  switch (criteria.type) {
    case "lesson_complete":
      current = stats.lessonsCompleted;
      break;
    case "streak":
      current = stats.currentStreak;
      break;
    case "unit_complete":
      current = stats.unitsCompleted;
      break;
    case "xp_total":
      current = stats.totalXp;
      break;
    case "accuracy":
      // Accuracy badges show 0 or 100
      return 0;
    default:
      return 0;
  }

  return Math.min(Math.round((current / target) * 100), 100);
}

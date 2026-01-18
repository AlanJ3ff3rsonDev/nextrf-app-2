import { createClient } from "@/lib/supabase/client";
import type {
  StudentDetailData,
  StudentOverviewStats,
  ProgressEntry,
  SkillAnalysis,
  RecentLesson,
  Student,
  Profile,
  Class,
  Streak,
  StudentBadge,
} from "@/types";

/**
 * Fetch all student detail data in parallel
 */
export async function fetchStudentDetail(
  studentId: string
): Promise<StudentDetailData | null> {
  const supabase = createClient();

  // Fetch student with profile and class
  const { data: studentData, error: studentError } = await supabase
    .from("students")
    .select("*, profiles(*), classes(*)")
    .eq("id", studentId)
    .single() as { data: any; error: any };

  if (studentError || !studentData) {
    return null;
  }

  // Fetch progress data
  const { data: progressData } = await supabase
    .from("student_progress")
    .select("*, lessons(*, units(*))")
    .eq("student_id", studentId)
    .order("completed_at", { ascending: false }) as { data: any[] | null };

  // Fetch mastery data
  const { data: masteryData } = await supabase
    .from("item_mastery")
    .select("*, items(*)")
    .eq("student_id", studentId) as { data: any[] | null };

  // Fetch streak data
  const { data: streakData } = await supabase
    .from("streaks")
    .select("*")
    .eq("student_id", studentId)
    .single() as { data: Streak | null };

  // Fetch badges data
  const { data: badgesData } = await supabase
    .from("student_badges")
    .select("*, badges(*)")
    .eq("student_id", studentId)
    .order("earned_at", { ascending: false }) as { data: any[] | null };

  return {
    student: {
      ...studentData,
      profile: studentData.profiles as Profile,
      class: studentData.classes as Class,
    } as Student & { profile: Profile; class: Class },
    streak: streakData,
    badges: (badgesData || []).map((b: any) => ({
      ...b,
      badge: b.badges,
    })) as StudentBadge[],
    progress: (progressData || []).map((p: any) => ({
      ...p,
      lesson: {
        ...p.lessons,
        unit: p.lessons?.units,
      },
    })),
    mastery: (masteryData || []).map((m: any) => ({
      ...m,
      item: m.items,
    })),
  };
}

/**
 * Calculate overview statistics from student data
 */
export function calculateStats(data: StudentDetailData): StudentOverviewStats {
  const { student, streak, progress } = data;

  const lessonsCompleted = progress.length;
  const totalTimeSeconds = progress.reduce(
    (sum, p) => sum + (p.time_spent_seconds || 0),
    0
  );
  const totalTimeMinutes = Math.round(totalTimeSeconds / 60);

  const totalAccuracy = progress.reduce((sum, p) => sum + (p.accuracy || 0), 0);
  const overallAccuracy =
    lessonsCompleted > 0 ? Math.round(totalAccuracy / lessonsCompleted) : 0;

  return {
    lessonsCompleted,
    totalTimeMinutes,
    overallAccuracy,
    totalXp: student.total_xp || 0,
    currentStreak: streak?.current_streak || 0,
    longestStreak: streak?.longest_streak || 0,
  };
}

/**
 * Aggregate progress data by day for chart visualization
 */
export function aggregateProgressByDay(
  progress: StudentDetailData["progress"],
  days: number = 30
): ProgressEntry[] {
  const now = new Date();
  const startDate = new Date(now);
  startDate.setDate(startDate.getDate() - days);

  // Initialize map with all dates
  const dateMap = new Map<string, ProgressEntry>();
  for (let i = 0; i <= days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split("T")[0];
    dateMap.set(dateStr, {
      date: dateStr,
      accuracy: 0,
      lessonsCount: 0,
      timeMinutes: 0,
    });
  }

  // Aggregate progress data
  progress.forEach((p) => {
    const completedDate = new Date(p.completed_at);
    const dateStr = completedDate.toISOString().split("T")[0];

    const entry = dateMap.get(dateStr);
    if (entry) {
      entry.lessonsCount += 1;
      entry.timeMinutes += Math.round((p.time_spent_seconds || 0) / 60);
      // Running average for accuracy
      entry.accuracy =
        entry.lessonsCount === 1
          ? p.accuracy
          : Math.round(
              (entry.accuracy * (entry.lessonsCount - 1) + p.accuracy) /
                entry.lessonsCount
            );
    }
  });

  return Array.from(dateMap.values()).sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
}

/**
 * Analyze strengths and weaknesses based on item mastery and tags
 */
export function analyzeStrengthsWeaknesses(
  mastery: StudentDetailData["mastery"]
): SkillAnalysis[] {
  // Group by tag
  const tagMap = new Map<
    string,
    { correct: number; total: number; items: number }
  >();

  mastery.forEach((m) => {
    const tags = m.item?.tags || [];
    const correct = m.correct_count || 0;
    const incorrect = m.incorrect_count || 0;
    const total = correct + incorrect;

    if (total === 0) return;

    tags.forEach((tag) => {
      const existing = tagMap.get(tag) || { correct: 0, total: 0, items: 0 };
      existing.correct += correct;
      existing.total += total;
      existing.items += 1;
      tagMap.set(tag, existing);
    });
  });

  // Convert to analysis array
  const analysis: SkillAnalysis[] = [];
  tagMap.forEach((data, tag) => {
    if (data.total < 3) return; // Require minimum attempts

    const accuracy = Math.round((data.correct / data.total) * 100);
    let status: SkillAnalysis["status"] = "neutral";

    if (accuracy >= 80) {
      status = "strength";
    } else if (accuracy < 60) {
      status = "needs_work";
    }

    analysis.push({
      tag,
      accuracy,
      totalAttempts: data.total,
      status,
    });
  });

  // Sort by accuracy (strengths first)
  return analysis.sort((a, b) => b.accuracy - a.accuracy);
}

/**
 * Format progress data into recent lessons list
 */
export function formatRecentLessons(
  progress: StudentDetailData["progress"],
  limit: number = 10
): RecentLesson[] {
  return progress.slice(0, limit).map((p) => ({
    id: p.lesson_id,
    title: p.lesson?.title || "Unknown Lesson",
    unitTitle: p.lesson?.unit?.title || "Unknown Unit",
    completedAt: p.completed_at,
    accuracy: p.accuracy,
    timeSpentSeconds: p.time_spent_seconds,
    xpEarned: p.xp_earned,
  }));
}

/**
 * Verify teacher has access to this student (owns the class)
 */
export async function verifyTeacherAccess(
  teacherId: string,
  studentId: string
): Promise<boolean> {
  const supabase = createClient();

  const { data: student } = await supabase
    .from("students")
    .select("class_id, classes!inner(teacher_id)")
    .eq("id", studentId)
    .single();

  if (!student) return false;

  const studentData = student as any;
  return studentData.classes?.teacher_id === teacherId;
}

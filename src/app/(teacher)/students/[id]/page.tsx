"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Avatar,
  ProgressBar,
  ChevronLeftIcon,
  TrophyIcon,
  BookIcon,
} from "@/components/ui";
import { cn, formatRelativeDate, formatXP, getCEFRDisplayName } from "@/lib/utils";
import {
  fetchStudentDetail,
  calculateStats,
  aggregateProgressByDay,
  analyzeStrengthsWeaknesses,
  formatRecentLessons,
  verifyTeacherAccess,
} from "@/lib/services/student-service";
import type {
  StudentDetailData,
  StudentOverviewStats,
  ProgressEntry,
  SkillAnalysis,
  RecentLesson,
  StudentBadge,
} from "@/types";

type TimeRange = "week" | "month" | "all";

export default function StudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const studentId = resolvedParams.id;

  const [data, setData] = useState<StudentDetailData | null>(null);
  const [stats, setStats] = useState<StudentOverviewStats | null>(null);
  const [progressData, setProgressData] = useState<ProgressEntry[]>([]);
  const [skills, setSkills] = useState<SkillAnalysis[]>([]);
  const [recentLessons, setRecentLessons] = useState<RecentLesson[]>([]);
  const [timeRange, setTimeRange] = useState<TimeRange>("month");
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setAuthorized(false);
        setLoading(false);
        return;
      }

      // Verify teacher access
      const hasAccess = await verifyTeacherAccess(user.id, studentId);
      if (!hasAccess) {
        setAuthorized(false);
        setLoading(false);
        return;
      }

      // Fetch student data
      const studentData = await fetchStudentDetail(studentId);
      if (!studentData) {
        setLoading(false);
        return;
      }

      setData(studentData);
      setStats(calculateStats(studentData));
      setSkills(analyzeStrengthsWeaknesses(studentData.mastery));
      setRecentLessons(formatRecentLessons(studentData.progress, 10));
      updateProgressData(studentData, "month");
      setLoading(false);
    };

    fetchData();
  }, [studentId]);

  const updateProgressData = (studentData: StudentDetailData, range: TimeRange) => {
    const days = range === "week" ? 7 : range === "month" ? 30 : 90;
    setProgressData(aggregateProgressByDay(studentData.progress, days));
    setTimeRange(range);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card padding="lg" className="text-center max-w-md">
          <h2 className="text-xl font-bold mb-2">Access Denied</h2>
          <p className="text-muted-foreground mb-4">
            You don&apos;t have permission to view this student.
          </p>
          <Link
            href="/dashboard"
            className="text-primary-600 hover:underline font-medium"
          >
            Return to Dashboard
          </Link>
        </Card>
      </div>
    );
  }

  if (!data || !stats) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card padding="lg" className="text-center max-w-md">
          <h2 className="text-xl font-bold mb-2">Student Not Found</h2>
          <p className="text-muted-foreground mb-4">
            The student you&apos;re looking for doesn&apos;t exist.
          </p>
          <Link
            href="/dashboard"
            className="text-primary-600 hover:underline font-medium"
          >
            Return to Dashboard
          </Link>
        </Card>
      </div>
    );
  }

  const strengths = skills.filter((s) => s.status === "strength");
  const needsWork = skills.filter((s) => s.status === "needs_work");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-border p-4">
        <div className="max-w-6xl mx-auto">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4"
          >
            <ChevronLeftIcon className="w-5 h-5" />
            Back to Dashboard
          </Link>
          <div className="flex items-center gap-4">
            <Avatar
              name={data.student.profile?.name}
              src={data.student.profile?.avatar_url}
              size="xl"
            />
            <div>
              <h1 className="text-2xl font-bold">
                {data.student.profile?.name || data.student.username}
              </h1>
              <div className="flex items-center gap-3 mt-1 text-muted-foreground">
                <span className="px-2 py-0.5 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
                  {data.student.level} - {getCEFRDisplayName(data.student.level)}
                </span>
                <span>{data.student.class?.name}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                @{data.student.username} · Last active:{" "}
                {data.progress.length > 0
                  ? formatRelativeDate(data.progress[0].completed_at)
                  : "Never"}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="Lessons"
            value={stats.lessonsCompleted.toString()}
            icon={<BookIcon className="w-5 h-5 text-primary-600" />}
            bgColor="bg-primary-100"
          />
          <StatCard
            label="Time Practiced"
            value={formatTime(stats.totalTimeMinutes)}
            icon={<ClockIcon className="w-5 h-5 text-secondary-600" />}
            bgColor="bg-secondary-100"
          />
          <StatCard
            label="Accuracy"
            value={`${stats.overallAccuracy}%`}
            icon={<TargetIcon className="w-5 h-5 text-success-600" />}
            bgColor="bg-success-100"
          />
          <StatCard
            label="Total XP"
            value={formatXP(stats.totalXp)}
            icon={<StarIcon className="w-5 h-5 text-warning-600" />}
            bgColor="bg-warning-100"
          />
        </div>

        {/* Progress Chart */}
        <Card padding="lg">
          <div className="flex items-center justify-between mb-4">
            <CardTitle>Progress Over Time</CardTitle>
            <div className="flex gap-1 bg-muted rounded-lg p-1">
              {(["week", "month", "all"] as TimeRange[]).map((range) => (
                <button
                  key={range}
                  onClick={() => data && updateProgressData(data, range)}
                  className={cn(
                    "px-3 py-1 text-sm rounded-md transition-colors",
                    timeRange === range
                      ? "bg-white shadow-sm font-medium"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {range === "week" ? "Week" : range === "month" ? "Month" : "All"}
                </button>
              ))}
            </div>
          </div>
          <ProgressChart data={progressData} />
        </Card>

        {/* Strengths and Weaknesses */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card padding="lg">
            <CardTitle className="text-success-600 mb-4">Strengths</CardTitle>
            {strengths.length > 0 ? (
              <div className="space-y-3">
                {strengths.slice(0, 5).map((skill) => (
                  <SkillBar key={skill.tag} skill={skill} variant="success" />
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">
                No strengths identified yet. More practice needed.
              </p>
            )}
          </Card>

          <Card padding="lg">
            <CardTitle className="text-warning-600 mb-4">Needs Work</CardTitle>
            {needsWork.length > 0 ? (
              <div className="space-y-3">
                {needsWork.slice(0, 5).map((skill) => (
                  <SkillBar key={skill.tag} skill={skill} variant="warning" />
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">
                Great job! No areas need immediate attention.
              </p>
            )}
          </Card>
        </div>

        {/* Recent Lessons */}
        <Card padding="none">
          <CardHeader className="p-4 border-b border-border mb-0">
            <CardTitle>Recent Lessons</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {recentLessons.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50 text-sm text-muted-foreground">
                    <tr>
                      <th className="text-left p-3">Date</th>
                      <th className="text-left p-3">Lesson</th>
                      <th className="text-left p-3">Unit</th>
                      <th className="text-left p-3">Accuracy</th>
                      <th className="text-left p-3">Time</th>
                      <th className="text-left p-3">XP</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentLessons.map((lesson, index) => (
                      <tr
                        key={`${lesson.id}-${index}`}
                        className="border-t border-border hover:bg-muted/30"
                      >
                        <td className="p-3 text-sm text-muted-foreground">
                          {formatRelativeDate(lesson.completedAt)}
                        </td>
                        <td className="p-3 font-medium">{lesson.title}</td>
                        <td className="p-3 text-sm text-muted-foreground">
                          {lesson.unitTitle}
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <ProgressBar
                              value={lesson.accuracy}
                              size="sm"
                              variant={lesson.accuracy >= 70 ? "success" : "primary"}
                              className="w-16"
                            />
                            <span className="text-sm">{lesson.accuracy}%</span>
                          </div>
                        </td>
                        <td className="p-3 text-sm">
                          {formatTime(Math.round(lesson.timeSpentSeconds / 60))}
                        </td>
                        <td className="p-3">
                          <span className="text-sm font-medium text-primary-600">
                            +{lesson.xpEarned} XP
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-6 text-center text-muted-foreground">
                No lessons completed yet.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Badges */}
        <Card padding="lg">
          <CardTitle className="mb-4">
            Badges Earned ({data.badges.length})
          </CardTitle>
          {data.badges.length > 0 ? (
            <div className="flex flex-wrap gap-4">
              {data.badges.map((studentBadge) => (
                <BadgeDisplay key={studentBadge.id} studentBadge={studentBadge} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <TrophyIcon className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">No badges earned yet.</p>
            </div>
          )}
        </Card>
      </main>
    </div>
  );
}

// Helper Components

interface StatCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  bgColor: string;
}

function StatCard({ label, value, icon, bgColor }: StatCardProps) {
  return (
    <Card padding="md">
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center",
            bgColor
          )}
        >
          {icon}
        </div>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-sm text-muted-foreground">{label}</p>
        </div>
      </div>
    </Card>
  );
}

function ProgressChart({ data }: { data: ProgressEntry[] }) {
  // Get only entries with data for a cleaner display
  const maxAccuracy = Math.max(...data.map((d) => d.accuracy), 100);
  const entriesWithData = data.filter((d) => d.lessonsCount > 0);

  if (entriesWithData.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-muted-foreground">
        No activity data for this period.
      </div>
    );
  }

  return (
    <div className="h-48">
      <div className="flex items-end justify-between h-full gap-1">
        {data.map((entry, index) => {
          const height = entry.accuracy > 0 ? (entry.accuracy / maxAccuracy) * 100 : 0;
          const date = new Date(entry.date);
          const showLabel = index % Math.ceil(data.length / 7) === 0;

          return (
            <div
              key={entry.date}
              className="flex-1 flex flex-col items-center"
              title={`${entry.date}: ${entry.accuracy}% accuracy, ${entry.lessonsCount} lessons`}
            >
              <div className="flex-1 w-full flex items-end justify-center pb-6">
                <div
                  className={cn(
                    "w-full max-w-[20px] rounded-t transition-all",
                    entry.lessonsCount > 0 ? "bg-primary-500" : "bg-muted"
                  )}
                  style={{ height: `${Math.max(height, 4)}%` }}
                />
              </div>
              {showLabel && (
                <span className="text-xs text-muted-foreground mt-1">
                  {date.getDate()}/{date.getMonth() + 1}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SkillBar({
  skill,
  variant,
}: {
  skill: SkillAnalysis;
  variant: "success" | "warning";
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium w-24 truncate capitalize">
        {skill.tag}
      </span>
      <div className="flex-1">
        <ProgressBar
          value={skill.accuracy}
          size="sm"
          variant={variant === "success" ? "success" : "primary"}
        />
      </div>
      <span className="text-sm font-medium w-12 text-right">{skill.accuracy}%</span>
    </div>
  );
}

function BadgeDisplay({ studentBadge }: { studentBadge: StudentBadge }) {
  const badge = studentBadge.badge;
  if (!badge) return null;

  return (
    <div className="flex flex-col items-center p-3 bg-muted/50 rounded-xl min-w-[100px]">
      <span className="text-3xl mb-1">{badge.icon}</span>
      <span className="text-sm font-medium text-center">{badge.name}</span>
      <span className="text-xs text-muted-foreground">
        {formatRelativeDate(studentBadge.earned_at)}
      </span>
    </div>
  );
}

// Utility functions

function formatTime(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

// Icon components (inline to avoid adding more dependencies)

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function TargetIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}

function StarIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

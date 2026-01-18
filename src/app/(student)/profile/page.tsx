"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  Card,
  Avatar,
  XPBadge,
  StreakBadge,
  LevelBadge,
  Button,
  ProgressBar,
  HomeIcon,
  BookIcon,
  TrophyIcon,
  UserIcon,
  SettingsIcon,
  LogOutIcon,
  ThemeToggle,
} from "@/components/ui";
import { cn, getCEFRDisplayName } from "@/lib/utils";
import type { Student, Streak, Badge, StudentBadge } from "@/types";

export default function StudentProfilePage() {
  const [student, setStudent] = useState<Student | null>(null);
  const [streak, setStreak] = useState<Streak | null>(null);
  const [badges, setBadges] = useState<(StudentBadge & { badge: Badge })[]>([]);
  const [stats, setStats] = useState({
    lessonsCompleted: 0,
    totalMinutes: 0,
    averageAccuracy: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get student data
      const { data: studentData } = await supabase
        .from("students")
        .select("*, profiles(*)")
        .eq("profile_id", user.id)
        .single() as { data: any };

      if (studentData) {
        setStudent(studentData as Student);

        // Get streak
        const { data: streakData } = await supabase
          .from("streaks")
          .select("*")
          .eq("student_id", studentData.id)
          .single() as { data: any };

        setStreak(streakData as Streak);

        // Get badges
        const { data: badgesData } = await supabase
          .from("student_badges")
          .select("*, badge:badges(*)")
          .eq("student_id", studentData.id)
          .order("earned_at", { ascending: false }) as { data: any[] | null };

        setBadges(badgesData as any || []);

        // Get progress stats
        const { data: progressData } = await supabase
          .from("student_progress")
          .select("time_spent_seconds, accuracy")
          .eq("student_id", studentData.id) as { data: any[] | null };

        if (progressData && progressData.length > 0) {
          setStats({
            lessonsCompleted: progressData.length,
            totalMinutes: Math.round(
              progressData.reduce((sum, p) => sum + p.time_spent_seconds, 0) / 60
            ),
            averageAccuracy: Math.round(
              progressData.reduce((sum, p) => sum + p.accuracy, 0) /
                progressData.length
            ),
          });
        }
      }

      setLoading(false);
    };

    fetchData();
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-primary-500 text-white p-6 pb-16 rounded-b-[2rem]">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold">Profile</h1>
          <div className="flex items-center gap-2">
            <ThemeToggle className="bg-white/10 hover:bg-white/20" />
            <button
              onClick={handleSignOut}
              className="p-2 hover:bg-white/10 rounded-full"
            >
              <LogOutIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Profile Card */}
      <div className="px-4 -mt-12">
        <Card variant="elevated" padding="lg" className="text-center">
          <Avatar
            name={student?.profile?.name || "Student"}
            size="xl"
            className="mx-auto mb-4 border-4 border-white shadow-medium"
          />
          <h2 className="text-xl font-bold mb-1">
            {student?.profile?.name || "Student"}
          </h2>
          <p className="text-muted-foreground mb-4">@{student?.username}</p>

          <div className="flex justify-center gap-4 mb-4">
            <div className="flex items-center gap-1">
              <LevelBadge level={student?.level || "A0"} />
              <span className="text-sm font-medium">
                {getCEFRDisplayName(student?.level || "A0")}
              </span>
            </div>
          </div>

          <div className="flex justify-center gap-4">
            <XPBadge xp={student?.total_xp || 0} />
            <StreakBadge days={streak?.current_streak || 0} />
          </div>
        </Card>
      </div>

      {/* Stats */}
      <div className="px-4 mt-6">
        <h3 className="text-lg font-bold mb-4">Your Stats</h3>
        <div className="grid grid-cols-3 gap-3">
          <Card padding="md" className="text-center">
            <p className="text-2xl font-bold text-primary-500">
              {stats.lessonsCompleted}
            </p>
            <p className="text-xs text-muted-foreground">Lessons</p>
          </Card>
          <Card padding="md" className="text-center">
            <p className="text-2xl font-bold text-secondary-500">
              {stats.totalMinutes}
            </p>
            <p className="text-xs text-muted-foreground">Minutes</p>
          </Card>
          <Card padding="md" className="text-center">
            <p className="text-2xl font-bold text-success-500">
              {stats.averageAccuracy}%
            </p>
            <p className="text-xs text-muted-foreground">Accuracy</p>
          </Card>
        </div>
      </div>

      {/* Badges */}
      <div className="px-4 mt-6">
        <h3 className="text-lg font-bold mb-4">Badges ({badges.length})</h3>

        {badges.length === 0 ? (
          <Card padding="md" className="text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
              <TrophyIcon className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">
              Complete lessons to earn badges!
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-4 gap-3">
            {badges.map((sb) => (
              <Card key={sb.id} padding="sm" className="text-center">
                <span className="text-3xl">{sb.badge?.icon || "🏆"}</span>
                <p className="text-xs font-medium mt-1 truncate">
                  {sb.badge?.name}
                </p>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Streak Info */}
      {streak && streak.longest_streak > 0 && (
        <div className="px-4 mt-6">
          <Card padding="md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Longest Streak</p>
                <p className="text-xl font-bold">
                  🔥 {streak.longest_streak} days
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Current</p>
                <p className="text-xl font-bold text-warning-500">
                  {streak.current_streak} days
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Bottom Navigation */}
      <nav className="bottom-nav">
        <div className="flex justify-around py-3">
          <Link href="/home" className="flex flex-col items-center text-muted-foreground">
            <HomeIcon className="w-6 h-6" />
            <span className="text-xs mt-1">Home</span>
          </Link>
          <Link href="/review" className="flex flex-col items-center text-muted-foreground">
            <BookIcon className="w-6 h-6" />
            <span className="text-xs mt-1">Review</span>
          </Link>
          <Link href="/badges" className="flex flex-col items-center text-muted-foreground">
            <TrophyIcon className="w-6 h-6" />
            <span className="text-xs mt-1">Badges</span>
          </Link>
          <Link href="/profile" className="flex flex-col items-center text-primary-500">
            <UserIcon className="w-6 h-6" />
            <span className="text-xs mt-1">Profile</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}

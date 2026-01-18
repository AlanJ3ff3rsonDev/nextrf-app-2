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
  ChevronRightIcon,
  LockIcon,
  BookIcon,
  TrophyIcon,
  HomeIcon,
  UserIcon,
} from "@/components/ui";
import { cn } from "@/lib/utils";
import type { Student, Unit, Lesson, Streak } from "@/types";

interface UnitWithProgress extends Unit {
  lessons: (Lesson & { completed: boolean })[];
  completedLessons: number;
  totalLessons: number;
}

export default function StudentHomePage() {
  const [student, setStudent] = useState<Student | null>(null);
  const [streak, setStreak] = useState<Streak | null>(null);
  const [units, setUnits] = useState<UnitWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nextLesson, setNextLesson] = useState<{ unit: Unit; lesson: Lesson } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const supabase = createClient();

        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setError("Sessão expirada. Faça login novamente.");
          setLoading(false);
          return;
        }

        // Get student data (sem join para evitar recursão RLS)
        const { data: studentData, error: studentError } = await supabase
          .from("students")
          .select("id, profile_id, class_id, username, level, total_xp, created_at")
          .eq("profile_id", user.id)
          .single();

        if (studentError) {
          console.error("Erro ao buscar estudante:", studentError);
          setError("Não foi possível carregar seus dados. Tente novamente.");
          setLoading(false);
          return;
        }

        if (!studentData) {
          setError("Perfil de estudante não encontrado.");
          setLoading(false);
          return;
        }

        // Buscar perfil separadamente
        const { data: profileData } = await supabase
          .from("profiles")
          .select("id, name, avatar_url, role")
          .eq("id", user.id)
          .single();

        const studentWithProfile = {
          ...studentData,
          profile: profileData,
        };

        setStudent(studentWithProfile as Student);

        // Get streak (opcional - não bloqueia se falhar)
        const { data: streakData } = await supabase
          .from("streaks")
          .select("*")
          .eq("student_id", studentData.id)
          .single();

        setStreak(streakData as Streak);

        // Get student's progress
        const { data: progressData } = await supabase
          .from("student_progress")
          .select("lesson_id")
          .eq("student_id", studentData.id);

        const completedLessonIds = new Set(
          progressData?.map((p: { lesson_id: string }) => p.lesson_id) || []
        );

        // Get units with lessons for the student's level
        const { data: unitsData, error: unitsError } = await supabase
          .from("units")
          .select(`
            *,
            level:levels!inner(*),
            lessons(*)
          `)
          .eq("level.cefr_level", studentData.level)
          .order("order", { ascending: true });

        if (unitsError) {
          console.error("Erro ao buscar unidades:", unitsError);
          // Continua mesmo sem unidades - mostra mensagem no UI
        }

        if (unitsData && unitsData.length > 0) {
          const unitsWithProgress: UnitWithProgress[] = unitsData.map((unit: any) => {
            const lessons = (unit.lessons || [])
              .sort((a: Lesson, b: Lesson) => a.order - b.order)
              .map((lesson: Lesson) => ({
                ...lesson,
                completed: completedLessonIds.has(lesson.id),
              }));

            return {
              ...unit,
              lessons,
              completedLessons: lessons.filter((l: any) => l.completed).length,
              totalLessons: lessons.length,
            };
          });

          setUnits(unitsWithProgress);

          // Find next available lesson
          for (const unit of unitsWithProgress) {
            const nextAvailableLesson = unit.lessons.find((l) => !l.completed);
            if (nextAvailableLesson) {
              setNextLesson({ unit, lesson: nextAvailableLesson });
              break;
            }
          }
        }

        setLoading(false);
      } catch (err) {
        console.error("Erro inesperado:", err);
        setError("Algo deu errado. Tente novamente.");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <div className="text-center">
          <div className="w-20 h-20 bg-error-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">😕</span>
          </div>
          <p className="text-lg font-medium text-foreground mb-2">{error}</p>
          <p className="text-sm text-muted-foreground mb-6">
            Verifique sua conexão e tente novamente.
          </p>
          <Button onClick={() => window.location.reload()} variant="primary">
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-primary-500 text-white p-6 pb-8 rounded-b-[2rem]">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Avatar
              name={student?.profile?.name || "Student"}
              size="lg"
              className="border-2 border-white"
            />
            <div>
              <p className="font-bold text-lg">{student?.profile?.name || "Student"}</p>
              <div className="flex items-center gap-2">
                <LevelBadge level={student?.level || "A0"} size="sm" />
                <span className="text-primary-100 text-sm">
                  {student?.level === "A0" ? "Beginner" : student?.level}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-4">
          <XPBadge xp={student?.total_xp || 0} />
          <StreakBadge days={streak?.current_streak || 0} />
        </div>
      </header>

      {/* Continue Learning CTA */}
      {nextLesson && (
        <div className="px-4 -mt-4">
          <Link href={`/lesson/${nextLesson.lesson.id}`}>
            <Card variant="elevated" padding="lg" className="bg-secondary-500 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-secondary-100 text-sm mb-1">Continue Learning</p>
                  <p className="font-bold text-lg">{nextLesson.lesson.title}</p>
                  <p className="text-secondary-100 text-sm">{nextLesson.unit.title}</p>
                </div>
                <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-3xl">▶️</span>
                </div>
              </div>
            </Card>
          </Link>
        </div>
      )}

      {/* Units List */}
      <div className="px-4 mt-6">
        <h2 className="text-lg font-bold mb-4">Your Journey</h2>

        {units.length === 0 ? (
          <Card padding="lg" className="text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">📚</span>
            </div>
            <p className="text-muted-foreground">
              Nenhuma unidade disponível para o seu nível ainda.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Aguarde seu professor adicionar conteúdo.
            </p>
          </Card>
        ) : (
        <div className="space-y-4">
          {units.map((unit, index) => {
            const isLocked = index > 0 && units[index - 1].completedLessons < units[index - 1].totalLessons;
            const progress = unit.totalLessons > 0
              ? (unit.completedLessons / unit.totalLessons) * 100
              : 0;

            return (
              <Link
                key={unit.id}
                href={isLocked ? "#" : `/unit/${unit.id}`}
                className={cn(isLocked && "pointer-events-none")}
              >
                <Card
                  variant={isLocked ? "outline" : "interactive"}
                  padding="md"
                  className={cn(isLocked && "opacity-60")}
                >
                  <div className="flex items-center gap-4">
                    {/* Unit icon */}
                    <div
                      className={cn(
                        "w-14 h-14 rounded-2xl flex items-center justify-center text-2xl",
                        isLocked
                          ? "bg-muted text-muted-foreground"
                          : "bg-primary-100"
                      )}
                    >
                      {isLocked ? (
                        <LockIcon className="w-6 h-6" />
                      ) : (
                        getUnitEmoji(unit.theme)
                      )}
                    </div>

                    {/* Unit info */}
                    <div className="flex-1">
                      <p className="font-bold">{unit.title}</p>
                      <p className="text-sm text-muted-foreground">{unit.theme}</p>

                      {/* Progress bar */}
                      <div className="mt-2 flex items-center gap-2">
                        <ProgressBar value={progress} size="sm" className="flex-1" />
                        <span className="text-xs text-muted-foreground">
                          {unit.completedLessons}/{unit.totalLessons}
                        </span>
                      </div>
                    </div>

                    {!isLocked && (
                      <ChevronRightIcon className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <nav className="bottom-nav">
        <div className="flex justify-around py-3">
          <Link href="/home" className="flex flex-col items-center text-primary-500">
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
          <Link href="/profile" className="flex flex-col items-center text-muted-foreground">
            <UserIcon className="w-6 h-6" />
            <span className="text-xs mt-1">Profile</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}

function getUnitEmoji(theme: string): string {
  const emojis: Record<string, string> = {
    greetings: "👋",
    colors: "🎨",
    numbers: "🔢",
    animals: "🐾",
    food: "🍎",
    family: "👨‍👩‍👧‍👦",
    body: "🫀",
    clothes: "👕",
    house: "🏠",
    school: "🏫",
  };
  return emojis[theme.toLowerCase()] || "📚";
}

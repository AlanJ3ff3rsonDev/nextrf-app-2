"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Card,
  Button,
  ChevronLeftIcon,
  LockIcon,
  CheckIcon,
  StarIcon,
} from "@/components/ui";
import { cn } from "@/lib/utils";
import type { Unit, Lesson } from "@/types";

interface LessonWithStatus extends Lesson {
  status: "locked" | "available" | "completed";
  xpEarned?: number;
  accuracy?: number;
}

export default function UnitPage() {
  const params = useParams();
  const router = useRouter();
  const [unit, setUnit] = useState<Unit | null>(null);
  const [lessons, setLessons] = useState<LessonWithStatus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();
      const unitId = params.id as string;

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get student data
      const { data: studentData } = await supabase
        .from("students")
        .select("id")
        .eq("profile_id", user.id)
        .single() as { data: { id: string } | null };

      if (!studentData) return;

      // Get unit with lessons
      const { data: unitData } = await supabase
        .from("units")
        .select("*, lessons(*)")
        .eq("id", unitId)
        .single() as { data: any };

      if (unitData) {
        setUnit(unitData as Unit);

        // Get student's progress for this unit's lessons
        const lessonIds = unitData.lessons.map((l: Lesson) => l.id);
        const { data: progressData } = await supabase
          .from("student_progress")
          .select("lesson_id, xp_earned, accuracy")
          .eq("student_id", studentData.id)
          .in("lesson_id", lessonIds) as { data: any[] | null };

        const progressMap = new Map(
          progressData?.map((p) => [p.lesson_id, p]) || []
        );

        // Sort lessons by order and determine status
        const sortedLessons = unitData.lessons
          .sort((a: Lesson, b: Lesson) => a.order - b.order)
          .map((lesson: Lesson, index: number, array: Lesson[]) => {
            const progress = progressMap.get(lesson.id);

            let status: "locked" | "available" | "completed" = "locked";

            if (progress) {
              status = "completed";
            } else if (index === 0) {
              status = "available";
            } else {
              // Check if previous lesson is completed
              const prevLesson = array[index - 1];
              if (progressMap.has(prevLesson.id)) {
                status = "available";
              }
            }

            return {
              ...lesson,
              status,
              xpEarned: progress?.xp_earned,
              accuracy: progress?.accuracy,
            };
          });

        setLessons(sortedLessons);
      }

      setLoading(false);
    };

    fetchData();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!unit) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p>Unit not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary-500 text-white p-4 pb-8 rounded-b-[2rem]">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 hover:bg-white/10 rounded-full"
          >
            <ChevronLeftIcon className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-2xl font-bold">{unit.title}</h1>
            <p className="text-primary-100">{unit.theme}</p>
          </div>
        </div>

        {/* Unit progress */}
        <div className="flex gap-2">
          {lessons.map((lesson) => (
            <div
              key={lesson.id}
              className={cn(
                "flex-1 h-2 rounded-full",
                lesson.status === "completed" ? "bg-white" : "bg-white/30"
              )}
            />
          ))}
        </div>
      </header>

      {/* Lessons List */}
      <div className="px-4 py-6">
        <div className="space-y-4">
          {lessons.map((lesson, index) => (
            <LessonCard key={lesson.id} lesson={lesson} index={index + 1} />
          ))}
        </div>
      </div>
    </div>
  );
}

function LessonCard({
  lesson,
  index,
}: {
  lesson: LessonWithStatus;
  index: number;
}) {
  const isLocked = lesson.status === "locked";
  const isCompleted = lesson.status === "completed";

  const content = (
    <Card
      variant={isLocked ? "outline" : "interactive"}
      padding="md"
      className={cn(isLocked && "opacity-60")}
    >
      <div className="flex items-center gap-4">
        {/* Lesson number/status */}
        <div
          className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center font-bold",
            isCompleted && "bg-success-500 text-white",
            lesson.status === "available" && "bg-primary-500 text-white",
            isLocked && "bg-muted text-muted-foreground"
          )}
        >
          {isCompleted ? (
            <CheckIcon className="w-6 h-6" />
          ) : isLocked ? (
            <LockIcon className="w-5 h-5" />
          ) : (
            index
          )}
        </div>

        {/* Lesson info */}
        <div className="flex-1">
          <p className="font-bold">{lesson.title}</p>
          {lesson.description && (
            <p className="text-sm text-muted-foreground">{lesson.description}</p>
          )}

          {/* Stats for completed lessons */}
          {isCompleted && (
            <div className="flex items-center gap-3 mt-1">
              <span className="text-xs text-success-600 flex items-center gap-1">
                <span>⚡</span> +{lesson.xpEarned} XP
              </span>
              {lesson.accuracy !== undefined && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <StarIcon className="w-3 h-3" filled />
                  {lesson.accuracy}%
                </span>
              )}
            </div>
          )}
        </div>

        {/* XP reward for non-completed */}
        {!isCompleted && !isLocked && (
          <span className="text-sm text-secondary-500 font-semibold">
            +{lesson.xp_reward} XP
          </span>
        )}
      </div>
    </Card>
  );

  if (isLocked) {
    return content;
  }

  return <Link href={`/lesson/${lesson.id}`}>{content}</Link>;
}

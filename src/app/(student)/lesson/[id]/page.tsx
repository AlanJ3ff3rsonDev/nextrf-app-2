"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  ExerciseContainer,
  ListenTapImage,
  Match,
  OrderWords,
  ReadChoose,
  SpeakRepeat,
} from "@/components/exercises";
import { LessonComplete, BadgeEarned } from "@/components/gamification";
import { checkAndAwardBadges } from "@/lib/services/badge-service";
import type { Lesson, Exercise, Item, ExerciseConfig, Badge } from "@/types";

interface ExerciseWithItems extends Exercise {
  items: Map<string, Item>;
}

// Spaced repetition intervals in days
const REVIEW_INTERVALS = [1, 3, 7, 14, 30];

export default function LessonPage() {
  const params = useParams();
  const router = useRouter();
  const lessonId = params.id as string;

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [exercises, setExercises] = useState<ExerciseWithItems[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [studentId, setStudentId] = useState<string | null>(null);

  // Exercise state
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [canSubmit, setCanSubmit] = useState(false);
  const [exerciseResult, setExerciseResult] = useState<{
    correct: boolean;
    data?: any;
  } | null>(null);

  // Session tracking
  const [startTime] = useState(() => Date.now());
  const [correctCount, setCorrectCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);

  // Badge state
  const [earnedBadges, setEarnedBadges] = useState<Badge[]>([]);
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [currentBadgeIndex, setCurrentBadgeIndex] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/student-login");
        return;
      }

      // Get student data
      const { data: studentData } = await supabase
        .from("students")
        .select("id")
        .eq("profile_id", user.id)
        .single() as { data: { id: string } | null };

      if (studentData) {
        setStudentId(studentData.id);
      }

      // Get lesson
      const { data: lessonData } = await supabase
        .from("lessons")
        .select("*")
        .eq("id", lessonId)
        .single() as { data: Lesson | null };

      if (lessonData) {
        setLesson(lessonData);
      }

      // Get exercises
      const { data: exercisesData } = await supabase
        .from("exercises")
        .select("*")
        .eq("lesson_id", lessonId)
        .order("order", { ascending: true }) as { data: any[] | null };

      if (exercisesData && exercisesData.length > 0) {
        // Collect all item IDs from exercises
        const itemIds = new Set<string>();
        exercisesData.forEach((ex: any) => {
          const config = ex.config as any;
          if (config.correct_item_id) itemIds.add(config.correct_item_id);
          if (config.distractor_item_ids) {
            config.distractor_item_ids.forEach((id: string) => itemIds.add(id));
          }
          if (config.pairs) {
            config.pairs.forEach((pair: any) => itemIds.add(pair.item_id));
          }
        });

        // Fetch all items
        const { data: itemsData } = await supabase
          .from("items")
          .select("*")
          .in("id", Array.from(itemIds)) as { data: any[] | null };

        const itemsMap = new Map<string, Item>(
          itemsData?.map((item) => [item.id, item as Item]) || []
        );

        // Attach items to exercises
        const exercisesWithItems: ExerciseWithItems[] = exercisesData.map((ex) => ({
          ...ex,
          items: itemsMap,
        }));

        setExercises(exercisesWithItems);
        setTotalCount(exercisesWithItems.length);
      }

      setLoading(false);
    };

    fetchData();
  }, [lessonId, router]);

  // Update item mastery after each exercise
  const updateItemMastery = useCallback(
    async (itemId: string, correct: boolean) => {
      if (!studentId || !itemId) return;

      const supabase = createClient();

      // Check if mastery record exists
      const { data: existing } = await supabase
        .from("item_mastery")
        .select("*")
        .eq("student_id", studentId)
        .eq("item_id", itemId)
        .single() as { data: any };

      const now = new Date().toISOString();

      if (existing) {
        // Update existing record
        const newStreak = correct ? existing.streak + 1 : 0;
        const intervalIndex = Math.min(newStreak, REVIEW_INTERVALS.length - 1);

        let nextReviewDate: Date;
        if (correct) {
          const daysToAdd = REVIEW_INTERVALS[intervalIndex];
          nextReviewDate = new Date();
          nextReviewDate.setDate(nextReviewDate.getDate() + daysToAdd);
        } else {
          nextReviewDate = new Date();
          nextReviewDate.setHours(nextReviewDate.getHours() + 4);
        }

        let newStatus = existing.status;
        if (newStreak >= 3) newStatus = "reviewing";
        if (newStreak >= 5) newStatus = "mastered";
        if (!correct && newStatus !== "new") newStatus = "learning";

        await (supabase.from("item_mastery") as any)
          .update({
            correct_count: correct ? existing.correct_count + 1 : existing.correct_count,
            incorrect_count: correct ? existing.incorrect_count : existing.incorrect_count + 1,
            streak: newStreak,
            status: newStatus,
            next_review: nextReviewDate.toISOString(),
            last_reviewed: now,
          })
          .eq("id", existing.id);
      } else {
        // Create new record
        const nextReviewDate = new Date();
        if (correct) {
          nextReviewDate.setDate(nextReviewDate.getDate() + REVIEW_INTERVALS[0]);
        } else {
          nextReviewDate.setHours(nextReviewDate.getHours() + 4);
        }

        await (supabase.from("item_mastery") as any).insert({
          student_id: studentId,
          item_id: itemId,
          status: correct ? "learning" : "new",
          correct_count: correct ? 1 : 0,
          incorrect_count: correct ? 0 : 1,
          streak: correct ? 1 : 0,
          next_review: nextReviewDate.toISOString(),
          last_reviewed: now,
        });
      }
    },
    [studentId]
  );

  // Extract item ID from exercise config
  const getItemIdFromExercise = useCallback((exercise: ExerciseWithItems): string | null => {
    const config = exercise.config as any;

    switch (exercise.type) {
      case "listen_tap_image":
      case "read_choose":
        return config.correct_item_id || null;
      case "match":
        // For match, we track the first pair's item
        return config.pairs?.[0]?.item_id || null;
      default:
        return null;
    }
  }, []);

  const handleAnswer = useCallback(
    async (correct: boolean, data?: any) => {
      setExerciseResult({ correct, data });
      setFeedback(correct ? "correct" : "incorrect");

      if (correct) {
        setCorrectCount((c) => c + 1);
      }

      if (!correct && data) {
        setFeedbackMessage(data.correctAnswer ? `Correct: ${data.correctAnswer}` : "");
      }

      // Track item mastery
      const currentExercise = exercises[currentIndex];
      const itemId = getItemIdFromExercise(currentExercise);
      if (itemId) {
        await updateItemMastery(itemId, correct);
      }

      setCanSubmit(true);
    },
    [currentIndex, exercises, getItemIdFromExercise, updateItemMastery]
  );

  const handleContinue = useCallback(async () => {
    // Move to next exercise or complete
    if (currentIndex < exercises.length - 1) {
      setCurrentIndex((i) => i + 1);
      setFeedback(null);
      setFeedbackMessage("");
      setCanSubmit(false);
      setExerciseResult(null);
    } else {
      // Lesson complete!
      const timeSpent = Math.round((Date.now() - startTime) / 1000);
      const accuracy = Math.round((correctCount / totalCount) * 100);
      const baseXp = lesson?.xp_reward || 10;
      const bonusXp = accuracy >= 90 ? 5 : accuracy >= 70 ? 2 : 0;
      const earnedXp = baseXp + bonusXp;

      setXpEarned(earnedXp);

      // Save progress
      if (studentId) {
        const supabase = createClient();

        await (supabase.from("student_progress") as any).upsert({
          student_id: studentId,
          lesson_id: lessonId,
          xp_earned: earnedXp,
          accuracy,
          time_spent_seconds: timeSpent,
        });

        // Update student's streak
        try {
          await (supabase as any).rpc("update_student_streak", { p_student_id: studentId });
        } catch (e) {
          // Function may not exist yet
        }

        // Increment total XP
        const { data: currentStudent } = await supabase
          .from("students")
          .select("total_xp")
          .eq("id", studentId)
          .single() as { data: { total_xp: number } | null };

        if (currentStudent) {
          await (supabase.from("students") as any)
            .update({ total_xp: currentStudent.total_xp + earnedXp })
            .eq("id", studentId);
        }

        // Check and award badges
        const newBadges = await checkAndAwardBadges(studentId, {
          accuracy,
          lessonId,
        });

        if (newBadges.length > 0) {
          setEarnedBadges(newBadges);
          setShowBadgeModal(true);
        } else {
          setIsComplete(true);
        }
      } else {
        setIsComplete(true);
      }
    }
  }, [currentIndex, exercises.length, startTime, correctCount, totalCount, lesson, studentId, lessonId]);

  const handleSkip = useCallback(() => {
    handleAnswer(false);
  }, [handleAnswer]);

  const handleClose = useCallback(() => {
    router.back();
  }, [router]);

  const handleBadgeModalClose = useCallback(() => {
    if (currentBadgeIndex < earnedBadges.length - 1) {
      setCurrentBadgeIndex((i) => i + 1);
    } else {
      setShowBadgeModal(false);
      setIsComplete(true);
    }
  }, [currentBadgeIndex, earnedBadges.length]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  // Show badge earned modal
  if (showBadgeModal && earnedBadges[currentBadgeIndex]) {
    return (
      <BadgeEarned
        badge={earnedBadges[currentBadgeIndex]}
        onClose={handleBadgeModalClose}
      />
    );
  }

  if (isComplete) {
    return (
      <LessonComplete
        xpEarned={xpEarned}
        accuracy={Math.round((correctCount / totalCount) * 100)}
        correctCount={correctCount}
        totalCount={totalCount}
        earnedBadges={earnedBadges}
        onContinue={() => router.push("/home")}
      />
    );
  }

  if (exercises.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p>No exercises found</p>
      </div>
    );
  }

  const currentExercise = exercises[currentIndex];

  return (
    <ExerciseContainer
      totalExercises={exercises.length}
      currentExercise={currentIndex + 1}
      onClose={handleClose}
      feedback={feedback}
      feedbackMessage={feedbackMessage}
      canSubmit={canSubmit}
      onSubmit={handleContinue}
      submitLabel={exerciseResult ? "Continue" : "Check"}
      showSkip={currentExercise.type === "speak_repeat"}
      onSkip={handleSkip}
    >
      <ExerciseRenderer
        exercise={currentExercise}
        onAnswer={handleAnswer}
        disabled={feedback !== null}
      />
    </ExerciseContainer>
  );
}

interface ExerciseRendererProps {
  exercise: ExerciseWithItems;
  onAnswer: (correct: boolean, data?: any) => void;
  disabled: boolean;
}

function ExerciseRenderer({ exercise, onAnswer, disabled }: ExerciseRendererProps) {
  const config = exercise.config as any;
  const items = exercise.items;

  switch (exercise.type) {
    case "listen_tap_image": {
      const correctItem = items.get(config.correct_item_id);
      const distractorItems = config.distractor_item_ids
        .map((id: string) => items.get(id))
        .filter(Boolean);

      if (!correctItem) return null;

      return (
        <ListenTapImage
          audioText={config.audio_text}
          correctItem={correctItem}
          distractorItems={distractorItems}
          onAnswer={(correct, selectedId) =>
            onAnswer(correct, { selectedId, correctAnswer: correctItem.text_en })
          }
          disabled={disabled}
        />
      );
    }

    case "match": {
      const pairs = config.pairs.map((pair: any) => ({
        item: items.get(pair.item_id)!,
        matchType: pair.match_type,
      })).filter((p: any) => p.item);

      return (
        <Match
          pairs={pairs}
          onComplete={(allCorrect, errors) =>
            onAnswer(errors === 0, { errors })
          }
        />
      );
    }

    case "order_words": {
      return (
        <OrderWords
          sentencePt={config.sentence_pt}
          words={config.words}
          correctOrder={config.correct_order}
          onAnswer={(correct) =>
            onAnswer(correct, { correctAnswer: config.sentence_en })
          }
          disabled={disabled}
        />
      );
    }

    case "read_choose": {
      const correctItem = items.get(config.correct_item_id);
      const distractorItems = config.distractor_item_ids
        .map((id: string) => items.get(id))
        .filter(Boolean);

      if (!correctItem) return null;

      return (
        <ReadChoose
          question={config.question}
          correctItem={correctItem}
          distractorItems={distractorItems}
          onAnswer={(correct, selectedId) =>
            onAnswer(correct, { selectedId, correctAnswer: correctItem.text_pt })
          }
          disabled={disabled}
        />
      );
    }

    case "speak_repeat": {
      return (
        <SpeakRepeat
          text={config.text}
          audioUrl={config.audio_url}
          onAnswer={(correct, transcript, similarity) =>
            onAnswer(correct, { transcript, similarity })
          }
          onSkip={() => onAnswer(false, { skipped: true })}
          disabled={disabled}
        />
      );
    }

    default:
      return <p>Unknown exercise type</p>;
  }
}

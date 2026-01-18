"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Card,
  Button,
  ProgressBar,
  HomeIcon,
  BookIcon,
  TrophyIcon,
  UserIcon,
} from "@/components/ui";
import { cn } from "@/lib/utils";
import type { Item, ItemMastery } from "@/types";

interface ReviewItem extends ItemMastery {
  item: Item;
}

type ReviewExercise = {
  type: "translate_to_en" | "translate_to_pt";
  item: Item;
  options: Item[];
};

// Spaced repetition intervals in days
const REVIEW_INTERVALS = [1, 3, 7, 14, 30];

export default function ReviewPage() {
  const router = useRouter();
  const [studentId, setStudentId] = useState<string | null>(null);
  const [reviewItems, setReviewItems] = useState<ReviewItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentExercise, setCurrentExercise] = useState<ReviewExercise | null>(null);
  const [allItems, setAllItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [isReviewing, setIsReviewing] = useState(false);

  // Exercise state
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);
  const [correctCount, setCorrectCount] = useState(0);

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

      if (!studentData) return;
      setStudentId(studentData.id);

      // Get items due for review
      const now = new Date().toISOString();
      const { data: masteryData } = await supabase
        .from("item_mastery")
        .select("*, item:items(*)")
        .eq("student_id", studentData.id)
        .lte("next_review", now)
        .order("next_review", { ascending: true }) as { data: any[] | null };

      if (masteryData && masteryData.length > 0) {
        setReviewItems(masteryData as ReviewItem[]);
      }

      // Get all items for distractors
      const { data: itemsData } = await supabase
        .from("items")
        .select("*") as { data: Item[] | null };

      if (itemsData) {
        setAllItems(itemsData);
      }

      setLoading(false);
    };

    fetchData();
  }, [router]);

  const generateExercise = useCallback((reviewItem: ReviewItem) => {
    const { item } = reviewItem;

    // PROTEÇÃO: Verificar se há items suficientes para gerar exercício
    if (allItems.length < 2) {
      // Não há items suficientes - criar exercício apenas com o item correto
      setCurrentExercise({
        type: Math.random() > 0.5 ? "translate_to_en" : "translate_to_pt",
        item,
        options: [item],
      });
      return;
    }

    // Random exercise type
    const type = Math.random() > 0.5 ? "translate_to_en" : "translate_to_pt";

    // Get distractors (items with similar tags) - com null check
    const similarItems = allItems.filter(
      (i) => i.id !== item.id && i.tags?.some((tag) => item.tags?.includes(tag))
    );

    // Shuffle and take up to 3 distractors
    const shuffledDistractors = [...similarItems]
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    // CORREÇÃO: Loop seguro para preencher distractors faltantes
    const availableItems = allItems.filter(
      (i) => i.id !== item.id && !shuffledDistractors.some((d) => d.id === i.id)
    );

    // Preencher até ter 3 distractors (ou até acabarem os items disponíveis)
    while (shuffledDistractors.length < 3 && availableItems.length > 0) {
      const randomIndex = Math.floor(Math.random() * availableItems.length);
      const randomItem = availableItems[randomIndex];
      if (randomItem) {
        shuffledDistractors.push(randomItem);
        availableItems.splice(randomIndex, 1); // Remove para não repetir
      }
    }

    // Create options array with correct answer
    const options = [...shuffledDistractors, item].sort(
      () => Math.random() - 0.5
    );

    setCurrentExercise({ type, item, options });
  }, [allItems]);

  const startReview = () => {
    setIsReviewing(true);
    setCurrentIndex(0);
    setCorrectCount(0);
    if (reviewItems.length > 0) {
      generateExercise(reviewItems[0]);
    }
  };

  const handleOptionSelect = async (optionId: string) => {
    if (feedback) return;
    setSelectedOption(optionId);

    const isCorrect = optionId === currentExercise?.item.id;
    setFeedback(isCorrect ? "correct" : "incorrect");

    if (isCorrect) {
      setCorrectCount((c) => c + 1);
    }

    // Update item mastery
    if (studentId && currentExercise) {
      const supabase = createClient();
      const currentMastery = reviewItems[currentIndex];

      // Calculate next review date
      const newStreak = isCorrect ? currentMastery.streak + 1 : 0;
      const intervalIndex = Math.min(newStreak, REVIEW_INTERVALS.length - 1);

      let nextReviewDate: Date;
      if (isCorrect) {
        // Correct: use spaced repetition interval
        const daysToAdd = REVIEW_INTERVALS[intervalIndex];
        nextReviewDate = new Date();
        nextReviewDate.setDate(nextReviewDate.getDate() + daysToAdd);
      } else {
        // Incorrect: review in 4 hours
        nextReviewDate = new Date();
        nextReviewDate.setHours(nextReviewDate.getHours() + 4);
      }

      // Update mastery status
      let newStatus = currentMastery.status;
      if (newStreak >= 3) newStatus = "reviewing";
      if (newStreak >= 5) newStatus = "mastered";
      if (!isCorrect) newStatus = "learning";

      await (supabase.from("item_mastery") as any)
        .update({
          correct_count: isCorrect
            ? currentMastery.correct_count + 1
            : currentMastery.correct_count,
          incorrect_count: isCorrect
            ? currentMastery.incorrect_count
            : currentMastery.incorrect_count + 1,
          streak: newStreak,
          status: newStatus,
          next_review: nextReviewDate.toISOString(),
          last_reviewed: new Date().toISOString(),
        })
        .eq("id", currentMastery.id);
    }
  };

  const handleContinue = () => {
    if (currentIndex < reviewItems.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      setSelectedOption(null);
      setFeedback(null);
      generateExercise(reviewItems[nextIndex]);
    } else {
      // Review complete
      setIsReviewing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  // Empty state
  if (!isReviewing && reviewItems.length === 0) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <header className="bg-primary-500 text-white p-6 pb-8 rounded-b-[2rem]">
          <h1 className="text-xl font-bold">Review</h1>
          <p className="text-primary-100">Spaced repetition practice</p>
        </header>

        <div className="px-4 mt-8">
          <Card padding="lg" className="text-center">
            <div className="w-20 h-20 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">🎉</span>
            </div>
            <h2 className="text-xl font-bold mb-2">All caught up!</h2>
            <p className="text-muted-foreground mb-6">
              No items to review right now. Complete more lessons to add items
              for review.
            </p>
            <Button variant="primary" onClick={() => router.push("/home")}>
              Continue Learning
            </Button>
          </Card>
        </div>

        <BottomNav />
      </div>
    );
  }

  // Review start screen
  if (!isReviewing) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <header className="bg-primary-500 text-white p-6 pb-8 rounded-b-[2rem]">
          <h1 className="text-xl font-bold">Review</h1>
          <p className="text-primary-100">Spaced repetition practice</p>
        </header>

        <div className="px-4 mt-6">
          <Card padding="lg" className="text-center">
            <div className="w-20 h-20 bg-warning-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">📚</span>
            </div>
            <h2 className="text-xl font-bold mb-2">
              {reviewItems.length} {reviewItems.length === 1 ? "item" : "items"} to review
            </h2>
            <p className="text-muted-foreground mb-6">
              Practice makes perfect! Review these items to strengthen your
              memory.
            </p>
            <Button variant="primary" size="lg" fullWidth onClick={startReview}>
              Start Review
            </Button>
          </Card>
        </div>

        <BottomNav />
      </div>
    );
  }

  // Review complete screen
  if (isReviewing && currentIndex >= reviewItems.length - 1 && feedback) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-success-500 to-success-700 flex flex-col items-center justify-center p-6 text-white">
        <div className="w-32 h-32 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-6">
          <span className="text-7xl">✨</span>
        </div>

        <h1 className="text-3xl font-bold mb-2">Review Complete!</h1>
        <p className="text-success-100 mb-8">Great job practicing!</p>

        <div className="w-full max-w-xs space-y-4 mb-8">
          <Card padding="md" className="bg-white/10 text-white">
            <div className="flex justify-between items-center">
              <span>Correct</span>
              <span className="font-bold">
                {correctCount}/{reviewItems.length}
              </span>
            </div>
          </Card>
          <Card padding="md" className="bg-white/10 text-white">
            <div className="flex justify-between items-center">
              <span>Accuracy</span>
              <span className="font-bold">
                {Math.round((correctCount / reviewItems.length) * 100)}%
              </span>
            </div>
          </Card>
        </div>

        <Button
          variant="secondary"
          size="lg"
          fullWidth
          className="max-w-xs"
          onClick={() => router.push("/home")}
        >
          Continue
        </Button>
      </div>
    );
  }

  // Review exercise screen
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Progress Header */}
      <header className="bg-background p-4 border-b">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsReviewing(false)}
            className="p-2 hover:bg-muted rounded-full"
          >
            <span className="text-xl">✕</span>
          </button>
          <ProgressBar
            value={currentIndex + 1}
            max={reviewItems.length}
            variant="primary"
            className="flex-1"
          />
          <span className="text-sm text-muted-foreground">
            {currentIndex + 1}/{reviewItems.length}
          </span>
        </div>
      </header>

      {/* Exercise Content */}
      <div className="flex-1 p-4">
        {currentExercise && (
          <>
            <h2 className="text-lg font-bold mb-6">
              {currentExercise.type === "translate_to_en"
                ? "What is this in English?"
                : "What is this in Portuguese?"}
            </h2>

            {/* Word to translate */}
            <Card padding="lg" className="mb-6 text-center bg-primary-50">
              <p className="text-2xl font-bold">
                {currentExercise.type === "translate_to_en"
                  ? currentExercise.item.text_pt
                  : currentExercise.item.text_en}
              </p>
            </Card>

            {/* Options */}
            <div className="grid grid-cols-2 gap-3">
              {currentExercise.options.map((option) => {
                const isSelected = selectedOption === option.id;
                const isCorrect = option.id === currentExercise.item.id;
                const showCorrect = feedback && isCorrect;
                const showIncorrect = feedback && isSelected && !isCorrect;

                return (
                  <button
                    key={option.id}
                    onClick={() => handleOptionSelect(option.id)}
                    disabled={feedback !== null}
                    className={cn(
                      "p-4 rounded-xl border-2 text-center font-medium",
                      "transition-all duration-200",
                      !feedback && "hover:border-primary-500 hover:bg-primary-50",
                      !feedback && isSelected && "border-primary-500 bg-primary-50",
                      !feedback && !isSelected && "border-border bg-white",
                      showCorrect && "border-success-500 bg-success-50 text-success-700",
                      showIncorrect && "border-error-500 bg-error-50 text-error-700"
                    )}
                  >
                    {currentExercise.type === "translate_to_en"
                      ? option.text_en
                      : option.text_pt}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Feedback Bar */}
      {feedback && (
        <div
          className={cn(
            "p-4 border-t",
            feedback === "correct" ? "bg-success-50" : "bg-error-50"
          )}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">
                {feedback === "correct" ? "✓" : "✗"}
              </span>
              <span
                className={cn(
                  "font-bold",
                  feedback === "correct" ? "text-success-700" : "text-error-700"
                )}
              >
                {feedback === "correct" ? "Correct!" : "Incorrect"}
              </span>
            </div>
            {feedback === "incorrect" && currentExercise && (
              <span className="text-sm text-error-700">
                Answer:{" "}
                {currentExercise.type === "translate_to_en"
                  ? currentExercise.item.text_en
                  : currentExercise.item.text_pt}
              </span>
            )}
          </div>
          <Button
            variant={feedback === "correct" ? "primary" : "danger"}
            fullWidth
            onClick={handleContinue}
          >
            Continue
          </Button>
        </div>
      )}
    </div>
  );
}

function BottomNav() {
  return (
    <nav className="bottom-nav">
      <div className="flex justify-around py-3">
        <Link href="/home" className="flex flex-col items-center text-muted-foreground">
          <HomeIcon className="w-6 h-6" />
          <span className="text-xs mt-1">Home</span>
        </Link>
        <Link href="/review" className="flex flex-col items-center text-primary-500">
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
  );
}

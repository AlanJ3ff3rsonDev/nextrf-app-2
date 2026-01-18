"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { getBadgesWithProgress } from "@/lib/services/badge-service";
import {
  Card,
  ProgressBar,
  HomeIcon,
  BookIcon,
  TrophyIcon,
  UserIcon,
} from "@/components/ui";
import { cn } from "@/lib/utils";
import type { Badge } from "@/types";

interface BadgeWithProgress extends Badge {
  earned: boolean;
  earnedAt?: string;
  progress: number;
}

export default function BadgesPage() {
  const [badges, setBadges] = useState<BadgeWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [earnedCount, setEarnedCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get student data
      const { data: studentData } = await supabase
        .from("students")
        .select("id")
        .eq("profile_id", user.id)
        .single() as { data: { id: string } | null };

      if (studentData) {
        const badgesData = await getBadgesWithProgress(studentData.id);
        setBadges(badgesData);
        setEarnedCount(badgesData.filter((b) => b.earned).length);
      }

      setLoading(false);
    };

    fetchData();
  }, []);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("pt-BR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
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
      <header className="bg-primary-500 text-white p-6 pb-8 rounded-b-[2rem]">
        <h1 className="text-xl font-bold mb-2">Badges</h1>
        <p className="text-primary-100">
          {earnedCount} of {badges.length} earned
        </p>
        <ProgressBar
          value={earnedCount}
          max={badges.length}
          variant="secondary"
          size="md"
          className="mt-4"
        />
      </header>

      {/* Badges Grid */}
      <div className="px-4 mt-6">
        {/* Earned Badges */}
        {badges.some((b) => b.earned) && (
          <div className="mb-8">
            <h2 className="text-lg font-bold mb-4">Earned</h2>
            <div className="grid grid-cols-2 gap-4">
              {badges
                .filter((b) => b.earned)
                .map((badge) => (
                  <BadgeCard
                    key={badge.id}
                    badge={badge}
                    formatDate={formatDate}
                  />
                ))}
            </div>
          </div>
        )}

        {/* Locked Badges */}
        {badges.some((b) => !b.earned) && (
          <div>
            <h2 className="text-lg font-bold mb-4">Keep Going!</h2>
            <div className="grid grid-cols-2 gap-4">
              {badges
                .filter((b) => !b.earned)
                .map((badge) => (
                  <BadgeCard
                    key={badge.id}
                    badge={badge}
                    formatDate={formatDate}
                  />
                ))}
            </div>
          </div>
        )}

        {badges.length === 0 && (
          <Card padding="lg" className="text-center">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <TrophyIcon className="w-10 h-10 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">
              No badges available yet. Start learning to unlock badges!
            </p>
          </Card>
        )}
      </div>

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
          <Link href="/badges" className="flex flex-col items-center text-primary-500">
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

interface BadgeCardProps {
  badge: BadgeWithProgress;
  formatDate: (date: string) => string;
}

function BadgeCard({ badge, formatDate }: BadgeCardProps) {
  return (
    <Card
      padding="md"
      className={cn(
        "text-center transition-all",
        !badge.earned && "opacity-60"
      )}
    >
      {/* Badge Icon */}
      <div
        className={cn(
          "w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3",
          badge.earned ? "bg-warning-100" : "bg-muted"
        )}
      >
        <span
          className={cn(
            "text-4xl",
            !badge.earned && "grayscale opacity-50"
          )}
        >
          {badge.icon}
        </span>
      </div>

      {/* Badge Name */}
      <h3 className="font-bold text-sm mb-1">{badge.name}</h3>

      {/* Description */}
      <p className="text-xs text-muted-foreground mb-2">{badge.description}</p>

      {/* Earned Date or Progress */}
      {badge.earned && badge.earnedAt ? (
        <p className="text-xs text-success-600 font-medium">
          {formatDate(badge.earnedAt)}
        </p>
      ) : (
        <div className="mt-2">
          <ProgressBar
            value={badge.progress}
            size="sm"
            variant="primary"
          />
          <p className="text-xs text-muted-foreground mt-1">
            {badge.progress}%
          </p>
        </div>
      )}
    </Card>
  );
}

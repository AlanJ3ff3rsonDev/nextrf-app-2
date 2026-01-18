import Link from "next/link";
import { Button } from "@/components/ui";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-primary-500 to-primary-700 flex flex-col">
      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center text-white">
        {/* Logo */}
        <div className="mb-8">
          <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center shadow-strong mb-4 mx-auto">
            <span className="text-5xl">📚</span>
          </div>
          <h1 className="text-4xl font-bold mb-2">NextRF English</h1>
          <p className="text-primary-100 text-lg">
            Learn English the fun way!
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-3 gap-4 mb-12 max-w-xs mx-auto">
          <div className="text-center">
            <div className="text-3xl mb-1">🎯</div>
            <p className="text-xs text-primary-100">Fun Lessons</p>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-1">🔥</div>
            <p className="text-xs text-primary-100">Daily Streaks</p>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-1">🏆</div>
            <p className="text-xs text-primary-100">Earn Badges</p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-white rounded-t-[2rem] px-6 py-8 pb-safe-bottom">
        <div className="max-w-md mx-auto space-y-4">
          <Link href="/student-login" className="block">
            <Button variant="primary" size="lg" fullWidth>
              I&apos;m a Student
            </Button>
          </Link>

          <Link href="/login" className="block">
            <Button variant="outline" size="lg" fullWidth>
              I&apos;m a Teacher
            </Button>
          </Link>

          <p className="text-center text-sm text-muted-foreground mt-6">
            A project by{" "}
            <span className="font-semibold text-primary-500">NextRF</span>
          </p>
        </div>
      </div>
    </main>
  );
}

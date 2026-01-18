"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Input, Card, ChevronLeftIcon } from "@/components/ui";
import { createClient } from "@/lib/supabase/client";

export default function TeacherLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"login" | "signup">("login");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const supabase = createClient();

      if (mode === "signup") {
        // Sign up
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name: email.split("@")[0],
              role: "teacher",
            },
          },
        });

        if (signUpError) {
          setError(signUpError.message);
          setLoading(false);
          return;
        }

        // Show success message
        setError("");
        alert("Check your email to confirm your account!");
        setMode("login");
        setLoading(false);
        return;
      }

      // Login
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError("Invalid email or password");
        setLoading(false);
        return;
      }

      // Check if user is a teacher
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .single();

      if ((profile as { role: string } | null)?.role !== "teacher") {
        await supabase.auth.signOut();
        setError("This login is for teachers only");
        setLoading(false);
        return;
      }

      // Redirect to dashboard
      router.push("/dashboard");
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="p-4 flex items-center">
        <Link href="/" className="p-2 -ml-2 hover:bg-muted rounded-full">
          <ChevronLeftIcon className="w-6 h-6" />
        </Link>
      </header>

      {/* Content */}
      <div className="flex-1 px-6 py-4">
        <div className="max-w-md mx-auto">
          {/* Title */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-secondary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">👩‍🏫</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground">
              {mode === "login" ? "Teacher Login" : "Create Account"}
            </h1>
            <p className="text-muted-foreground mt-1">
              {mode === "login"
                ? "Access your teacher dashboard"
                : "Join NextRF English as a teacher"}
            </p>
          </div>

          {/* Form */}
          <Card padding="lg">
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <Input
                label="Password"
                type="password"
                placeholder={mode === "signup" ? "Create a password" : "Your password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                hint={mode === "signup" ? "At least 6 characters" : undefined}
                required
              />

              {error && (
                <div className="p-3 bg-error-50 text-error-600 text-sm rounded-xl">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                variant="secondary"
                size="lg"
                fullWidth
                loading={loading}
              >
                {mode === "login" ? "Sign In" : "Create Account"}
              </Button>
            </form>
          </Card>

          {/* Toggle mode */}
          <p className="text-center text-sm text-muted-foreground mt-6">
            {mode === "login" ? (
              <>
                Don&apos;t have an account?{" "}
                <button
                  onClick={() => setMode("signup")}
                  className="text-primary-500 font-medium"
                >
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  onClick={() => setMode("login")}
                  className="text-primary-500 font-medium"
                >
                  Sign in
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </main>
  );
}

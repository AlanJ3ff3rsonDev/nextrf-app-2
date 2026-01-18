"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Input, Card, ChevronLeftIcon } from "@/components/ui";
import { createClient } from "@/lib/supabase/client";

export default function StudentLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const supabase = createClient();

      // Find the student by username (sem relacionamento para evitar recursão RLS)
      const { data: student, error: studentError } = await supabase
        .from("students")
        .select("id, profile_id, class_id")
        .eq("username", username.toLowerCase())
        .single() as { data: { id: string; profile_id: string; class_id: string } | null; error: any };

      if (studentError || !student) {
        setError("Usuário não encontrado. Verifique seu nome de usuário.");
        setLoading(false);
        return;
      }

      // Buscar código da classe em query separada
      const { data: classData, error: classError } = await supabase
        .from("classes")
        .select("code")
        .eq("id", student.class_id)
        .single() as { data: { code: string } | null; error: any };

      if (classError || !classData) {
        setError("Turma não encontrada.");
        setLoading(false);
        return;
      }

      // Get the class code from the separate query
      const classCode = classData.code.toLowerCase();

      // Sign in with email/password
      // For students, we use a generated email format: username@class-code.nextrf.local
      const studentEmail = `${username.toLowerCase()}@${classCode}.nextrf.local`;

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: studentEmail,
        password: password,
      });

      if (signInError) {
        setError("Senha incorreta. Tente novamente.");
        setLoading(false);
        return;
      }

      // Redirect to student home
      router.push("/home");
    } catch {
      setError("Algo deu errado. Tente novamente.");
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
            <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🎒</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground">Login do Aluno</h1>
            <p className="text-muted-foreground mt-1">
              Digite seu usuário e senha
            </p>
          </div>

          {/* Form */}
          <Card padding="lg">
            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                label="Usuário"
                placeholder="Seu nome de usuário"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />

              <Input
                label="Senha"
                type="password"
                placeholder="Sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              {error && (
                <div className="p-3 bg-error-50 text-error-600 text-sm rounded-xl">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                loading={loading}
              >
                Começar a Aprender
              </Button>
            </form>
          </Card>

          {/* Help */}
          <p className="text-center text-sm text-muted-foreground mt-6">
            Não tem uma conta?{" "}
            <span className="text-primary-500">Pergunte ao seu professor</span>
          </p>
        </div>
      </div>
    </main>
  );
}

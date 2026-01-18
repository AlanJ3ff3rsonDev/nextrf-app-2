"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  Avatar,
  AvatarWithStatus,
  ProgressBar,
  PlusIcon,
  UsersIcon,
  BarChartIcon,
  SettingsIcon,
  LogOutIcon,
} from "@/components/ui";
import { cn, formatRelativeDate, generateClassCode } from "@/lib/utils";
import type { Profile, Class, Student } from "@/types";

interface StudentWithStats extends Student {
  profile: Profile;
  lessonsCompleted: number;
  lastActive: string | null;
  weeklyMinutes: number;
  accuracy: number;
  status: "active" | "warning" | "inactive";
}

interface ClassWithStudents extends Class {
  students: StudentWithStats[];
}

export default function TeacherDashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [classes, setClasses] = useState<ClassWithStudents[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateClass, setShowCreateClass] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single() as { data: any };

      setProfile(profileData as Profile | null);

      // Get teacher's classes with students
      const { data: classesData } = await supabase
        .from("classes")
        .select(`
          *,
          students(
            *,
            profiles(*)
          )
        `)
        .eq("teacher_id", user.id)
        .order("created_at", { ascending: false }) as { data: any[] | null };

      if (classesData) {
        // Get activity data for all students
        const studentIds = classesData.flatMap((c: any) =>
          c.students.map((s: any) => s.id)
        );

        // Get progress data
        const { data: progressData } = await supabase
          .from("student_progress")
          .select("student_id, completed_at, time_spent_seconds, accuracy")
          .in("student_id", studentIds) as { data: any[] | null };

        const progressByStudent = new Map<string, any[]>();
        progressData?.forEach((p) => {
          const existing = progressByStudent.get(p.student_id) || [];
          existing.push(p);
          progressByStudent.set(p.student_id, existing);
        });

        // Calculate stats for each student
        const classesWithStats: ClassWithStudents[] = classesData.map((cls) => ({
          ...cls,
          students: cls.students.map((student: any) => {
            const studentProgress = progressByStudent.get(student.id) || [];

            // Calculate weekly minutes
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            const weeklyProgress = studentProgress.filter(
              (p) => new Date(p.completed_at) > weekAgo
            );
            const weeklyMinutes = Math.round(
              weeklyProgress.reduce((sum, p) => sum + p.time_spent_seconds, 0) / 60
            );

            // Calculate average accuracy
            const accuracy =
              studentProgress.length > 0
                ? Math.round(
                    studentProgress.reduce((sum, p) => sum + p.accuracy, 0) /
                      studentProgress.length
                  )
                : 0;

            // Find last active
            const lastActive = studentProgress.length > 0
              ? studentProgress.sort(
                  (a, b) =>
                    new Date(b.completed_at).getTime() -
                    new Date(a.completed_at).getTime()
                )[0].completed_at
              : null;

            // Determine status (active if practiced in last 3 days)
            let status: "active" | "warning" | "inactive" = "inactive";
            if (lastActive) {
              const daysSinceActive = Math.floor(
                (Date.now() - new Date(lastActive).getTime()) / (1000 * 60 * 60 * 24)
              );
              if (daysSinceActive <= 2) status = "active";
              else if (daysSinceActive <= 5) status = "warning";
            }

            return {
              ...student,
              lessonsCompleted: studentProgress.length,
              lastActive,
              weeklyMinutes,
              accuracy,
              status,
            };
          }),
        }));

        setClasses(classesWithStats);
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-border p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold">NR</span>
            </div>
            <div>
              <h1 className="font-bold text-lg">NextRF English</h1>
              <p className="text-sm text-muted-foreground">Teacher Dashboard</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Avatar name={profile?.name || "Teacher"} size="md" />
            <button
              onClick={handleSignOut}
              className="p-2 hover:bg-muted rounded-lg text-muted-foreground"
            >
              <LogOutIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto p-4 md:p-6">
        {/* Welcome */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold">
            Welcome, {profile?.name?.split(" ")[0] || "Teacher"}!
          </h2>
          <p className="text-muted-foreground">
            Manage your classes and track student progress
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card padding="md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                <UsersIcon className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {classes.reduce((sum, c) => sum + c.students.length, 0)}
                </p>
                <p className="text-sm text-muted-foreground">Students</p>
              </div>
            </div>
          </Card>

          <Card padding="md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-success-100 rounded-lg flex items-center justify-center">
                <span className="text-xl">🟢</span>
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {classes.reduce(
                    (sum, c) =>
                      sum + c.students.filter((s) => s.status === "active").length,
                    0
                  )}
                </p>
                <p className="text-sm text-muted-foreground">Active</p>
              </div>
            </div>
          </Card>

          <Card padding="md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-warning-100 rounded-lg flex items-center justify-center">
                <span className="text-xl">🟡</span>
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {classes.reduce(
                    (sum, c) =>
                      sum + c.students.filter((s) => s.status === "warning").length,
                    0
                  )}
                </p>
                <p className="text-sm text-muted-foreground">At risk</p>
              </div>
            </div>
          </Card>

          <Card padding="md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-secondary-100 rounded-lg flex items-center justify-center">
                <BarChartIcon className="w-5 h-5 text-secondary-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{classes.length}</p>
                <p className="text-sm text-muted-foreground">Classes</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Classes */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">Your Classes</h3>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowCreateClass(true)}
          >
            <PlusIcon className="w-4 h-4 mr-1" />
            New Class
          </Button>
        </div>

        {classes.length === 0 ? (
          <Card padding="lg" className="text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <UsersIcon className="w-8 h-8 text-muted-foreground" />
            </div>
            <h4 className="font-bold mb-2">No classes yet</h4>
            <p className="text-muted-foreground mb-4">
              Create your first class to start adding students
            </p>
            <Button variant="primary" onClick={() => setShowCreateClass(true)}>
              Create Class
            </Button>
          </Card>
        ) : (
          <div className="space-y-6">
            {classes.map((cls) => (
              <Card key={cls.id} padding="none">
                <CardHeader className="p-4 border-b border-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{cls.name}</CardTitle>
                      <CardDescription>
                        Code: <span className="font-mono font-bold">{cls.code}</span>
                      </CardDescription>
                    </div>
                    <Link href={`/classes/${cls.id}`}>
                      <Button variant="outline" size="sm">
                        Manage
                      </Button>
                    </Link>
                  </div>
                </CardHeader>

                <CardContent className="p-0">
                  {cls.students.length === 0 ? (
                    <div className="p-6 text-center text-muted-foreground">
                      No students yet. Share the class code to invite students.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-muted/50 text-sm text-muted-foreground">
                          <tr>
                            <th className="text-left p-3">Student</th>
                            <th className="text-left p-3">Level</th>
                            <th className="text-left p-3">Lessons</th>
                            <th className="text-left p-3">Min/Week</th>
                            <th className="text-left p-3">Accuracy</th>
                            <th className="text-left p-3">Last Active</th>
                          </tr>
                        </thead>
                        <tbody>
                          {cls.students.map((student) => (
                            <tr
                              key={student.id}
                              className="border-t border-border hover:bg-muted/30"
                            >
                              <td className="p-3">
                                <Link
                                  href={`/students/${student.id}`}
                                  className="flex items-center gap-3"
                                >
                                  <AvatarWithStatus
                                    name={student.profile?.name}
                                    size="sm"
                                    status={student.status}
                                  />
                                  <span className="font-medium">
                                    {student.profile?.name || student.username}
                                  </span>
                                </Link>
                              </td>
                              <td className="p-3">
                                <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-medium">
                                  {student.level}
                                </span>
                              </td>
                              <td className="p-3">{student.lessonsCompleted}</td>
                              <td className="p-3">{student.weeklyMinutes}</td>
                              <td className="p-3">
                                <div className="flex items-center gap-2">
                                  <ProgressBar
                                    value={student.accuracy}
                                    size="sm"
                                    variant={
                                      student.accuracy >= 70
                                        ? "success"
                                        : "primary"
                                    }
                                    className="w-16"
                                  />
                                  <span className="text-sm">{student.accuracy}%</span>
                                </div>
                              </td>
                              <td className="p-3 text-sm text-muted-foreground">
                                {student.lastActive
                                  ? formatRelativeDate(student.lastActive)
                                  : "Never"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Create Class Modal */}
      {showCreateClass && (
        <CreateClassModal
          onClose={() => setShowCreateClass(false)}
          onCreated={(newClass) => {
            setClasses([{ ...newClass, students: [] }, ...classes]);
            setShowCreateClass(false);
          }}
        />
      )}
    </div>
  );
}

interface CreateClassModalProps {
  onClose: () => void;
  onCreated: (cls: Class) => void;
}

function CreateClassModal({ onClose, onCreated }: CreateClassModalProps) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    setError("");

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const code = generateClassCode();

      const { data, error: insertError } = await (supabase
        .from("classes") as any)
        .insert({
          name: name.trim(),
          teacher_id: user.id,
          code,
        })
        .select()
        .single();

      if (insertError) throw insertError;
      if (data) onCreated(data as Class);
    } catch (err: any) {
      setError(err.message || "Failed to create class");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card padding="lg" className="w-full max-w-md animate-scale-in">
        <h3 className="text-xl font-bold mb-4">Create New Class</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Class Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., 4th Grade - Morning"
              className="w-full h-12 px-4 rounded-2xl border-2 border-border focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
              required
            />
          </div>

          {error && (
            <div className="p-3 bg-error-50 text-error-600 text-sm rounded-xl">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              fullWidth
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              fullWidth
              loading={loading}
            >
              Create
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

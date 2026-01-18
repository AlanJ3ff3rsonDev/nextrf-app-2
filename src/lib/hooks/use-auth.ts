"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import type { Profile, Student, Class } from "@/types";

interface AuthState {
  user: User | null;
  profile: Profile | null;
  student: (Student & { class: Class }) | null;
  loading: boolean;
  isTeacher: boolean;
  isStudent: boolean;
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [student, setStudent] = useState<(Student & { class: Class }) | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    // Get initial session
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);

      if (session?.user) {
        // Get profile
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single() as { data: Profile | null };

        setProfile(profileData);

        // If student, get student data
        if (profileData?.role === "student") {
          const { data: studentData } = await supabase
            .from("students")
            .select("*, class:classes(*)")
            .eq("profile_id", session.user.id)
            .single() as { data: any };

          setStudent(studentData as (Student & { class: Class }) | null);
        }
      }

      setLoading(false);
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);

        if (session?.user) {
          const { data: profileData } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .single() as { data: Profile | null };

          setProfile(profileData);

          if (profileData?.role === "student") {
            const { data: studentData } = await supabase
              .from("students")
              .select("*, class:classes(*)")
              .eq("profile_id", session.user.id)
              .single() as { data: any };

            setStudent(studentData as (Student & { class: Class }) | null);
          }
        } else {
          setProfile(null);
          setStudent(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    user,
    profile,
    student,
    loading,
    isTeacher: profile?.role === "teacher",
    isStudent: profile?.role === "student",
  };
}

export function useSignOut() {
  const signOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return signOut;
}

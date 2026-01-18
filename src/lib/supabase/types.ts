export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          name: string;
          role: "teacher" | "student";
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          name: string;
          role: "teacher" | "student";
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          name?: string;
          role?: "teacher" | "student";
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      classes: {
        Row: {
          id: string;
          name: string;
          teacher_id: string;
          code: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          teacher_id: string;
          code: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          teacher_id?: string;
          code?: string;
          created_at?: string;
        };
      };
      students: {
        Row: {
          id: string;
          profile_id: string;
          class_id: string;
          username: string;
          level: "A0" | "A1" | "A2" | "B1" | "B2";
          total_xp: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          class_id: string;
          username: string;
          level?: "A0" | "A1" | "A2" | "B1" | "B2";
          total_xp?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          class_id?: string;
          username?: string;
          level?: "A0" | "A1" | "A2" | "B1" | "B2";
          total_xp?: number;
          created_at?: string;
        };
      };
      courses: {
        Row: {
          id: string;
          name: string;
          description: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          created_at?: string;
        };
      };
      levels: {
        Row: {
          id: string;
          course_id: string;
          cefr_level: "A0" | "A1" | "A2" | "B1" | "B2";
          name: string;
          description: string;
          order: number;
        };
        Insert: {
          id?: string;
          course_id: string;
          cefr_level: "A0" | "A1" | "A2" | "B1" | "B2";
          name: string;
          description: string;
          order: number;
        };
        Update: {
          id?: string;
          course_id?: string;
          cefr_level?: "A0" | "A1" | "A2" | "B1" | "B2";
          name?: string;
          description?: string;
          order?: number;
        };
      };
      units: {
        Row: {
          id: string;
          level_id: string;
          title: string;
          theme: string;
          description: string | null;
          image_url: string | null;
          order: number;
        };
        Insert: {
          id?: string;
          level_id: string;
          title: string;
          theme: string;
          description?: string | null;
          image_url?: string | null;
          order: number;
        };
        Update: {
          id?: string;
          level_id?: string;
          title?: string;
          theme?: string;
          description?: string | null;
          image_url?: string | null;
          order?: number;
        };
      };
      lessons: {
        Row: {
          id: string;
          unit_id: string;
          title: string;
          description: string | null;
          target_skills: string[];
          xp_reward: number;
          order: number;
        };
        Insert: {
          id?: string;
          unit_id: string;
          title: string;
          description?: string | null;
          target_skills?: string[];
          xp_reward?: number;
          order: number;
        };
        Update: {
          id?: string;
          unit_id?: string;
          title?: string;
          description?: string | null;
          target_skills?: string[];
          xp_reward?: number;
          order?: number;
        };
      };
      items: {
        Row: {
          id: string;
          text_en: string;
          text_pt: string;
          image_url: string | null;
          audio_url: string | null;
          tags: string[];
          created_at: string;
        };
        Insert: {
          id?: string;
          text_en: string;
          text_pt: string;
          image_url?: string | null;
          audio_url?: string | null;
          tags?: string[];
          created_at?: string;
        };
        Update: {
          id?: string;
          text_en?: string;
          text_pt?: string;
          image_url?: string | null;
          audio_url?: string | null;
          tags?: string[];
          created_at?: string;
        };
      };
      lesson_items: {
        Row: {
          lesson_id: string;
          item_id: string;
          order: number;
        };
        Insert: {
          lesson_id: string;
          item_id: string;
          order: number;
        };
        Update: {
          lesson_id?: string;
          item_id?: string;
          order?: number;
        };
      };
      exercises: {
        Row: {
          id: string;
          lesson_id: string;
          type: "listen_tap_image" | "match" | "order_words" | "read_choose" | "speak_repeat";
          config: Json;
          order: number;
        };
        Insert: {
          id?: string;
          lesson_id: string;
          type: "listen_tap_image" | "match" | "order_words" | "read_choose" | "speak_repeat";
          config: Json;
          order: number;
        };
        Update: {
          id?: string;
          lesson_id?: string;
          type?: "listen_tap_image" | "match" | "order_words" | "read_choose" | "speak_repeat";
          config?: Json;
          order?: number;
        };
      };
      student_progress: {
        Row: {
          id: string;
          student_id: string;
          lesson_id: string;
          completed_at: string;
          xp_earned: number;
          accuracy: number;
          time_spent_seconds: number;
        };
        Insert: {
          id?: string;
          student_id: string;
          lesson_id: string;
          completed_at?: string;
          xp_earned: number;
          accuracy: number;
          time_spent_seconds: number;
        };
        Update: {
          id?: string;
          student_id?: string;
          lesson_id?: string;
          completed_at?: string;
          xp_earned?: number;
          accuracy?: number;
          time_spent_seconds?: number;
        };
      };
      item_mastery: {
        Row: {
          id: string;
          student_id: string;
          item_id: string;
          status: "new" | "learning" | "reviewing" | "mastered";
          correct_count: number;
          incorrect_count: number;
          streak: number;
          next_review: string;
          last_reviewed: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          item_id: string;
          status?: "new" | "learning" | "reviewing" | "mastered";
          correct_count?: number;
          incorrect_count?: number;
          streak?: number;
          next_review?: string;
          last_reviewed?: string;
        };
        Update: {
          id?: string;
          student_id?: string;
          item_id?: string;
          status?: "new" | "learning" | "reviewing" | "mastered";
          correct_count?: number;
          incorrect_count?: number;
          streak?: number;
          next_review?: string;
          last_reviewed?: string;
        };
      };
      streaks: {
        Row: {
          id: string;
          student_id: string;
          current_streak: number;
          longest_streak: number;
          last_practice_date: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          current_streak?: number;
          longest_streak?: number;
          last_practice_date?: string;
        };
        Update: {
          id?: string;
          student_id?: string;
          current_streak?: number;
          longest_streak?: number;
          last_practice_date?: string;
        };
      };
      badges: {
        Row: {
          id: string;
          name: string;
          description: string;
          icon: string;
          criteria: Json;
        };
        Insert: {
          id?: string;
          name: string;
          description: string;
          icon: string;
          criteria: Json;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          icon?: string;
          criteria?: Json;
        };
      };
      student_badges: {
        Row: {
          id: string;
          student_id: string;
          badge_id: string;
          earned_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          badge_id: string;
          earned_at?: string;
        };
        Update: {
          id?: string;
          student_id?: string;
          badge_id?: string;
          earned_at?: string;
        };
      };
      missions: {
        Row: {
          id: string;
          class_id: string;
          title: string;
          description: string;
          goal_type: "minutes" | "lessons" | "xp" | "unit";
          goal_value: number;
          start_date: string;
          end_date: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          class_id: string;
          title: string;
          description: string;
          goal_type: "minutes" | "lessons" | "xp" | "unit";
          goal_value: number;
          start_date: string;
          end_date: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          class_id?: string;
          title?: string;
          description?: string;
          goal_type?: "minutes" | "lessons" | "xp" | "unit";
          goal_value?: number;
          start_date?: string;
          end_date?: string;
          created_at?: string;
        };
      };
      student_mission_progress: {
        Row: {
          id: string;
          student_id: string;
          mission_id: string;
          progress_value: number;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          student_id: string;
          mission_id: string;
          progress_value?: number;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          student_id?: string;
          mission_id?: string;
          progress_value?: number;
          completed_at?: string | null;
        };
      };
      activity_logs: {
        Row: {
          id: string;
          student_id: string;
          activity_type: "lesson_start" | "lesson_complete" | "exercise_complete" | "login";
          metadata: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          activity_type: "lesson_start" | "lesson_complete" | "exercise_complete" | "login";
          metadata?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          student_id?: string;
          activity_type?: "lesson_start" | "lesson_complete" | "exercise_complete" | "login";
          metadata?: Json | null;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      cefr_level: "A0" | "A1" | "A2" | "B1" | "B2";
      exercise_type: "listen_tap_image" | "match" | "order_words" | "read_choose" | "speak_repeat";
      mastery_status: "new" | "learning" | "reviewing" | "mastered";
      user_role: "teacher" | "student";
      mission_goal_type: "minutes" | "lessons" | "xp" | "unit";
      activity_type: "lesson_start" | "lesson_complete" | "exercise_complete" | "login";
    };
  };
};

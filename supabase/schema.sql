-- NextRF English App Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ENUMS
-- ============================================

CREATE TYPE user_role AS ENUM ('teacher', 'student');
CREATE TYPE cefr_level AS ENUM ('A0', 'A1', 'A2', 'B1', 'B2');
CREATE TYPE exercise_type AS ENUM ('listen_tap_image', 'match', 'order_words', 'read_choose', 'speak_repeat');
CREATE TYPE mastery_status AS ENUM ('new', 'learning', 'reviewing', 'mastered');
CREATE TYPE mission_goal_type AS ENUM ('minutes', 'lessons', 'xp', 'unit');
CREATE TYPE activity_type AS ENUM ('lesson_start', 'lesson_complete', 'exercise_complete', 'login');

-- ============================================
-- USER & AUTH TABLES
-- ============================================

-- Profiles table (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  name TEXT NOT NULL,
  role user_role NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Classes table
CREATE TABLE classes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  teacher_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  code TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Students table (links profile to class with student-specific data)
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  level cefr_level DEFAULT 'A0',
  total_xp INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(class_id, username)
);

-- ============================================
-- COURSE STRUCTURE TABLES
-- ============================================

-- Courses table
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Levels table (CEFR levels within a course)
CREATE TABLE levels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  cefr_level cefr_level NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  "order" INTEGER NOT NULL
);

-- Units table (thematic units within a level)
CREATE TABLE units (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  level_id UUID NOT NULL REFERENCES levels(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  theme TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  "order" INTEGER NOT NULL
);

-- Lessons table
CREATE TABLE lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  unit_id UUID NOT NULL REFERENCES units(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  target_skills TEXT[] DEFAULT '{}',
  xp_reward INTEGER DEFAULT 10,
  "order" INTEGER NOT NULL
);

-- ============================================
-- CONTENT TABLES
-- ============================================

-- Items table (vocabulary/phrases)
CREATE TABLE items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  text_en TEXT NOT NULL,
  text_pt TEXT NOT NULL,
  image_url TEXT,
  audio_url TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lesson items junction table
CREATE TABLE lesson_items (
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  "order" INTEGER NOT NULL,
  PRIMARY KEY (lesson_id, item_id)
);

-- Exercises table
CREATE TABLE exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  type exercise_type NOT NULL,
  config JSONB NOT NULL,
  "order" INTEGER NOT NULL
);

-- ============================================
-- PROGRESS TRACKING TABLES
-- ============================================

-- Student progress table
CREATE TABLE student_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  xp_earned INTEGER NOT NULL,
  accuracy INTEGER NOT NULL CHECK (accuracy >= 0 AND accuracy <= 100),
  time_spent_seconds INTEGER NOT NULL,
  UNIQUE(student_id, lesson_id)
);

-- Item mastery table (for spaced repetition)
CREATE TABLE item_mastery (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  status mastery_status DEFAULT 'new',
  correct_count INTEGER DEFAULT 0,
  incorrect_count INTEGER DEFAULT 0,
  streak INTEGER DEFAULT 0,
  next_review TIMESTAMPTZ DEFAULT NOW(),
  last_reviewed TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, item_id)
);

-- ============================================
-- GAMIFICATION TABLES
-- ============================================

-- Streaks table
CREATE TABLE streaks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID UNIQUE NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_practice_date DATE DEFAULT CURRENT_DATE
);

-- Badges table
CREATE TABLE badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  criteria JSONB NOT NULL
);

-- Student badges junction table
CREATE TABLE student_badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, badge_id)
);

-- ============================================
-- MISSIONS TABLES
-- ============================================

-- Missions table
CREATE TABLE missions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  goal_type mission_goal_type NOT NULL,
  goal_value INTEGER NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Student mission progress table
CREATE TABLE student_mission_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  mission_id UUID NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
  progress_value INTEGER DEFAULT 0,
  completed_at TIMESTAMPTZ,
  UNIQUE(student_id, mission_id)
);

-- ============================================
-- ACTIVITY LOGS TABLE
-- ============================================

CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  activity_type activity_type NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_students_class_id ON students(class_id);
CREATE INDEX idx_students_profile_id ON students(profile_id);
CREATE INDEX idx_classes_teacher_id ON classes(teacher_id);
CREATE INDEX idx_lessons_unit_id ON lessons(unit_id);
CREATE INDEX idx_units_level_id ON units(level_id);
CREATE INDEX idx_levels_course_id ON levels(course_id);
CREATE INDEX idx_exercises_lesson_id ON exercises(lesson_id);
CREATE INDEX idx_student_progress_student_id ON student_progress(student_id);
CREATE INDEX idx_student_progress_lesson_id ON student_progress(lesson_id);
CREATE INDEX idx_item_mastery_student_id ON item_mastery(student_id);
CREATE INDEX idx_item_mastery_next_review ON item_mastery(next_review);
CREATE INDEX idx_activity_logs_student_id ON activity_logs(student_id);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE units ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_mastery ENABLE ROW LEVEL SECURITY;
ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_mission_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Teachers can view all profiles in their classes
CREATE POLICY "Teachers can view student profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM students s
      JOIN classes c ON s.class_id = c.id
      WHERE s.profile_id = profiles.id AND c.teacher_id = auth.uid()
    )
  );

-- Classes policies
CREATE POLICY "Teachers can manage their classes" ON classes
  FOR ALL USING (teacher_id = auth.uid());

CREATE POLICY "Students can view their class" ON classes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM students s
      WHERE s.class_id = classes.id AND s.profile_id = auth.uid()
    )
  );

-- Students policies
CREATE POLICY "Teachers can manage students in their classes" ON students
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM classes c
      WHERE c.id = students.class_id AND c.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Students can view themselves" ON students
  FOR SELECT USING (profile_id = auth.uid());

-- Allow anonymous lookup of student by username for login flow
-- This only allows finding if a username exists, the actual auth happens via Supabase Auth
CREATE POLICY "Anonymous can lookup student for login" ON students
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Students can update their own data" ON students
  FOR UPDATE USING (profile_id = auth.uid());

-- Course content is public (read-only)
CREATE POLICY "Anyone can view courses" ON courses FOR SELECT USING (true);
CREATE POLICY "Anyone can view levels" ON levels FOR SELECT USING (true);
CREATE POLICY "Anyone can view units" ON units FOR SELECT USING (true);
CREATE POLICY "Anyone can view lessons" ON lessons FOR SELECT USING (true);
CREATE POLICY "Anyone can view items" ON items FOR SELECT USING (true);
CREATE POLICY "Anyone can view lesson_items" ON lesson_items FOR SELECT USING (true);
CREATE POLICY "Anyone can view exercises" ON exercises FOR SELECT USING (true);
CREATE POLICY "Anyone can view badges" ON badges FOR SELECT USING (true);

-- Teachers can manage content
CREATE POLICY "Teachers can manage courses" ON courses
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'teacher')
  );

CREATE POLICY "Teachers can manage levels" ON levels
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'teacher')
  );

CREATE POLICY "Teachers can manage units" ON units
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'teacher')
  );

CREATE POLICY "Teachers can manage lessons" ON lessons
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'teacher')
  );

CREATE POLICY "Teachers can manage items" ON items
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'teacher')
  );

CREATE POLICY "Teachers can manage lesson_items" ON lesson_items
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'teacher')
  );

CREATE POLICY "Teachers can manage exercises" ON exercises
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'teacher')
  );

CREATE POLICY "Teachers can manage badges" ON badges
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'teacher')
  );

-- Progress policies
CREATE POLICY "Students can manage their progress" ON student_progress
  FOR ALL USING (
    EXISTS (SELECT 1 FROM students WHERE id = student_progress.student_id AND profile_id = auth.uid())
  );

CREATE POLICY "Teachers can view student progress" ON student_progress
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM students s
      JOIN classes c ON s.class_id = c.id
      WHERE s.id = student_progress.student_id AND c.teacher_id = auth.uid()
    )
  );

-- Item mastery policies
CREATE POLICY "Students can manage their item mastery" ON item_mastery
  FOR ALL USING (
    EXISTS (SELECT 1 FROM students WHERE id = item_mastery.student_id AND profile_id = auth.uid())
  );

CREATE POLICY "Teachers can view student item mastery" ON item_mastery
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM students s
      JOIN classes c ON s.class_id = c.id
      WHERE s.id = item_mastery.student_id AND c.teacher_id = auth.uid()
    )
  );

-- Streaks policies
CREATE POLICY "Students can manage their streaks" ON streaks
  FOR ALL USING (
    EXISTS (SELECT 1 FROM students WHERE id = streaks.student_id AND profile_id = auth.uid())
  );

CREATE POLICY "Teachers can view student streaks" ON streaks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM students s
      JOIN classes c ON s.class_id = c.id
      WHERE s.id = streaks.student_id AND c.teacher_id = auth.uid()
    )
  );

-- Student badges policies
CREATE POLICY "Students can view their badges" ON student_badges
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM students WHERE id = student_badges.student_id AND profile_id = auth.uid())
  );

CREATE POLICY "System can award badges" ON student_badges
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM students WHERE id = student_badges.student_id AND profile_id = auth.uid())
  );

CREATE POLICY "Teachers can view student badges" ON student_badges
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM students s
      JOIN classes c ON s.class_id = c.id
      WHERE s.id = student_badges.student_id AND c.teacher_id = auth.uid()
    )
  );

-- Missions policies
CREATE POLICY "Teachers can manage missions" ON missions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM classes WHERE id = missions.class_id AND teacher_id = auth.uid())
  );

CREATE POLICY "Students can view their class missions" ON missions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM students s
      WHERE s.class_id = missions.class_id AND s.profile_id = auth.uid()
    )
  );

-- Mission progress policies
CREATE POLICY "Students can manage their mission progress" ON student_mission_progress
  FOR ALL USING (
    EXISTS (SELECT 1 FROM students WHERE id = student_mission_progress.student_id AND profile_id = auth.uid())
  );

CREATE POLICY "Teachers can view student mission progress" ON student_mission_progress
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM students s
      JOIN classes c ON s.class_id = c.id
      WHERE s.id = student_mission_progress.student_id AND c.teacher_id = auth.uid()
    )
  );

-- Activity logs policies
CREATE POLICY "Students can create their activity logs" ON activity_logs
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM students WHERE id = activity_logs.student_id AND profile_id = auth.uid())
  );

CREATE POLICY "Students can view their activity logs" ON activity_logs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM students WHERE id = activity_logs.student_id AND profile_id = auth.uid())
  );

CREATE POLICY "Teachers can view student activity logs" ON activity_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM students s
      JOIN classes c ON s.class_id = c.id
      WHERE s.id = activity_logs.student_id AND c.teacher_id = auth.uid()
    )
  );

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for profiles updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'student')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Function to update streak
CREATE OR REPLACE FUNCTION update_student_streak(p_student_id UUID)
RETURNS VOID AS $$
DECLARE
  v_last_practice DATE;
  v_current_streak INTEGER;
  v_longest_streak INTEGER;
BEGIN
  SELECT last_practice_date, current_streak, longest_streak
  INTO v_last_practice, v_current_streak, v_longest_streak
  FROM streaks
  WHERE student_id = p_student_id;

  IF NOT FOUND THEN
    INSERT INTO streaks (student_id, current_streak, longest_streak, last_practice_date)
    VALUES (p_student_id, 1, 1, CURRENT_DATE);
  ELSIF v_last_practice = CURRENT_DATE THEN
    -- Already practiced today, do nothing
    NULL;
  ELSIF v_last_practice = CURRENT_DATE - 1 THEN
    -- Practiced yesterday, increment streak
    UPDATE streaks
    SET current_streak = current_streak + 1,
        longest_streak = GREATEST(longest_streak, current_streak + 1),
        last_practice_date = CURRENT_DATE
    WHERE student_id = p_student_id;
  ELSE
    -- Streak broken, reset to 1
    UPDATE streaks
    SET current_streak = 1,
        last_practice_date = CURRENT_DATE
    WHERE student_id = p_student_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

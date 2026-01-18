-- SEED TEST USERS FOR LOCAL DEVELOPMENT
-- Teacher: teacher@nextrf.local / teacher123
-- Student: joao (username) / joao123

-- Insert into auth.users
INSERT INTO auth.users (
  id, instance_id, email, encrypted_password, email_confirmed_at,
  created_at, updated_at, raw_app_meta_data, raw_user_meta_data, aud, role
) VALUES
  (
    '11111111-1111-1111-1111-111111111111',
    '00000000-0000-0000-0000-000000000000',
    'teacher@nextrf.local',
    crypt('teacher123', gen_salt('bf')),
    NOW(), NOW(), NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"name": "Professor Demo", "role": "teacher"}',
    'authenticated', 'authenticated'
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    '00000000-0000-0000-0000-000000000000',
    'joao@turma1.nextrf.local',
    crypt('joao123', gen_salt('bf')),
    NOW(), NOW(), NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"name": "Joao Silva", "role": "student"}',
    'authenticated', 'authenticated'
  )
ON CONFLICT (id) DO NOTHING;

-- Insert identities (required for Supabase Auth)
INSERT INTO auth.identities (
  id, user_id, identity_data, provider, provider_id, created_at, updated_at
) VALUES
  (
    '11111111-1111-1111-1111-111111111111',
    '11111111-1111-1111-1111-111111111111',
    '{"sub": "11111111-1111-1111-1111-111111111111", "email": "teacher@nextrf.local"}',
    'email', 'teacher@nextrf.local', NOW(), NOW()
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    '22222222-2222-2222-2222-222222222222',
    '{"sub": "22222222-2222-2222-2222-222222222222", "email": "joao@turma1.nextrf.local"}',
    'email', 'joao@turma1.nextrf.local', NOW(), NOW()
  )
ON CONFLICT (id) DO NOTHING;

-- Profiles (trigger should create, but ensure correct data)
INSERT INTO profiles (id, email, name, role) VALUES
  ('11111111-1111-1111-1111-111111111111', 'teacher@nextrf.local', 'Professor Demo', 'teacher'),
  ('22222222-2222-2222-2222-222222222222', 'joao@turma1.nextrf.local', 'Joao Silva', 'student')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role;

-- Create class
INSERT INTO classes (id, name, teacher_id, code) VALUES
  ('c1000001-0000-0000-0000-000000000001', 'Turma 1 - Iniciantes', '11111111-1111-1111-1111-111111111111', 'TURMA1')
ON CONFLICT (id) DO NOTHING;

-- Create student record
INSERT INTO students (id, profile_id, class_id, username, level, total_xp) VALUES
  ('s1000001-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', 'c1000001-0000-0000-0000-000000000001', 'joao', 'A0', 0)
ON CONFLICT (id) DO NOTHING;

-- Create streak
INSERT INTO streaks (student_id, current_streak, longest_streak, last_practice_date) VALUES
  ('s1000001-0000-0000-0000-000000000001', 0, 0, CURRENT_DATE - 1)
ON CONFLICT (student_id) DO NOTHING;

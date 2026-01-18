-- NextRF English App Seed Data
-- Run this after schema.sql to populate initial content

-- ============================================
-- BADGES
-- ============================================

INSERT INTO badges (id, name, description, icon, criteria) VALUES
  ('b0000001-0000-0000-0000-000000000001', 'First Step', 'Complete your first lesson', '🎯', '{"type": "lesson_complete", "value": 1}'),
  ('b0000001-0000-0000-0000-000000000002', 'Week Warrior', '7 day streak', '🔥', '{"type": "streak", "value": 7}'),
  ('b0000001-0000-0000-0000-000000000003', 'Unit Master', 'Complete a unit', '🏆', '{"type": "unit_complete", "value": 1}'),
  ('b0000001-0000-0000-0000-000000000004', 'Century Club', 'Earn 100 XP', '💯', '{"type": "xp_total", "value": 100}'),
  ('b0000001-0000-0000-0000-000000000005', 'Perfect Score', 'Get 100% accuracy on a lesson', '⭐', '{"type": "accuracy", "value": 100}'),
  ('b0000001-0000-0000-0000-000000000006', 'Rising Star', 'Earn 500 XP', '🌟', '{"type": "xp_total", "value": 500}'),
  ('b0000001-0000-0000-0000-000000000007', 'Month Master', '30 day streak', '🗓️', '{"type": "streak", "value": 30}'),
  ('b0000001-0000-0000-0000-000000000008', 'Scholar', 'Earn 1000 XP', '📚', '{"type": "xp_total", "value": 1000}');

-- ============================================
-- COURSE STRUCTURE
-- ============================================

-- Main English Course
INSERT INTO courses (id, name, description) VALUES
  ('c0000001-0000-0000-0000-000000000001', 'NextRF English', 'Complete English course for NextRF students from beginner to intermediate');

-- A0 Level (Beginner)
INSERT INTO levels (id, course_id, cefr_level, name, description, "order") VALUES
  ('a1000001-0000-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000001', 'A0', 'Beginner', 'Introduction to English - basic words and phrases', 1);

-- A1 Level (Elementary)
INSERT INTO levels (id, course_id, cefr_level, name, description, "order") VALUES
  ('a1000001-0000-0000-0000-000000000002', 'c0000001-0000-0000-0000-000000000001', 'A1', 'Elementary', 'Basic communication - simple sentences and conversations', 2);

-- ============================================
-- UNITS - A0 Level
-- ============================================

INSERT INTO units (id, level_id, title, theme, description, "order") VALUES
  ('aa000001-0000-0000-0000-000000000001', 'a1000001-0000-0000-0000-000000000001', 'Greetings', 'greetings', 'Learn to say hello and goodbye', 1),
  ('aa000001-0000-0000-0000-000000000002', 'a1000001-0000-0000-0000-000000000001', 'Colors', 'colors', 'Learn the basic colors', 2),
  ('aa000001-0000-0000-0000-000000000003', 'a1000001-0000-0000-0000-000000000001', 'Numbers 1-10', 'numbers', 'Learn to count from 1 to 10', 3);

-- ============================================
-- LESSONS - Unit 1: Greetings
-- ============================================

INSERT INTO lessons (id, unit_id, title, description, target_skills, xp_reward, "order") VALUES
  ('1e000001-0000-0000-0000-000000000001', 'aa000001-0000-0000-0000-000000000001', 'Hello!', 'Learn how to greet someone', ARRAY['listening', 'speaking'], 10, 1),
  ('1e000001-0000-0000-0000-000000000002', 'aa000001-0000-0000-0000-000000000001', 'Goodbye!', 'Learn how to say goodbye', ARRAY['listening', 'speaking'], 10, 2),
  ('1e000001-0000-0000-0000-000000000003', 'aa000001-0000-0000-0000-000000000001', 'How are you?', 'Learn to ask and answer about feelings', ARRAY['listening', 'speaking', 'reading'], 15, 3);

-- ============================================
-- LESSONS - Unit 2: Colors
-- ============================================

INSERT INTO lessons (id, unit_id, title, description, target_skills, xp_reward, "order") VALUES
  ('1e000001-0000-0000-0000-000000000004', 'aa000001-0000-0000-0000-000000000002', 'Basic Colors', 'Learn red, blue, green, yellow', ARRAY['listening', 'vocabulary'], 10, 1),
  ('1e000001-0000-0000-0000-000000000005', 'aa000001-0000-0000-0000-000000000002', 'More Colors', 'Learn orange, purple, pink, black, white', ARRAY['listening', 'vocabulary'], 10, 2),
  ('1e000001-0000-0000-0000-000000000006', 'aa000001-0000-0000-0000-000000000002', 'What color is it?', 'Practice identifying colors', ARRAY['listening', 'speaking', 'reading'], 15, 3);

-- ============================================
-- LESSONS - Unit 3: Numbers
-- ============================================

INSERT INTO lessons (id, unit_id, title, description, target_skills, xp_reward, "order") VALUES
  ('1e000001-0000-0000-0000-000000000007', 'aa000001-0000-0000-0000-000000000003', 'Numbers 1-5', 'Learn to count 1 to 5', ARRAY['listening', 'vocabulary'], 10, 1),
  ('1e000001-0000-0000-0000-000000000008', 'aa000001-0000-0000-0000-000000000003', 'Numbers 6-10', 'Learn to count 6 to 10', ARRAY['listening', 'vocabulary'], 10, 2),
  ('1e000001-0000-0000-0000-000000000009', 'aa000001-0000-0000-0000-000000000003', 'Counting Practice', 'Practice all numbers 1-10', ARRAY['listening', 'speaking', 'reading'], 15, 3);

-- ============================================
-- ITEMS (Vocabulary)
-- ============================================

-- Greetings
INSERT INTO items (id, text_en, text_pt, tags) VALUES
  ('d1000001-0000-0000-0000-000000000001', 'Hello', 'Olá', ARRAY['greeting', 'basic']),
  ('d1000001-0000-0000-0000-000000000002', 'Hi', 'Oi', ARRAY['greeting', 'basic', 'informal']),
  ('d1000001-0000-0000-0000-000000000003', 'Good morning', 'Bom dia', ARRAY['greeting', 'basic', 'formal']),
  ('d1000001-0000-0000-0000-000000000004', 'Good afternoon', 'Boa tarde', ARRAY['greeting', 'basic', 'formal']),
  ('d1000001-0000-0000-0000-000000000005', 'Good evening', 'Boa noite', ARRAY['greeting', 'basic', 'formal']),
  ('d1000001-0000-0000-0000-000000000006', 'Goodbye', 'Tchau', ARRAY['greeting', 'basic', 'farewell']),
  ('d1000001-0000-0000-0000-000000000007', 'Bye', 'Tchau', ARRAY['greeting', 'basic', 'farewell', 'informal']),
  ('d1000001-0000-0000-0000-000000000008', 'See you', 'Até logo', ARRAY['greeting', 'basic', 'farewell']),
  ('d1000001-0000-0000-0000-000000000009', 'How are you?', 'Como você está?', ARRAY['greeting', 'basic', 'question']),
  ('d1000001-0000-0000-0000-000000000010', 'I am fine', 'Estou bem', ARRAY['greeting', 'basic', 'response']),
  ('d1000001-0000-0000-0000-000000000011', 'Thank you', 'Obrigado', ARRAY['greeting', 'basic', 'polite']),
  ('d1000001-0000-0000-0000-000000000012', 'Please', 'Por favor', ARRAY['greeting', 'basic', 'polite']);

-- Colors
INSERT INTO items (id, text_en, text_pt, tags) VALUES
  ('d1000001-0000-0000-0000-000000000013', 'red', 'vermelho', ARRAY['color', 'basic']),
  ('d1000001-0000-0000-0000-000000000014', 'blue', 'azul', ARRAY['color', 'basic']),
  ('d1000001-0000-0000-0000-000000000015', 'green', 'verde', ARRAY['color', 'basic']),
  ('d1000001-0000-0000-0000-000000000016', 'yellow', 'amarelo', ARRAY['color', 'basic']),
  ('d1000001-0000-0000-0000-000000000017', 'orange', 'laranja', ARRAY['color', 'basic']),
  ('d1000001-0000-0000-0000-000000000018', 'purple', 'roxo', ARRAY['color', 'basic']),
  ('d1000001-0000-0000-0000-000000000019', 'pink', 'rosa', ARRAY['color', 'basic']),
  ('d1000001-0000-0000-0000-000000000020', 'black', 'preto', ARRAY['color', 'basic']),
  ('d1000001-0000-0000-0000-000000000021', 'white', 'branco', ARRAY['color', 'basic']),
  ('d1000001-0000-0000-0000-000000000022', 'brown', 'marrom', ARRAY['color', 'basic']);

-- Numbers
INSERT INTO items (id, text_en, text_pt, tags) VALUES
  ('d1000001-0000-0000-0000-000000000023', 'one', 'um', ARRAY['number', 'basic']),
  ('d1000001-0000-0000-0000-000000000024', 'two', 'dois', ARRAY['number', 'basic']),
  ('d1000001-0000-0000-0000-000000000025', 'three', 'três', ARRAY['number', 'basic']),
  ('d1000001-0000-0000-0000-000000000026', 'four', 'quatro', ARRAY['number', 'basic']),
  ('d1000001-0000-0000-0000-000000000027', 'five', 'cinco', ARRAY['number', 'basic']),
  ('d1000001-0000-0000-0000-000000000028', 'six', 'seis', ARRAY['number', 'basic']),
  ('d1000001-0000-0000-0000-000000000029', 'seven', 'sete', ARRAY['number', 'basic']),
  ('d1000001-0000-0000-0000-000000000030', 'eight', 'oito', ARRAY['number', 'basic']),
  ('d1000001-0000-0000-0000-000000000031', 'nine', 'nove', ARRAY['number', 'basic']),
  ('d1000001-0000-0000-0000-000000000032', 'ten', 'dez', ARRAY['number', 'basic']);

-- ============================================
-- LESSON ITEMS (Linking)
-- ============================================

-- Lesson 1: Hello! - items
INSERT INTO lesson_items (lesson_id, item_id, "order") VALUES
  ('1e000001-0000-0000-0000-000000000001', 'd1000001-0000-0000-0000-000000000001', 1),
  ('1e000001-0000-0000-0000-000000000001', 'd1000001-0000-0000-0000-000000000002', 2),
  ('1e000001-0000-0000-0000-000000000001', 'd1000001-0000-0000-0000-000000000003', 3),
  ('1e000001-0000-0000-0000-000000000001', 'd1000001-0000-0000-0000-000000000004', 4),
  ('1e000001-0000-0000-0000-000000000001', 'd1000001-0000-0000-0000-000000000005', 5);

-- Lesson 2: Goodbye! - items
INSERT INTO lesson_items (lesson_id, item_id, "order") VALUES
  ('1e000001-0000-0000-0000-000000000002', 'd1000001-0000-0000-0000-000000000006', 1),
  ('1e000001-0000-0000-0000-000000000002', 'd1000001-0000-0000-0000-000000000007', 2),
  ('1e000001-0000-0000-0000-000000000002', 'd1000001-0000-0000-0000-000000000008', 3);

-- Lesson 3: How are you? - items
INSERT INTO lesson_items (lesson_id, item_id, "order") VALUES
  ('1e000001-0000-0000-0000-000000000003', 'd1000001-0000-0000-0000-000000000009', 1),
  ('1e000001-0000-0000-0000-000000000003', 'd1000001-0000-0000-0000-000000000010', 2),
  ('1e000001-0000-0000-0000-000000000003', 'd1000001-0000-0000-0000-000000000011', 3),
  ('1e000001-0000-0000-0000-000000000003', 'd1000001-0000-0000-0000-000000000012', 4);

-- Lesson 4: Basic Colors - items
INSERT INTO lesson_items (lesson_id, item_id, "order") VALUES
  ('1e000001-0000-0000-0000-000000000004', 'd1000001-0000-0000-0000-000000000013', 1),
  ('1e000001-0000-0000-0000-000000000004', 'd1000001-0000-0000-0000-000000000014', 2),
  ('1e000001-0000-0000-0000-000000000004', 'd1000001-0000-0000-0000-000000000015', 3),
  ('1e000001-0000-0000-0000-000000000004', 'd1000001-0000-0000-0000-000000000016', 4);

-- Lesson 5: More Colors - items
INSERT INTO lesson_items (lesson_id, item_id, "order") VALUES
  ('1e000001-0000-0000-0000-000000000005', 'd1000001-0000-0000-0000-000000000017', 1),
  ('1e000001-0000-0000-0000-000000000005', 'd1000001-0000-0000-0000-000000000018', 2),
  ('1e000001-0000-0000-0000-000000000005', 'd1000001-0000-0000-0000-000000000019', 3),
  ('1e000001-0000-0000-0000-000000000005', 'd1000001-0000-0000-0000-000000000020', 4),
  ('1e000001-0000-0000-0000-000000000005', 'd1000001-0000-0000-0000-000000000021', 5);

-- Lesson 7: Numbers 1-5 - items
INSERT INTO lesson_items (lesson_id, item_id, "order") VALUES
  ('1e000001-0000-0000-0000-000000000007', 'd1000001-0000-0000-0000-000000000023', 1),
  ('1e000001-0000-0000-0000-000000000007', 'd1000001-0000-0000-0000-000000000024', 2),
  ('1e000001-0000-0000-0000-000000000007', 'd1000001-0000-0000-0000-000000000025', 3),
  ('1e000001-0000-0000-0000-000000000007', 'd1000001-0000-0000-0000-000000000026', 4),
  ('1e000001-0000-0000-0000-000000000007', 'd1000001-0000-0000-0000-000000000027', 5);

-- Lesson 8: Numbers 6-10 - items
INSERT INTO lesson_items (lesson_id, item_id, "order") VALUES
  ('1e000001-0000-0000-0000-000000000008', 'd1000001-0000-0000-0000-000000000028', 1),
  ('1e000001-0000-0000-0000-000000000008', 'd1000001-0000-0000-0000-000000000029', 2),
  ('1e000001-0000-0000-0000-000000000008', 'd1000001-0000-0000-0000-000000000030', 3),
  ('1e000001-0000-0000-0000-000000000008', 'd1000001-0000-0000-0000-000000000031', 4),
  ('1e000001-0000-0000-0000-000000000008', 'd1000001-0000-0000-0000-000000000032', 5);

-- ============================================
-- EXERCISES - Lesson 1: Hello!
-- ============================================

INSERT INTO exercises (id, lesson_id, type, config, "order") VALUES
  -- Listen and tap the correct image
  ('e0000001-0000-0000-0000-000000000001', '1e000001-0000-0000-0000-000000000001', 'listen_tap_image',
   '{"type": "listen_tap_image", "audio_text": "Hello", "correct_item_id": "d1000001-0000-0000-0000-000000000001", "distractor_item_ids": ["d1000001-0000-0000-0000-000000000006", "d1000001-0000-0000-0000-000000000009", "d1000001-0000-0000-0000-000000000011"]}'::jsonb, 1),

  -- Read and choose translation
  ('e0000001-0000-0000-0000-000000000002', '1e000001-0000-0000-0000-000000000001', 'read_choose',
   '{"type": "read_choose", "question": "What does \"Good morning\" mean?", "correct_item_id": "d1000001-0000-0000-0000-000000000003", "distractor_item_ids": ["d1000001-0000-0000-0000-000000000004", "d1000001-0000-0000-0000-000000000005", "d1000001-0000-0000-0000-000000000006"]}'::jsonb, 2),

  -- Match words
  ('e0000001-0000-0000-0000-000000000003', '1e000001-0000-0000-0000-000000000001', 'match',
   '{"type": "match", "pairs": [{"item_id": "d1000001-0000-0000-0000-000000000001", "match_type": "word_to_translation"}, {"item_id": "d1000001-0000-0000-0000-000000000002", "match_type": "word_to_translation"}, {"item_id": "d1000001-0000-0000-0000-000000000003", "match_type": "word_to_translation"}]}'::jsonb, 3),

  -- Speak and repeat
  ('e0000001-0000-0000-0000-000000000004', '1e000001-0000-0000-0000-000000000001', 'speak_repeat',
   '{"type": "speak_repeat", "text": "Hello"}'::jsonb, 4),

  ('e0000001-0000-0000-0000-000000000005', '1e000001-0000-0000-0000-000000000001', 'speak_repeat',
   '{"type": "speak_repeat", "text": "Good morning"}'::jsonb, 5);

-- ============================================
-- EXERCISES - Lesson 4: Basic Colors
-- ============================================

INSERT INTO exercises (id, lesson_id, type, config, "order") VALUES
  ('e0000001-0000-0000-0000-000000000006', '1e000001-0000-0000-0000-000000000004', 'listen_tap_image',
   '{"type": "listen_tap_image", "audio_text": "red", "correct_item_id": "d1000001-0000-0000-0000-000000000013", "distractor_item_ids": ["d1000001-0000-0000-0000-000000000014", "d1000001-0000-0000-0000-000000000015", "d1000001-0000-0000-0000-000000000016"]}'::jsonb, 1),

  ('e0000001-0000-0000-0000-000000000007', '1e000001-0000-0000-0000-000000000004', 'listen_tap_image',
   '{"type": "listen_tap_image", "audio_text": "blue", "correct_item_id": "d1000001-0000-0000-0000-000000000014", "distractor_item_ids": ["d1000001-0000-0000-0000-000000000013", "d1000001-0000-0000-0000-000000000015", "d1000001-0000-0000-0000-000000000016"]}'::jsonb, 2),

  ('e0000001-0000-0000-0000-000000000008', '1e000001-0000-0000-0000-000000000004', 'match',
   '{"type": "match", "pairs": [{"item_id": "d1000001-0000-0000-0000-000000000013", "match_type": "word_to_translation"}, {"item_id": "d1000001-0000-0000-0000-000000000014", "match_type": "word_to_translation"}, {"item_id": "d1000001-0000-0000-0000-000000000015", "match_type": "word_to_translation"}, {"item_id": "d1000001-0000-0000-0000-000000000016", "match_type": "word_to_translation"}]}'::jsonb, 3),

  ('e0000001-0000-0000-0000-000000000009', '1e000001-0000-0000-0000-000000000004', 'speak_repeat',
   '{"type": "speak_repeat", "text": "red"}'::jsonb, 4),

  ('e0000001-0000-0000-0000-000000000010', '1e000001-0000-0000-0000-000000000004', 'speak_repeat',
   '{"type": "speak_repeat", "text": "blue"}'::jsonb, 5);

-- ============================================
-- EXERCISES - Lesson 7: Numbers 1-5
-- ============================================

INSERT INTO exercises (id, lesson_id, type, config, "order") VALUES
  ('e0000001-0000-0000-0000-000000000011', '1e000001-0000-0000-0000-000000000007', 'listen_tap_image',
   '{"type": "listen_tap_image", "audio_text": "one", "correct_item_id": "d1000001-0000-0000-0000-000000000023", "distractor_item_ids": ["d1000001-0000-0000-0000-000000000024", "d1000001-0000-0000-0000-000000000025", "d1000001-0000-0000-0000-000000000026"]}'::jsonb, 1),

  ('e0000001-0000-0000-0000-000000000012', '1e000001-0000-0000-0000-000000000007', 'listen_tap_image',
   '{"type": "listen_tap_image", "audio_text": "three", "correct_item_id": "d1000001-0000-0000-0000-000000000025", "distractor_item_ids": ["d1000001-0000-0000-0000-000000000023", "d1000001-0000-0000-0000-000000000024", "d1000001-0000-0000-0000-000000000027"]}'::jsonb, 2),

  ('e0000001-0000-0000-0000-000000000013', '1e000001-0000-0000-0000-000000000007', 'order_words',
   '{"type": "order_words", "sentence_en": "one two three", "sentence_pt": "um dois três", "words": ["three", "one", "two"], "correct_order": [1, 2, 0]}'::jsonb, 3),

  ('e0000001-0000-0000-0000-000000000014', '1e000001-0000-0000-0000-000000000007', 'match',
   '{"type": "match", "pairs": [{"item_id": "d1000001-0000-0000-0000-000000000023", "match_type": "word_to_translation"}, {"item_id": "d1000001-0000-0000-0000-000000000024", "match_type": "word_to_translation"}, {"item_id": "d1000001-0000-0000-0000-000000000025", "match_type": "word_to_translation"}, {"item_id": "d1000001-0000-0000-0000-000000000026", "match_type": "word_to_translation"}, {"item_id": "d1000001-0000-0000-0000-000000000027", "match_type": "word_to_translation"}]}'::jsonb, 4),

  ('e0000001-0000-0000-0000-000000000015', '1e000001-0000-0000-0000-000000000007', 'speak_repeat',
   '{"type": "speak_repeat", "text": "one two three four five"}'::jsonb, 5);

-- ============================================
-- LESSON ITEMS - Lesson 6: What color is it?
-- ============================================
INSERT INTO lesson_items (lesson_id, item_id, "order") VALUES
  ('1e000001-0000-0000-0000-000000000006', 'd1000001-0000-0000-0000-000000000013', 1),
  ('1e000001-0000-0000-0000-000000000006', 'd1000001-0000-0000-0000-000000000014', 2),
  ('1e000001-0000-0000-0000-000000000006', 'd1000001-0000-0000-0000-000000000015', 3),
  ('1e000001-0000-0000-0000-000000000006', 'd1000001-0000-0000-0000-000000000016', 4),
  ('1e000001-0000-0000-0000-000000000006', 'd1000001-0000-0000-0000-000000000017', 5),
  ('1e000001-0000-0000-0000-000000000006', 'd1000001-0000-0000-0000-000000000018', 6);

-- ============================================
-- LESSON ITEMS - Lesson 9: Counting Practice
-- ============================================
INSERT INTO lesson_items (lesson_id, item_id, "order") VALUES
  ('1e000001-0000-0000-0000-000000000009', 'd1000001-0000-0000-0000-000000000023', 1),
  ('1e000001-0000-0000-0000-000000000009', 'd1000001-0000-0000-0000-000000000024', 2),
  ('1e000001-0000-0000-0000-000000000009', 'd1000001-0000-0000-0000-000000000025', 3),
  ('1e000001-0000-0000-0000-000000000009', 'd1000001-0000-0000-0000-000000000026', 4),
  ('1e000001-0000-0000-0000-000000000009', 'd1000001-0000-0000-0000-000000000027', 5),
  ('1e000001-0000-0000-0000-000000000009', 'd1000001-0000-0000-0000-000000000028', 6),
  ('1e000001-0000-0000-0000-000000000009', 'd1000001-0000-0000-0000-000000000029', 7),
  ('1e000001-0000-0000-0000-000000000009', 'd1000001-0000-0000-0000-000000000030', 8),
  ('1e000001-0000-0000-0000-000000000009', 'd1000001-0000-0000-0000-000000000031', 9),
  ('1e000001-0000-0000-0000-000000000009', 'd1000001-0000-0000-0000-000000000032', 10);

-- ============================================
-- EXERCISES - Lesson 2: Goodbye!
-- ============================================

INSERT INTO exercises (id, lesson_id, type, config, "order") VALUES
  ('e0000001-0000-0000-0000-000000000016', '1e000001-0000-0000-0000-000000000002', 'listen_tap_image',
   '{"type": "listen_tap_image", "audio_text": "Goodbye", "correct_item_id": "d1000001-0000-0000-0000-000000000006", "distractor_item_ids": ["d1000001-0000-0000-0000-000000000001", "d1000001-0000-0000-0000-000000000009", "d1000001-0000-0000-0000-000000000011"]}'::jsonb, 1),

  ('e0000001-0000-0000-0000-000000000017', '1e000001-0000-0000-0000-000000000002', 'listen_tap_image',
   '{"type": "listen_tap_image", "audio_text": "See you", "correct_item_id": "d1000001-0000-0000-0000-000000000008", "distractor_item_ids": ["d1000001-0000-0000-0000-000000000001", "d1000001-0000-0000-0000-000000000006", "d1000001-0000-0000-0000-000000000010"]}'::jsonb, 2),

  ('e0000001-0000-0000-0000-000000000018', '1e000001-0000-0000-0000-000000000002', 'read_choose',
   '{"type": "read_choose", "question": "What does \"Bye\" mean?", "correct_item_id": "d1000001-0000-0000-0000-000000000007", "distractor_item_ids": ["d1000001-0000-0000-0000-000000000001", "d1000001-0000-0000-0000-000000000003", "d1000001-0000-0000-0000-000000000010"]}'::jsonb, 3),

  ('e0000001-0000-0000-0000-000000000019', '1e000001-0000-0000-0000-000000000002', 'match',
   '{"type": "match", "pairs": [{"item_id": "d1000001-0000-0000-0000-000000000006", "match_type": "word_to_translation"}, {"item_id": "d1000001-0000-0000-0000-000000000007", "match_type": "word_to_translation"}, {"item_id": "d1000001-0000-0000-0000-000000000008", "match_type": "word_to_translation"}]}'::jsonb, 4),

  ('e0000001-0000-0000-0000-000000000020', '1e000001-0000-0000-0000-000000000002', 'speak_repeat',
   '{"type": "speak_repeat", "text": "Goodbye"}'::jsonb, 5);

-- ============================================
-- EXERCISES - Lesson 3: How are you?
-- ============================================

INSERT INTO exercises (id, lesson_id, type, config, "order") VALUES
  ('e0000001-0000-0000-0000-000000000021', '1e000001-0000-0000-0000-000000000003', 'listen_tap_image',
   '{"type": "listen_tap_image", "audio_text": "How are you?", "correct_item_id": "d1000001-0000-0000-0000-000000000009", "distractor_item_ids": ["d1000001-0000-0000-0000-000000000001", "d1000001-0000-0000-0000-000000000006", "d1000001-0000-0000-0000-000000000011"]}'::jsonb, 1),

  ('e0000001-0000-0000-0000-000000000022', '1e000001-0000-0000-0000-000000000003', 'listen_tap_image',
   '{"type": "listen_tap_image", "audio_text": "I am fine", "correct_item_id": "d1000001-0000-0000-0000-000000000010", "distractor_item_ids": ["d1000001-0000-0000-0000-000000000009", "d1000001-0000-0000-0000-000000000011", "d1000001-0000-0000-0000-000000000012"]}'::jsonb, 2),

  ('e0000001-0000-0000-0000-000000000023', '1e000001-0000-0000-0000-000000000003', 'read_choose',
   '{"type": "read_choose", "question": "What does \"Thank you\" mean?", "correct_item_id": "d1000001-0000-0000-0000-000000000011", "distractor_item_ids": ["d1000001-0000-0000-0000-000000000009", "d1000001-0000-0000-0000-000000000010", "d1000001-0000-0000-0000-000000000012"]}'::jsonb, 3),

  ('e0000001-0000-0000-0000-000000000024', '1e000001-0000-0000-0000-000000000003', 'match',
   '{"type": "match", "pairs": [{"item_id": "d1000001-0000-0000-0000-000000000009", "match_type": "word_to_translation"}, {"item_id": "d1000001-0000-0000-0000-000000000010", "match_type": "word_to_translation"}, {"item_id": "d1000001-0000-0000-0000-000000000011", "match_type": "word_to_translation"}, {"item_id": "d1000001-0000-0000-0000-000000000012", "match_type": "word_to_translation"}]}'::jsonb, 4),

  ('e0000001-0000-0000-0000-000000000025', '1e000001-0000-0000-0000-000000000003', 'speak_repeat',
   '{"type": "speak_repeat", "text": "How are you? I am fine, thank you!"}'::jsonb, 5);

-- ============================================
-- EXERCISES - Lesson 5: More Colors
-- ============================================

INSERT INTO exercises (id, lesson_id, type, config, "order") VALUES
  ('e0000001-0000-0000-0000-000000000026', '1e000001-0000-0000-0000-000000000005', 'listen_tap_image',
   '{"type": "listen_tap_image", "audio_text": "orange", "correct_item_id": "d1000001-0000-0000-0000-000000000017", "distractor_item_ids": ["d1000001-0000-0000-0000-000000000018", "d1000001-0000-0000-0000-000000000019", "d1000001-0000-0000-0000-000000000020"]}'::jsonb, 1),

  ('e0000001-0000-0000-0000-000000000027', '1e000001-0000-0000-0000-000000000005', 'listen_tap_image',
   '{"type": "listen_tap_image", "audio_text": "purple", "correct_item_id": "d1000001-0000-0000-0000-000000000018", "distractor_item_ids": ["d1000001-0000-0000-0000-000000000017", "d1000001-0000-0000-0000-000000000019", "d1000001-0000-0000-0000-000000000021"]}'::jsonb, 2),

  ('e0000001-0000-0000-0000-000000000028', '1e000001-0000-0000-0000-000000000005', 'read_choose',
   '{"type": "read_choose", "question": "What does \"pink\" mean?", "correct_item_id": "d1000001-0000-0000-0000-000000000019", "distractor_item_ids": ["d1000001-0000-0000-0000-000000000017", "d1000001-0000-0000-0000-000000000018", "d1000001-0000-0000-0000-000000000020"]}'::jsonb, 3),

  ('e0000001-0000-0000-0000-000000000029', '1e000001-0000-0000-0000-000000000005', 'match',
   '{"type": "match", "pairs": [{"item_id": "d1000001-0000-0000-0000-000000000017", "match_type": "word_to_translation"}, {"item_id": "d1000001-0000-0000-0000-000000000018", "match_type": "word_to_translation"}, {"item_id": "d1000001-0000-0000-0000-000000000019", "match_type": "word_to_translation"}, {"item_id": "d1000001-0000-0000-0000-000000000020", "match_type": "word_to_translation"}, {"item_id": "d1000001-0000-0000-0000-000000000021", "match_type": "word_to_translation"}]}'::jsonb, 4),

  ('e0000001-0000-0000-0000-000000000030', '1e000001-0000-0000-0000-000000000005', 'speak_repeat',
   '{"type": "speak_repeat", "text": "orange purple pink"}'::jsonb, 5);

-- ============================================
-- EXERCISES - Lesson 6: What color is it?
-- ============================================

INSERT INTO exercises (id, lesson_id, type, config, "order") VALUES
  ('e0000001-0000-0000-0000-000000000031', '1e000001-0000-0000-0000-000000000006', 'listen_tap_image',
   '{"type": "listen_tap_image", "audio_text": "What color is this? It is green.", "correct_item_id": "d1000001-0000-0000-0000-000000000015", "distractor_item_ids": ["d1000001-0000-0000-0000-000000000013", "d1000001-0000-0000-0000-000000000014", "d1000001-0000-0000-0000-000000000016"]}'::jsonb, 1),

  ('e0000001-0000-0000-0000-000000000032', '1e000001-0000-0000-0000-000000000006', 'listen_tap_image',
   '{"type": "listen_tap_image", "audio_text": "What color is this? It is yellow.", "correct_item_id": "d1000001-0000-0000-0000-000000000016", "distractor_item_ids": ["d1000001-0000-0000-0000-000000000013", "d1000001-0000-0000-0000-000000000017", "d1000001-0000-0000-0000-000000000018"]}'::jsonb, 2),

  ('e0000001-0000-0000-0000-000000000033', '1e000001-0000-0000-0000-000000000006', 'read_choose',
   '{"type": "read_choose", "question": "The sky is ___", "correct_item_id": "d1000001-0000-0000-0000-000000000014", "distractor_item_ids": ["d1000001-0000-0000-0000-000000000013", "d1000001-0000-0000-0000-000000000015", "d1000001-0000-0000-0000-000000000016"]}'::jsonb, 3),

  ('e0000001-0000-0000-0000-000000000034', '1e000001-0000-0000-0000-000000000006', 'match',
   '{"type": "match", "pairs": [{"item_id": "d1000001-0000-0000-0000-000000000013", "match_type": "word_to_translation"}, {"item_id": "d1000001-0000-0000-0000-000000000014", "match_type": "word_to_translation"}, {"item_id": "d1000001-0000-0000-0000-000000000015", "match_type": "word_to_translation"}, {"item_id": "d1000001-0000-0000-0000-000000000017", "match_type": "word_to_translation"}, {"item_id": "d1000001-0000-0000-0000-000000000018", "match_type": "word_to_translation"}]}'::jsonb, 4),

  ('e0000001-0000-0000-0000-000000000035', '1e000001-0000-0000-0000-000000000006', 'speak_repeat',
   '{"type": "speak_repeat", "text": "What color is it? It is red."}'::jsonb, 5);

-- ============================================
-- EXERCISES - Lesson 8: Numbers 6-10
-- ============================================

INSERT INTO exercises (id, lesson_id, type, config, "order") VALUES
  ('e0000001-0000-0000-0000-000000000036', '1e000001-0000-0000-0000-000000000008', 'listen_tap_image',
   '{"type": "listen_tap_image", "audio_text": "six", "correct_item_id": "d1000001-0000-0000-0000-000000000028", "distractor_item_ids": ["d1000001-0000-0000-0000-000000000029", "d1000001-0000-0000-0000-000000000030", "d1000001-0000-0000-0000-000000000031"]}'::jsonb, 1),

  ('e0000001-0000-0000-0000-000000000037', '1e000001-0000-0000-0000-000000000008', 'listen_tap_image',
   '{"type": "listen_tap_image", "audio_text": "ten", "correct_item_id": "d1000001-0000-0000-0000-000000000032", "distractor_item_ids": ["d1000001-0000-0000-0000-000000000028", "d1000001-0000-0000-0000-000000000029", "d1000001-0000-0000-0000-000000000030"]}'::jsonb, 2),

  ('e0000001-0000-0000-0000-000000000038', '1e000001-0000-0000-0000-000000000008', 'read_choose',
   '{"type": "read_choose", "question": "What does \"eight\" mean?", "correct_item_id": "d1000001-0000-0000-0000-000000000030", "distractor_item_ids": ["d1000001-0000-0000-0000-000000000028", "d1000001-0000-0000-0000-000000000029", "d1000001-0000-0000-0000-000000000031"]}'::jsonb, 3),

  ('e0000001-0000-0000-0000-000000000039', '1e000001-0000-0000-0000-000000000008', 'match',
   '{"type": "match", "pairs": [{"item_id": "d1000001-0000-0000-0000-000000000028", "match_type": "word_to_translation"}, {"item_id": "d1000001-0000-0000-0000-000000000029", "match_type": "word_to_translation"}, {"item_id": "d1000001-0000-0000-0000-000000000030", "match_type": "word_to_translation"}, {"item_id": "d1000001-0000-0000-0000-000000000031", "match_type": "word_to_translation"}, {"item_id": "d1000001-0000-0000-0000-000000000032", "match_type": "word_to_translation"}]}'::jsonb, 4),

  ('e0000001-0000-0000-0000-000000000040', '1e000001-0000-0000-0000-000000000008', 'speak_repeat',
   '{"type": "speak_repeat", "text": "six seven eight nine ten"}'::jsonb, 5);

-- ============================================
-- EXERCISES - Lesson 9: Counting Practice
-- ============================================

INSERT INTO exercises (id, lesson_id, type, config, "order") VALUES
  ('e0000001-0000-0000-0000-000000000041', '1e000001-0000-0000-0000-000000000009', 'order_words',
   '{"type": "order_words", "sentence_en": "one two three four five", "sentence_pt": "um dois três quatro cinco", "words": ["five", "two", "one", "four", "three"], "correct_order": [2, 1, 4, 3, 0]}'::jsonb, 1),

  ('e0000001-0000-0000-0000-000000000042', '1e000001-0000-0000-0000-000000000009', 'order_words',
   '{"type": "order_words", "sentence_en": "six seven eight nine ten", "sentence_pt": "seis sete oito nove dez", "words": ["ten", "seven", "six", "nine", "eight"], "correct_order": [2, 1, 4, 3, 0]}'::jsonb, 2),

  ('e0000001-0000-0000-0000-000000000043', '1e000001-0000-0000-0000-000000000009', 'match',
   '{"type": "match", "pairs": [{"item_id": "d1000001-0000-0000-0000-000000000023", "match_type": "word_to_translation"}, {"item_id": "d1000001-0000-0000-0000-000000000025", "match_type": "word_to_translation"}, {"item_id": "d1000001-0000-0000-0000-000000000027", "match_type": "word_to_translation"}, {"item_id": "d1000001-0000-0000-0000-000000000029", "match_type": "word_to_translation"}]}'::jsonb, 3),

  ('e0000001-0000-0000-0000-000000000044', '1e000001-0000-0000-0000-000000000009', 'listen_tap_image',
   '{"type": "listen_tap_image", "audio_text": "five", "correct_item_id": "d1000001-0000-0000-0000-000000000027", "distractor_item_ids": ["d1000001-0000-0000-0000-000000000023", "d1000001-0000-0000-0000-000000000028", "d1000001-0000-0000-0000-000000000032"]}'::jsonb, 4),

  ('e0000001-0000-0000-0000-000000000045', '1e000001-0000-0000-0000-000000000009', 'speak_repeat',
   '{"type": "speak_repeat", "text": "one two three four five six seven eight nine ten"}'::jsonb, 5);

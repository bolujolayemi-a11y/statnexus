-- Remaining test results data from Supabase
-- This file contains the rest of the test results that couldn't fit in the previous files
-- Run this in CockroachDB Cloud SQL Editor after the other test results files

-- Note: Due to the large size of the original data, you may need to break this into smaller chunks
-- or use the Node.js import script instead: node server/scripts/import-supabase.js

-- Sample format for remaining records (you'll need to add all your remaining data here):
INSERT INTO "public"."test_results" ("id", "user_id", "exam_type", "score", "questions_count", "completed_at", "duration_minutes", "user_answers", "questions") VALUES 
-- Add your remaining test results here following the same pattern
-- Each record should follow this format:
-- ('uuid', 'user-uuid', 'exam-type', score, questions_count, 'timestamp', duration, 'json-answers', 'json-questions'),

-- For the records with null user_answers and questions, use:
('66563869-0731-4be2-8c62-788e8e855d45', 'b3794968-d8d7-462b-b89e-2ac5be2fc97b', 'General', 80, 10, '2026-06-02 19:06:34.234564+00', 3, null, null),
('677587d6-88bf-4a13-b54a-12bccb0ced0d', 'b27b770e-17df-49a0-b1b2-2e8a3d4a1196', 'General', 80, 10, '2026-06-02 19:08:34.844055+00', 2, null, null),
('74073bb4-fcb9-4a80-8c3d-8efe049e443b', 'b27b770e-17df-49a0-b1b2-2e8a3d4a1196', 'General', 100, 10, '2026-05-31 18:14:04.419293+00', 1, null, null),
('9d36e45a-8159-42e0-a067-4a0fa0666e42', 'b27b770e-17df-49a0-b1b2-2e8a3d4a1196', 'General', 80, 10, '2026-05-31 19:09:08.196246+00', 6, null, null),
('a0bac3c5-d9ad-49bd-a851-1a89dce75446', '5845cfb5-5214-4e1c-9f99-8d2ff5d8cfd3', 'General', 80, 10, '2026-06-02 19:17:21.27033+00', 3, null, null),
('fc714808-33af-4e73-b311-c460621b6fcc', 'b27b770e-17df-49a0-b1b2-2e8a3d4a1196', 'General', 100, 10, '2026-06-02 18:47:43.403909+00', 2, null, null)
ON CONFLICT (id) DO NOTHING;

-- Add the remaining records with full JSON data here...
-- You'll need to copy them from your original export following the same pattern
-- Exported profiles data from Supabase
-- Run this in CockroachDB Cloud SQL Editor after schema migration

INSERT INTO "public"."profiles" ("id", "full_name", "updated_at", "syllabus_focus", "account_tier") VALUES 
('14d053ea-36c3-482a-b9f6-df538feeaffb', 'Emmanuel wisdom ', '2026-06-03 13:43:17.017752+00', 'NCLEX-RN', 'STANDARD'),
('2a6caed7-0a36-44b0-9669-b203d6446a74', 'Eyebiokin Aduragbemi ', '2026-06-03 15:44:21.616601+00', 'NCLEX-RN', 'STANDARD'),
('2c46c58d-1faf-4507-9a52-cad53e81caa0', 'Olatunde Henry', '2026-06-03 13:34:00.191181+00', 'NCLEX-RN', 'STANDARD'),
('36f06eb5-d83e-4414-8661-0e79f83e710c', 'Olofinnika Oluwatosin Foluke ', '2026-06-02 19:23:39.776618+00', 'NCLEX-RN', 'STANDARD'),
('3b17b457-ac9c-4a00-ba6f-ad2072bb0458', 'Catherine Adegoke', '2026-06-03 18:53:36.761269+00', 'NCLEX-RN', 'STANDARD'),
('3e4ddd4e-dd0d-4a69-9b9f-339697dc2415', 'Moryam Ismail', '2026-06-03 13:35:16.890598+00', 'NCLEX-RN', 'STANDARD'),
('412f705f-0bda-4ef5-8c89-d21b8140b156', 'Temiloluwa Bankole ', '2026-06-03 13:40:23.175461+00', 'NCLEX-RN', 'STANDARD'),
('4efb4adc-0e6b-41e0-b1d6-6a003a8e64b7', 'Akanbi Abigail ', '2026-06-03 13:39:30.257681+00', 'NCLEX-RN', 'STANDARD'),
('55ac0b2c-ae0e-49d3-ab9d-73af6eea492e', 'Falodi Oluwaseun Adeola ', '2026-06-03 14:43:12.696906+00', 'NCLEX-RN', 'STANDARD'),
('5845cfb5-5214-4e1c-9f99-8d2ff5d8cfd3', 'Olasegiri Bode Joseph ', '2026-06-02 19:14:22.961211+00', 'NCLEX-RN', 'STANDARD'),
('6e8ea4da-3dc8-4773-97e9-89661b83f445', 'Mokoena Mohau ', '2026-06-16 14:17:57.417951+00', 'NCLEX-RN', 'STANDARD'),
('7533e860-2a30-4e7c-9cff-491f1a91531a', 'Temitope ', '2026-06-03 14:47:19.627986+00', 'NCLEX-RN', 'STANDARD'),
('76c861f0-5d46-41ad-a279-c42f87920c87', 'Ayobola Praise ', '2026-06-03 14:12:44.406112+00', 'NCLEX-RN', 'STANDARD'),
('901bf883-5126-4e82-aaa2-7f09cb40e4f1', 'Ibeh chioma Elizabeth ', '2026-06-03 09:34:36.885419+00', 'NCLEX-RN', 'STANDARD'),
('9c3e63e3-3645-4e74-b9b9-b9971bbd8288', 'Dahunsi Glory Oluwanifemi', '2026-06-03 14:05:13.718478+00', 'NCLEX-RN', 'STANDARD'),
('b27b770e-17df-49a0-b1b2-2e8a3d4a1196', 'Boluwatife ', '2026-05-31 18:12:27.613586+00', 'NCLEX-RN', 'STANDARD'),
('b3794968-d8d7-462b-b89e-2ac5be2fc97b', 'Oyekusibe Faith Inumidun ', '2026-06-02 19:03:49.419287+00', 'NCLEX-RN', 'STANDARD'),
('b579a891-4c5b-42f7-8d2a-b3ef4336cc03', 'Omotayo Olamide Inioluwa ', '2026-06-03 13:27:15.073592+00', 'NCLEX-RN', 'STANDARD'),
('bd05b415-a0ef-439a-9e57-0aaf9ab6e00a', 'Adetuwo Blessing ', '2026-06-03 14:00:17.260643+00', 'NCLEX-RN', 'STANDARD'),
('c55d9a81-06b6-459a-8817-e1c693b8b5d7', 'Alli Praise ', '2026-06-03 13:39:22.308021+00', 'NCLEX-RN', 'STANDARD'),
('ccd51867-fee3-4f93-8c9b-392cc1ad0ed8', 'Akinyemi Faithful ', '2026-06-03 14:00:48.838533+00', 'NCLEX-RN', 'STANDARD')
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  updated_at = EXCLUDED.updated_at,
  syllabus_focus = EXCLUDED.syllabus_focus,
  account_tier = EXCLUDED.account_tier;
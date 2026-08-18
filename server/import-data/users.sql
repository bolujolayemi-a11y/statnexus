-- Exported users from Supabase auth.users
-- Import this FIRST to CockroachDB before profiles and test_results

INSERT INTO users (id, email, password_hash, created_at, email_verified) VALUES
('ae10ec71-bb6e-445f-a57f-d693d388fad4', 'doe@gmail.com', '$2a$10$yBT3ZnY/uvVtbFjtNHgoR.OLWTSAsBsPD6Z40SKDbSlVyZsizncKe', '2026-05-31 14:41:59.453524+00', true),
('b27b770e-17df-49a0-b1b2-2e8a3d4a1196', 'bolujolayemi@gmail.com', '$2a$10$6rEVMZraL9aY0.Pxm3va6eGZYbF/Vf8oVTd/cg//r1vEt.LgUx1iO', '2026-05-31 18:12:27.614572+00', true),
('b3794968-d8d7-462b-b89e-2ac5be2fc97b', 'faithoyekusibe@gmail.com', '$2a$10$tKfRO80Jm8HIq7EQf6UBh.46PdRmU1KueJ/rXliZ6Tuxkmu0IhsXe', '2026-06-02 19:03:49.420162+00', true),
('5845cfb5-5214-4e1c-9f99-8d2ff5d8cfd3', 'bodeolasegiri@gmail.com', '$2a$10$wW7aXny3q2QNCO0T.AQL7u2m04rvTrgxWACVjYrqbN7kLK8mPayP6', '2026-06-02 19:14:22.961595+00', true),
('36f06eb5-d83e-4414-8661-0e79f83e710c', 'olofinnikatosin.2018@gmail.com', '$2a$10$b9yJavbZT3Rm8rbu3o9DXerO536AkJvzVI0bXZAFz3pSfCaJTT9eq', '2026-06-02 19:23:39.7776+00', true),
('901bf883-5126-4e82-aaa2-7f09cb40e4f1', 'chiomaibeh727@gmail.com', '$2a$10$PpLE7AtRY/o3OHiCnWLv..0vtElORA.Bbcyi6pUK9gsfY.LWurlBe', '2026-06-03 09:34:36.88576+00', true),
('b579a891-4c5b-42f7-8d2a-b3ef4336cc03', 'omotayoolamide326@gmail.com', '$2a$10$tOaV0irsb3QMYWjSw7RhBOryrwzK8hWBrn6Vnxcjy3aZnW2yZrNKa', '2026-06-03 13:27:15.073932+00', true),
('2c46c58d-1faf-4507-9a52-cad53e81caa0', 'henrypraise952@gmail.com', '$2a$10$EerwjB0h.60g47XoTVVzsusRzMnBSBk3GHyIOl.qICJBahnQ/vHDq', '2026-06-03 13:34:00.192153+00', true),
('3e4ddd4e-dd0d-4a69-9b9f-339697dc2415', 'm.balogun600@gmail.com', '$2a$10$4tbae93gV.SFWoKmO7Qt7.IRUlO2nrmD7LAecKzmnZ0rLD3n9FYSW', '2026-06-03 13:35:16.892466+00', true),
('c55d9a81-06b6-459a-8817-e1c693b8b5d7', 'allipraise94@gmail.com', '$2a$10$zF5rOV0JAwlkdhxCswVsM.u9.ZkNSVwpQgzzxwoBKvGiFGoVwCtPa', '2026-06-03 13:39:22.308321+00', true),
('4efb4adc-0e6b-41e0-b1d6-6a003a8e64b7', 'akanbimodupeoluwa1@gmail.com', '$2a$10$BGWzPY/yia8FpnNGxduCfuH2MyUGHYnJQ3G8d1M7Bb039cu/VZjUi', '2026-06-03 13:39:30.257989+00', true),
('412f705f-0bda-4ef5-8c89-d21b8140b156', 'temiloluwamorolake2@gmail.com', '$2a$10$OxgfepF50ik/YurdqcVoQuN9QNWlvV.CIAg.FwFbQ4.M/r.9HVGi6', '2026-06-03 13:40:23.175768+00', true),
('14d053ea-36c3-482a-b9f6-df538feeaffb', 'oluwafunmilola2006@gmail.com', '$2a$10$kpvFVEcMndcyC8k3XXcppevAGEPEfgbKXLIR/5H35NExufJmsCCfW', '2026-06-03 13:43:17.018082+00', true),
('bd05b415-a0ef-439a-9e57-0aaf9ab6e00a', 'blessingadetuwo3@gmail.com', '$2a$10$SJZaHkXJj.7Fi62htyMLiO3nBbRLrNcSu5UNC4Fu79rVhGgtCd28e', '2026-06-03 14:00:17.262481+00', true),
('ccd51867-fee3-4f93-8c9b-392cc1ad0ed8', 'faithfulolamide7@gmail.com', '$2a$10$cLqUUvY.MP9JmEFbtYcxBuuINB4Du.IClOytQSp80h7CdeOM/UuW.', '2026-06-03 14:00:48.840338+00', true),
('9c3e63e3-3645-4e74-b9b9-b9971bbd8288', 'dahunsiglory100@gmail.com', '$2a$10$0JtDGFimIYO8qxSuUmkTLuYcTLtqBjT7cbgkuVoumfEp3OzrEMy4.', '2026-06-03 14:05:13.719524+00', true),
('76c861f0-5d46-41ad-a279-c42f87920c87', 'olaniyanayobola@gmail.com', '$2a$10$hX2J6fsBZaX3.OsUoEnn.e0zXd/gEn0ZR4Mhh6vsvTetpOEF9/HDS', '2026-06-03 14:12:44.407044+00', true),
('55ac0b2c-ae0e-49d3-ab9d-73af6eea492e', 'oluwaseunadeola03@gmail.com', '$2a$10$PM2e0xIuz7spZRMvrBCfRu5lMizdZbS7XfcGkI5LdZbAXW52WV6Je', '2026-06-03 14:43:12.697253+00', true),
('7533e860-2a30-4e7c-9cff-491f1a91531a', 'oluwabamiseariyo@gmail.com', '$2a$10$ap9AeBJA9q6he/yU7I.hx.8Y/OOWJpcHxT6.8UhetyGmUKCglMT7W', '2026-06-03 14:47:19.628324+00', true),
('2a6caed7-0a36-44b0-9669-b203d6446a74', 'eyebiokinaduragbemi0@gmail.com', '$2a$10$/ySIKAEJJ1IfI0KXwyU8uedDkC92YhhgjLqxXBL4ze0uwv5jFhYwq', '2026-06-03 15:44:21.617613+00', true),
('3b17b457-ac9c-4a00-ba6f-ad2072bb0458', 'catherineadegoke4@gmail.com', '$2a$10$BBkoT74dhAcRCUiHZ1f2GufpIKVb0b5qJeovOLUpukz.Hj2xr3E1e', '2026-06-03 18:53:36.761626+00', true),
('6e8ea4da-3dc8-4773-97e9-89661b83f445', 'sybalhauzen1@gmail.com', '$2a$10$VBJ5GBJs9EfM6THAMJ.zW.PgSqqFk7dU8CUw87lEATQaAfBH4AyyS', '2026-06-16 14:17:57.418316+00', true)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  password_hash = EXCLUDED.password_hash,
  email_verified = EXCLUDED.email_verified;
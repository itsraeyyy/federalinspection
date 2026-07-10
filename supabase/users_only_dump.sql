SET session_replication_role = replica;

--
-- PostgreSQL database dump
--

-- \restrict czKsYbnKtCjZ8QcmyOmNtswOXVVvfa4horkTxoJvrC1lwTiVfcDhR48U3t7qfRR

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: custom_oauth_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."users" ("instance_id", "id", "aud", "role", "email", "encrypted_password", "email_confirmed_at", "invited_at", "confirmation_token", "confirmation_sent_at", "recovery_token", "recovery_sent_at", "email_change_token_new", "email_change", "email_change_sent_at", "last_sign_in_at", "raw_app_meta_data", "raw_user_meta_data", "is_super_admin", "created_at", "updated_at", "phone", "phone_confirmed_at", "phone_change", "phone_change_token", "phone_change_sent_at", "email_change_token_current", "email_change_confirm_status", "banned_until", "reauthentication_token", "reauthentication_sent_at", "is_sso_user", "deleted_at", "is_anonymous") VALUES
	('00000000-0000-0000-0000-000000000000', '7abb9cef-fcf9-4595-8a4f-0df734cc1d49', 'authenticated', 'authenticated', 'rep_e18bb5e1@seed.local', '$2a$10$XooEj0km6NnCqz1JPWi2aeAPAavwbRyhX/Je0zRBDmkJc.BHkqhCe', '2026-07-10 12:44:02.5155+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"email_verified": true}', NULL, '2026-07-10 12:44:02.511475+00', '2026-07-10 12:44:02.516075+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'b8fcb741-2f9b-41d8-b9c5-4a279051153a', 'authenticated', 'authenticated', 'superadmin@commission.gov', '$2a$10$bwn4XdPK7stbQXABHkPave7i.QUxBH6IZerLelQkXtiC7O1ZXjLOy', '2026-06-25 09:22:28.318429+00', NULL, '', NULL, '', NULL, '', '', NULL, '2026-07-10 10:42:55.401337+00', '{"provider": "email", "providers": ["email"]}', '{"email_verified": true}', NULL, '2026-06-25 09:22:28.313192+00', '2026-07-10 10:42:55.403985+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '653239dc-63f5-4f2d-8d37-683c6d123762', 'authenticated', 'authenticated', 'rep_e18890e1@seed.local', '$2a$10$I6eJu7TAkdA6wVp5hmPgwuiIrH903I0aNLb7OuN.2WkgFMPonN29O', '2026-07-10 12:44:01.853213+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"email_verified": true}', NULL, '2026-07-10 12:44:01.848716+00', '2026-07-10 12:44:01.853697+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '0e4baf40-5658-4213-a461-6f4e28c33cdb', 'authenticated', 'authenticated', 'alazartesema1@gmail.com', '$2a$10$ti8T5t4/jD.N/GXmBgTuI.PoesE0O6OHlQO1Qvslkk0VY8OdjQUk.', '2026-06-25 12:30:47.201937+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"email_verified": true}', NULL, '2026-06-25 12:30:47.195384+00', '2026-06-25 12:30:47.202927+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '26bbe23b-6252-434e-aa40-e402d6dea20d', 'authenticated', 'authenticated', 'rep_e18aa0e1@seed.local', '$2a$10$Vk7cWBZooPDwK1xW9VkBqONOAjbVKfvncVZ9/qKYYBxWkW9kOd8.a', '2026-07-10 12:44:01.297045+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"email_verified": true}', NULL, '2026-07-10 12:44:01.292261+00', '2026-07-10 12:44:01.297686+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '2cd58af9-e91a-47dc-8e92-5f9ff38cbf8e', 'authenticated', 'authenticated', 'superadmin@commision.gov', '$2a$10$9G2KajEB3VcsZrjdj4WS3.kqCywH8osF1dWCvg0MA.p1L.eYfVUW.', '2026-06-25 09:20:45.581567+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"email_verified": true}', NULL, '2026-06-25 09:20:45.576263+00', '2026-06-25 09:20:45.582278+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'e2960f47-cf20-4df9-bce2-edb4f9029463', 'authenticated', 'authenticated', 'rep_e18bb0e1@seed.local', '$2a$10$A1F1PJq7a7DNSdqlN3iIqui2YqLVmKjxmOmfZQ3SyQ61TvU6Gc6Bi', '2026-07-10 12:44:02.223712+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"email_verified": true}', NULL, '2026-07-10 12:44:02.218173+00', '2026-07-10 12:44:02.224376+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'fd4661a9-d7ba-46ef-b63b-25d886ad1a99', 'authenticated', 'authenticated', 'federalinspection34@gmail.com', '$2a$10$MYhE1O7Z9DGUa4NnvAcJ..6Me5zEReJbnn2kChyFc4PT2cxVKliyC', '2026-06-25 12:33:39.526583+00', NULL, '', NULL, '', NULL, '', '', NULL, '2026-06-25 12:34:04.955755+00', '{"provider": "email", "providers": ["email"]}', '{"email_verified": true}', NULL, '2026-06-25 12:33:39.522085+00', '2026-06-25 12:34:13.841788+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '62d73d76-fd79-4a72-a718-d6b66b259511', 'authenticated', 'authenticated', 'rep_e188b6e1@seed.local', '$2a$10$GSwoGLsrGeLktdqKgS38YeIkx/gF.P3YmZaicnmHpOmsEUqn5Wviy', '2026-07-10 12:44:01.431586+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"email_verified": true}', NULL, '2026-07-10 12:44:01.426707+00', '2026-07-10 12:44:01.432272+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'e781b401-2ef0-4446-9c99-ec0ccab27472', 'authenticated', 'authenticated', 'rep_e188b2e1@seed.local', '$2a$10$2ZgJUohISNNiijXxbiyRnOk2HJ5Fll6GOi/ZDbvZ/HPR3Izkqd2w.', '2026-07-10 12:44:01.978517+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"email_verified": true}', NULL, '2026-07-10 12:44:01.973428+00', '2026-07-10 12:44:01.9793+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '0a1c41a5-39d5-42dd-ad35-5f49d97083a5', 'authenticated', 'authenticated', 'rep_e189a4e1@seed.local', '$2a$10$pgDzi.XDmRXky/wsU7LY7uEVnhIKdgSxaYtiYd2sgJ8egIM3dwWGC', '2026-07-10 12:44:01.611087+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"email_verified": true}', NULL, '2026-07-10 12:44:01.605213+00', '2026-07-10 12:44:01.611577+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '567eeff7-4deb-4ce9-b394-8414f8c534ac', 'authenticated', 'authenticated', 'rep_e18c8be1@seed.local', '$2a$10$FF85VA84nyqapEY252fSKeX8ZJXeF11v1vsc5UfVBLHLVmi7YOHoW', '2026-07-10 12:44:01.7334+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"email_verified": true}', NULL, '2026-07-10 12:44:01.728643+00', '2026-07-10 12:44:01.734057+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'c852a4fc-8bd7-4882-9cd3-a43c6d407e21', 'authenticated', 'authenticated', 'rep_e18aa6e1@seed.local', '$2a$10$4L4q7wKi/8m.AjCJXBNbi.rQNARGiY3lnAKkg5QREgvSmnsItdKcK', '2026-07-10 12:44:01.164025+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"email_verified": true}', NULL, '2026-07-10 12:44:01.156649+00', '2026-07-10 12:44:01.164831+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '9789e7e8-7877-4aaf-ab16-4c63c4c3bfbe', 'authenticated', 'authenticated', 'rep_e1889be1@seed.local', '$2a$10$UaVA2DEPzV60Ho/7xVqSjOTPPLuPLvY/C8AIU6MFQ2l9motW3Ys2i', '2026-07-10 12:44:02.354531+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"email_verified": true}', NULL, '2026-07-10 12:44:02.349518+00', '2026-07-10 12:44:02.355449+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'e9ba6046-89dc-440f-b5aa-bc114208090f', 'authenticated', 'authenticated', 'rep_e18bb02f@seed.local', '$2a$10$.1txzoyDqnfUFOuSqAhhTus4U0NGVLVbKRZ.4TgHlFDlG5JvG.rWO', '2026-07-10 12:44:02.098909+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"email_verified": true}', NULL, '2026-07-10 12:44:02.093677+00', '2026-07-10 12:44:02.099505+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'a38b4ed4-fdcf-4b3e-aec9-1a41392f4bba', 'authenticated', 'authenticated', 'admin@commission.gov', '$2a$10$R7BKRYnS5Fd5o1ELlHsXfeGImdhQgKw57BV19vfOqHa.hCWSpSZvK', '2026-06-25 09:09:38.021152+00', NULL, '', NULL, '', NULL, '', '', NULL, '2026-07-10 13:53:03.537601+00', '{"provider": "email", "providers": ["email"]}', '{"email_verified": true}', NULL, '2026-06-25 09:09:38.015258+00', '2026-07-10 13:53:03.541523+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '3dc86042-2d61-40d9-b5fc-9ca089e619ab', 'authenticated', 'authenticated', 'rep_e18d8ce1@seed.local', '$2a$10$eaa8DfA7hq/n.abrxjfYnuy3AqgMfKs9cEXWURC7veiLCf2bhFPtq', '2026-07-10 12:44:02.641399+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"email_verified": true}', NULL, '2026-07-10 12:44:02.636621+00', '2026-07-10 12:44:02.642147+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '66390954-3da4-40a9-b08a-0354f13d8d5e', 'authenticated', 'authenticated', '251928406415@federal.local', '$2a$10$fKrBnM2j8LWO8C0ZK9aElO8t2NU4zxLPJu1HT8qu/zz6LHchPv0vS', '2026-07-10 13:49:11.530297+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"phone": "+251928406415", "full_name": "TEST14", "email_verified": true, "force_password_change": true}', NULL, '2026-07-10 13:49:11.524952+00', '2026-07-10 13:49:11.531055+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '9f637b7d-7015-4226-90a9-88abed31f3ae', 'authenticated', 'authenticated', '251987279591@federal.local', '$2a$10$UrgjxcYK19/.SLWJds4srO1wwi3oH2.sPNxJ7/02QgZq9NTtX9CeS', '2026-07-10 14:00:47.410499+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"phone": "+251987279591", "full_name": "test12", "email_verified": true, "force_password_change": true}', NULL, '2026-07-10 13:48:45.720172+00', '2026-07-10 14:00:47.418828+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '89d32615-1d2e-4669-be21-d5a824171db0', 'authenticated', 'authenticated', '251938560597@federal.local', '$2a$10$AQi2fRM99EoCaGXQK/gbjutgIXqY5OiLmJtxJPpoxQ3y2Zw8ewVk6', '2026-07-10 14:02:01.67486+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"phone": "+251938560597", "full_name": "test33", "email_verified": true, "force_password_change": true}', NULL, '2026-07-10 13:47:42.415769+00', '2026-07-10 14:02:01.683579+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false) ON CONFLICT DO NOTHING;


--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."identities" ("provider_id", "user_id", "identity_data", "provider", "last_sign_in_at", "created_at", "updated_at", "id") VALUES
	('a38b4ed4-fdcf-4b3e-aec9-1a41392f4bba', 'a38b4ed4-fdcf-4b3e-aec9-1a41392f4bba', '{"sub": "a38b4ed4-fdcf-4b3e-aec9-1a41392f4bba", "email": "admin@commission.gov", "email_verified": false, "phone_verified": false}', 'email', '2026-06-25 09:09:38.017608+00', '2026-06-25 09:09:38.017647+00', '2026-06-25 09:09:38.017647+00', '33f87abc-9a33-48b2-a107-6daa2148a878'),
	('2cd58af9-e91a-47dc-8e92-5f9ff38cbf8e', '2cd58af9-e91a-47dc-8e92-5f9ff38cbf8e', '{"sub": "2cd58af9-e91a-47dc-8e92-5f9ff38cbf8e", "email": "superadmin@commision.gov", "email_verified": false, "phone_verified": false}', 'email', '2026-06-25 09:20:45.578151+00', '2026-06-25 09:20:45.578182+00', '2026-06-25 09:20:45.578182+00', 'a718632e-0353-4439-9718-0874b7c54a54'),
	('b8fcb741-2f9b-41d8-b9c5-4a279051153a', 'b8fcb741-2f9b-41d8-b9c5-4a279051153a', '{"sub": "b8fcb741-2f9b-41d8-b9c5-4a279051153a", "email": "superadmin@commission.gov", "email_verified": false, "phone_verified": false}', 'email', '2026-06-25 09:22:28.315201+00', '2026-06-25 09:22:28.31523+00', '2026-06-25 09:22:28.31523+00', 'e0974d39-a5fc-4452-99fc-b16d68e552bb'),
	('0e4baf40-5658-4213-a461-6f4e28c33cdb', '0e4baf40-5658-4213-a461-6f4e28c33cdb', '{"sub": "0e4baf40-5658-4213-a461-6f4e28c33cdb", "email": "alazartesema1@gmail.com", "email_verified": false, "phone_verified": false}', 'email', '2026-06-25 12:30:47.197906+00', '2026-06-25 12:30:47.19793+00', '2026-06-25 12:30:47.19793+00', 'c617fbb5-2c6f-41f9-9bea-e02c42312ae7'),
	('fd4661a9-d7ba-46ef-b63b-25d886ad1a99', 'fd4661a9-d7ba-46ef-b63b-25d886ad1a99', '{"sub": "fd4661a9-d7ba-46ef-b63b-25d886ad1a99", "email": "federalinspection34@gmail.com", "email_verified": false, "phone_verified": false}', 'email', '2026-06-25 12:33:39.524047+00', '2026-06-25 12:33:39.524073+00', '2026-06-25 12:33:39.524073+00', '478fe471-6fb3-4dcd-a5dd-bfa4b77526cd'),
	('c852a4fc-8bd7-4882-9cd3-a43c6d407e21', 'c852a4fc-8bd7-4882-9cd3-a43c6d407e21', '{"sub": "c852a4fc-8bd7-4882-9cd3-a43c6d407e21", "email": "rep_e18aa6e1@seed.local", "email_verified": false, "phone_verified": false}', 'email', '2026-07-10 12:44:01.160439+00', '2026-07-10 12:44:01.160509+00', '2026-07-10 12:44:01.160509+00', 'a972c15b-202e-44e1-bf8a-a6b002674317'),
	('26bbe23b-6252-434e-aa40-e402d6dea20d', '26bbe23b-6252-434e-aa40-e402d6dea20d', '{"sub": "26bbe23b-6252-434e-aa40-e402d6dea20d", "email": "rep_e18aa0e1@seed.local", "email_verified": false, "phone_verified": false}', 'email', '2026-07-10 12:44:01.294545+00', '2026-07-10 12:44:01.294572+00', '2026-07-10 12:44:01.294572+00', '376f24a6-1ef4-4bab-8674-f0fbbfe82a55'),
	('62d73d76-fd79-4a72-a718-d6b66b259511', '62d73d76-fd79-4a72-a718-d6b66b259511', '{"sub": "62d73d76-fd79-4a72-a718-d6b66b259511", "email": "rep_e188b6e1@seed.local", "email_verified": false, "phone_verified": false}', 'email', '2026-07-10 12:44:01.428891+00', '2026-07-10 12:44:01.428921+00', '2026-07-10 12:44:01.428921+00', '86b276f1-cc5d-4288-9d02-521e8c4c09fc'),
	('0a1c41a5-39d5-42dd-ad35-5f49d97083a5', '0a1c41a5-39d5-42dd-ad35-5f49d97083a5', '{"sub": "0a1c41a5-39d5-42dd-ad35-5f49d97083a5", "email": "rep_e189a4e1@seed.local", "email_verified": false, "phone_verified": false}', 'email', '2026-07-10 12:44:01.608228+00', '2026-07-10 12:44:01.608272+00', '2026-07-10 12:44:01.608272+00', 'e7050710-05b3-4919-bffa-6d240f560822'),
	('567eeff7-4deb-4ce9-b394-8414f8c534ac', '567eeff7-4deb-4ce9-b394-8414f8c534ac', '{"sub": "567eeff7-4deb-4ce9-b394-8414f8c534ac", "email": "rep_e18c8be1@seed.local", "email_verified": false, "phone_verified": false}', 'email', '2026-07-10 12:44:01.730831+00', '2026-07-10 12:44:01.730856+00', '2026-07-10 12:44:01.730856+00', 'a5202a97-7e7e-40e2-9513-cca54d04fbf7'),
	('653239dc-63f5-4f2d-8d37-683c6d123762', '653239dc-63f5-4f2d-8d37-683c6d123762', '{"sub": "653239dc-63f5-4f2d-8d37-683c6d123762", "email": "rep_e18890e1@seed.local", "email_verified": false, "phone_verified": false}', 'email', '2026-07-10 12:44:01.850719+00', '2026-07-10 12:44:01.850748+00', '2026-07-10 12:44:01.850748+00', '5c445bfc-06e3-4254-a01d-0b34814c18e8'),
	('e781b401-2ef0-4446-9c99-ec0ccab27472', 'e781b401-2ef0-4446-9c99-ec0ccab27472', '{"sub": "e781b401-2ef0-4446-9c99-ec0ccab27472", "email": "rep_e188b2e1@seed.local", "email_verified": false, "phone_verified": false}', 'email', '2026-07-10 12:44:01.975489+00', '2026-07-10 12:44:01.975518+00', '2026-07-10 12:44:01.975518+00', '9e44db96-75ae-445a-b46f-cfcf56613348'),
	('e9ba6046-89dc-440f-b5aa-bc114208090f', 'e9ba6046-89dc-440f-b5aa-bc114208090f', '{"sub": "e9ba6046-89dc-440f-b5aa-bc114208090f", "email": "rep_e18bb02f@seed.local", "email_verified": false, "phone_verified": false}', 'email', '2026-07-10 12:44:02.096111+00', '2026-07-10 12:44:02.096137+00', '2026-07-10 12:44:02.096137+00', '69ef564b-bb36-4ee2-b983-1655d23c64a3'),
	('e2960f47-cf20-4df9-bce2-edb4f9029463', 'e2960f47-cf20-4df9-bce2-edb4f9029463', '{"sub": "e2960f47-cf20-4df9-bce2-edb4f9029463", "email": "rep_e18bb0e1@seed.local", "email_verified": false, "phone_verified": false}', 'email', '2026-07-10 12:44:02.220194+00', '2026-07-10 12:44:02.220222+00', '2026-07-10 12:44:02.220222+00', '433938a0-9754-4ff9-86e4-dcc1ea8cea70'),
	('9789e7e8-7877-4aaf-ab16-4c63c4c3bfbe', '9789e7e8-7877-4aaf-ab16-4c63c4c3bfbe', '{"sub": "9789e7e8-7877-4aaf-ab16-4c63c4c3bfbe", "email": "rep_e1889be1@seed.local", "email_verified": false, "phone_verified": false}', 'email', '2026-07-10 12:44:02.35173+00', '2026-07-10 12:44:02.35176+00', '2026-07-10 12:44:02.35176+00', '7beb66b5-f76f-4e87-872c-7082f172887e'),
	('7abb9cef-fcf9-4595-8a4f-0df734cc1d49', '7abb9cef-fcf9-4595-8a4f-0df734cc1d49', '{"sub": "7abb9cef-fcf9-4595-8a4f-0df734cc1d49", "email": "rep_e18bb5e1@seed.local", "email_verified": false, "phone_verified": false}', 'email', '2026-07-10 12:44:02.51325+00', '2026-07-10 12:44:02.513274+00', '2026-07-10 12:44:02.513274+00', 'cee0934e-e0ce-4755-94b9-1b3295500948'),
	('3dc86042-2d61-40d9-b5fc-9ca089e619ab', '3dc86042-2d61-40d9-b5fc-9ca089e619ab', '{"sub": "3dc86042-2d61-40d9-b5fc-9ca089e619ab", "email": "rep_e18d8ce1@seed.local", "email_verified": false, "phone_verified": false}', 'email', '2026-07-10 12:44:02.638766+00', '2026-07-10 12:44:02.6388+00', '2026-07-10 12:44:02.6388+00', '548b4b49-19a6-4cce-9183-cf3c2f7df12e'),
	('66390954-3da4-40a9-b08a-0354f13d8d5e', '66390954-3da4-40a9-b08a-0354f13d8d5e', '{"sub": "66390954-3da4-40a9-b08a-0354f13d8d5e", "email": "251928406415@federal.local", "email_verified": false, "phone_verified": false}', 'email', '2026-07-10 13:49:11.526845+00', '2026-07-10 13:49:11.526876+00', '2026-07-10 13:49:11.526876+00', '0bce03ea-b708-4774-a58e-918d66cf434f'),
	('9f637b7d-7015-4226-90a9-88abed31f3ae', '9f637b7d-7015-4226-90a9-88abed31f3ae', '{"sub": "9f637b7d-7015-4226-90a9-88abed31f3ae", "email": "251987279591@federal.local", "email_verified": true, "phone_verified": false}', 'email', '2026-07-10 13:48:45.722163+00', '2026-07-10 13:48:45.722193+00', '2026-07-10 13:48:45.722193+00', '76d66e64-d039-42b2-b862-e209d92718f1'),
	('89d32615-1d2e-4669-be21-d5a824171db0', '89d32615-1d2e-4669-be21-d5a824171db0', '{"sub": "89d32615-1d2e-4669-be21-d5a824171db0", "email": "251938560597@federal.local", "email_verified": true, "phone_verified": false}', 'email', '2026-07-10 13:47:42.418503+00', '2026-07-10 13:47:42.418533+00', '2026-07-10 13:47:42.418533+00', '440a0ee3-ab58-4b38-9250-355365b8d511') ON CONFLICT DO NOTHING;


--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_clients; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_authorizations; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_client_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_consents; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: webauthn_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: webauthn_credentials; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: admin_profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."admin_profiles" ("id", "role", "permissions", "first_name", "last_name", "created_at", "updated_at", "email", "phone", "access_level", "groups", "modules", "status", "last_login", "requires_password_change") VALUES
	('b8fcb741-2f9b-41d8-b9c5-4a279051153a', 'super_admin', '{}', 'Super', 'Admin User', '2026-06-25 09:22:28.342629+00', '2026-06-25 09:22:28.342629+00', 'superadmin@commission.gov', '0911000001', 'all', '{}', '{}', 'Active', NULL, false),
	('a38b4ed4-fdcf-4b3e-aec9-1a41392f4bba', 'super_admin', '{}', 'Super', 'Admin', '2026-06-25 09:09:38.04672+00', '2026-06-25 09:09:38.04672+00', 'admin@commission.gov', '000000000', 'all', '{}', '{}', 'Active', NULL, false) ON CONFLICT DO NOTHING;


--
-- Data for Name: assessment_periods; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."users" ("id", "phone_number", "full_name", "created_at") VALUES
	('c852a4fc-8bd7-4882-9cd3-a43c6d407e21', '+251900969037', 'Rep ኦሮሚያ', '2026-07-10 12:44:01.171482+00'),
	('62d73d76-fd79-4a72-a718-d6b66b259511', '+251900152023', 'Rep ሶማሌ', '2026-07-10 12:44:01.438121+00'),
	('0a1c41a5-39d5-42dd-ad35-5f49d97083a5', '+251900256415', 'Rep ቤን-ጉሙዝ', '2026-07-10 12:44:01.618102+00'),
	('567eeff7-4deb-4ce9-b394-8414f8c534ac', '+251900666379', 'Rep ጋምቤላ', '2026-07-10 12:44:01.739145+00'),
	('653239dc-63f5-4f2d-8d37-683c6d123762', '+251900668858', 'Rep ሐረሪ', '2026-07-10 12:44:01.859545+00'),
	('e781b401-2ef0-4446-9c99-ec0ccab27472', '+251900764287', 'Rep ሲዳማ', '2026-07-10 12:44:01.98511+00'),
	('e9ba6046-89dc-440f-b5aa-bc114208090f', '+251900346639', 'Rep ደ/ም/ኢ/ያ', '2026-07-10 12:44:02.105071+00'),
	('e2960f47-cf20-4df9-bce2-edb4f9029463', '+251900866167', 'Rep ደቡብ ኢ/ያ', '2026-07-10 12:44:02.231513+00'),
	('9789e7e8-7877-4aaf-ab16-4c63c4c3bfbe', '+251900543711', 'Rep ማዕ/ኢ/ያ', '2026-07-10 12:44:02.361539+00'),
	('26bbe23b-6252-434e-aa40-e402d6dea20d', '+251900631684', 'Rep አዲስ አበባ', '2026-07-10 12:44:01.30348+00'),
	('7abb9cef-fcf9-4595-8a4f-0df734cc1d49', '+251900691965', 'Rep ድሬ ዳዋ', '2026-07-10 12:44:02.521681+00'),
	('3dc86042-2d61-40d9-b5fc-9ca089e619ab', '+251900268596', 'Rep ፌዴራል ተቋማት', '2026-07-10 12:44:02.647882+00'),
	('66390954-3da4-40a9-b08a-0354f13d8d5e', '+251928406415', 'TEST14', '2026-07-10 13:49:11.540304+00'),
	('9f637b7d-7015-4226-90a9-88abed31f3ae', '+251987279591', 'Sami', '2026-07-10 13:48:45.746541+00'),
	('89d32615-1d2e-4669-be21-d5a824171db0', '+251938560597', 'alazar', '2026-07-10 13:47:42.438665+00') ON CONFLICT DO NOTHING;


--
-- Data for Name: approver_evaluations; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: complaints; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: document_folders; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: documents; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: document_access_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: evaluations; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: feedbacks; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: final_scores; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: form_schemas; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: news_articles; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: otp_requests; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: page_views; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: period_members; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: personnel; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."personnel" ("id", "name", "name_am", "position", "position_am", "office_category", "office_category_am", "department", "email", "phone", "photo", "message", "status", "created_at", "facebook_url", "archived_at", "x_url", "linkedin_url", "whatsapp_url", "region") VALUES
	('afbac384-a7d1-4753-95d9-87c67b267984', 'test', 'test', 'Commission Member', 'ኮሚሽን አባል', 'Commission Members', 'ኮሚሽን አባላት', '', '', '', 'http://192.168.3.228:54521/storage/v1/object/public/personnel_photos/nhvp2qw5fo_1783689503093.png', NULL, 'Active', '2026-07-10 13:18:20.135993+00', '', NULL, '', '', '', NULL) ON CONFLICT DO NOTHING;


--
-- Data for Name: public_files; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: qr_codes; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: rate_limits; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: reports; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: report_feedbacks; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: reporting_profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: scan_requests; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: self_assessments; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: user_profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."user_profiles" ("user_id", "gender", "age", "education_level", "professional_field", "experience_professional", "experience_leadership", "institution", "current_responsibility_gov", "current_responsibility_com", "system_role", "created_at", "updated_at", "photo_url", "region") VALUES
	('c852a4fc-8bd7-4882-9cd3-a43c6d407e21', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'representative', '2026-07-10 12:44:01.178619+00', '2026-07-10 12:44:01.178619+00', NULL, 'ኦሮሚያ'),
	('62d73d76-fd79-4a72-a718-d6b66b259511', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'representative', '2026-07-10 12:44:01.444652+00', '2026-07-10 12:44:01.444652+00', NULL, 'ሶማሌ'),
	('0a1c41a5-39d5-42dd-ad35-5f49d97083a5', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'representative', '2026-07-10 12:44:01.623769+00', '2026-07-10 12:44:01.623769+00', NULL, 'ቤን-ጉሙዝ'),
	('567eeff7-4deb-4ce9-b394-8414f8c534ac', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'representative', '2026-07-10 12:44:01.743671+00', '2026-07-10 12:44:01.743671+00', NULL, 'ጋምቤላ'),
	('653239dc-63f5-4f2d-8d37-683c6d123762', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'representative', '2026-07-10 12:44:01.863777+00', '2026-07-10 12:44:01.863777+00', NULL, 'ሐረሪ'),
	('e781b401-2ef0-4446-9c99-ec0ccab27472', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'representative', '2026-07-10 12:44:01.990537+00', '2026-07-10 12:44:01.990537+00', NULL, 'ሲዳማ'),
	('e9ba6046-89dc-440f-b5aa-bc114208090f', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'representative', '2026-07-10 12:44:02.111112+00', '2026-07-10 12:44:02.111112+00', NULL, 'ደ/ም/ኢ/ያ'),
	('e2960f47-cf20-4df9-bce2-edb4f9029463', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'representative', '2026-07-10 12:44:02.238797+00', '2026-07-10 12:44:02.238797+00', NULL, 'ደቡብ ኢ/ያ'),
	('9789e7e8-7877-4aaf-ab16-4c63c4c3bfbe', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'representative', '2026-07-10 12:44:02.365273+00', '2026-07-10 12:44:02.365273+00', NULL, 'ማዕ/ኢ/ያ'),
	('26bbe23b-6252-434e-aa40-e402d6dea20d', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'representative', '2026-07-10 12:44:01.31144+00', '2026-07-10 12:44:01.31144+00', NULL, 'አዲስ አበባ'),
	('7abb9cef-fcf9-4595-8a4f-0df734cc1d49', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'representative', '2026-07-10 12:44:02.52712+00', '2026-07-10 12:44:02.52712+00', NULL, 'ድሬ ዳዋ'),
	('3dc86042-2d61-40d9-b5fc-9ca089e619ab', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'representative', '2026-07-10 12:44:02.653283+00', '2026-07-10 12:44:02.653283+00', NULL, 'ፌዴራል ተቋማት'),
	('66390954-3da4-40a9-b08a-0354f13d8d5e', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-10 13:49:11.557058+00', '2026-07-10 13:49:11.557058+00', NULL, NULL),
	('9f637b7d-7015-4226-90a9-88abed31f3ae', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-10 13:48:45.763195+00', '2026-07-10 13:48:45.763195+00', NULL, NULL),
	('89d32615-1d2e-4669-be21-d5a824171db0', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-10 13:47:42.454483+00', '2026-07-10 13:47:42.454483+00', NULL, NULL) ON CONFLICT DO NOTHING;


--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: buckets_analytics; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: buckets_vectors; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: iceberg_namespaces; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: iceberg_tables; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: vector_indexes; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: hooks; Type: TABLE DATA; Schema: supabase_functions; Owner: supabase_functions_admin
--



--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: supabase_auth_admin
--



--
-- Name: hooks_id_seq; Type: SEQUENCE SET; Schema: supabase_functions; Owner: supabase_functions_admin
--



--
-- PostgreSQL database dump complete
--

-- \unrestrict czKsYbnKtCjZ8QcmyOmNtswOXVVvfa4horkTxoJvrC1lwTiVfcDhR48U3t7qfRR


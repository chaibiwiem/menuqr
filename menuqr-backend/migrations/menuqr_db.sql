-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1
-- Généré le : mer. 17 juin 2026 à 11:00
-- Version du serveur : 10.4.27-MariaDB
-- Version de PHP : 8.2.0

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `menuqr_db`
--

-- --------------------------------------------------------

--
-- Structure de la table `admin_logs`
--

CREATE TABLE `admin_logs` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `admin_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `action` varchar(100) NOT NULL,
  `target_type` varchar(50) DEFAULT NULL,
  `target_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `details` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`details`)),
  `created_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `admin_logs`
--

INSERT INTO `admin_logs` (`id`, `admin_id`, `action`, `target_type`, `target_id`, `details`, `created_at`) VALUES
('01ae7d8b-48be-4d27-b97d-f3383a049fc0', '1c0a26db-a757-4f74-9645-920faa7f522c', 'CREATE_RESTAURANT', 'restaurant', 'bc763e0b-10cb-4ea2-a9ce-27fc9375e39f', '{\"name\":\"pavaroti\",\"plan\":\"PRO\",\"owner_email\":\"pavaroti@gmail.com\"}', '2026-06-07 23:07:21'),
('0407eefd-7b67-4630-9788-b6d959779cf1', '1c0a26db-a757-4f74-9645-920faa7f522c', 'UPDATE_RESTAURANT', 'restaurant', '926f35f9-1a80-4272-a0e6-ea4dd37b2118', '{\"template_id\":\"modern_theme\",\"plan\":\"PRO\",\"banner_url\":\"http://localhost:3001/uploads/delcapo-restaurant/banner.jpeg\"}', '2026-06-10 10:39:45'),
('0929ce73-9da8-4863-966b-b0523165f94d', '1c0a26db-a757-4f74-9645-920faa7f522c', 'DELETE_RESTAURANT', 'restaurant', '5324c198-08a3-436f-af04-ce89a94a8d6b', '{\"name\":\"delcapo restaurant\"}', '2026-06-08 23:28:42'),
('0e13dcba-8e7a-4f83-bac2-9083231f0af0', '1c0a26db-a757-4f74-9645-920faa7f522c', 'ACTIVATE_RESTAURANT', 'restaurant', 'f6805a7b-5726-44d0-a12a-e64f7dd61b3a', NULL, '2026-06-08 00:09:57'),
('1222027e-ce35-40ee-a7e5-db1c5cab6918', '1c0a26db-a757-4f74-9645-920faa7f522c', 'UPDATE_RESTAURANT', 'restaurant', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '{\"template_id\":\"dark_sleek\",\"plan\":\"STARTER\"}', '2026-06-15 11:27:00'),
('142ef41e-24b3-4779-97aa-6ef9bbd4e970', '1c0a26db-a757-4f74-9645-920faa7f522c', 'UPDATE_RESTAURANT', 'restaurant', 'f82bee2a-3f1b-4e8e-b489-a7851b1648f2', '{\"name\":\"Pavarotti Restaurant\",\"type\":\"Restaurant\",\"email\":\"Pavarotti@gmail.com\",\"phone\":\"+216 58 799 209\",\"address\":\"LAC 1\",\"short_description\":\"Cuisine italienne , Cocktails&Coffe, bar a Chicha\",\"social_facebook\":\"https://www.facebook.com/p/Pavarotti-cafe-resto-61572452227150/\",\"social_instagram\":\"\",\"social_tripadvisor\":\"https://www.tripadvisor.fr/Restaurant_Review-g293758-d15072462-Reviews-Pavarotti_Pasta-Tunis_Tunis_Governorate.html\",\"social_google_maps\":\" centre él halfaouine les berges du lac en face de dahdah, Tunis, Tunisia, 1053\",\"social_website\":\"\",\"social_whatsapp\":\"\"}', '2026-06-15 11:25:55'),
('184a5896-93b9-4881-bab9-c09ce7fa3a88', '1c0a26db-a757-4f74-9645-920faa7f522c', 'UPDATE_RESTAURANT', 'restaurant', '926f35f9-1a80-4272-a0e6-ea4dd37b2118', '{\"name\":\"delcapo restaurant\",\"type\":\"Restaurant\",\"email\":\"delcapo1@gmail.com\",\"phone\":\"+216 24 355 789\",\"address\":\"Marsa\",\"short_description\":\"restaurant italien tunisie\",\"social_facebook\":\"https://www.facebook.com/Delcapopasta/\",\"social_instagram\":\"https://www.instagram.com/delcapo.restaurant/\",\"social_tripadvisor\":\"\",\"social_google_maps\":\"\",\"social_website\":\"\",\"social_whatsapp\":\"\"}', '2026-06-10 10:22:24'),
('1954fca2-5c4c-4d35-9e5b-d3c32063bcdf', '1c0a26db-a757-4f74-9645-920faa7f522c', 'UPDATE_RESTAURANT', 'restaurant', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '{\"template_id\":\"dark_sleek\",\"plan\":\"STARTER\"}', '2026-06-11 14:50:02'),
('1eacab8b-ef1f-46f6-a5ce-4f670dd9e3f2', '1c0a26db-a757-4f74-9645-920faa7f522c', 'UPDATE_RESTAURANT', 'restaurant', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '{\"template_id\":\"editorial_menu\",\"plan\":\"STARTER\"}', '2026-06-11 13:09:37'),
('1f66c912-d800-4cb1-a3f0-7fa6616e177d', '1c0a26db-a757-4f74-9645-920faa7f522c', 'UPDATE_SUBSCRIPTION', 'subscription', '889db9c6-894c-4e5a-8493-6743d4ff896c', '{\"before\":{\"plan\":\"PRO\",\"status\":\"ACTIVE\"},\"after\":{\"plan\":\"PRO\",\"status\":\"ACTIVE\"}}', '2026-06-10 10:13:20'),
('26a93e8d-9a53-4175-a6fd-247b179d5420', '1c0a26db-a757-4f74-9645-920faa7f522c', 'UPDATE_RESTAURANT', 'restaurant', '926f35f9-1a80-4272-a0e6-ea4dd37b2118', '{\"template_id\":\"aurora_glass\",\"plan\":\"PRO\"}', '2026-06-15 16:25:03'),
('29a055d3-9039-42b0-9bc0-73be724c4e53', '1c0a26db-a757-4f74-9645-920faa7f522c', 'UPDATE_RESTAURANT', 'restaurant', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '{\"template_id\":\"dark_sleek\",\"plan\":\"STARTER\"}', '2026-06-11 15:11:18'),
('29b38bc6-1d6b-4f8e-9099-06a48179d04c', '1c0a26db-a757-4f74-9645-920faa7f522c', 'UPDATE_RESTAURANT', 'restaurant', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '{\"template_id\":\"dark_sleek\",\"plan\":\"STARTER\"}', '2026-06-11 12:35:55'),
('2b87f278-5434-4d06-aa21-81acabd3584d', '1c0a26db-a757-4f74-9645-920faa7f522c', 'UPDATE_RESTAURANT', 'restaurant', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '{\"template_id\":\"classic_theme\",\"plan\":\"STARTER\"}', '2026-06-11 12:36:51'),
('2bf0905e-f9b0-47fd-ab27-4e5f01cc5c80', '1c0a26db-a757-4f74-9645-920faa7f522c', 'UPDATE_PLAN', 'plan', '84cdc4c7-a0f6-4689-a827-16758c63fca8', '{\"name\":\"PREMIUM\",\"price_monthly\":\"79.000\",\"price_annual\":\"750.000\"}', '2026-06-15 22:29:10'),
('2dbabdc6-e376-4d19-b7b8-a5897eba09be', '1c0a26db-a757-4f74-9645-920faa7f522c', 'CREATE_RESTAURANT', 'restaurant', '012b7620-0e98-4e7b-b3c9-60b7fd162fe7', '{\"name\":\"Bistro Tunis\",\"plan\":\"STARTER\",\"owner_email\":\"sami@bistrotunis.tn\"}', '2026-06-07 23:02:55'),
('300b0777-af60-4b3b-904a-8131425289a8', '1c0a26db-a757-4f74-9645-920faa7f522c', 'UPDATE_RESTAURANT', 'restaurant', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '{\"template_id\":\"classic_theme\",\"plan\":\"STARTER\"}', '2026-06-11 12:22:11'),
('37cf7664-a634-4e62-827b-284ae6ae2f7b', '1c0a26db-a757-4f74-9645-920faa7f522c', 'CREATE_RESTAURANT', 'restaurant', '6e191ab4-4dc9-4801-9c2a-043f6e5c6c86', '{\"name\":\"Test Bistro\",\"plan\":\"FREE\",\"owner_email\":\"owner@testbistro.tn\"}', '2026-06-07 23:00:28'),
('380f03d4-12f6-42ca-a628-26e50fcc73f6', '1c0a26db-a757-4f74-9645-920faa7f522c', 'ACTIVATE_RESTAURANT', 'restaurant', 'f82bee2a-3f1b-4e8e-b489-a7851b1648f2', NULL, '2026-06-15 11:26:06'),
('3f1d8659-b36c-4f76-a932-72fc023abe14', '1c0a26db-a757-4f74-9645-920faa7f522c', 'UPDATE_RESTAURANT', 'restaurant', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '{\"template_id\":\"bento_menu\",\"plan\":\"STARTER\"}', '2026-06-11 15:09:54'),
('4385735e-ed04-4cb0-8c9c-5c0789ae2b01', '1c0a26db-a757-4f74-9645-920faa7f522c', 'UPDATE_SUBSCRIPTION', 'subscription', '59d392bc-f3b6-44d7-947f-3e39fc96c34e', '{\"before\":{\"plan\":\"PREMIUM\",\"status\":\"ACTIVE\"},\"after\":{\"plan\":\"PREMIUM\",\"status\":\"ACTIVE\"}}', '2026-06-15 16:01:46'),
('444cc8db-5b11-4c91-9304-c238695c626c', '1c0a26db-a757-4f74-9645-920faa7f522c', 'UPDATE_RESTAURANT', 'restaurant', '926f35f9-1a80-4272-a0e6-ea4dd37b2118', '{\"template_id\":\"modern_theme\",\"plan\":\"PRO\",\"logo_url\":\"http://localhost:3001/uploads/delcapo-restaurant/logo.png\"}', '2026-06-10 10:39:03'),
('4488165b-59e9-4e2c-b176-2495dedf5df6', '1c0a26db-a757-4f74-9645-920faa7f522c', 'DELETE_RESTAURANT', 'restaurant', '012b7620-0e98-4e7b-b3c9-60b7fd162fe7', '{\"name\":\"Bistro Tunis\"}', '2026-06-08 23:28:03'),
('4d5af7ac-df90-4e37-981a-dae41113199f', '1c0a26db-a757-4f74-9645-920faa7f522c', 'UPDATE_RESTAURANT', 'restaurant', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '{\"template_id\":\"editorial_menu\",\"plan\":\"STARTER\"}', '2026-06-10 11:26:26'),
('55201e70-153a-46f7-be53-129342473f25', '1c0a26db-a757-4f74-9645-920faa7f522c', 'UPDATE_RESTAURANT', 'restaurant', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '{\"name\":\"demo restaurant\",\"type\":\"Restaurant\",\"email\":\"demo@gmail.com\",\"phone\":\"+216 23 789 543\",\"address\":\"tunis marsa\",\"short_description\":\"test1 demo restaurant\",\"social_facebook\":\"\",\"social_instagram\":\"https://www.instagram.com/delcapo.restaurant/\",\"social_tripadvisor\":\"\",\"social_google_maps\":\"\",\"social_website\":\"\",\"social_whatsapp\":\"#\"}', '2026-06-12 00:03:32'),
('5ce704a6-fb7a-4a49-a9d2-8219ff61246d', '1c0a26db-a757-4f74-9645-920faa7f522c', 'USER_ACTIVATED', 'User', '2864c7aa-63e1-4178-a14b-a170f43ced5f', '{\"name\":\"delcapo restaurant\",\"role\":\"OWNER\"}', '2026-06-10 10:04:18'),
('613af1dc-f782-4aaa-9cf2-a84f82aad3a2', '1c0a26db-a757-4f74-9645-920faa7f522c', 'UPDATE_RESTAURANT', 'restaurant', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '{\"template_id\":\"aurora_glass\",\"plan\":\"STARTER\"}', '2026-06-11 14:34:06'),
('61f504c6-5fbe-4603-b2b9-7afa6a4d1dc3', '1c0a26db-a757-4f74-9645-920faa7f522c', 'DELETE_RESTAURANT', 'restaurant', '6e191ab4-4dc9-4801-9c2a-043f6e5c6c86', '{\"name\":\"Test Bistro\"}', '2026-06-08 00:13:25'),
('6293f4c9-de34-417d-b4f3-ba701e4b355a', '1c0a26db-a757-4f74-9645-920faa7f522c', 'UPDATE_RESTAURANT', 'restaurant', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '{\"template_id\":\"aurora_glass\",\"plan\":\"STARTER\"}', '2026-06-11 14:33:48'),
('62f7f4ef-83b1-4007-b454-be7dfae8250b', '1c0a26db-a757-4f74-9645-920faa7f522c', 'CREATE_INVOICE', 'invoice', '55856920-2527-45cf-bd26-9bc599227b23', '{\"invoice_number\":\"FACTURE-2026-0001\",\"amount\":100,\"restaurant_id\":\"926f35f9-1a80-4272-a0e6-ea4dd37b2118\"}', '2026-06-10 10:01:12'),
('6e51327e-cbff-4f1d-a4c1-871e0a3efb9f', '1c0a26db-a757-4f74-9645-920faa7f522c', 'UPDATE_ADMIN_PROFILE', 'User', '1c0a26db-a757-4f74-9645-920faa7f522c', '{\"name\":\"Super Admin\",\"email\":\"hannibaladvanced@gmail.com\"}', '2026-06-16 15:24:55'),
('6fd2faab-61f7-4ec5-acc2-11430719e172', '1c0a26db-a757-4f74-9645-920faa7f522c', 'RESET_OWNER_PASSWORD', 'user', 'f6414970-145e-4b46-8e00-c04d60d3c054', NULL, '2026-06-08 00:10:00'),
('72a47d9f-062a-4fac-8b09-0ffbf3124039', '1c0a26db-a757-4f74-9645-920faa7f522c', 'UPDATE_RESTAURANT', 'restaurant', '926f35f9-1a80-4272-a0e6-ea4dd37b2118', '{\"template_id\":\"modern_theme\",\"plan\":\"PRO\"}', '2026-06-10 10:22:56'),
('74f42b08-aeb2-4f59-b957-8c876f5941ba', '1c0a26db-a757-4f74-9645-920faa7f522c', 'UPDATE_RESTAURANT', 'restaurant', 'f82bee2a-3f1b-4e8e-b489-a7851b1648f2', '{\"name\":\"Pavarotti Restaurant\",\"type\":\"Restaurant\",\"email\":\"Pavarotti@gmail.com\",\"phone\":\"+216 58 799 209\",\"address\":\"LAC 1\",\"short_description\":\"Cuisine italienne , Cocktails&Coffe, bar a Chicha\",\"social_facebook\":\"https://www.facebook.com/p/Pavarotti-cafe-resto-61572452227150/\",\"social_instagram\":\"\",\"social_tripadvisor\":\"https://www.tripadvisor.fr/Restaurant_Review-g293758-d15072462-Reviews-Pavarotti_Pasta-Tunis_Tunis_Governorate.html\",\"social_google_maps\":\" centre él halfaouine les berges du lac en face de dahdah, Tunis, Tunisia, 1053\",\"social_website\":\"\",\"social_whatsapp\":\"\"}', '2026-06-15 11:26:09'),
('76a85cac-0713-487d-abcd-0987fd2dd0de', '1c0a26db-a757-4f74-9645-920faa7f522c', 'UPDATE_RESTAURANT', 'restaurant', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '{\"template_id\":\"dark_sleek\",\"plan\":\"STARTER\"}', '2026-06-11 11:33:15'),
('76cc3582-4b4c-432b-992f-eea561f5743b', '1c0a26db-a757-4f74-9645-920faa7f522c', 'UPDATE_RESTAURANT', 'restaurant', 'f82bee2a-3f1b-4e8e-b489-a7851b1648f2', '{\"template_id\":\"modern_theme\",\"plan\":\"PREMIUM\"}', '2026-06-15 11:26:34'),
('788a6825-52eb-4aef-b391-d71a85bc4da0', '1c0a26db-a757-4f74-9645-920faa7f522c', 'UPDATE_RESTAURANT', 'restaurant', 'f82bee2a-3f1b-4e8e-b489-a7851b1648f2', '{\"template_id\":\"dark_sleek\",\"plan\":\"PREMIUM\"}', '2026-06-15 11:22:28'),
('7d2fc621-e263-45f9-bd0c-708a2e249c8a', '1c0a26db-a757-4f74-9645-920faa7f522c', 'UPDATE_RESTAURANT', 'restaurant', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '{\"template_id\":\"aurora_glass\",\"plan\":\"STARTER\"}', '2026-06-11 13:09:01'),
('814390c7-a24b-40a1-9141-580b1a66865c', '1c0a26db-a757-4f74-9645-920faa7f522c', 'UPDATE_PLAN', 'plan', '84cdc4c7-a0f6-4689-a827-16758c63fca8', '{\"name\":\"PREMIUM\",\"price_monthly\":\"79.000\",\"price_annual\":\"850.000\"}', '2026-06-15 17:58:07'),
('82095115-3484-4013-ab17-33bc7f8c39bb', '1c0a26db-a757-4f74-9645-920faa7f522c', 'UPDATE_SUBSCRIPTION', 'subscription', 'ce7f8935-a85d-4aa0-8e12-b25a063fb07a', '{\"before\":{\"plan\":\"STARTER\",\"status\":\"ACTIVE\"},\"after\":{\"plan\":\"PREMIUM\",\"status\":\"ACTIVE\"}}', '2026-06-15 17:47:59'),
('82bb37c3-64ce-441a-9408-37f556945fc4', '1c0a26db-a757-4f74-9645-920faa7f522c', 'DELETE_RESTAURANT', 'restaurant', 'bc763e0b-10cb-4ea2-a9ce-27fc9375e39f', '{\"name\":\"pavaroti\"}', '2026-06-08 23:27:58'),
('85870a92-336e-4afc-845d-6e11dbacc910', '1c0a26db-a757-4f74-9645-920faa7f522c', 'UPDATE_PLAN', 'plan', 'e6e66613-6a7c-4bbc-b871-4bf77fe7c4b4', '{\"name\":\"PRO\",\"price_monthly\":\"59.000\",\"price_annual\":\"500.000\"}', '2026-06-15 18:00:10'),
('863da75e-85d4-4b4f-ade1-b6163da945c4', '1c0a26db-a757-4f74-9645-920faa7f522c', 'UPDATE_RESTAURANT', 'restaurant', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '{\"template_id\":\"aurora_glass\",\"plan\":\"STARTER\"}', '2026-06-11 14:53:51'),
('89c453d1-d18c-468e-8a08-81982498197c', '1c0a26db-a757-4f74-9645-920faa7f522c', 'UPDATE_PLAN', 'plan', '3ded6e5b-a057-4a35-b40b-045dd42c2534', '{\"name\":\"STARTER\",\"price_monthly\":\"29.000\",\"price_annual\":\"250.000\"}', '2026-06-15 18:00:52'),
('940ccbe1-260c-4b58-8347-053c42eb6ded', '1c0a26db-a757-4f74-9645-920faa7f522c', 'USER_ACTIVATED', 'User', 'f6414970-145e-4b46-8e00-c04d60d3c054', '{\"name\":\"demo restaurant\",\"role\":\"OWNER\"}', '2026-06-10 10:04:25'),
('9490e1a6-4d66-4256-9dfe-7e80abf07a4f', '1c0a26db-a757-4f74-9645-920faa7f522c', 'USER_DEACTIVATED', 'User', '2864c7aa-63e1-4178-a14b-a170f43ced5f', '{\"name\":\"delcapo restaurant\",\"role\":\"OWNER\"}', '2026-06-10 10:04:16'),
('94d4e49c-6156-416d-9fb7-a5fb81c15571', '1c0a26db-a757-4f74-9645-920faa7f522c', 'CREATE_RESTAURANT', 'restaurant', '926f35f9-1a80-4272-a0e6-ea4dd37b2118', '{\"name\":\"delcapo restaurant\",\"plan\":\"PRO\",\"owner_email\":\"delcapo1@gmail.com\"}', '2026-06-10 09:01:47'),
('996462bc-e084-4263-a202-58ed71d58d6a', '1c0a26db-a757-4f74-9645-920faa7f522c', 'UPDATE_RESTAURANT', 'restaurant', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '{\"template_id\":\"modern_theme\",\"plan\":\"STARTER\"}', '2026-06-11 11:55:21'),
('9fd58029-9a11-4ba9-8196-ca403b77acd8', '1c0a26db-a757-4f74-9645-920faa7f522c', 'RESET_OWNER_PASSWORD', 'user', '5a9e109d-0aef-4001-884c-e06e059b6ab6', NULL, '2026-06-08 23:15:31'),
('a08a3f9b-8791-47d1-bfc8-57328b561050', '1c0a26db-a757-4f74-9645-920faa7f522c', 'UPDATE_RESTAURANT', 'restaurant', '926f35f9-1a80-4272-a0e6-ea4dd37b2118', '{\"template_id\":\"modern_theme\",\"plan\":\"PRO\",\"logo_url\":\"http://localhost:3001/uploads/delcapo-restaurant/logo.png\"}', '2026-06-10 10:38:37'),
('a0aa75e5-b953-4b5b-8d50-27c89ee4cb1a', '1c0a26db-a757-4f74-9645-920faa7f522c', 'UPDATE_RESTAURANT', 'restaurant', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '{\"template_id\":\"bento_menu\",\"plan\":\"STARTER\"}', '2026-06-11 13:59:27'),
('a376c03a-83ce-4e61-8ee5-245293874661', '1c0a26db-a757-4f74-9645-920faa7f522c', 'UPDATE_RESTAURANT', 'restaurant', '926f35f9-1a80-4272-a0e6-ea4dd37b2118', '{\"template_id\":\"aurora_glass\",\"plan\":\"PRO\"}', '2026-06-13 09:15:58'),
('a4cea599-59bd-46be-8ba9-4957fcf5694b', '1c0a26db-a757-4f74-9645-920faa7f522c', 'UPDATE_RESTAURANT', 'restaurant', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '{\"template_id\":\"dark_sleek\",\"plan\":\"PRO\"}', '2026-06-15 16:20:40'),
('a5991f85-511c-46dc-b88b-4bcc94e39c52', '1c0a26db-a757-4f74-9645-920faa7f522c', 'UPDATE_SUBSCRIPTION', 'subscription', '889db9c6-894c-4e5a-8493-6743d4ff896c', '{\"before\":{\"plan\":\"PRO\",\"status\":\"ACTIVE\"},\"after\":{\"plan\":\"PRO\",\"status\":\"ACTIVE\"}}', '2026-06-10 10:13:50'),
('a96fe9bf-0c9c-4cd6-945d-34cbfd0cdaa4', '1c0a26db-a757-4f74-9645-920faa7f522c', 'UPDATE_RESTAURANT', 'restaurant', '926f35f9-1a80-4272-a0e6-ea4dd37b2118', '{\"logo_url\":\"http://localhost:3001/uploads/delcapo-restaurant/logo.png\"}', '2026-06-10 10:35:02'),
('ae2e2792-efa5-4bb3-a0c5-5225db91394a', '1c0a26db-a757-4f74-9645-920faa7f522c', 'UPDATE_PLAN', 'plan', 'e6e66613-6a7c-4bbc-b871-4bf77fe7c4b4', '{\"name\":\"PRO\",\"price_monthly\":\"59.000\",\"price_annual\":\"500.000\"}', '2026-06-15 22:28:58'),
('b0f48066-8e52-466b-997b-bdce0d737443', '1c0a26db-a757-4f74-9645-920faa7f522c', 'UPDATE_RESTAURANT', 'restaurant', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '{\"template_id\":\"modern_theme\",\"plan\":\"STARTER\"}', '2026-06-11 13:40:44'),
('b48e8531-7319-4571-abed-5bbb90bbf522', '1c0a26db-a757-4f74-9645-920faa7f522c', 'UPDATE_RESTAURANT', 'restaurant', '926f35f9-1a80-4272-a0e6-ea4dd37b2118', '{\"name\":\"delcapo restaurant\",\"type\":\"Restaurant\",\"email\":\"delcapo1@gmail.com\",\"phone\":\"+216 24 355 789\",\"address\":\"Marsa\",\"short_description\":\"restaurant italien\",\"social_facebook\":\"https://www.facebook.com/Delcapopasta/\",\"social_instagram\":\"https://www.instagram.com/delcapo.restaurant/\",\"social_tripadvisor\":\"\",\"social_google_maps\":\"\",\"social_website\":\"\",\"social_whatsapp\":\"\"}', '2026-06-10 09:02:54'),
('b5e50630-ea12-4e5b-be9e-a80b42426f52', '1c0a26db-a757-4f74-9645-920faa7f522c', 'UPDATE_PLAN', 'plan', 'e6e66613-6a7c-4bbc-b871-4bf77fe7c4b4', '{\"name\":\"PRO\",\"price_monthly\":\"59.000\",\"price_annual\":\"500.000\"}', '2026-06-15 17:58:44'),
('b7423bbd-7e0e-4fe7-bb3b-accbb0fda3ee', '1c0a26db-a757-4f74-9645-920faa7f522c', 'UPDATE_SUBSCRIPTION', 'subscription', '889db9c6-894c-4e5a-8493-6743d4ff896c', '{\"before\":{\"plan\":\"PRO\",\"status\":\"ACTIVE\"},\"after\":{\"plan\":\"PRO\",\"status\":\"ACTIVE\"}}', '2026-06-15 16:24:46'),
('b8160172-bd15-49b6-bfe3-a27031188ba1', '1c0a26db-a757-4f74-9645-920faa7f522c', 'UPDATE_PLAN', 'plan', 'e6e66613-6a7c-4bbc-b871-4bf77fe7c4b4', '{\"name\":\"PRO\",\"price_monthly\":\"59.000\",\"price_annual\":\"560.000\"}', '2026-06-15 22:28:17'),
('bd7fc15b-b3f8-43c4-8852-1547610a0606', '1c0a26db-a757-4f74-9645-920faa7f522c', 'DELETE_RESTAURANT', 'restaurant', '5f7cde52-2625-4741-a6a9-aa1abd903cb7', '{\"name\":\"delcapo restaurant\"}', '2026-06-08 23:28:27'),
('c1724a12-6c3e-4f5a-bb98-8bef7b1cb191', '1c0a26db-a757-4f74-9645-920faa7f522c', 'UPDATE_RESTAURANT', 'restaurant', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '{\"template_id\":\"dark_sleek\",\"plan\":\"STARTER\"}', '2026-06-11 11:40:56'),
('c4cf2b0e-31ad-48da-88bb-0aef7e6d13f2', '1c0a26db-a757-4f74-9645-920faa7f522c', 'CREATE_RESTAURANT', 'restaurant', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '{\"name\":\"demo restaurant\",\"plan\":\"STARTER\",\"owner_email\":\"demoresto@gmail.com\"}', '2026-06-08 00:18:42'),
('c4d8abcf-53aa-47dc-82db-06a73353d3aa', '1c0a26db-a757-4f74-9645-920faa7f522c', 'RESET_OWNER_PASSWORD', 'user', 'bdf11593-ff2d-4f13-81ac-8c6cd8d1131d', NULL, '2026-06-15 11:45:16'),
('c748bc1e-ea1f-4b16-87f8-dedf583b6bd1', '1c0a26db-a757-4f74-9645-920faa7f522c', 'UPDATE_RESTAURANT', 'restaurant', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '{\"template_id\":\"modern_theme\",\"plan\":\"STARTER\"}', '2026-06-11 11:35:22'),
('c8174092-d821-49e5-a5dc-bb549404c595', '1c0a26db-a757-4f74-9645-920faa7f522c', 'DELETE_RESTAURANT', 'restaurant', 'f6805a7b-5726-44d0-a12a-e64f7dd61b3a', '{\"name\":\"demo restaurant\"}', '2026-06-08 00:13:34'),
('c8d997c1-2737-495c-a624-2462b4d02344', '1c0a26db-a757-4f74-9645-920faa7f522c', 'UPDATE_RESTAURANT', 'restaurant', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '{\"template_id\":\"dark_sleek\",\"plan\":\"PREMIUM\"}', '2026-06-15 17:47:42'),
('cb21adc5-d928-4d2b-8602-f85f64cff396', '1c0a26db-a757-4f74-9645-920faa7f522c', 'USER_PASSWORD_CHANGED', 'User', 'bdf11593-ff2d-4f13-81ac-8c6cd8d1131d', '{\"name\":\"Pavarotti Restaurant\",\"role\":\"OWNER\"}', '2026-06-15 11:51:00'),
('cd82c24a-c373-4510-a438-d22fbc8de303', '1c0a26db-a757-4f74-9645-920faa7f522c', 'CREATE_INVOICE', 'invoice', '9a5a7f55-ad57-400d-ba4b-3fff51ad82c5', '{\"invoice_number\":\"FACTURE-2026-0001\",\"amount\":80,\"restaurant_id\":\"926f35f9-1a80-4272-a0e6-ea4dd37b2118\"}', '2026-06-10 10:03:41'),
('d057de22-ec58-4d50-ad68-b6dcdacd6be7', '1c0a26db-a757-4f74-9645-920faa7f522c', 'UPDATE_RESTAURANT', 'restaurant', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '{\"template_id\":\"classic_theme\",\"plan\":\"STARTER\"}', '2026-06-10 11:25:58'),
('d39acc01-b30e-4079-8b11-7e855dd27287', '1c0a26db-a757-4f74-9645-920faa7f522c', 'DEACTIVATE_RESTAURANT', 'restaurant', 'f6805a7b-5726-44d0-a12a-e64f7dd61b3a', NULL, '2026-06-08 00:09:53'),
('d3e0a362-1899-4a4e-b022-b5c82aa2e8dc', '1c0a26db-a757-4f74-9645-920faa7f522c', 'UPDATE_RESTAURANT', 'restaurant', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '{\"template_id\":\"dark_sleek\",\"plan\":\"STARTER\"}', '2026-06-11 12:21:29'),
('d43f32be-4fef-445f-b2fe-b0f55679230c', '1c0a26db-a757-4f74-9645-920faa7f522c', 'CREATE_RESTAURANT', 'restaurant', 'f6805a7b-5726-44d0-a12a-e64f7dd61b3a', '{\"name\":\"demo restaurant\",\"plan\":\"STARTER\",\"owner_email\":\"demo@gmail.com\"}', '2026-06-07 23:19:25'),
('d681d618-76ce-47c6-ac41-bfb8f65110b7', '1c0a26db-a757-4f74-9645-920faa7f522c', 'UPDATE_RESTAURANT', 'restaurant', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '{\"template_id\":\"dark_sleek\",\"plan\":\"STARTER\",\"logo_url\":\"http://localhost:3001/uploads/demo-restaurant/logo.png\",\"banner_url\":\"http://localhost:3001/uploads/demo-restaurant/banner.jpeg\"}', '2026-06-10 10:50:06'),
('d80bdbac-4326-40a4-8e2d-193ee428d513', '1c0a26db-a757-4f74-9645-920faa7f522c', 'CREATE_INVOICE', 'invoice', 'ef650b13-21e4-4504-832b-ee0f57959c5d', '{\"invoice_number\":\"FACTURE-2026-0002\",\"amount\":80,\"restaurant_id\":\"ef453e3b-33d5-43ac-91d2-9ec86b927035\"}', '2026-06-10 10:29:00'),
('d831530b-1093-48d8-9e81-497ed99935be', '1c0a26db-a757-4f74-9645-920faa7f522c', 'UPDATE_RESTAURANT', 'restaurant', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '{\"template_id\":\"editorial_menu\",\"plan\":\"STARTER\"}', '2026-06-11 15:09:31'),
('d9337a0e-335e-459d-951c-eb7977443bc6', '1c0a26db-a757-4f74-9645-920faa7f522c', 'RESET_OWNER_PASSWORD', 'user', 'f6414970-145e-4b46-8e00-c04d60d3c054', NULL, '2026-06-08 00:09:49'),
('dc065eca-e49e-4064-a1be-5d220e04814b', '1c0a26db-a757-4f74-9645-920faa7f522c', 'UPDATE_RESTAURANT', 'restaurant', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '{\"template_id\":\"dark_sleek\",\"plan\":\"STARTER\"}', '2026-06-15 11:31:28'),
('dcf881c3-1d94-4aec-a7b1-1bde0b0e3df6', '1c0a26db-a757-4f74-9645-920faa7f522c', 'CREATE_INVOICE', 'invoice', 'c427ab2f-3264-4c4f-b048-ffb8c633d1d2', '{\"invoice_number\":\"FACTURE-2026-TEST-0009\",\"amount\":\"150.000\",\"restaurant_id\":\"926f35f9-1a80-4272-a0e6-ea4dd37b2118\"}', '2026-06-10 09:12:40'),
('dfafffb6-c9f7-4d76-8d1c-e39d537e5d73', '1c0a26db-a757-4f74-9645-920faa7f522c', 'DEACTIVATE_RESTAURANT', 'restaurant', 'f82bee2a-3f1b-4e8e-b489-a7851b1648f2', NULL, '2026-06-15 11:25:50'),
('e350970c-9f58-4f38-b95a-f5eba8b31c55', '1c0a26db-a757-4f74-9645-920faa7f522c', 'UPDATE_SUBSCRIPTION', 'subscription', '889db9c6-894c-4e5a-8493-6743d4ff896c', '{\"before\":{\"plan\":\"PRO\",\"status\":\"ACTIVE\"},\"after\":{\"plan\":\"PRO\",\"status\":\"ACTIVE\"}}', '2026-06-15 16:24:17'),
('e934d18e-e52c-4277-905d-d9679f34c27c', '1c0a26db-a757-4f74-9645-920faa7f522c', 'CREATE_RESTAURANT', 'restaurant', 'f82bee2a-3f1b-4e8e-b489-a7851b1648f2', '{\"name\":\"Pavarotti Restaurant\",\"plan\":\"PREMIUM\",\"owner_email\":\"Pavarotti@gmail.com\"}', '2026-06-13 09:45:55'),
('ea267733-cbd1-40cd-97b0-836f9b6e5746', '1c0a26db-a757-4f74-9645-920faa7f522c', 'UPDATE_RESTAURANT', 'restaurant', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '{\"template_id\":\"classic_theme\",\"plan\":\"STARTER\"}', '2026-06-11 12:09:35'),
('ec4cabdd-aa50-4d5d-8a98-25a9e8701c4d', '1c0a26db-a757-4f74-9645-920faa7f522c', 'UPDATE_RESTAURANT', 'restaurant', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '{\"template_id\":\"dark_sleek\",\"plan\":\"STARTER\"}', '2026-06-12 11:27:57'),
('f3a0333c-a447-4d35-a17c-9ddf8a7447ad', '1c0a26db-a757-4f74-9645-920faa7f522c', 'CREATE_INVOICE', 'invoice', '556f4e04-0515-42f8-8df9-1c4054086930', '{\"invoice_number\":\"FACTURE-2026-0003\",\"amount\":500,\"restaurant_id\":\"f82bee2a-3f1b-4e8e-b489-a7851b1648f2\"}', '2026-06-15 14:58:29'),
('f5819b96-a6d5-49c3-8bd1-aa2a45a797b9', '1c0a26db-a757-4f74-9645-920faa7f522c', 'UPDATE_RESTAURANT', 'restaurant', '926f35f9-1a80-4272-a0e6-ea4dd37b2118', '{\"template_id\":\"modern_theme\",\"plan\":\"PRO\"}', '2026-06-10 09:04:27'),
('f75e0240-3d31-4629-ad10-205c99a095b2', '1c0a26db-a757-4f74-9645-920faa7f522c', 'CREATE_RESTAURANT', 'restaurant', '5324c198-08a3-436f-af04-ce89a94a8d6b', '{\"name\":\"delcapo restaurant\",\"plan\":\"FREE\",\"owner_email\":\"\"}', '2026-06-07 22:44:23'),
('f7a4431b-7ee0-4f80-b489-b2c62d9fa2ed', '1c0a26db-a757-4f74-9645-920faa7f522c', 'UPDATE_RESTAURANT', 'restaurant', 'f82bee2a-3f1b-4e8e-b489-a7851b1648f2', '{\"template_id\":\"dark_sleek\",\"plan\":\"PREMIUM\"}', '2026-06-15 11:21:25'),
('f939f480-be7f-4651-81b0-9598d4607534', '1c0a26db-a757-4f74-9645-920faa7f522c', 'UPDATE_RESTAURANT', 'restaurant', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '{\"template_id\":\"modern_theme\",\"plan\":\"STARTER\"}', '2026-06-10 11:25:12'),
('fba0c075-95f5-45fc-a6da-2b6c69b64baa', '1c0a26db-a757-4f74-9645-920faa7f522c', 'UPDATE_RESTAURANT', 'restaurant', 'f82bee2a-3f1b-4e8e-b489-a7851b1648f2', '{\"template_id\":\"editorial_menu\",\"plan\":\"PREMIUM\"}', '2026-06-15 17:30:09'),
('fd0a87be-863a-4346-bd95-fd9d6948d3f0', '1c0a26db-a757-4f74-9645-920faa7f522c', 'CREATE_RESTAURANT', 'restaurant', '5f7cde52-2625-4741-a6a9-aa1abd903cb7', '{\"name\":\"delcapo restaurant\",\"plan\":\"FREE\",\"owner_email\":\"delcapo@gmail.com\"}', '2026-06-07 22:58:40'),
('ffe01966-16c3-4b32-84cf-52b5ef0ce7b7', '1c0a26db-a757-4f74-9645-920faa7f522c', 'UPDATE_PLAN', 'plan', 'e6e66613-6a7c-4bbc-b871-4bf77fe7c4b4', '{\"name\":\"PRO\",\"price_monthly\":\"59.000\",\"price_annual\":\"500.000\"}', '2026-06-15 18:00:25');

-- --------------------------------------------------------

--
-- Structure de la table `call_waiters`
--

CREATE TABLE `call_waiters` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `restaurant_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `table_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `type` enum('WAITER','CHECK','OTHER') DEFAULT 'WAITER',
  `message` text DEFAULT NULL,
  `status` enum('PENDING','IN_PROGRESS','DONE') NOT NULL DEFAULT 'PENDING',
  `resolved_at` datetime DEFAULT NULL,
  `resolved_by` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `call_waiters`
--

INSERT INTO `call_waiters` (`id`, `restaurant_id`, `table_id`, `type`, `message`, `status`, `resolved_at`, `resolved_by`, `created_at`) VALUES
('0102e8b3-8448-484e-b515-5a247457ac29', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', 'bd5f3f89-8414-4509-b151-ffd2027cbc6b', 'WAITER', NULL, 'DONE', '2026-06-10 12:16:27', '2fdb3f1b-9ac7-42ac-954d-fdf902f93a89', '2026-06-10 11:09:30'),
('12ee3de1-2fdd-47e0-83a0-ea01eb5fafda', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '2a938c85-ab12-4cde-a1bf-a1f8c30c981b', 'WAITER', NULL, 'DONE', '2026-06-10 11:45:00', '2fdb3f1b-9ac7-42ac-954d-fdf902f93a89', '2026-06-10 10:18:18'),
('186b540d-7fd3-4513-b284-12e45b267d5e', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', 'bd5f3f89-8414-4509-b151-ffd2027cbc6b', 'CHECK', NULL, 'DONE', '2026-06-10 13:59:21', '2fdb3f1b-9ac7-42ac-954d-fdf902f93a89', '2026-06-10 12:59:16'),
('21907fe7-69b7-4776-810b-9543aa927643', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', 'bd5f3f89-8414-4509-b151-ffd2027cbc6b', 'WAITER', NULL, 'DONE', '2026-06-10 12:51:07', '2fdb3f1b-9ac7-42ac-954d-fdf902f93a89', '2026-06-10 11:50:52'),
('36ec40f0-aecb-413a-9506-22a37e63310f', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '0fd96779-24cc-4ea0-82a7-1e53e3cab151', 'WAITER', NULL, 'DONE', '2026-06-15 15:58:18', '9cd55930-833f-420c-af71-c9ea7fc6eb92', '2026-06-15 14:51:00'),
('39ac124c-f688-4cd3-addd-fc10815209f3', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', 'bd5f3f89-8414-4509-b151-ffd2027cbc6b', 'WAITER', NULL, 'DONE', '2026-06-10 12:43:57', '2fdb3f1b-9ac7-42ac-954d-fdf902f93a89', '2026-06-10 11:43:31'),
('3a5d21a2-80b7-4ca0-a45d-92f14f7d0c4c', 'f82bee2a-3f1b-4e8e-b489-a7851b1648f2', 'f30d9ac6-5108-47e6-b8c5-f4c3f5a0d7c6', 'WAITER', NULL, 'DONE', '2026-06-13 10:01:37', 'bdf11593-ff2d-4f13-81ac-8c6cd8d1131d', '2026-06-13 09:01:31'),
('3d9b63ed-82bc-4e4f-a215-01f7f44ebc6a', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '0fd96779-24cc-4ea0-82a7-1e53e3cab151', 'WAITER', NULL, 'DONE', '2026-06-15 15:50:07', '2fdb3f1b-9ac7-42ac-954d-fdf902f93a89', '2026-06-15 14:49:59'),
('420b764a-4578-4402-be1d-40332f9cadcc', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', 'd3e9cef7-894b-4f24-abfb-a6ab674aed9b', 'WAITER', NULL, 'DONE', '2026-06-09 11:10:52', '2fdb3f1b-9ac7-42ac-954d-fdf902f93a89', '2026-06-09 09:32:08'),
('42ee57c5-d6eb-4e99-805e-91dc3f452b04', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', 'bd5f3f89-8414-4509-b151-ffd2027cbc6b', 'WAITER', NULL, 'DONE', '2026-06-10 12:24:59', '2fdb3f1b-9ac7-42ac-954d-fdf902f93a89', '2026-06-10 11:16:38'),
('549e3691-61ee-4db9-8a2e-3f57dd0bde83', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '1a72ddd2-bd3d-4381-a958-e4ce759bd787', 'WAITER', NULL, 'DONE', '2026-06-15 15:34:38', '2fdb3f1b-9ac7-42ac-954d-fdf902f93a89', '2026-06-15 14:31:40'),
('5f53f3f4-5a1f-4b1c-9e00-3e26b73ae21b', 'f82bee2a-3f1b-4e8e-b489-a7851b1648f2', '04a22c64-b2bf-4367-89d5-dca6b4d4b9ce', 'WAITER', NULL, 'DONE', '2026-06-15 12:04:37', 'bdf11593-ff2d-4f13-81ac-8c6cd8d1131d', '2026-06-15 11:04:22'),
('83c92446-0d9d-4148-b265-2878b077e6c9', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '1a72ddd2-bd3d-4381-a958-e4ce759bd787', 'WAITER', NULL, 'DONE', '2026-06-15 15:12:48', '9cd55930-833f-420c-af71-c9ea7fc6eb92', '2026-06-15 14:05:11'),
('83e6849a-daf5-48a8-a79a-898e09f4634c', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '0fd96779-24cc-4ea0-82a7-1e53e3cab151', 'WAITER', NULL, 'DONE', '2026-06-10 12:28:33', '2fdb3f1b-9ac7-42ac-954d-fdf902f93a89', '2026-06-10 11:28:11'),
('b1d2bf4f-5fef-4307-a1f0-b394295d43a5', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '0fd96779-24cc-4ea0-82a7-1e53e3cab151', 'WAITER', NULL, 'DONE', '2026-06-09 11:55:32', '2fdb3f1b-9ac7-42ac-954d-fdf902f93a89', '2026-06-09 10:12:14'),
('b4a6653b-57eb-45e5-8b7e-0d2d538ec06d', 'f82bee2a-3f1b-4e8e-b489-a7851b1648f2', '1c0cf590-8cc8-4d71-97fc-058e478fe384', 'WAITER', NULL, 'DONE', '2026-06-16 10:33:05', '4f1c5a80-eecc-4bee-af97-b89e3103b88f', '2026-06-16 09:32:57'),
('ce180048-ddf9-4686-8db4-d71e9397e70a', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', 'a794d1b3-5591-49dd-b7b8-bd7141ddceec', 'WAITER', NULL, 'DONE', '2026-06-09 11:11:04', '2fdb3f1b-9ac7-42ac-954d-fdf902f93a89', '2026-06-09 09:34:24'),
('e31b724a-feac-47d1-b2b4-f752da908e17', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', 'bd5f3f89-8414-4509-b151-ffd2027cbc6b', 'WAITER', NULL, 'DONE', '2026-06-10 13:55:59', '2fdb3f1b-9ac7-42ac-954d-fdf902f93a89', '2026-06-10 12:55:52'),
('ea20e90a-1fef-4f23-af0d-81e9a287f2de', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '1a72ddd2-bd3d-4381-a958-e4ce759bd787', 'WAITER', NULL, 'DONE', '2026-06-15 15:48:30', '2fdb3f1b-9ac7-42ac-954d-fdf902f93a89', '2026-06-15 14:34:51');

-- --------------------------------------------------------

--
-- Structure de la table `categories`
--

CREATE TABLE `categories` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `menu_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `name_fr` varchar(80) NOT NULL,
  `name_en` varchar(80) DEFAULT NULL,
  `name_it` varchar(80) DEFAULT NULL,
  `name_ar` varchar(80) DEFAULT NULL,
  `sort_order` int(11) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `icon` varchar(10) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `categories`
--

INSERT INTO `categories` (`id`, `menu_id`, `name_fr`, `name_en`, `name_it`, `name_ar`, `sort_order`, `is_active`, `icon`, `created_at`, `updated_at`) VALUES
('003f1204-07a4-4d9f-a4a5-cfe22d8d3a01', 'd63de8e2-dbe7-4e6e-a2b9-fa1e7fb128cd', 'Pates', NULL, NULL, NULL, 0, 1, NULL, '2026-06-08 11:29:55', '2026-06-10 17:15:42'),
('0c712bde-16b8-4028-93ec-09782f088fa8', '3ee04654-354f-44e5-84c4-c33813d8272f', 'Pizzas', NULL, NULL, NULL, 0, 1, NULL, '2026-06-11 09:53:08', '2026-06-11 09:53:08'),
('2a23c061-2fe4-41d4-8392-d8cf8a0a5156', '471f7b1e-9a5f-412e-b82f-c580a3b07964', 'Salades', NULL, NULL, NULL, 1, 1, NULL, '2026-06-13 09:32:15', '2026-06-13 09:32:15'),
('367aded7-5a42-4a85-be59-bb0eb9eaee90', '471f7b1e-9a5f-412e-b82f-c580a3b07964', 'Pates', NULL, NULL, NULL, 0, 1, NULL, '2026-06-13 09:31:57', '2026-06-13 09:31:57'),
('58a6f4d0-80c3-489f-a440-5a81f16610ea', '960452ef-244b-4430-b740-54558cd500b5', 'Burger', NULL, NULL, NULL, 0, 1, NULL, '2026-06-09 10:13:52', '2026-06-10 18:40:05'),
('79743db8-b7ac-4dbc-b05b-527e2693b91b', '330ed300-be40-45b9-bac8-63a3cf8a15a7', 'Peti déj', NULL, NULL, NULL, 1, 1, NULL, '2026-06-13 09:59:13', '2026-06-13 09:59:13'),
('e5ccd5fc-7545-414d-99c3-cc09440f3c8a', '330ed300-be40-45b9-bac8-63a3cf8a15a7', 'Pates', NULL, NULL, NULL, 0, 1, NULL, '2026-06-13 09:57:21', '2026-06-13 09:57:21');

-- --------------------------------------------------------

--
-- Structure de la table `invoices`
--

CREATE TABLE `invoices` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `restaurant_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `subscription_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `amount` decimal(10,3) NOT NULL,
  `currency` varchar(3) DEFAULT 'DT',
  `status` enum('PAID','PENDING','CANCELLED') DEFAULT 'PENDING',
  `invoice_number` varchar(20) DEFAULT NULL,
  `issued_at` date DEFAULT NULL,
  `due_at` date DEFAULT NULL,
  `pdf_url` varchar(500) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `invoices`
--

INSERT INTO `invoices` (`id`, `restaurant_id`, `subscription_id`, `amount`, `currency`, `status`, `invoice_number`, `issued_at`, `due_at`, `pdf_url`, `created_at`, `updated_at`) VALUES
('556f4e04-0515-42f8-8df9-1c4054086930', 'f82bee2a-3f1b-4e8e-b489-a7851b1648f2', NULL, '500.000', 'DT', 'PAID', 'FACTURE-2026-0003', '2026-06-15', '2027-06-15', NULL, '2026-06-15 14:58:29', '2026-06-15 14:58:29'),
('9a5a7f55-ad57-400d-ba4b-3fff51ad82c5', '926f35f9-1a80-4272-a0e6-ea4dd37b2118', NULL, '80.000', 'DT', 'PAID', 'FACTURE-2026-0001', '2026-06-10', '2026-07-10', NULL, '2026-06-10 10:03:41', '2026-06-15 16:24:29'),
('ef650b13-21e4-4504-832b-ee0f57959c5d', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', NULL, '80.000', 'DT', 'PAID', 'FACTURE-2026-0002', '2026-06-10', '2026-07-07', NULL, '2026-06-10 10:29:00', '2026-06-10 10:29:00');

-- --------------------------------------------------------

--
-- Structure de la table `menus`
--

CREATE TABLE `menus` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `restaurant_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `name` varchar(80) NOT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `menus`
--

INSERT INTO `menus` (`id`, `restaurant_id`, `name`, `is_active`, `created_at`, `updated_at`) VALUES
('330ed300-be40-45b9-bac8-63a3cf8a15a7', 'f82bee2a-3f1b-4e8e-b489-a7851b1648f2', 'pates', 1, '2026-06-13 09:57:14', '2026-06-13 09:57:14'),
('3ee04654-354f-44e5-84c4-c33813d8272f', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', 'Pizzas', 1, '2026-06-11 09:53:04', '2026-06-11 09:53:04'),
('471f7b1e-9a5f-412e-b82f-c580a3b07964', '926f35f9-1a80-4272-a0e6-ea4dd37b2118', 'Pates', 1, '2026-06-13 09:31:49', '2026-06-13 09:31:49'),
('960452ef-244b-4430-b740-54558cd500b5', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', 'Burgers', 1, '2026-06-09 10:13:41', '2026-06-10 18:42:52'),
('d63de8e2-dbe7-4e6e-a2b9-fa1e7fb128cd', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', 'Pates', 1, '2026-06-08 11:29:24', '2026-06-09 13:05:16');

-- --------------------------------------------------------

--
-- Structure de la table `menu_items`
--

CREATE TABLE `menu_items` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `category_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `name_fr` varchar(80) NOT NULL,
  `name_en` varchar(80) DEFAULT NULL,
  `name_it` varchar(80) DEFAULT NULL,
  `name_ar` varchar(80) DEFAULT NULL,
  `description_fr` text DEFAULT NULL,
  `description_en` text DEFAULT NULL,
  `description_it` text DEFAULT NULL,
  `description_ar` text DEFAULT NULL,
  `price` decimal(10,3) NOT NULL DEFAULT 0.000,
  `price_night` decimal(10,3) DEFAULT NULL,
  `price_happy_hour` decimal(10,3) DEFAULT NULL,
  `happy_hour_start` time DEFAULT NULL,
  `happy_hour_end` time DEFAULT NULL,
  `image_url` varchar(500) DEFAULT NULL,
  `is_available` tinyint(1) DEFAULT 1,
  `is_featured` tinyint(1) DEFAULT 0,
  `prep_time_min` tinyint(4) DEFAULT NULL,
  `disable_at` time DEFAULT NULL,
  `enable_at` time DEFAULT NULL,
  `sort_order` int(11) DEFAULT 0,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `promo_price` decimal(10,3) DEFAULT NULL,
  `promo_label` varchar(50) DEFAULT NULL,
  `promo_start` date DEFAULT NULL,
  `promo_end` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `menu_items`
--

INSERT INTO `menu_items` (`id`, `category_id`, `name_fr`, `name_en`, `name_it`, `name_ar`, `description_fr`, `description_en`, `description_it`, `description_ar`, `price`, `price_night`, `price_happy_hour`, `happy_hour_start`, `happy_hour_end`, `image_url`, `is_available`, `is_featured`, `prep_time_min`, `disable_at`, `enable_at`, `sort_order`, `created_at`, `updated_at`, `promo_price`, `promo_label`, `promo_start`, `promo_end`) VALUES
('31e505da-d1aa-40ae-bb1a-9d3c8e390e5c', 'e5ccd5fc-7545-414d-99c3-cc09440f3c8a', 'plat1', NULL, NULL, NULL, 'CV   BCVCX', NULL, NULL, NULL, '15.000', NULL, NULL, NULL, NULL, 'http://localhost:3001/uploads/items/temp_1781341131732.jpeg', 1, 0, 13, NULL, NULL, 0, '2026-06-13 09:58:53', '2026-06-13 09:58:53', NULL, NULL, NULL, NULL),
('53b6f579-4666-485f-8bd8-4709153c80a7', '58a6f4d0-80c3-489f-a440-5a81f16610ea', 'Cheese Burger', NULL, NULL, NULL, 'Viande hachée (45g), cheddar, roquette, tomates fraîches, oignons', NULL, NULL, NULL, '15.000', NULL, NULL, NULL, NULL, 'http://localhost:3001/uploads/items/temp_1781113229734.webp', 1, 0, 10, NULL, NULL, 0, '2026-06-10 18:40:34', '2026-06-10 18:40:34', NULL, NULL, NULL, NULL),
('cf3509f1-d816-4e8c-a37c-3fd98b0e6b05', '003f1204-07a4-4d9f-a4a5-cfe22d8d3a01', 'Pâtes à la Truffe', NULL, NULL, NULL, 'Champignons, crème fraiche, fromage', NULL, NULL, NULL, '14.000', NULL, NULL, NULL, NULL, 'http://localhost:3001/uploads/items/cf3509f1-d816-4e8c-a37c-3fd98b0e6b05.webp', 1, 0, 15, NULL, NULL, 1, '2026-06-10 17:31:33', '2026-06-12 00:04:54', '10.000', '15%', '2026-06-11', '2026-06-12'),
('cf85b8a0-7c00-43e3-99ad-98508367b6fe', '58a6f4d0-80c3-489f-a440-5a81f16610ea', 'Le Tonio Cheese', NULL, NULL, NULL, 'Viande hachée façon bouchère (120g), cheddar, roquette, tomates fraîches, oignons, sauce faite maison', NULL, NULL, NULL, '15.000', NULL, NULL, NULL, NULL, 'http://localhost:3001/uploads/items/temp_1781284068959.webp', 1, 0, 10, NULL, NULL, 1, '2026-06-12 18:07:51', '2026-06-12 18:07:51', NULL, NULL, NULL, NULL),
('f418a930-230c-469e-ab25-0afe3370f103', '0c712bde-16b8-4028-93ec-09782f088fa8', 'Orientale', NULL, NULL, NULL, 'Mozzarella, merguez, poivrons, oeuf', NULL, NULL, NULL, '10.000', NULL, NULL, NULL, NULL, 'http://localhost:3001/uploads/items/temp_1781214583972.webp', 1, 0, 16, NULL, NULL, 0, '2026-06-11 22:50:42', '2026-06-11 23:10:28', NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Structure de la table `menu_item_variants`
--

CREATE TABLE `menu_item_variants` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `menu_item_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `label_fr` varchar(80) NOT NULL,
  `label_en` varchar(80) DEFAULT NULL,
  `label_it` varchar(80) DEFAULT NULL,
  `label_ar` varchar(80) DEFAULT NULL,
  `price` decimal(10,3) NOT NULL DEFAULT 0.000,
  `is_available` tinyint(1) NOT NULL DEFAULT 1,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `menu_item_variants`
--

INSERT INTO `menu_item_variants` (`id`, `menu_item_id`, `label_fr`, `label_en`, `label_it`, `label_ar`, `price`, `is_available`, `sort_order`, `created_at`, `updated_at`) VALUES
('2de02b4e-205c-41e8-b77a-ee56da4d4039', 'f418a930-230c-469e-ab25-0afe3370f103', 'Senior', NULL, NULL, NULL, '20.000', 1, 1, '2026-06-11 23:05:58', '2026-06-11 23:05:58'),
('4ff69234-d7a5-4e09-8574-bc31dca51b9d', 'f418a930-230c-469e-ab25-0afe3370f103', 'Familiale', NULL, NULL, NULL, '30.000', 1, 2, '2026-06-11 23:06:10', '2026-06-11 23:06:10'),
('6d47a397-7261-4260-8cc1-eac77ea9f201', 'f418a930-230c-469e-ab25-0afe3370f103', 'Solo', NULL, NULL, NULL, '10.000', 1, 0, '2026-06-11 23:05:43', '2026-06-11 23:05:43');

-- --------------------------------------------------------

--
-- Structure de la table `notifications`
--

CREATE TABLE `notifications` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `restaurant_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `type` varchar(60) NOT NULL,
  `title` varchar(200) NOT NULL,
  `body` text DEFAULT NULL,
  `reference_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `notifications`
--

INSERT INTO `notifications` (`id`, `restaurant_id`, `type`, `title`, `body`, `reference_id`, `is_read`, `created_at`, `updated_at`) VALUES
('0893beb8-7f52-42b9-8d80-62df11978c35', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', 'NEW_ORDER', 'Nouvelle commande', 'Table Tab3 — 2 article(s)', '398adf7b-687f-4c79-9110-5ca78ffd9ef4', 0, '2026-06-11 11:13:45', '2026-06-11 11:13:45'),
('11800572-dc09-4e4d-8f00-61e5f115fa1b', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', 'NEW_ORDER', 'Nouvelle commande', 'Table Tab4 — 1 article(s)', 'd0c59df9-6609-440d-887f-ef7fbf213ff9', 0, '2026-06-12 14:50:36', '2026-06-12 14:50:36'),
('24999565-5403-4d6e-9878-4ae7a5f83405', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', 'CALL_WAITER', 'Appel serveur', 'Table TAB8 — Appel serveur', '83c92446-0d9d-4148-b265-2878b077e6c9', 0, '2026-06-15 15:05:11', '2026-06-15 15:05:11'),
('2763d17a-1815-4322-a266-97cfa765d9fe', 'f82bee2a-3f1b-4e8e-b489-a7851b1648f2', 'NEW_ORDER', 'Nouvelle commande', 'Table Tab2 — 1 article(s)', '75873f85-de50-4a6b-87c1-4aeb62560fa1', 0, '2026-06-15 15:32:52', '2026-06-15 15:32:52'),
('4e755ef6-1abe-4158-b1d9-03c3247a2162', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', 'NEW_ORDER', 'Nouvelle commande', 'Table tab7 — 1 article(s)', '40d7d706-d4ab-4aab-9541-b6bc113b37e6', 0, '2026-06-16 12:37:06', '2026-06-16 12:37:06'),
('5f785da8-0d00-493e-b0a3-13d917bc3231', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', 'NEW_ORDER', 'Nouvelle commande', 'Table TAB5 — 1 article(s)', '41bb2316-da7a-46f8-8bb2-9de2e490ee0b', 0, '2026-06-11 10:26:20', '2026-06-11 10:26:20'),
('68199ef8-b5f6-413e-a31e-a51f07c7ec2a', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', 'CALL_WAITER', 'Appel serveur', 'Table TAB8 — Appel serveur', '549e3691-61ee-4db9-8a2e-3f57dd0bde83', 0, '2026-06-15 15:31:40', '2026-06-15 15:31:40'),
('6b3076d8-24cf-45d3-9978-fc4557f918c4', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', 'NEW_ORDER', 'Nouvelle commande', 'Table tab7 — 1 article(s)', 'bd197739-4062-452e-9227-d150b078f790', 0, '2026-06-16 14:40:55', '2026-06-16 14:40:55'),
('75891797-15a8-44a5-b36f-f67119426338', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', 'NEW_ORDER', 'Nouvelle commande', 'Table TAB5 — 1 article(s)', 'f4e0fab1-5277-49c9-9d78-8220c3192e1a', 0, '2026-06-11 10:51:37', '2026-06-11 10:51:37'),
('81f941b5-5bad-4059-9417-53d7fabfcc59', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', 'NEW_ORDER', 'Nouvelle commande', 'Table TAB8 — 1 article(s)', '72752aef-93d8-4822-8c27-bdd5c1b274fc', 0, '2026-06-15 15:06:29', '2026-06-15 15:06:29'),
('82168c5d-ed32-470e-96a1-f646fbdba362', 'f82bee2a-3f1b-4e8e-b489-a7851b1648f2', 'CALL_WAITER', 'Appel serveur', 'Table 4 — Appel serveur', 'b4a6653b-57eb-45e5-8b7e-0d2d538ec06d', 0, '2026-06-16 10:32:57', '2026-06-16 10:32:57'),
('878b19a8-4c7e-4235-969a-0c30f985a424', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', 'NEW_ORDER', 'Nouvelle commande', 'Table Tab3 — 2 article(s)', 'a6549f32-26c1-4a07-be8f-018bf69ee2b9', 0, '2026-06-11 23:26:18', '2026-06-11 23:26:18'),
('88289378-02fd-4ee7-b4c5-1891f38e2b5d', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', 'CALL_WAITER', 'Appel serveur', 'Table TAB5 — Appel serveur', '3d9b63ed-82bc-4e4f-a215-01f7f44ebc6a', 0, '2026-06-15 15:49:59', '2026-06-15 15:49:59'),
('8ffa1e41-0b4b-49b6-87ff-42543c32cc1b', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', 'CALL_WAITER', 'Appel serveur', 'Table TAB8 — Appel serveur', 'ea20e90a-1fef-4f23-af0d-81e9a287f2de', 0, '2026-06-15 15:34:51', '2026-06-15 15:34:51'),
('a2c71d50-b9b9-4498-b65c-a8f0dcbeb2b1', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', 'NEW_ORDER', 'Nouvelle commande', 'Table Tab3 — 1 article(s)', '7bc38cc6-1ef0-4ab9-8fd1-c546f5c053dc', 0, '2026-06-11 23:06:35', '2026-06-11 23:06:35'),
('ac325ffc-f429-4439-ae78-f257000fd2ac', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', 'NEW_ORDER', 'Nouvelle commande', 'Commande en ligne — 1 article(s)', '27a57067-ff46-40b1-ac72-4c73246df5af', 0, '2026-06-11 10:00:43', '2026-06-11 10:00:43'),
('b48c1bdd-39d1-4b8c-9bf8-d0e1a089b21e', 'f82bee2a-3f1b-4e8e-b489-a7851b1648f2', 'NEW_ORDER', 'Nouvelle commande', 'Table 4 — 1 article(s)', '939c7974-3d05-4597-8116-12c743594962', 0, '2026-06-16 10:28:12', '2026-06-16 10:28:12'),
('c048a0eb-34d0-4d48-99ed-d3e81affc547', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', 'NEW_ORDER', 'Nouvelle commande', 'Table 2 — 1 article(s)', '5d7cb14c-3f7f-40b1-9b65-30b059b27876', 0, '2026-06-13 10:58:55', '2026-06-13 10:58:55'),
('c0a81118-7e19-45d0-9c9e-70bbd06fbffc', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', 'NEW_ORDER', 'Nouvelle commande', 'Commande en ligne — 2 article(s)', '179a4414-1cb6-4a00-a33c-1fb4bcbcea0b', 0, '2026-06-11 11:09:28', '2026-06-11 11:09:28'),
('c21f199b-80e9-4881-b9dd-2ec33bd307e2', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', 'NEW_ORDER', 'Nouvelle commande', 'Table 2 — 1 article(s)', 'e670ecd2-64ad-4e3b-8dad-9425aaeb8291', 0, '2026-06-13 12:29:09', '2026-06-13 12:29:09'),
('c4d74684-cae9-4bec-bfb2-6aa2fac8c15f', 'f82bee2a-3f1b-4e8e-b489-a7851b1648f2', 'CALL_WAITER', 'Appel serveur', 'Table Tab1 — Appel serveur', '3a5d21a2-80b7-4ca0-a45d-92f14f7d0c4c', 0, '2026-06-13 10:01:31', '2026-06-13 10:01:31'),
('c988407b-06ed-4ef3-a403-2b9883500246', 'f82bee2a-3f1b-4e8e-b489-a7851b1648f2', 'NEW_ORDER', 'Nouvelle commande', 'Table 3 — 1 article(s)', '7ce6e8c9-142f-40ee-938a-54d9fd1bc7af', 0, '2026-06-15 12:01:51', '2026-06-15 12:01:51'),
('d4ef74c7-1b3a-4b99-865f-76b14b1450cb', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', 'NEW_ORDER', 'Nouvelle commande', 'Table tab6 — 1 article(s)', '6c5b7fc8-b594-4893-a24f-6cb612ff476a', 0, '2026-06-11 10:37:22', '2026-06-11 10:37:22'),
('d6a2933d-612d-4169-b7c0-6befcf5b4b71', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', 'CALL_WAITER', 'Appel serveur', 'Table TAB5 — Appel serveur', '36ec40f0-aecb-413a-9506-22a37e63310f', 0, '2026-06-15 15:51:00', '2026-06-15 15:51:00'),
('d7aea0bd-4604-42b9-9dea-825c9c166140', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', 'NEW_ORDER', 'Nouvelle commande', 'Table TAB1 — 1 article(s)', 'fa362884-06cd-4a02-a6a0-125e4d7c8b36', 0, '2026-06-11 10:49:00', '2026-06-11 10:49:00'),
('e69cfeca-8608-4a53-8c06-5cbcd84407f3', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', 'NEW_ORDER', 'Nouvelle commande', 'Table tab7 — 1 article(s)', '38ebe9e0-7eda-4847-8523-567d96e470c0', 0, '2026-06-13 12:43:42', '2026-06-13 12:43:42'),
('e7cefc2e-4b14-4e78-92ad-10d83bf57a6c', 'f82bee2a-3f1b-4e8e-b489-a7851b1648f2', 'CALL_WAITER', 'Appel serveur', 'Table 3 — Appel serveur', '5f53f3f4-5a1f-4b1c-9e00-3e26b73ae21b', 0, '2026-06-15 12:04:22', '2026-06-15 12:04:22'),
('f853b16b-4a21-4eb0-9178-e4b94b6d4a46', 'f82bee2a-3f1b-4e8e-b489-a7851b1648f2', 'NEW_ORDER', 'Nouvelle commande', 'Table Tab1 — 1 article(s)', '53372ed2-36ba-467a-92f7-cd96e765478d', 0, '2026-06-13 10:01:50', '2026-06-13 10:01:50');

-- --------------------------------------------------------

--
-- Structure de la table `notification_settings`
--

CREATE TABLE `notification_settings` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `restaurant_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `sound_new_order` tinyint(1) DEFAULT 1,
  `sound_call_waiter` tinyint(1) DEFAULT 1,
  `sound_reservation` tinyint(1) NOT NULL DEFAULT 1,
  `email_new_order` tinyint(1) DEFAULT 0,
  `email_reservation` tinyint(1) DEFAULT 1,
  `email_call_waiter` tinyint(1) DEFAULT 0,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `notification_settings`
--

INSERT INTO `notification_settings` (`id`, `restaurant_id`, `sound_new_order`, `sound_call_waiter`, `sound_reservation`, `email_new_order`, `email_reservation`, `email_call_waiter`, `created_at`, `updated_at`) VALUES
('791ad90c-7ea3-45c7-901a-0b749ddd7196', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', 1, 1, 1, 0, 1, 0, '2026-06-10 11:33:12', '2026-06-10 11:33:12'),
('9efdcbc2-9592-4382-8f96-3244413cafad', '926f35f9-1a80-4272-a0e6-ea4dd37b2118', 1, 1, 1, 0, 1, 0, '2026-06-13 00:39:53', '2026-06-13 00:39:53'),
('ba220420-56d7-4cc8-8b6a-629f8840c040', 'f82bee2a-3f1b-4e8e-b489-a7851b1648f2', 1, 1, 1, 0, 1, 0, '2026-06-13 09:47:36', '2026-06-13 09:47:36');

-- --------------------------------------------------------

--
-- Structure de la table `orders`
--

CREATE TABLE `orders` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `restaurant_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `table_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `staff_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `status` enum('PENDING','CONFIRMED','PREPARING','READY','SERVED','CLOSED','CANCELLED') DEFAULT 'PENDING',
  `total` decimal(10,3) NOT NULL DEFAULT 0.000,
  `payment_method` enum('CASH','CARD','PENDING') DEFAULT 'PENDING',
  `notes` text DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `orders`
--

INSERT INTO `orders` (`id`, `restaurant_id`, `table_id`, `staff_id`, `status`, `total`, `payment_method`, `notes`, `created_at`, `updated_at`) VALUES
('0e336953-6cd7-469f-a7bd-581f86efa7b4', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '41bf6831-47fd-4c89-b622-cdb29415e534', '2fdb3f1b-9ac7-42ac-954d-fdf902f93a89', 'CLOSED', '12.000', 'PENDING', NULL, '2026-06-09 11:41:55', '2026-06-11 10:24:54'),
('173c9634-756b-41c1-8711-f4018761e3d6', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '3c703bd5-c45a-4208-a47c-93ad10fdfbc2', '2fdb3f1b-9ac7-42ac-954d-fdf902f93a89', 'CLOSED', '40.000', 'CASH', NULL, '2026-06-12 15:38:20', '2026-06-13 12:42:30'),
('179a4414-1cb6-4a00-a33c-1fb4bcbcea0b', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', NULL, NULL, 'CANCELLED', '29.000', 'PENDING', NULL, '2026-06-11 11:09:28', '2026-06-11 11:13:09'),
('190192d1-2aff-416d-ba88-311a0bffd526', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '0fd96779-24cc-4ea0-82a7-1e53e3cab151', 'c6a3e0df-2e20-4f3e-9df0-af50f4e6334f', 'CLOSED', '20.000', 'CARD', NULL, '2026-06-16 12:03:49', '2026-06-16 12:11:14'),
('1f197624-6316-4a5b-9caf-e28681a87014', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '2a938c85-ab12-4cde-a1bf-a1f8c30c981b', '2fdb3f1b-9ac7-42ac-954d-fdf902f93a89', 'CLOSED', '15.000', 'CARD', NULL, '2026-06-12 15:53:42', '2026-06-13 12:41:59'),
('27a57067-ff46-40b1-ac72-4c73246df5af', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', NULL, NULL, 'CLOSED', '14.000', 'PENDING', NULL, '2026-06-11 10:00:43', '2026-06-11 10:23:50'),
('2cc50b91-3454-4363-bcae-5ca5c82c6249', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', 'bd5f3f89-8414-4509-b151-ffd2027cbc6b', NULL, 'CLOSED', '14.000', 'PENDING', NULL, '2026-06-10 12:44:17', '2026-06-11 10:24:50'),
('38ebe9e0-7eda-4847-8523-567d96e470c0', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '41bf6831-47fd-4c89-b622-cdb29415e534', NULL, 'CLOSED', '14.000', 'CARD', NULL, '2026-06-13 12:43:42', '2026-06-16 11:34:47'),
('398adf7b-687f-4c79-9110-5ca78ffd9ef4', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '3c703bd5-c45a-4208-a47c-93ad10fdfbc2', NULL, 'CLOSED', '29.000', 'CARD', NULL, '2026-06-11 11:13:45', '2026-06-11 11:23:21'),
('40d7d706-d4ab-4aab-9541-b6bc113b37e6', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '41bf6831-47fd-4c89-b622-cdb29415e534', NULL, 'CLOSED', '15.000', 'CARD', NULL, '2026-06-16 12:37:06', '2026-06-16 12:38:15'),
('41bb2316-da7a-46f8-8bb2-9de2e490ee0b', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '0fd96779-24cc-4ea0-82a7-1e53e3cab151', NULL, 'CLOSED', '14.000', 'CASH', NULL, '2026-06-11 10:26:20', '2026-06-12 14:49:37'),
('4424f53a-629b-4a90-b548-5313a3e99724', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', NULL, NULL, 'CANCELLED', '12.000', 'PENDING', NULL, '2026-06-10 12:17:49', '2026-06-10 12:24:23'),
('465e5c48-04fa-46fb-b1fc-b1248b6978b1', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', 'a794d1b3-5591-49dd-b7b8-bd7141ddceec', '2fdb3f1b-9ac7-42ac-954d-fdf902f93a89', 'CLOSED', '42.000', 'CASH', NULL, '2026-06-12 12:57:15', '2026-06-12 14:43:17'),
('4ecbf60b-c56b-4aee-bfec-0582702b2e7d', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', 'd3e9cef7-894b-4f24-abfb-a6ab674aed9b', NULL, 'CLOSED', '12.000', 'PENDING', NULL, '2026-06-08 23:42:21', '2026-06-08 23:43:05'),
('53372ed2-36ba-467a-92f7-cd96e765478d', 'f82bee2a-3f1b-4e8e-b489-a7851b1648f2', 'f30d9ac6-5108-47e6-b8c5-f4c3f5a0d7c6', NULL, 'CLOSED', '15.000', 'CASH', NULL, '2026-06-13 10:01:50', '2026-06-15 12:02:55'),
('5b18d1d3-aea5-46af-9dfa-f2198124d30d', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '0fd96779-24cc-4ea0-82a7-1e53e3cab151', NULL, 'CANCELLED', '14.000', 'PENDING', NULL, '2026-06-10 12:36:47', '2026-06-10 12:39:17'),
('5d7cb14c-3f7f-40b1-9b65-30b059b27876', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', 'a794d1b3-5591-49dd-b7b8-bd7141ddceec', NULL, 'CLOSED', '15.000', 'PENDING', NULL, '2026-06-13 10:58:55', '2026-06-13 12:12:35'),
('5e499823-d26a-4af0-929b-a3a63205cf96', 'f82bee2a-3f1b-4e8e-b489-a7851b1648f2', 'f30d9ac6-5108-47e6-b8c5-f4c3f5a0d7c6', '4f1c5a80-eecc-4bee-af97-b89e3103b88f', 'CLOSED', '15.000', 'CARD', NULL, '2026-06-16 10:09:20', '2026-06-16 10:28:59'),
('6c5b7fc8-b594-4893-a24f-6cb612ff476a', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', 'bd5f3f89-8414-4509-b151-ffd2027cbc6b', NULL, 'CLOSED', '15.000', 'CASH', NULL, '2026-06-11 10:37:22', '2026-06-12 14:34:27'),
('6e80c40d-176f-4043-abeb-ef6a131313c8', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '0fd96779-24cc-4ea0-82a7-1e53e3cab151', NULL, 'CLOSED', '12.000', 'CASH', NULL, '2026-06-10 12:29:01', '2026-06-11 10:24:16'),
('72752aef-93d8-4822-8c27-bdd5c1b274fc', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '1a72ddd2-bd3d-4381-a958-e4ce759bd787', NULL, 'CLOSED', '15.000', 'CASH', NULL, '2026-06-15 15:06:29', '2026-06-16 11:43:58'),
('75873f85-de50-4a6b-87c1-4aeb62560fa1', 'f82bee2a-3f1b-4e8e-b489-a7851b1648f2', '0054bf66-4737-424a-b78b-5eb470037f30', NULL, 'CLOSED', '15.000', 'CASH', NULL, '2026-06-15 15:32:52', '2026-06-16 10:07:48'),
('7bc38cc6-1ef0-4ab9-8fd1-c546f5c053dc', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '3c703bd5-c45a-4208-a47c-93ad10fdfbc2', NULL, 'CLOSED', '20.000', 'CASH', NULL, '2026-06-11 23:06:35', '2026-06-12 14:48:46'),
('7ce6e8c9-142f-40ee-938a-54d9fd1bc7af', 'f82bee2a-3f1b-4e8e-b489-a7851b1648f2', '04a22c64-b2bf-4367-89d5-dca6b4d4b9ce', NULL, 'CLOSED', '15.000', 'CARD', NULL, '2026-06-15 12:01:51', '2026-06-16 09:22:57'),
('86b6ccc1-98fe-4cda-bb03-1b545aaece7d', 'f82bee2a-3f1b-4e8e-b489-a7851b1648f2', 'f30d9ac6-5108-47e6-b8c5-f4c3f5a0d7c6', '4f1c5a80-eecc-4bee-af97-b89e3103b88f', 'CLOSED', '15.000', 'CARD', NULL, '2026-06-16 11:16:53', '2026-06-16 12:54:48'),
('896cb3ce-de61-4315-91e2-d0c2f830fb02', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', NULL, NULL, 'CANCELLED', '12.000', 'PENDING', NULL, '2026-06-10 12:17:05', '2026-06-10 12:24:15'),
('939c7974-3d05-4597-8116-12c743594962', 'f82bee2a-3f1b-4e8e-b489-a7851b1648f2', '1c0cf590-8cc8-4d71-97fc-058e478fe384', NULL, 'CLOSED', '15.000', 'PENDING', NULL, '2026-06-16 10:28:12', '2026-06-16 10:34:45'),
('96d36992-5319-4cd3-975f-45c6c5365b9f', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '2a938c85-ab12-4cde-a1bf-a1f8c30c981b', NULL, 'CLOSED', '12.000', 'PENDING', NULL, '2026-06-10 12:11:28', '2026-06-11 10:24:53'),
('a6549f32-26c1-4a07-be8f-018bf69ee2b9', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '3c703bd5-c45a-4208-a47c-93ad10fdfbc2', NULL, 'CLOSED', '55.000', 'CARD', NULL, '2026-06-11 23:26:18', '2026-06-12 14:24:27'),
('adbebd72-ced2-42a4-8e73-7d0c2f1ac4bd', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '0fd96779-24cc-4ea0-82a7-1e53e3cab151', '2fdb3f1b-9ac7-42ac-954d-fdf902f93a89', 'CLOSED', '14.000', 'CARD', NULL, '2026-06-09 11:13:00', '2026-06-09 12:07:11'),
('b2e7b21a-5470-4c1c-87b8-a495e50a6e11', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', 'bd5f3f89-8414-4509-b151-ffd2027cbc6b', NULL, 'CANCELLED', '14.000', 'PENDING', NULL, '2026-06-10 12:51:23', '2026-06-11 10:13:55'),
('bd197739-4062-452e-9227-d150b078f790', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '41bf6831-47fd-4c89-b622-cdb29415e534', NULL, 'CLOSED', '20.000', 'CARD', NULL, '2026-06-16 14:40:55', '2026-06-16 14:58:18'),
('c7db06cb-460a-46a8-ba0f-1626a7ec61b9', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', 'd3e9cef7-894b-4f24-abfb-a6ab674aed9b', NULL, 'CLOSED', '14.000', 'CARD', NULL, '2026-06-09 09:55:26', '2026-06-09 10:17:07'),
('c92e393c-0798-4482-a6f6-71518f0a3596', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', NULL, NULL, 'CLOSED', '26.000', 'PENDING', NULL, '2026-06-08 23:44:20', '2026-06-09 09:57:27'),
('d0c59df9-6609-440d-887f-ef7fbf213ff9', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', 'd3e9cef7-894b-4f24-abfb-a6ab674aed9b', NULL, 'CLOSED', '15.000', 'CARD', NULL, '2026-06-12 14:50:36', '2026-06-16 11:05:18'),
('d59a6c5d-c331-4b84-9501-ba4105d23cd2', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', 'bd5f3f89-8414-4509-b151-ffd2027cbc6b', NULL, 'CLOSED', '14.000', 'PENDING', NULL, '2026-06-10 13:56:12', '2026-06-11 10:24:51'),
('deac5c34-2da5-40ac-8b3e-ebb05344ea7d', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '0fd96779-24cc-4ea0-82a7-1e53e3cab151', 'd496387b-d985-41f0-aeba-70d74b655795', 'CONFIRMED', '10.000', 'PENDING', NULL, '2026-06-16 14:59:27', '2026-06-16 14:59:29'),
('e33a4070-b06f-4cbf-b627-61f006be9a57', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', 'a794d1b3-5591-49dd-b7b8-bd7141ddceec', NULL, 'CLOSED', '12.000', 'PENDING', NULL, '2026-06-09 10:26:11', '2026-06-11 10:24:55'),
('e670ecd2-64ad-4e3b-8dad-9425aaeb8291', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', 'a794d1b3-5591-49dd-b7b8-bd7141ddceec', NULL, 'CLOSED', '23.000', 'CARD', NULL, '2026-06-13 12:29:09', '2026-06-15 10:14:03'),
('f4e0fab1-5277-49c9-9d78-8220c3192e1a', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '0fd96779-24cc-4ea0-82a7-1e53e3cab151', NULL, 'CLOSED', '15.000', 'CARD', NULL, '2026-06-11 10:51:37', '2026-06-12 14:34:40'),
('f5ceee5d-4a12-4ed2-84e2-3ed52abeb953', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', 'a794d1b3-5591-49dd-b7b8-bd7141ddceec', 'd496387b-d985-41f0-aeba-70d74b655795', 'CLOSED', '14.000', 'CASH', NULL, '2026-06-16 13:04:39', '2026-06-16 14:32:21'),
('fa362884-06cd-4a02-a6a0-125e4d7c8b36', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '2a938c85-ab12-4cde-a1bf-a1f8c30c981b', NULL, 'CLOSED', '15.000', 'CASH', NULL, '2026-06-11 10:49:00', '2026-06-11 11:23:44');

-- --------------------------------------------------------

--
-- Structure de la table `order_items`
--

CREATE TABLE `order_items` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `order_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `menu_item_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `quantity` tinyint(4) NOT NULL DEFAULT 1,
  `unit_price` decimal(10,3) NOT NULL,
  `name_snapshot` varchar(80) NOT NULL,
  `notes` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `order_items`
--

INSERT INTO `order_items` (`id`, `order_id`, `menu_item_id`, `quantity`, `unit_price`, `name_snapshot`, `notes`) VALUES
('051bb940-6196-4216-ab1d-ca4051269555', '1f197624-6316-4a5b-9caf-e28681a87014', '53b6f579-4666-485f-8bd8-4709153c80a7', 1, '15.000', 'Cheese Burger', NULL),
('06a6f527-4943-4da1-8737-f68b58d88450', '41bb2316-da7a-46f8-8bb2-9de2e490ee0b', 'cf3509f1-d816-4e8c-a37c-3fd98b0e6b05', 1, '14.000', 'Pâtes à la Truffe', NULL),
('08650f0b-cd4b-4b87-9188-5c59faa153bc', '398adf7b-687f-4c79-9110-5ca78ffd9ef4', '53b6f579-4666-485f-8bd8-4709153c80a7', 1, '15.000', 'Cheese Burger', NULL),
('0a032034-48e0-418b-9dd0-6d783c61a332', '2cc50b91-3454-4363-bcae-5ca5c82c6249', NULL, 1, '12.000', 'kouskous', NULL),
('0f3f8b7a-9327-49aa-87a7-327e94bdc0e3', 'adbebd72-ced2-42a4-8e73-7d0c2f1ac4bd', NULL, 1, '12.000', 'kouskous', NULL),
('0f7afbfb-504e-4dea-9e5b-7854491fcc33', 'c92e393c-0798-4482-a6f6-71518f0a3596', NULL, 1, '12.000', 'kouskous', NULL),
('100bd5cb-806d-4b5e-9c1d-ed5d7a6782f2', '96d36992-5319-4cd3-975f-45c6c5365b9f', NULL, 1, '12.000', 'kouskous', NULL),
('12a99195-06e4-49be-a869-cc7461df975a', '5b18d1d3-aea5-46af-9dfa-f2198124d30d', NULL, 1, '12.000', 'kouskous', NULL),
('1705a2cb-ad9d-43f4-b186-07b880f82a8d', '465e5c48-04fa-46fb-b1fc-b1248b6978b1', 'f418a930-230c-469e-ab25-0afe3370f103', 1, '10.000', 'Orientale', NULL),
('307b5ed2-5fc8-4968-bb96-bb1c0a0dfba0', '7bc38cc6-1ef0-4ab9-8fd1-c546f5c053dc', 'f418a930-230c-469e-ab25-0afe3370f103', 1, '20.000', 'Orientale', NULL),
('322972fd-5105-493a-b037-c99cff2cab78', '75873f85-de50-4a6b-87c1-4aeb62560fa1', '31e505da-d1aa-40ae-bb1a-9d3c8e390e5c', 1, '15.000', 'plat1', NULL),
('3350cba9-2410-4e4b-9988-d307e98e41a4', 'bd197739-4062-452e-9227-d150b078f790', 'f418a930-230c-469e-ab25-0afe3370f103', 1, '20.000', 'Orientale (Senior)', NULL),
('3685a37f-1e9a-485b-a4f5-305b5bb9377e', '896cb3ce-de61-4315-91e2-d0c2f830fb02', NULL, 1, '12.000', 'kouskous', NULL),
('393bbf3d-2685-4a72-95e5-d0908c1f1745', '465e5c48-04fa-46fb-b1fc-b1248b6978b1', 'cf3509f1-d816-4e8c-a37c-3fd98b0e6b05', 1, '14.000', 'Pâtes à la Truffe', NULL),
('3b755847-2c5f-4882-91ea-09dd1ec8e233', 'f5ceee5d-4a12-4ed2-84e2-3ed52abeb953', 'cf3509f1-d816-4e8c-a37c-3fd98b0e6b05', 1, '14.000', 'Pâtes à la Truffe', NULL),
('3eb6323f-28a2-4e1e-a237-b55217e9d134', '53372ed2-36ba-467a-92f7-cd96e765478d', '31e505da-d1aa-40ae-bb1a-9d3c8e390e5c', 1, '15.000', 'plat1', NULL),
('42cd0aee-eca1-4c73-b66c-d69320d81b83', '72752aef-93d8-4822-8c27-bdd5c1b274fc', '53b6f579-4666-485f-8bd8-4709153c80a7', 1, '15.000', 'Cheese Burger', NULL),
('42dff617-b9f1-4517-878e-4bd90fcd678a', '0e336953-6cd7-469f-a7bd-581f86efa7b4', NULL, 1, '12.000', 'kouskous', NULL),
('459747fe-f1b4-48b4-aa28-bb15e428d41b', 'd59a6c5d-c331-4b84-9501-ba4105d23cd2', NULL, 1, '12.000', 'kouskous', NULL),
('494131da-85d7-47a9-9efe-d2e2a159ada8', 'e670ecd2-64ad-4e3b-8dad-9425aaeb8291', 'f418a930-230c-469e-ab25-0afe3370f103', 1, '20.000', 'Orientale (Senior)', NULL),
('4d27aa16-f50c-4a07-9376-a4cce9df20b3', 'c92e393c-0798-4482-a6f6-71518f0a3596', NULL, 1, '12.000', 'kouskous', NULL),
('6a5b7b43-6023-47ee-888b-a00a91ab95b1', 'b2e7b21a-5470-4c1c-87b8-a495e50a6e11', NULL, 1, '12.000', 'kouskous', NULL),
('6e62864b-c0e5-4073-9489-d1b0f591d195', 'c7db06cb-460a-46a8-ba0f-1626a7ec61b9', NULL, 1, '12.000', 'kouskous', NULL),
('763fa026-cf67-490a-ad3e-ef3c719ea91f', '190192d1-2aff-416d-ba88-311a0bffd526', 'f418a930-230c-469e-ab25-0afe3370f103', 1, '20.000', 'Orientale', NULL),
('7757933f-079d-44a0-80a6-e1c6a9c0f531', '465e5c48-04fa-46fb-b1fc-b1248b6978b1', '53b6f579-4666-485f-8bd8-4709153c80a7', 1, '15.000', 'Cheese Burger', NULL),
('8108abf5-6510-40ea-bfe5-5ddbcdf04c3e', '6e80c40d-176f-4043-abeb-ef6a131313c8', NULL, 1, '12.000', 'kouskous', NULL),
('85f7e4f0-d0e9-4714-8775-40c10fb93fd7', 'a6549f32-26c1-4a07-be8f-018bf69ee2b9', 'f418a930-230c-469e-ab25-0afe3370f103', 1, '20.000', 'Orientale (Senior)', NULL),
('875f07be-5911-4584-ba8c-d066f6a209bc', '939c7974-3d05-4597-8116-12c743594962', '31e505da-d1aa-40ae-bb1a-9d3c8e390e5c', 1, '15.000', 'plat1', NULL),
('946bd744-6d65-435b-b2d2-957e79206968', 'f4e0fab1-5277-49c9-9d78-8220c3192e1a', '53b6f579-4666-485f-8bd8-4709153c80a7', 1, '15.000', 'Cheese Burger', NULL),
('959a98b7-5c99-4b3e-85ba-2e5ea0a6485d', 'e33a4070-b06f-4cbf-b627-61f006be9a57', NULL, 1, '12.000', 'kouskous', NULL),
('9b7a4505-0bff-4cb4-8cda-973d7aa00fb0', '4424f53a-629b-4a90-b548-5313a3e99724', NULL, 1, '12.000', 'kouskous', NULL),
('9c8ed6c4-4283-4ac1-8f4f-7a8e5ee1a543', '398adf7b-687f-4c79-9110-5ca78ffd9ef4', 'cf3509f1-d816-4e8c-a37c-3fd98b0e6b05', 1, '14.000', 'Pâtes à la Truffe', NULL),
('a2d7564d-7100-48ef-9615-e2c76f11527f', '179a4414-1cb6-4a00-a33c-1fb4bcbcea0b', '53b6f579-4666-485f-8bd8-4709153c80a7', 1, '15.000', 'Cheese Burger', NULL),
('a3f6e709-cd7a-4786-9853-90b5961d9a41', 'fa362884-06cd-4a02-a6a0-125e4d7c8b36', '53b6f579-4666-485f-8bd8-4709153c80a7', 1, '15.000', 'Cheese Burger', NULL),
('a59ff834-f36c-42f8-a597-a505674117b5', 'deac5c34-2da5-40ac-8b3e-ebb05344ea7d', 'f418a930-230c-469e-ab25-0afe3370f103', 1, '10.000', 'Orientale', NULL),
('a786d4a9-b8cb-49de-a7c3-791576550c52', '4ecbf60b-c56b-4aee-bfec-0582702b2e7d', NULL, 1, '12.000', 'kouskous', NULL),
('a94305ee-8118-4a84-bef3-1bc32fe1a774', '40d7d706-d4ab-4aab-9541-b6bc113b37e6', '53b6f579-4666-485f-8bd8-4709153c80a7', 1, '15.000', 'Cheese Burger', NULL),
('ae3e2b7b-2178-48dc-8a74-a2ecef278ff8', 'd0c59df9-6609-440d-887f-ef7fbf213ff9', '53b6f579-4666-485f-8bd8-4709153c80a7', 1, '15.000', 'Cheese Burger', NULL),
('bee7ce61-7f6c-4cce-ae6f-b579a20a8aaa', '179a4414-1cb6-4a00-a33c-1fb4bcbcea0b', 'cf3509f1-d816-4e8c-a37c-3fd98b0e6b05', 1, '14.000', 'Pâtes à la Truffe', NULL),
('c17ad5dc-d6df-4ff6-9c20-860f0bba3cc3', 'a6549f32-26c1-4a07-be8f-018bf69ee2b9', 'f418a930-230c-469e-ab25-0afe3370f103', 1, '30.000', 'Orientale (Familiale)', NULL),
('ca4412ca-8c43-4cbf-a845-cc6ce44b546b', '5e499823-d26a-4af0-929b-a3a63205cf96', '31e505da-d1aa-40ae-bb1a-9d3c8e390e5c', 1, '15.000', 'plat1', NULL),
('cc3ac66a-d230-4a25-9cc2-58a57a9b1d11', '5d7cb14c-3f7f-40b1-9b65-30b059b27876', '53b6f579-4666-485f-8bd8-4709153c80a7', 1, '15.000', 'Cheese Burger', NULL),
('e471f154-76aa-4a8f-8be7-0fabb6de33a4', '6c5b7fc8-b594-4893-a24f-6cb612ff476a', '53b6f579-4666-485f-8bd8-4709153c80a7', 1, '15.000', 'Cheese Burger', NULL),
('e66e8297-61fc-47d8-aae3-beb866d39d1e', '27a57067-ff46-40b1-ac72-4c73246df5af', NULL, 1, '14.000', 'kouskous', NULL),
('fa1d8435-71a1-4273-9c4f-b6636cd3d846', '86b6ccc1-98fe-4cda-bb03-1b545aaece7d', '31e505da-d1aa-40ae-bb1a-9d3c8e390e5c', 1, '15.000', 'plat1', NULL),
('fcd167c6-7cc2-4fd3-813d-cf388a16eb57', '38ebe9e0-7eda-4847-8523-567d96e470c0', 'cf3509f1-d816-4e8c-a37c-3fd98b0e6b05', 1, '14.000', 'Pâtes à la Truffe', NULL),
('fe4a59cd-34fc-49cc-82d5-59767219c878', '173c9634-756b-41c1-8711-f4018761e3d6', 'f418a930-230c-469e-ab25-0afe3370f103', 2, '20.000', 'Orientale', 'dfghjklknbvcx'),
('fffd080a-9de4-46f3-beaa-67b6cc39e0cc', '7ce6e8c9-142f-40ee-938a-54d9fd1bc7af', '31e505da-d1aa-40ae-bb1a-9d3c8e390e5c', 1, '15.000', 'plat1', NULL);

-- --------------------------------------------------------

--
-- Structure de la table `order_item_supplements`
--

CREATE TABLE `order_item_supplements` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `order_item_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `supplement_option_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `option_name_snapshot` varchar(80) NOT NULL,
  `extra_price` decimal(10,3) NOT NULL DEFAULT 0.000
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `order_item_supplements`
--

INSERT INTO `order_item_supplements` (`id`, `order_item_id`, `supplement_option_id`, `option_name_snapshot`, `extra_price`) VALUES
('0ca8f246-e717-4534-ac48-36eaece8a4bd', '1705a2cb-ad9d-43f4-b186-07b880f82a8d', '63e2a561-f047-451c-aec7-9f3152fb87e5', 'FRIT', '3.000'),
('1464673c-be85-4c41-870f-af7645060de0', '763fa026-cf67-490a-ad3e-ef3c719ea91f', NULL, 'Senior', '0.000'),
('147c534b-f02e-4922-8c20-86bae8ed6f94', 'fe4a59cd-34fc-49cc-82d5-59767219c878', NULL, 'Senior', '0.000'),
('15b0414d-5681-4db9-9244-291c36fed175', '0f3f8b7a-9327-49aa-87a7-327e94bdc0e3', '2238e041-6133-4e1d-a4e1-cdc124d98de0', 'sauce rouge', '2.000'),
('1e2e8a73-c6c8-48fb-afa4-56fac70403fd', '6e62864b-c0e5-4073-9489-d1b0f591d195', '2238e041-6133-4e1d-a4e1-cdc124d98de0', 'sauce rouge', '2.000'),
('240b89ef-b9fe-4fbc-94a0-c249c90e0a8d', '494131da-85d7-47a9-9efe-d2e2a159ada8', '63e2a561-f047-451c-aec7-9f3152fb87e5', 'FRIT', '3.000'),
('52064b56-f2d3-41d1-9691-1e6e1899b6ca', '6a5b7b43-6023-47ee-888b-a00a91ab95b1', '2238e041-6133-4e1d-a4e1-cdc124d98de0', 'sauce rouge', '2.000'),
('6807ece0-4a58-4980-a61e-5fe11acba74c', '0f7afbfb-504e-4dea-9e5b-7854491fcc33', '2238e041-6133-4e1d-a4e1-cdc124d98de0', 'sauce rouge', '2.000'),
('a04d8a5e-dc20-4ba9-b1dc-a8f01172db0d', 'c17ad5dc-d6df-4ff6-9c20-860f0bba3cc3', 'a51600f0-0044-4858-b390-6f48043bac85', 'FROMMAGE', '5.000'),
('b4d1f7e6-681b-454e-aef2-96d39ff44060', '12a99195-06e4-49be-a869-cc7461df975a', '2238e041-6133-4e1d-a4e1-cdc124d98de0', 'sauce rouge', '2.000'),
('c1a178c6-3d73-4f4f-9c7c-8eed54675fcb', 'a59ff834-f36c-42f8-a597-a505674117b5', NULL, 'Solo', '0.000'),
('d51a391c-9f2f-4721-bad4-a9f49f55fb06', '459747fe-f1b4-48b4-aa28-bb15e428d41b', '2238e041-6133-4e1d-a4e1-cdc124d98de0', 'sauce rouge', '2.000'),
('e8dc5750-dd3d-4264-b9e4-973e853ed686', '0a032034-48e0-418b-9dd0-6d783c61a332', '2238e041-6133-4e1d-a4e1-cdc124d98de0', 'sauce rouge', '2.000');

-- --------------------------------------------------------

--
-- Structure de la table `order_status_logs`
--

CREATE TABLE `order_status_logs` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `order_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `old_status` varchar(20) DEFAULT NULL,
  `new_status` varchar(20) NOT NULL,
  `changed_by` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `created_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `order_status_logs`
--

INSERT INTO `order_status_logs` (`id`, `order_id`, `old_status`, `new_status`, `changed_by`, `created_at`) VALUES
('011b2e0f-51d3-4d31-8c85-571e1ac29df9', 'deac5c34-2da5-40ac-8b3e-ebb05344ea7d', NULL, 'PENDING', 'd496387b-d985-41f0-aeba-70d74b655795', '2026-06-16 14:59:27'),
('02f64dd2-ca3f-4711-a239-2e59373585e1', '398adf7b-687f-4c79-9110-5ca78ffd9ef4', 'PENDING', 'CONFIRMED', '2fdb3f1b-9ac7-42ac-954d-fdf902f93a89', '2026-06-11 11:13:51'),
('05582fe1-14f8-401f-8c7a-8ce7f23e8ab3', '5e499823-d26a-4af0-929b-a3a63205cf96', 'CONFIRMED', 'PREPARING', '4f1c5a80-eecc-4bee-af97-b89e3103b88f', '2026-06-16 10:09:29'),
('0740375f-0bf2-4953-ab5d-3dac3dc51582', '6c5b7fc8-b594-4893-a24f-6cb612ff476a', 'PENDING', 'CONFIRMED', '2fdb3f1b-9ac7-42ac-954d-fdf902f93a89', '2026-06-11 10:37:28'),
('07563858-7f9e-4dec-8855-e7b6ecd74670', '86b6ccc1-98fe-4cda-bb03-1b545aaece7d', 'PREPARING', 'READY', '4f1c5a80-eecc-4bee-af97-b89e3103b88f', '2026-06-16 11:17:03'),
('078e347f-345a-4b82-9115-db5ba55b9fe7', 'd0c59df9-6609-440d-887f-ef7fbf213ff9', 'PENDING', 'CONFIRMED', '2fdb3f1b-9ac7-42ac-954d-fdf902f93a89', '2026-06-12 14:50:43'),
('088d6621-255b-44c2-9466-984101f89a80', '75873f85-de50-4a6b-87c1-4aeb62560fa1', 'PREPARING', 'READY', 'bdf11593-ff2d-4f13-81ac-8c6cd8d1131d', '2026-06-16 09:23:33'),
('0a83a419-5681-44f0-860d-da2851ea893a', 'a6549f32-26c1-4a07-be8f-018bf69ee2b9', 'PREPARING', 'READY', '2fdb3f1b-9ac7-42ac-954d-fdf902f93a89', '2026-06-11 23:26:39'),
('0b9db9aa-805c-4f04-981a-3c4fc72b2e6c', '41bb2316-da7a-46f8-8bb2-9de2e490ee0b', 'READY', 'SERVED', '2fdb3f1b-9ac7-42ac-954d-fdf902f93a89', '2026-06-12 14:49:27'),
('0eee6fe9-e7c1-46cf-a2f8-8585bf677216', 'd59a6c5d-c331-4b84-9501-ba4105d23cd2', 'PENDING', 'CONFIRMED', '2fdb3f1b-9ac7-42ac-954d-fdf902f93a89', '2026-06-11 10:09:06'),
('11790755-5fd1-4a4e-84ce-8a0c487363f4', 'adbebd72-ced2-42a4-8e73-7d0c2f1ac4bd', NULL, 'PENDING', '2fdb3f1b-9ac7-42ac-954d-fdf902f93a89', '2026-06-09 11:13:00'),
('16cdfeba-77e9-4f37-a72c-d2eec4e2dada', '6e80c40d-176f-4043-abeb-ef6a131313c8', 'PENDING', 'CONFIRMED', '2fdb3f1b-9ac7-42ac-954d-fdf902f93a89', '2026-06-10 12:29:28'),
('1758448f-4e36-49b8-b249-78b10c090f2e', '86b6ccc1-98fe-4cda-bb03-1b545aaece7d', 'CONFIRMED', 'PREPARING', '4f1c5a80-eecc-4bee-af97-b89e3103b88f', '2026-06-16 11:17:02'),
('1af0d5bc-861f-4835-88ea-5e0686053be1', '96d36992-5319-4cd3-975f-45c6c5365b9f', 'CONFIRMED', 'PREPARING', '2fdb3f1b-9ac7-42ac-954d-fdf902f93a89', '2026-06-10 12:24:37'),
('1bb14767-75a9-4626-b404-339d9c01a212', '0e336953-6cd7-469f-a7bd-581f86efa7b4', 'SERVED', 'CLOSED', '2fdb3f1b-9ac7-42ac-954d-fdf902f93a89', '2026-06-11 10:24:54'),
('1d960da6-561a-43d3-9ec7-5125af7b17af', '7ce6e8c9-142f-40ee-938a-54d9fd1bc7af', 'PENDING', 'CONFIRMED', 'bdf11593-ff2d-4f13-81ac-8c6cd8d1131d', '2026-06-15 12:01:59'),
('205034a4-7934-4d46-be83-b6f9bb79f3af', '96d36992-5319-4cd3-975f-45c6c5365b9f', 'READY', 'SERVED', '2fdb3f1b-9ac7-42ac-954d-fdf902f93a89', '2026-06-10 12:39:57'),
('26a17b03-b5e9-42fc-b4a6-965811095ead', 'f5ceee5d-4a12-4ed2-84e2-3ed52abeb953', NULL, 'PENDING', 'd496387b-d985-41f0-aeba-70d74b655795', '2026-06-16 13:04:39'),
('279f2210-b5da-4041-8d8e-ccae75541d19', '86b6ccc1-98fe-4cda-bb03-1b545aaece7d', 'PENDING', 'CONFIRMED', '4f1c5a80-eecc-4bee-af97-b89e3103b88f', '2026-06-16 11:16:57'),
('282d31f2-041b-4700-a01a-37e8dd7e9954', 'e670ecd2-64ad-4e3b-8dad-9425aaeb8291', 'PREPARING', 'READY', '2fdb3f1b-9ac7-42ac-954d-fdf902f93a89', '2026-06-13 12:39:48'),
('31c680b1-b25e-48c7-82bf-e5b428234e49', 'b2e7b21a-5470-4c1c-87b8-a495e50a6e11', 'PREPARING', 'READY', '2fdb3f1b-9ac7-42ac-954d-fdf902f93a89', '2026-06-11 10:10:41'),
('333e463b-82eb-45ac-9c0f-36680371023a', 'e33a4070-b06f-4cbf-b627-61f006be9a57', 'SERVED', 'CLOSED', '2fdb3f1b-9ac7-42ac-954d-fdf902f93a89', '2026-06-11 10:24:55'),
('362ea480-71da-4ae8-9744-0fd2b6579ce7', '2cc50b91-3454-4363-bcae-5ca5c82c6249', 'READY', 'SERVED', '2fdb3f1b-9ac7-42ac-954d-fdf902f93a89', '2026-06-11 10:24:45'),
('36de00d7-aa97-4112-92b9-727b1fc205a4', '173c9634-756b-41c1-8711-f4018761e3d6', 'PENDING', 'CONFIRMED', '2fdb3f1b-9ac7-42ac-954d-fdf902f93a89', '2026-06-12 15:53:47'),
('38688935-bacd-4a14-ae19-3b4835f1139f', 'fa362884-06cd-4a02-a6a0-125e4d7c8b36', 'PENDING', 'CONFIRMED', '2fdb3f1b-9ac7-42ac-954d-fdf902f93a89', '2026-06-11 10:49:09'),
('394a2c0b-2ce1-4f86-927c-8d13fbf6c9d3', '7ce6e8c9-142f-40ee-938a-54d9fd1bc7af', 'PREPARING', 'READY', 'bdf11593-ff2d-4f13-81ac-8c6cd8d1131d', '2026-06-15 12:08:26'),
('3a4a2efa-be11-4e0d-8c06-df33a719cac5', '5b18d1d3-aea5-46af-9dfa-f2198124d30d', 'PENDING', 'CANCELLED', '2fdb3f1b-9ac7-42ac-954d-fdf902f93a89', '2026-06-10 12:39:17'),
('3cbe057d-6f63-42c5-b50d-a9705c02b424', '40d7d706-d4ab-4aab-9541-b6bc113b37e6', 'PREPARING', 'READY', 'd496387b-d985-41f0-aeba-70d74b655795', '2026-06-16 12:37:31'),
('3cfd2350-0afd-4b4d-8233-73a78307d70a', '53372ed2-36ba-467a-92f7-cd96e765478d', 'PREPARING', 'READY', 'bdf11593-ff2d-4f13-81ac-8c6cd8d1131d', '2026-06-13 12:19:22'),
('3d9959c6-1be3-4698-ab7e-bf691e89b110', 'a6549f32-26c1-4a07-be8f-018bf69ee2b9', 'PENDING', 'CONFIRMED', '2fdb3f1b-9ac7-42ac-954d-fdf902f93a89', '2026-06-11 23:26:24'),
('3df7c84a-3401-417e-989c-c842123eea0b', '939c7974-3d05-4597-8116-12c743594962', 'PENDING', 'CONFIRMED', '4f1c5a80-eecc-4bee-af97-b89e3103b88f', '2026-06-16 10:28:19'),
('3f49cc92-870f-45d9-901b-8968cb5bf547', 'f4e0fab1-5277-49c9-9d78-8220c3192e1a', 'PENDING', 'CONFIRMED', '2fdb3f1b-9ac7-42ac-954d-fdf902f93a89', '2026-06-11 10:51:44'),
('43888c47-eaf4-4de1-8da9-cffc2c77b118', '7bc38cc6-1ef0-4ab9-8fd1-c546f5c053dc', 'READY', 'SERVED', '2fdb3f1b-9ac7-42ac-954d-fdf902f93a89', '2026-06-12 14:44:23'),
('4bd110b3-ec95-435e-a8b3-441d91bed7fa', '939c7974-3d05-4597-8116-12c743594962', 'SERVED', 'CLOSED', '4f1c5a80-eecc-4bee-af97-b89e3103b88f', '2026-06-16 10:34:45'),
('4c891306-6950-41aa-8f37-1993bd5fd92f', '40d7d706-d4ab-4aab-9541-b6bc113b37e6', 'PENDING', 'CONFIRMED', 'd496387b-d985-41f0-aeba-70d74b655795', '2026-06-16 12:37:13'),
('4c8c96bc-9300-4dc1-a3c9-f49ccf773ad7', '5e499823-d26a-4af0-929b-a3a63205cf96', 'PENDING', 'CONFIRMED', '4f1c5a80-eecc-4bee-af97-b89e3103b88f', '2026-06-16 10:09:26'),
('4ea16f91-5e6a-4017-8a13-417a87fa2b0e', 'e33a4070-b06f-4cbf-b627-61f006be9a57', 'PENDING', 'CONFIRMED', '2fdb3f1b-9ac7-42ac-954d-fdf902f93a89', '2026-06-09 10:26:24'),
('50083f6f-e72a-423c-9925-2b7db675edfd', '41bb2316-da7a-46f8-8bb2-9de2e490ee0b', 'PENDING', 'CONFIRMED', '2fdb3f1b-9ac7-42ac-954d-fdf902f93a89', '2026-06-11 10:26:27'),
('529f8c8c-e8ce-465c-8c29-a5a73ada8420', 'a6549f32-26c1-4a07-be8f-018bf69ee2b9', 'CONFIRMED', 'PREPARING', '2fdb3f1b-9ac7-42ac-954d-fdf902f93a89', '2026-06-11 23:26:37'),
('52eeafff-0d10-4719-ac32-d15dcdc65361', '173c9634-756b-41c1-8711-f4018761e3d6', 'READY', 'SERVED', '2fdb3f1b-9ac7-42ac-954d-fdf902f93a89', '2026-06-13 12:08:57'),
('53dde5ba-30cf-4ff6-a557-c00951a16125', '40d7d706-d4ab-4aab-9541-b6bc113b37e6', 'READY', 'SERVED', 'd496387b-d985-41f0-aeba-70d74b655795', '2026-06-16 12:37:33'),
('56bc6526-6f47-41c3-a086-d57d68bcba1c', '38ebe9e0-7eda-4847-8523-567d96e470c0', 'PENDING', 'CONFIRMED', '2fdb3f1b-9ac7-42ac-954d-fdf902f93a89', '2026-06-13 12:43:54'),
('56bfeef8-48ee-4891-9358-49b7678d706a', 'adbebd72-ced2-42a4-8e73-7d0c2f1ac4bd', 'CONFIRMED', 'PREPARING', '2fdb3f1b-9ac7-42ac-954d-fdf902f93a89', '2026-06-09 11:42:07'),
('59ad9898-f508-4bd3-a6aa-312d4a534ce4', 'd59a6c5d-c331-4b84-9501-ba4105d23cd2', 'SERVED', 'CLOSED', '2fdb3f1b-9ac7-42ac-954d-fdf902f93a89', '2026-06-11 10:24:51'),
('5b498bb7-93f3-4773-875c-151288b2a9f5', '190192d1-2aff-416d-ba88-311a0bffd526', NULL, 'PENDING', 'c6a3e0df-2e20-4f3e-9df0-af50f4e6334f', '2026-06-16 12:03:49'),
('5d91b81d-06f7-457c-879d-d07afb1cb0fe', '465e5c48-04fa-46fb-b1fc-b1248b6978b1', NULL, 'PENDING', '2fdb3f1b-9ac7-42ac-954d-fdf902f93a89', '2026-06-12 12:57:15'),
('5ffa87af-ad18-4b70-8bf5-05aba2630691', 'e33a4070-b06f-4cbf-b627-61f006be9a57', 'CONFIRMED', 'PREPARING', '2fdb3f1b-9ac7-42ac-954d-fdf902f93a89', '2026-06-09 10:30:43'),
('614ded44-df5b-4785-aeaf-45d0a9abc3a5', '190192d1-2aff-416d-ba88-311a0bffd526', 'READY', 'SERVED', 'd496387b-d985-41f0-aeba-70d74b655795', '2026-06-16 12:10:58'),
('61a221f6-65f1-47be-8420-7c6984d68786', '0e336953-6cd7-469f-a7bd-581f86efa7b4', 'PREPARING', 'READY', '2fdb3f1b-9ac7-42ac-954d-fdf902f93a89', '2026-06-11 10:13:14'),
('627984e8-9cf2-4e92-ae2e-bf40560dd403', '6c5b7fc8-b594-4893-a24f-6cb612ff476a', 'CONFIRMED', 'PREPARING', '2fdb3f1b-9ac7-42ac-954d-fdf902f93a89', '2026-06-11 11:09:44'),
('6313335f-0146-4156-9e28-d985c1486c59', 'd0c59df9-6609-440d-887f-ef7fbf213ff9', 'CONFIRMED', 'PREPARING', '2fdb3f1b-9ac7-42ac-954d-fdf902f93a89', '2026-06-13 11:51:23'),
('63436d2b-ef07-4862-8983-5062ecc41798', 'd0c59df9-6609-440d-887f-ef7fbf213ff9', 'PREPARING', 'READY', '2fdb3f1b-9ac7-42ac-954d-fdf902f93a89', '2026-06-13 11:51:24'),
('63cd172f-4471-4ae4-976d-3fcfabf9065a', '4ecbf60b-c56b-4aee-bfec-0582702b2e7d', 'SERVED', 'CLOSED', '2fdb3f1b-9ac7-42ac-954d-fdf902f93a89', '2026-06-08 23:43:05'),
('640cd3ac-cff6-4f48-b7b7-294147b6a334', '96d36992-5319-4cd3-975f-45c6c5365b9f', 'PREPARING', 'READY', '2fdb3f1b-9ac7-42ac-954d-fdf902f93a89', '2026-06-10 12:39:55'),
('6460c46d-9c6d-4504-a99d-a91bc895426a', '72752aef-93d8-4822-8c27-bdd5c1b274fc', 'READY', 'SERVED', 'c6a3e0df-2e20-4f3e-9df0-af50f4e6334f', '2026-06-16 10:36:38'),
('65481f20-d0fe-4c76-9f81-947930fd1c11', '5d7cb14c-3f7f-40b1-9b65-30b059b27876', 'PENDING', 'CONFIRMED', '2fdb3f1b-9ac7-42ac-954d-fdf902f93a89', '2026-06-13 10:59:04'),
('68224806-07c6-431b-bab9-539fe80fc68a', '7bc38cc6-1ef0-4ab9-8fd1-c546f5c053dc', 'PREPARING', 'READY', '2fdb3f1b-9ac7-42ac-954d-fdf902f93a89', '2026-06-12 14:44:20'),
('6c1c2cdd-4ff3-4b20-8adc-a73687e2bbf4', '86b6ccc1-98fe-4cda-bb03-1b545aaece7d', NULL, 'PENDING', '4f1c5a80-eecc-4bee-af97-b89e3103b88f', '2026-06-16 11:16:53'),
('6e506704-4615-4438-ab9e-f9299f81e72b', '72752aef-93d8-4822-8c27-bdd5c1b274fc', 'CONFIRMED', 'PREPARING', '9cd55930-833f-420c-af71-c9ea7fc6eb92', '2026-06-15 15:15:12'),
('6f44902a-0774-4873-b4df-34d3e789d9db', '939c7974-3d05-4597-8116-12c743594962', 'PREPARING', 'READY', '4f1c5a80-eecc-4bee-af97-b89e3103b88f', '2026-06-16 10:34:22'),
('70db836d-5156-4cc4-8d25-62efbb1046bd', 'c92e393c-0798-4482-a6f6-71518f0a3596', 'PENDING', 'CONFIRMED', '2fdb3f1b-9ac7-42ac-954d-fdf902f93a89', '2026-06-09 09:50:11'),
('72944eb4-8c6e-4e02-80fd-cf27c405bc74', 'fa362884-06cd-4a02-a6a0-125e4d7c8b36', 'CONFIRMED', 'PREPARING', '2fdb3f1b-9ac7-42ac-954d-fdf902f93a89', '2026-06-11 10:50:49'),
('736e4be4-4617-422c-88ba-5f8635c229da', '2cc50b91-3454-4363-bcae-5ca5c82c6249', 'PREPARING', 'READY', '2fdb3f1b-9ac7-42ac-954d-fdf902f93a89', '2026-06-11 10:13:31'),
('73899376-df84-4351-93b3-87407716c108', '0e336953-6cd7-469f-a7bd-581f86efa7b4', NULL, 'PENDING', '2fdb3f1b-9ac7-42ac-954d-fdf902f93a89', '2026-06-09 11:41:55'),
('77fc765a-b3fc-4bbf-8df9-fa2ec6f44383', '7ce6e8c9-142f-40ee-938a-54d9fd1bc7af', 'CONFIRMED', 'PREPARING', 'bdf11593-ff2d-4f13-81ac-8c6cd8d1131d', '2026-06-15 12:02:07'),
('7ac650e9-f372-49a8-9a81-847ee254e5f7', '27a57067-ff46-40b1-ac72-4c73246df5af', 'SERVED', 'CLOSED', '2fdb3f1b-9ac7-42ac-954d-fdf902f93a89', '2026-06-11 10:23:50'),
('7c200da9-a167-4cda-a2f0-c8047fa02f06', '179a4414-1cb6-4a00-a33c-1fb4bcbcea0b', 'PENDING', 'CONFIRMED', '2fdb3f1b-9ac7-42ac-954d-fdf902f93a89', '2026-06-11 11:11:50'),
('7ebb400d-ccd0-45f3-8a8c-e3ee02796c09', '4ecbf60b-c56b-4aee-bfec-0582702b2e7d', 'PREPARING', 'READY', '2fdb3f1b-9ac7-42ac-954d-fdf902f93a89', '2026-06-08 23:42:49'),
('800e4617-d57f-483f-86d7-014b3c00be79', '38ebe9e0-7eda-4847-8523-567d96e470c0', 'PREPARING', 'READY', 'c6a3e0df-2e20-4f3e-9df0-af50f4e6334f', '2026-06-16 11:04:02'),
('80696a69-7773-4cf4-a70c-950cf21953f4', '41bb2316-da7a-46f8-8bb2-9de2e490ee0b', 'CONFIRMED', 'PREPARING', '2fdb3f1b-9ac7-42ac-954d-fdf902f93a89', '2026-06-11 10:30:57'),
('821d4255-b3e8-4662-bec5-2435a02cff9d', 'd59a6c5d-c331-4b84-9501-ba4105d23cd2', 'CONFIRMED', 'PREPARING', '2fdb3f1b-9ac7-42ac-954d-fdf902f93a89', '2026-06-11 10:09:08'),
('840208b8-cf6e-4f17-ac37-e22176c01b48', '179a4414-1cb6-4a00-a33c-1fb4bcbcea0b', 'CONFIRMED', 'CANCELLED', '2fdb3f1b-9ac7-42ac-954d-fdf902f93a89', '2026-06-11 11:13:09'),
('849ce72c-89e1-4593-b644-706f37edacb8', '5d7cb14c-3f7f-40b1-9b65-30b059b27876', 'READY', 'SERVED', '2fdb3f1b-9ac7-42ac-954d-fdf902f93a89', '2026-06-13 12:08:49'),
('87d9d225-6f4e-4335-90c4-5682ad2584c3', '40d7d706-d4ab-4aab-9541-b6bc113b37e6', 'CONFIRMED', 'PREPARING', 'd496387b-d985-41f0-aeba-70d74b655795', '2026-06-16 12:37:19'),
('899b20d5-a97e-470f-ab94-0aa665b1f334', 'f5ceee5d-4a12-4ed2-84e2-3ed52abeb953', 'PENDING', 'CONFIRMED', 'd496387b-d985-41f0-aeba-70d74b655795', '2026-06-16 13:04:41'),
('8a21e60b-eb66-4cf9-a575-1f5aacf21329', '939c7974-3d05-4597-8116-12c743594962', 'READY', 'SERVED', '4f1c5a80-eecc-4bee-af97-b89e3103b88f', '2026-06-16 10:34:31'),
('8b05b626-7dc4-4d37-a383-11cbfc3eec18', 'bd197739-4062-452e-9227-d150b078f790', 'CONFIRMED', 'PREPARING', 'd496387b-d985-41f0-aeba-70d74b655795', '2026-06-16 14:41:02'),
('8be045da-1f5c-4179-8483-741fe7bc5044', '1f197624-6316-4a5b-9caf-e28681a87014', 'PREPARING', 'READY', '2fdb3f1b-9ac7-42ac-954d-fdf902f93a89', '2026-06-13 12:09:19'),
('8c9daaf1-7ed1-47df-a862-3c84b4dab510', '27a57067-ff46-40b1-ac72-4c73246df5af', 'READY', 'SERVED', '2fdb3f1b-9ac7-42ac-954d-fdf902f93a89', '2026-06-11 10:14:37'),
('8ee36f9a-8773-43ae-a498-07ce7de01ed1', '72752aef-93d8-4822-8c27-bdd5c1b274fc', 'PENDING', 'CONFIRMED', '9cd55930-833f-420c-af71-c9ea7fc6eb92', '2026-06-15 15:15:07'),
('8f01e003-b61f-48fc-a3be-34ef80bbc921', '190192d1-2aff-416d-ba88-311a0bffd526', 'CONFIRMED', 'PREPARING', 'd496387b-d985-41f0-aeba-70d74b655795', '2026-06-16 12:10:44'),
('906c505b-5655-46f6-890e-55978ae7c909', 'deac5c34-2da5-40ac-8b3e-ebb05344ea7d', 'PENDING', 'CONFIRMED', 'd496387b-d985-41f0-aeba-70d74b655795', '2026-06-16 14:59:29'),
('93d1fb4a-0682-4b71-8211-ad690e7447b9', '0e336953-6cd7-469f-a7bd-581f86efa7b4', 'PENDING', 'CONFIRMED', '2fdb3f1b-9ac7-42ac-954d-fdf902f93a89', '2026-06-09 11:42:06'),
('94bdc53f-220e-4c4a-856f-6076d4161da5', 'd59a6c5d-c331-4b84-9501-ba4105d23cd2', 'READY', 'SERVED', '2fdb3f1b-9ac7-42ac-954d-fdf902f93a89', '2026-06-11 10:24:43'),
('94e64171-6d8e-43fb-aa35-c3fe20b2e705', '173c9634-756b-41c1-8711-f4018761e3d6', 'CONFIRMED', 'PREPARING', '2fdb3f1b-9ac7-42ac-954d-fdf902f93a89', '2026-06-13 11:59:05'),
('989611e9-82bc-4ffb-b567-b92d17ee0576', 'fa362884-06cd-4a02-a6a0-125e4d7c8b36', 'PREPARING', 'READY', '2fdb3f1b-9ac7-42ac-954d-fdf902f93a89', '2026-06-11 10:51:13'),
('98a1d845-89e3-4671-a798-ddfd9bb7e1dc', '72752aef-93d8-4822-8c27-bdd5c1b274fc', 'PREPARING', 'READY', 'c6a3e0df-2e20-4f3e-9df0-af50f4e6334f', '2026-06-16 10:36:36'),
('9a12947b-ebb0-45b1-b61e-93481cd53e28', 'b2e7b21a-5470-4c1c-87b8-a495e50a6e11', 'READY', 'CANCELLED', '2fdb3f1b-9ac7-42ac-954d-fdf902f93a89', '2026-06-11 10:13:55'),
('9baf7a4a-3612-4d82-9d49-d02e540054cd', '27a57067-ff46-40b1-ac72-4c73246df5af', 'PREPARING', 'READY', '2fdb3f1b-9ac7-42ac-954d-fdf902f93a89', '2026-06-11 10:14:12'),
('9c8fa737-9da8-48bb-8074-e0bc597d26ac', '5e499823-d26a-4af0-929b-a3a63205cf96', NULL, 'PENDING', '4f1c5a80-eecc-4bee-af97-b89e3103b88f', '2026-06-16 10:09:20'),
('9ec0a984-8ec5-4e89-ba39-daf564694a85', '7bc38cc6-1ef0-4ab9-8fd1-c546f5c053dc', 'CONFIRMED', 'PREPARING', '2fdb3f1b-9ac7-42ac-954d-fdf902f93a89', '2026-06-12 14:44:19'),
('9ec88a0f-82e4-4790-a178-fc9d602bbf38', '5e499823-d26a-4af0-929b-a3a63205cf96', 'READY', 'SERVED', '4f1c5a80-eecc-4bee-af97-b89e3103b88f', '2026-06-16 10:28:35'),
('a04cfbcb-5f5c-4fc7-aeea-8271dd66b352', 'e670ecd2-64ad-4e3b-8dad-9425aaeb8291', 'PENDING', 'CONFIRMED', '2fdb3f1b-9ac7-42ac-954d-fdf902f93a89', '2026-06-13 12:29:17'),
('a0864acd-4251-4a51-9f71-f5cb517afb6f', '75873f85-de50-4a6b-87c1-4aeb62560fa1', 'READY', 'SERVED', 'bdf11593-ff2d-4f13-81ac-8c6cd8d1131d', '2026-06-16 09:23:46'),
('a0a31f15-83a4-4c9b-b876-bbffa302f05f', 'b2e7b21a-5470-4c1c-87b8-a495e50a6e11', 'PENDING', 'CONFIRMED', '2fdb3f1b-9ac7-42ac-954d-fdf902f93a89', '2026-06-11 10:08:55'),
('a1f50bc0-2be9-4c99-81d9-e64d120d5005', '41bb2316-da7a-46f8-8bb2-9de2e490ee0b', 'PREPARING', 'READY', '2fdb3f1b-9ac7-42ac-954d-fdf902f93a89', '2026-06-12 14:44:22'),
('a2c0d12a-9cff-429d-98e0-3b0754aa24af', '5d7cb14c-3f7f-40b1-9b65-30b059b27876', 'SERVED', 'CLOSED', '2fdb3f1b-9ac7-42ac-954d-fdf902f93a89', '2026-06-13 12:12:35'),
('a4772b5c-b0b3-4644-9bf4-11d6b2765434', '75873f85-de50-4a6b-87c1-4aeb62560fa1', 'CONFIRMED', 'PREPARING', 'bdf11593-ff2d-4f13-81ac-8c6cd8d1131d', '2026-06-15 15:33:12'),
('a5692da9-ae1e-4d28-9d41-0fb700620cd9', 'adbebd72-ced2-42a4-8e73-7d0c2f1ac4bd', 'PENDING', 'CONFIRMED', '2fdb3f1b-9ac7-42ac-954d-fdf902f93a89', '2026-06-09 11:13:09'),
('a6404c14-4a0e-453a-91b7-ef5132acb0a6', 'bd197739-4062-452e-9227-d150b078f790', 'PENDING', 'CONFIRMED', 'd496387b-d985-41f0-aeba-70d74b655795', '2026-06-16 14:40:59'),
('a75af868-7d23-4e77-a210-ccdf2ae558cd', '86b6ccc1-98fe-4cda-bb03-1b545aaece7d', 'READY', 'SERVED', '4f1c5a80-eecc-4bee-af97-b89e3103b88f', '2026-06-16 11:17:05'),
('a9bf5e48-2f82-49d0-a691-af54447990a6', '2cc50b91-3454-4363-bcae-5ca5c82c6249', 'CONFIRMED', 'PREPARING', '2fdb3f1b-9ac7-42ac-954d-fdf902f93a89', '2026-06-11 10:10:37'),
('ab13410f-f39f-4a31-912b-2ad52f6b70f0', '4ecbf60b-c56b-4aee-bfec-0582702b2e7d', 'PENDING', 'CONFIRMED', '2fdb3f1b-9ac7-42ac-954d-fdf902f93a89', '2026-06-08 23:42:45'),
('aba1a6a1-2f02-487d-a1c6-f9f78964fc08', '4ecbf60b-c56b-4aee-bfec-0582702b2e7d', 'READY', 'SERVED', '2fdb3f1b-9ac7-42ac-954d-fdf902f93a89', '2026-06-08 23:43:03'),
('ac06e6a0-b9fc-4cfb-9558-ac16d3e1cef8', '6e80c40d-176f-4043-abeb-ef6a131313c8', 'PREPARING', 'READY', '2fdb3f1b-9ac7-42ac-954d-fdf902f93a89', '2026-06-10 12:39:53'),
('ac552f23-fb14-415f-b9bf-4577d9b5295e', 'd59a6c5d-c331-4b84-9501-ba4105d23cd2', 'PREPARING', 'READY', '2fdb3f1b-9ac7-42ac-954d-fdf902f93a89', '2026-06-11 10:09:09'),
('ac91f966-9518-4d66-9177-9ea38fc70274', 'e33a4070-b06f-4cbf-b627-61f006be9a57', 'PREPARING', 'READY', '2fdb3f1b-9ac7-42ac-954d-fdf902f93a89', '2026-06-09 10:30:54'),
('af7acc44-0341-47f4-95e6-4a5048771ed1', 'c92e393c-0798-4482-a6f6-71518f0a3596', 'READY', 'SERVED', '2fdb3f1b-9ac7-42ac-954d-fdf902f93a89', '2026-06-09 09:57:07'),
('afc68c64-1f77-4f71-9717-059054976319', 'f5ceee5d-4a12-4ed2-84e2-3ed52abeb953', 'CONFIRMED', 'PREPARING', 'c6a3e0df-2e20-4f3e-9df0-af50f4e6334f', '2026-06-16 13:05:06'),
('b1011626-583e-4523-8662-25fa5aea02cc', '2cc50b91-3454-4363-bcae-5ca5c82c6249', 'SERVED', 'CLOSED', '2fdb3f1b-9ac7-42ac-954d-fdf902f93a89', '2026-06-11 10:24:50'),
('b1f82ef1-4b0b-4717-a5f0-ff4438442c09', '96d36992-5319-4cd3-975f-45c6c5365b9f', 'PENDING', 'CONFIRMED', '2fdb3f1b-9ac7-42ac-954d-fdf902f93a89', '2026-06-10 12:14:32'),
('b40fb159-3a37-49cd-8f40-3e8697cf3f8a', '4424f53a-629b-4a90-b548-5313a3e99724', 'PENDING', 'CANCELLED', '2fdb3f1b-9ac7-42ac-954d-fdf902f93a89', '2026-06-10 12:24:23'),
('b4d8bad3-32d1-4ddf-ab3a-47271431e6a2', '173c9634-756b-41c1-8711-f4018761e3d6', 'PREPARING', 'READY', '2fdb3f1b-9ac7-42ac-954d-fdf902f93a89', '2026-06-13 11:59:07'),
('b505b7b6-dcdb-4b72-8889-8d407d7a020f', '190192d1-2aff-416d-ba88-311a0bffd526', 'PREPARING', 'READY', 'd496387b-d985-41f0-aeba-70d74b655795', '2026-06-16 12:10:46'),
('b763f779-fe9a-4676-b12a-fc55df07e64a', '38ebe9e0-7eda-4847-8523-567d96e470c0', 'CONFIRMED', 'PREPARING', '2fdb3f1b-9ac7-42ac-954d-fdf902f93a89', '2026-06-13 12:44:08'),
('b78f9d84-e2c5-4884-a1aa-da633e64c58f', '0e336953-6cd7-469f-a7bd-581f86efa7b4', 'CONFIRMED', 'PREPARING', '2fdb3f1b-9ac7-42ac-954d-fdf902f93a89', '2026-06-09 14:03:20'),
('b8127ab2-ec8e-476f-941a-beb71aee0836', '190192d1-2aff-416d-ba88-311a0bffd526', 'PENDING', 'CONFIRMED', 'c6a3e0df-2e20-4f3e-9df0-af50f4e6334f', '2026-06-16 12:03:51'),
('b842df92-1d5a-4956-b5fd-72e0ef6f71a1', '173c9634-756b-41c1-8711-f4018761e3d6', NULL, 'PENDING', '2fdb3f1b-9ac7-42ac-954d-fdf902f93a89', '2026-06-12 15:38:20'),
('ba902254-da2e-4f60-8ba8-fc768626f8ad', '38ebe9e0-7eda-4847-8523-567d96e470c0', 'READY', 'SERVED', 'c6a3e0df-2e20-4f3e-9df0-af50f4e6334f', '2026-06-16 11:04:03'),
('baad9f20-428d-4b71-9b57-b09beeb0275c', '398adf7b-687f-4c79-9110-5ca78ffd9ef4', 'CONFIRMED', 'PREPARING', '2fdb3f1b-9ac7-42ac-954d-fdf902f93a89', '2026-06-11 11:13:59'),
('bc3ff822-3da6-4920-ae75-96be6c0eef46', 'e670ecd2-64ad-4e3b-8dad-9425aaeb8291', 'READY', 'SERVED', '2fdb3f1b-9ac7-42ac-954d-fdf902f93a89', '2026-06-13 12:40:05'),
('bca70b5f-414c-4c1c-b04a-a11cdab42de4', '896cb3ce-de61-4315-91e2-d0c2f830fb02', 'PENDING', 'CANCELLED', '2fdb3f1b-9ac7-42ac-954d-fdf902f93a89', '2026-06-10 12:24:15'),
('bee9bee0-a30c-462c-972a-8f31c7a7e855', 'c92e393c-0798-4482-a6f6-71518f0a3596', 'PREPARING', 'READY', '2fdb3f1b-9ac7-42ac-954d-fdf902f93a89', '2026-06-09 09:56:39'),
('c1d17057-8522-4778-b911-1d2f08365151', '53372ed2-36ba-467a-92f7-cd96e765478d', 'CONFIRMED', 'PREPARING', 'bdf11593-ff2d-4f13-81ac-8c6cd8d1131d', '2026-06-13 10:02:09'),
('c1e1bb71-80ee-4f48-8092-6e57f4c46168', '5e499823-d26a-4af0-929b-a3a63205cf96', 'PREPARING', 'READY', '4f1c5a80-eecc-4bee-af97-b89e3103b88f', '2026-06-16 10:28:31'),
('c3042b9f-0134-473b-8721-708897c26773', '27a57067-ff46-40b1-ac72-4c73246df5af', 'CONFIRMED', 'PREPARING', '2fdb3f1b-9ac7-42ac-954d-fdf902f93a89', '2026-06-11 10:13:06'),
('c7cf73ca-926b-4e05-9a9e-1140e4d4c1d5', '5d7cb14c-3f7f-40b1-9b65-30b059b27876', 'PREPARING', 'READY', '2fdb3f1b-9ac7-42ac-954d-fdf902f93a89', '2026-06-13 12:08:47'),
('c8c1a150-1d47-4c23-8d67-035c03bcc3c2', 'f5ceee5d-4a12-4ed2-84e2-3ed52abeb953', 'READY', 'SERVED', 'd496387b-d985-41f0-aeba-70d74b655795', '2026-06-16 14:23:39'),
('c926aa12-c78d-416e-9805-458a57dffd37', '6e80c40d-176f-4043-abeb-ef6a131313c8', 'READY', 'SERVED', '2fdb3f1b-9ac7-42ac-954d-fdf902f93a89', '2026-06-11 10:10:52'),
('ccbd1550-89fc-4d7c-86a5-4b9a780646fe', 'bd197739-4062-452e-9227-d150b078f790', 'PREPARING', 'READY', 'd496387b-d985-41f0-aeba-70d74b655795', '2026-06-16 14:49:26'),
('cedf5edd-6957-4509-aef8-fdbddb0e19d4', 'c7db06cb-460a-46a8-ba0f-1626a7ec61b9', 'PENDING', 'CONFIRMED', '2fdb3f1b-9ac7-42ac-954d-fdf902f93a89', '2026-06-09 09:55:35'),
('cf40467c-c3e1-470e-9e68-7c3e5a8224db', 'bd197739-4062-452e-9227-d150b078f790', 'READY', 'SERVED', 'd496387b-d985-41f0-aeba-70d74b655795', '2026-06-16 14:50:14'),
('d1ba3f46-b0b4-45f1-a567-998b94699e67', '53372ed2-36ba-467a-92f7-cd96e765478d', 'PENDING', 'CONFIRMED', 'bdf11593-ff2d-4f13-81ac-8c6cd8d1131d', '2026-06-13 10:01:57'),
('d3c8e054-fd4c-421d-9d27-f09b28a9b37e', 'c92e393c-0798-4482-a6f6-71518f0a3596', 'CONFIRMED', 'PREPARING', '2fdb3f1b-9ac7-42ac-954d-fdf902f93a89', '2026-06-09 09:55:52'),
('d3ebd44e-ae6f-43f3-a6d2-21d0904e3f96', '2cc50b91-3454-4363-bcae-5ca5c82c6249', 'PENDING', 'CONFIRMED', '2fdb3f1b-9ac7-42ac-954d-fdf902f93a89', '2026-06-10 12:44:26'),
('d4d56b71-dee6-43d1-9878-beccf0e80c9c', 'c92e393c-0798-4482-a6f6-71518f0a3596', 'SERVED', 'CLOSED', '2fdb3f1b-9ac7-42ac-954d-fdf902f93a89', '2026-06-09 09:57:27'),
('d66243f5-ab91-44f2-a526-aa69593feced', 'e670ecd2-64ad-4e3b-8dad-9425aaeb8291', 'CONFIRMED', 'PREPARING', '2fdb3f1b-9ac7-42ac-954d-fdf902f93a89', '2026-06-13 12:38:17'),
('d93f5063-b08c-4300-8575-5489a40fc2a4', 'b2e7b21a-5470-4c1c-87b8-a495e50a6e11', 'CONFIRMED', 'PREPARING', '2fdb3f1b-9ac7-42ac-954d-fdf902f93a89', '2026-06-11 10:08:58'),
('dd47fd93-d3dc-44fa-b00b-cbea34b14467', '1f197624-6316-4a5b-9caf-e28681a87014', 'CONFIRMED', 'PREPARING', '2fdb3f1b-9ac7-42ac-954d-fdf902f93a89', '2026-06-13 11:51:18'),
('dd6bd729-7aed-4bdc-9fe0-3b1da5001241', '96d36992-5319-4cd3-975f-45c6c5365b9f', 'SERVED', 'CLOSED', '2fdb3f1b-9ac7-42ac-954d-fdf902f93a89', '2026-06-11 10:24:53'),
('de8b50b9-a2ed-46fd-b811-d66f6094945c', '53372ed2-36ba-467a-92f7-cd96e765478d', 'READY', 'SERVED', 'bdf11593-ff2d-4f13-81ac-8c6cd8d1131d', '2026-06-13 12:19:34'),
('e135edbc-5b48-4dc8-97d6-e1ec76ee0292', '1f197624-6316-4a5b-9caf-e28681a87014', 'READY', 'SERVED', '2fdb3f1b-9ac7-42ac-954d-fdf902f93a89', '2026-06-13 12:38:28'),
('e2fda77a-1076-449a-8296-cd6c238d6c0e', '6e80c40d-176f-4043-abeb-ef6a131313c8', 'CONFIRMED', 'PREPARING', '2fdb3f1b-9ac7-42ac-954d-fdf902f93a89', '2026-06-10 12:39:46'),
('e4cb0a58-1eec-41f8-abe6-d3029e9d4dd1', '0e336953-6cd7-469f-a7bd-581f86efa7b4', 'READY', 'SERVED', '2fdb3f1b-9ac7-42ac-954d-fdf902f93a89', '2026-06-11 10:24:46'),
('e50e18cd-4d9e-4112-ba30-1ce1cb62ccc4', 'e33a4070-b06f-4cbf-b627-61f006be9a57', 'READY', 'SERVED', '2fdb3f1b-9ac7-42ac-954d-fdf902f93a89', '2026-06-10 12:39:59'),
('e834949b-6ff6-4993-ab1c-fc93bffdd4f3', '7bc38cc6-1ef0-4ab9-8fd1-c546f5c053dc', 'PENDING', 'CONFIRMED', '2fdb3f1b-9ac7-42ac-954d-fdf902f93a89', '2026-06-11 23:06:40'),
('e98dfa4c-4b6b-4229-a395-d0014d349337', '1f197624-6316-4a5b-9caf-e28681a87014', NULL, 'PENDING', '2fdb3f1b-9ac7-42ac-954d-fdf902f93a89', '2026-06-12 15:53:42'),
('ed74871a-554c-43c5-a321-2d0cf11cac6f', '939c7974-3d05-4597-8116-12c743594962', 'CONFIRMED', 'PREPARING', '4f1c5a80-eecc-4bee-af97-b89e3103b88f', '2026-06-16 10:28:30'),
('ee129b5f-76b5-459e-a8c7-c5b557821692', 'f5ceee5d-4a12-4ed2-84e2-3ed52abeb953', 'PREPARING', 'READY', 'd496387b-d985-41f0-aeba-70d74b655795', '2026-06-16 14:23:31'),
('ef77a805-0e37-4417-8207-26123072a0cb', '27a57067-ff46-40b1-ac72-4c73246df5af', 'PENDING', 'CONFIRMED', '2fdb3f1b-9ac7-42ac-954d-fdf902f93a89', '2026-06-11 10:09:17'),
('f25b3491-508d-410a-99da-bfbe29d5c148', '1f197624-6316-4a5b-9caf-e28681a87014', 'PENDING', 'CONFIRMED', '2fdb3f1b-9ac7-42ac-954d-fdf902f93a89', '2026-06-12 15:53:50'),
('f367c69d-dc05-4c02-970a-a332fcbdef5f', 'd0c59df9-6609-440d-887f-ef7fbf213ff9', 'READY', 'SERVED', '2fdb3f1b-9ac7-42ac-954d-fdf902f93a89', '2026-06-13 11:59:08'),
('f5597aee-7033-4b70-9363-b8e7df8331f1', '4ecbf60b-c56b-4aee-bfec-0582702b2e7d', 'CONFIRMED', 'PREPARING', '2fdb3f1b-9ac7-42ac-954d-fdf902f93a89', '2026-06-08 23:42:47'),
('f7882a95-3e1d-47ff-a47f-ffc752cd70a7', '75873f85-de50-4a6b-87c1-4aeb62560fa1', 'PENDING', 'CONFIRMED', 'bdf11593-ff2d-4f13-81ac-8c6cd8d1131d', '2026-06-15 15:33:10'),
('fc0704f8-6334-4f35-8332-961d4bc8d600', '465e5c48-04fa-46fb-b1fc-b1248b6978b1', 'PENDING', 'CONFIRMED', '2fdb3f1b-9ac7-42ac-954d-fdf902f93a89', '2026-06-12 12:57:40'),
('fed5ec4e-748c-4242-b67c-68ddf41e52b6', '5d7cb14c-3f7f-40b1-9b65-30b059b27876', 'CONFIRMED', 'PREPARING', '2fdb3f1b-9ac7-42ac-954d-fdf902f93a89', '2026-06-13 12:08:45');

-- --------------------------------------------------------

--
-- Structure de la table `payments`
--

CREATE TABLE `payments` (
  `id` char(36) NOT NULL,
  `order_id` char(36) NOT NULL,
  `method` enum('CASH','CARD') NOT NULL,
  `amount` decimal(10,3) NOT NULL,
  `change_given` decimal(10,3) NOT NULL DEFAULT 0.000,
  `discount_amount` decimal(10,3) NOT NULL DEFAULT 0.000,
  `discount_type` enum('PERCENT','FIXED') DEFAULT NULL,
  `processed_by` char(36) DEFAULT NULL,
  `processed_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `payments`
--

INSERT INTO `payments` (`id`, `order_id`, `method`, `amount`, `change_given`, `discount_amount`, `discount_type`, `processed_by`, `processed_at`) VALUES
('088dd9a6-d7fd-4ff7-87f8-c698cda26043', '40d7d706-d4ab-4aab-9541-b6bc113b37e6', 'CARD', '15.000', '0.000', '0.000', NULL, 'd496387b-d985-41f0-aeba-70d74b655795', '2026-06-16 12:38:15'),
('1dcec43e-140a-41ec-962b-ac9e78c14024', '6e80c40d-176f-4043-abeb-ef6a131313c8', 'CASH', '12.000', '0.000', '0.000', NULL, '2fdb3f1b-9ac7-42ac-954d-fdf902f93a89', '2026-06-11 10:24:16'),
('1eb7e71d-b54a-43ba-aa39-4e07edb6aae3', 'adbebd72-ced2-42a4-8e73-7d0c2f1ac4bd', 'CARD', '14.000', '0.000', '0.000', NULL, '2fdb3f1b-9ac7-42ac-954d-fdf902f93a89', '2026-06-09 12:07:11'),
('3430ade8-3745-4e4e-9f20-5f1908c1e12b', '7ce6e8c9-142f-40ee-938a-54d9fd1bc7af', 'CARD', '15.000', '0.000', '0.000', NULL, 'bdf11593-ff2d-4f13-81ac-8c6cd8d1131d', '2026-06-16 09:22:57'),
('3f9738c7-1910-4f24-843a-2773a4b426e9', 'fa362884-06cd-4a02-a6a0-125e4d7c8b36', 'CASH', '15.000', '0.000', '0.000', NULL, '2fdb3f1b-9ac7-42ac-954d-fdf902f93a89', '2026-06-11 11:23:44'),
('429e30eb-e2d5-493e-a97e-778568cc6849', '465e5c48-04fa-46fb-b1fc-b1248b6978b1', 'CASH', '42.000', '3.000', '0.000', NULL, '2fdb3f1b-9ac7-42ac-954d-fdf902f93a89', '2026-06-12 14:43:17'),
('44cbadc5-2a12-4295-8e63-2d4c327d03aa', '6c5b7fc8-b594-4893-a24f-6cb612ff476a', 'CASH', '15.000', '1.000', '0.000', NULL, '2fdb3f1b-9ac7-42ac-954d-fdf902f93a89', '2026-06-12 14:34:27'),
('45a3aaae-2c16-4669-bacd-70a85f7724dc', '75873f85-de50-4a6b-87c1-4aeb62560fa1', 'CASH', '15.000', '5.000', '0.000', NULL, '4f1c5a80-eecc-4bee-af97-b89e3103b88f', '2026-06-16 10:07:48'),
('45ba81cc-5100-4d77-8543-80bcd0da59e0', 'e670ecd2-64ad-4e3b-8dad-9425aaeb8291', 'CARD', '23.000', '0.000', '0.000', NULL, '2fdb3f1b-9ac7-42ac-954d-fdf902f93a89', '2026-06-15 10:14:03'),
('4fc80e5d-6f40-41bb-ba74-31f45010908c', '173c9634-756b-41c1-8711-f4018761e3d6', 'CASH', '40.000', '0.000', '0.000', NULL, '2fdb3f1b-9ac7-42ac-954d-fdf902f93a89', '2026-06-13 12:42:30'),
('57415034-0e96-4663-bbfa-2a47ba178ed8', 'bd197739-4062-452e-9227-d150b078f790', 'CARD', '20.000', '0.000', '0.000', NULL, 'd496387b-d985-41f0-aeba-70d74b655795', '2026-06-16 14:58:18'),
('63e24c32-085a-4ecd-a0b6-db40dbf3dad3', '38ebe9e0-7eda-4847-8523-567d96e470c0', 'CARD', '14.000', '0.000', '0.000', NULL, '2fdb3f1b-9ac7-42ac-954d-fdf902f93a89', '2026-06-16 11:34:47'),
('6ce2a329-8098-4220-a4ca-7f0a95e91271', '53372ed2-36ba-467a-92f7-cd96e765478d', 'CASH', '15.000', '5.000', '0.000', NULL, 'bdf11593-ff2d-4f13-81ac-8c6cd8d1131d', '2026-06-15 12:02:55'),
('6e9d60fc-7444-48b5-8396-a198e01bc623', '5e499823-d26a-4af0-929b-a3a63205cf96', 'CARD', '15.000', '0.000', '0.000', NULL, '4f1c5a80-eecc-4bee-af97-b89e3103b88f', '2026-06-16 10:28:59'),
('6ee8e810-ba1e-43d2-b75f-b7459e9683ac', '72752aef-93d8-4822-8c27-bdd5c1b274fc', 'CASH', '15.000', '0.000', '0.000', NULL, '2fdb3f1b-9ac7-42ac-954d-fdf902f93a89', '2026-06-16 11:43:58'),
('7a25cac2-63e9-4ff7-b823-13ec690f3cdc', '398adf7b-687f-4c79-9110-5ca78ffd9ef4', 'CARD', '29.000', '0.000', '0.000', NULL, '2fdb3f1b-9ac7-42ac-954d-fdf902f93a89', '2026-06-11 11:23:21'),
('8d93cc90-700c-4cfd-9963-775cd5d0ab3d', '190192d1-2aff-416d-ba88-311a0bffd526', 'CARD', '20.000', '0.000', '0.000', NULL, 'd496387b-d985-41f0-aeba-70d74b655795', '2026-06-16 12:11:14'),
('9064549e-72f7-4d50-b24e-8e7c1df9c878', 'f5ceee5d-4a12-4ed2-84e2-3ed52abeb953', 'CASH', '14.000', '0.000', '0.000', NULL, 'd496387b-d985-41f0-aeba-70d74b655795', '2026-06-16 14:32:21'),
('96367b4f-68ed-4cdc-911d-b407b7ad8837', 'd0c59df9-6609-440d-887f-ef7fbf213ff9', 'CARD', '15.000', '0.000', '0.000', NULL, '2fdb3f1b-9ac7-42ac-954d-fdf902f93a89', '2026-06-16 11:05:18'),
('a93a0007-4396-4304-a634-4877078f2892', '1f197624-6316-4a5b-9caf-e28681a87014', 'CARD', '15.000', '0.000', '0.000', NULL, '2fdb3f1b-9ac7-42ac-954d-fdf902f93a89', '2026-06-13 12:41:59'),
('afb6bbc5-5549-41ea-97a2-cc0da0c58c7a', '86b6ccc1-98fe-4cda-bb03-1b545aaece7d', 'CARD', '15.000', '0.000', '0.000', NULL, '4f1c5a80-eecc-4bee-af97-b89e3103b88f', '2026-06-16 12:54:48'),
('b93b182c-00c4-481a-905a-f0d983bd1363', '41bb2316-da7a-46f8-8bb2-9de2e490ee0b', 'CASH', '14.000', '0.000', '0.000', NULL, '2fdb3f1b-9ac7-42ac-954d-fdf902f93a89', '2026-06-12 14:49:37'),
('b94850c5-d163-47e7-b1f2-58b0071700c5', 'a6549f32-26c1-4a07-be8f-018bf69ee2b9', 'CARD', '55.000', '0.000', '0.000', NULL, '2fdb3f1b-9ac7-42ac-954d-fdf902f93a89', '2026-06-12 14:24:27'),
('cfd311c6-0e0b-411b-ad70-fa7f909bf428', '7bc38cc6-1ef0-4ab9-8fd1-c546f5c053dc', 'CASH', '20.000', '0.000', '0.000', NULL, '2fdb3f1b-9ac7-42ac-954d-fdf902f93a89', '2026-06-12 14:48:46'),
('d4f814fe-a230-4f79-9f91-dd450d7513f4', 'f4e0fab1-5277-49c9-9d78-8220c3192e1a', 'CARD', '15.000', '0.000', '0.000', NULL, '2fdb3f1b-9ac7-42ac-954d-fdf902f93a89', '2026-06-12 14:34:40'),
('f66cc7fa-afbb-4308-acb1-a75845fc35a4', 'c7db06cb-460a-46a8-ba0f-1626a7ec61b9', 'CARD', '14.000', '0.000', '0.000', NULL, '2fdb3f1b-9ac7-42ac-954d-fdf902f93a89', '2026-06-09 10:17:07');

-- --------------------------------------------------------

--
-- Structure de la table `plans`
--

CREATE TABLE `plans` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `name` enum('FREE','STARTER','PRO','PREMIUM') NOT NULL,
  `price_monthly` decimal(10,3) DEFAULT 0.000,
  `price_annual` decimal(10,3) DEFAULT 0.000,
  `features` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`features`)),
  `max_menus` int(11) DEFAULT 1,
  `max_tables` int(11) DEFAULT 5,
  `max_staff` int(11) DEFAULT 2,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `plans`
--

INSERT INTO `plans` (`id`, `name`, `price_monthly`, `price_annual`, `features`, `max_menus`, `max_tables`, `max_staff`, `created_at`, `updated_at`) VALUES
('3ded6e5b-a057-4a35-b40b-045dd42c2534', 'STARTER', '29.000', '250.000', '[]', 10, 20, 5, '2026-06-15 17:05:03', '2026-06-15 18:00:52'),
('84cdc4c7-a0f6-4689-a827-16758c63fca8', 'PREMIUM', '79.000', '750.000', '[]', 0, 0, 0, '2026-06-15 17:05:03', '2026-06-15 22:29:10'),
('cc295928-8ee2-4ad5-a163-89bf620687f1', 'FREE', '0.000', '0.000', '[]', 1, 5, 2, '2026-06-15 17:05:03', '2026-06-15 17:05:03'),
('e6e66613-6a7c-4bbc-b871-4bf77fe7c4b4', 'PRO', '59.000', '500.000', '[]', 20, 50, 10, '2026-06-15 17:05:03', '2026-06-15 22:28:58');

-- --------------------------------------------------------

--
-- Structure de la table `qr_scans`
--

CREATE TABLE `qr_scans` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `table_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `restaurant_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `scanned_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `qr_scans`
--

INSERT INTO `qr_scans` (`id`, `table_id`, `restaurant_id`, `ip_address`, `user_agent`, `scanned_at`, `created_at`) VALUES
('00f06c95-f41a-4d2f-a476-ef6ed602d4f9', '3c703bd5-c45a-4208-a47c-93ad10fdfbc2', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '::1', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '2026-06-11 16:04:58', '2026-06-11 15:04:58'),
('041f96b3-47f2-4f92-85b0-6aec95d52307', '04a22c64-b2bf-4367-89d5-dca6b4d4b9ce', 'f82bee2a-3f1b-4e8e-b489-a7851b1648f2', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '2026-06-15 12:01:30', '2026-06-15 11:01:30'),
('063b0e6a-d035-4da3-b0df-2cc45e7ca79c', '3c703bd5-c45a-4208-a47c-93ad10fdfbc2', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '::1', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '2026-06-11 15:28:51', '2026-06-11 14:28:51'),
('0753db03-3fcf-4b97-9894-9bafc7b09cd5', '0fd96779-24cc-4ea0-82a7-1e53e3cab151', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 OPR/131.0.0.0', '2026-06-11 10:49:49', '2026-06-11 09:49:49'),
('07d7d2e9-5f14-4427-a7fc-f49e44b59429', 'bd5f3f89-8414-4509-b151-ffd2027cbc6b', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '::1', 'Mozilla/5.0 (Linux; Android 13; SM-G981B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36', '2026-06-10 13:06:59', '2026-06-10 12:06:59'),
('08a2e908-c677-4bdb-ad48-680d297e9271', '0fd96779-24cc-4ea0-82a7-1e53e3cab151', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '2026-06-15 15:49:32', '2026-06-15 14:49:32'),
('08ad8082-95ff-46bf-a4a8-5404d1c35e5d', 'bd5f3f89-8414-4509-b151-ffd2027cbc6b', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '::1', 'Mozilla/5.0 (Linux; Android 13; SM-G981B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36', '2026-06-10 14:02:03', '2026-06-10 13:02:03'),
('09b3da7c-4395-43f5-ae8f-db22442af3dd', '3c703bd5-c45a-4208-a47c-93ad10fdfbc2', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '::1', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '2026-06-11 16:03:50', '2026-06-11 15:03:50'),
('0aa76aae-71c6-4f20-8103-9bd6086971be', 'bd5f3f89-8414-4509-b151-ffd2027cbc6b', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '::1', 'Mozilla/5.0 (Linux; Android 13; SM-G981B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36', '2026-06-10 12:57:35', '2026-06-10 11:57:35'),
('0ab97d6b-29e7-4204-977f-06aa56a95000', '2a938c85-ab12-4cde-a1bf-a1f8c30c981b', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 OPR/131.0.0.0', '2026-06-11 10:35:34', '2026-06-11 09:35:34'),
('0e6d8a85-6d43-49c9-9dbf-e73bcfe6cb27', '3c703bd5-c45a-4208-a47c-93ad10fdfbc2', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '::1', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '2026-06-11 22:50:56', '2026-06-11 21:50:56'),
('0eafa904-18a2-4542-9f4d-bf9b77e91372', '3c703bd5-c45a-4208-a47c-93ad10fdfbc2', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '::1', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '2026-06-11 14:57:25', '2026-06-11 13:57:25'),
('0f44dca4-4211-48fd-81b7-3701fc684c14', '0fd96779-24cc-4ea0-82a7-1e53e3cab151', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '2026-06-15 15:50:56', '2026-06-15 14:50:56'),
('10e282dd-889c-4045-a82f-3e458e6fb41c', 'bd5f3f89-8414-4509-b151-ffd2027cbc6b', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '::1', 'Mozilla/5.0 (Linux; Android 13; SM-G981B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36', '2026-06-10 13:46:25', '2026-06-10 12:46:25'),
('12811602-e384-49c4-9906-47b9b17ecde1', '0fd96779-24cc-4ea0-82a7-1e53e3cab151', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '2026-06-15 15:49:54', '2026-06-15 14:49:54'),
('17a2f2d7-a33d-4f42-b18a-eb0f039c9f0b', 'd3e9cef7-894b-4f24-abfb-a6ab674aed9b', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 OPR/131.0.0.0', '2026-06-09 09:50:14', '2026-06-09 09:32:48'),
('18c2ef3d-fc3b-4040-8049-25389bd1c322', '3c703bd5-c45a-4208-a47c-93ad10fdfbc2', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '::1', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '2026-06-11 14:50:07', '2026-06-11 13:50:07'),
('18dda4a0-fb49-418d-8c6c-3aeb0b842126', '0054bf66-4737-424a-b78b-5eb470037f30', 'f82bee2a-3f1b-4e8e-b489-a7851b1648f2', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '2026-06-15 15:32:45', '2026-06-15 14:32:45'),
('1a0880a3-ddd5-4b75-b8b6-ba705639b427', 'bd5f3f89-8414-4509-b151-ffd2027cbc6b', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '::1', 'Mozilla/5.0 (Linux; Android 13; SM-G981B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36', '2026-06-10 13:59:01', '2026-06-10 12:59:01'),
('1a7b1624-ed4c-4f70-a4c7-0eb82ad600ad', 'bd5f3f89-8414-4509-b151-ffd2027cbc6b', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '::1', 'Mozilla/5.0 (Linux; Android 13; SM-G981B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36', '2026-06-10 12:56:57', '2026-06-10 11:56:57'),
('1a868d08-8c28-4513-ad72-691882759501', '0fd96779-24cc-4ea0-82a7-1e53e3cab151', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 OPR/131.0.0.0', '2026-06-09 11:13:19', '2026-06-09 10:13:19'),
('1bb72904-5640-4601-8e0e-c4a7f3cd064d', 'bd5f3f89-8414-4509-b151-ffd2027cbc6b', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 OPR/131.0.0.0', '2026-06-11 10:37:42', '2026-06-11 09:37:42'),
('1ead60ab-095d-477b-be2e-b89a77ce5bb4', 'bd5f3f89-8414-4509-b151-ffd2027cbc6b', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '::1', 'Mozilla/5.0 (Linux; Android 13; SM-G981B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36', '2026-06-10 14:05:14', '2026-06-10 13:05:14'),
('20135de5-1157-4a79-95cd-d5546d1d2890', '3c703bd5-c45a-4208-a47c-93ad10fdfbc2', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '::1', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '2026-06-11 16:08:12', '2026-06-11 15:08:12'),
('206c3717-6096-487d-9146-0406d3bf4735', '1a72ddd2-bd3d-4381-a958-e4ce759bd787', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 OPR/131.0.0.0', '2026-06-15 15:05:05', '2026-06-15 14:05:05'),
('21e523e4-9913-4fb6-8807-5f4773c49336', 'd3e9cef7-894b-4f24-abfb-a6ab674aed9b', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 OPR/131.0.0.0', '2026-06-08 23:41:27', '2026-06-09 09:32:48'),
('240921ca-86c6-4c4a-8a72-f810ec33ae3e', '3c703bd5-c45a-4208-a47c-93ad10fdfbc2', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '::1', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '2026-06-11 15:43:01', '2026-06-11 14:43:01'),
('255be2d8-9ba3-4437-92e4-09e7a2740c8d', '3c703bd5-c45a-4208-a47c-93ad10fdfbc2', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '::1', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '2026-06-11 22:50:50', '2026-06-11 21:50:50'),
('25fbe476-f6c6-44dc-aa99-114644816bb7', '2a938c85-ab12-4cde-a1bf-a1f8c30c981b', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 OPR/131.0.0.0', '2026-06-11 10:48:47', '2026-06-11 09:48:47'),
('2601b078-0d0c-4320-91c6-3ac441b32c55', '2a938c85-ab12-4cde-a1bf-a1f8c30c981b', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 OPR/131.0.0.0', '2026-06-11 10:34:11', '2026-06-11 09:34:11'),
('26a88d56-c5c4-477c-89e8-390f73c34e9a', 'a794d1b3-5591-49dd-b7b8-bd7141ddceec', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 OPR/131.0.0.0', '2026-06-09 10:34:21', '2026-06-09 09:34:21'),
('270f363a-02b1-4557-a083-0ed9dffbc666', 'a794d1b3-5591-49dd-b7b8-bd7141ddceec', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 OPR/131.0.0.0', '2026-06-09 10:59:00', '2026-06-09 09:59:00'),
('2853ee87-063b-49c9-bc36-0ae6b4eed21b', '3c703bd5-c45a-4208-a47c-93ad10fdfbc2', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '::1', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '2026-06-11 16:04:55', '2026-06-11 15:04:55'),
('2861fdf9-dbef-4825-9c44-e22b9d6ea510', 'bd5f3f89-8414-4509-b151-ffd2027cbc6b', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '::1', 'Mozilla/5.0 (Linux; Android 13; SM-G981B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36', '2026-06-11 10:15:20', '2026-06-11 09:15:20'),
('28671aa1-5a26-4619-9b7d-88edb331b0ca', '2a938c85-ab12-4cde-a1bf-a1f8c30c981b', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 OPR/131.0.0.0', '2026-06-11 10:35:59', '2026-06-11 09:36:00'),
('2afc597f-3fb8-44dc-8427-aff533f4efde', '3c703bd5-c45a-4208-a47c-93ad10fdfbc2', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '::1', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '2026-06-11 15:58:27', '2026-06-11 14:58:27'),
('2b3f7cdd-5f3a-41b8-8440-235d6621134e', '3c703bd5-c45a-4208-a47c-93ad10fdfbc2', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '::1', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '2026-06-11 15:33:47', '2026-06-11 14:33:47'),
('2cb7ca4d-ede7-4a18-b2fd-650f2941f5bc', '0fd96779-24cc-4ea0-82a7-1e53e3cab151', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 OPR/131.0.0.0', '2026-06-10 12:36:36', '2026-06-10 11:36:36'),
('2d2916dc-aec0-4bbc-a7cf-720b2809f3b4', 'a794d1b3-5591-49dd-b7b8-bd7141ddceec', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 OPR/131.0.0.0', '2026-06-09 10:30:21', '2026-06-09 09:32:48'),
('35d53fc6-fa60-451d-b19e-8c51dba4daf9', 'bd5f3f89-8414-4509-b151-ffd2027cbc6b', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '::1', 'Mozilla/5.0 (Linux; Android 13; SM-G981B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36', '2026-06-10 14:02:54', '2026-06-10 13:02:54'),
('35d7e6ca-300f-4a42-9aa6-823ad4e317b1', '3c703bd5-c45a-4208-a47c-93ad10fdfbc2', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 OPR/131.0.0.0', '2026-06-11 14:45:16', '2026-06-11 13:45:16'),
('3a345ab5-a12c-4ba4-a8db-cdb9468ee724', 'bd5f3f89-8414-4509-b151-ffd2027cbc6b', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '::1', 'Mozilla/5.0 (Linux; Android 13; SM-G981B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36', '2026-06-10 13:43:06', '2026-06-10 12:43:06'),
('3a6fc97e-341b-479a-8eac-bb9693dfbe77', 'bd5f3f89-8414-4509-b151-ffd2027cbc6b', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 OPR/131.0.0.0', '2026-06-11 12:15:40', '2026-06-11 11:15:40'),
('3bcb86d3-60c1-48fb-b0ff-5ed23d40e1e0', 'd3e9cef7-894b-4f24-abfb-a6ab674aed9b', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '::1', 'Mozilla/5.0 (Linux; Android 13; SM-G981B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36', '2026-06-12 14:16:12', '2026-06-12 13:16:12'),
('3bd3916a-a09b-4c67-8b33-d2221ca5a670', 'bd5f3f89-8414-4509-b151-ffd2027cbc6b', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '::1', 'Mozilla/5.0 (Linux; Android 13; SM-G981B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36', '2026-06-10 13:01:32', '2026-06-10 12:01:32'),
('3c5bc474-770d-4a02-bf67-05bc6f2d844d', '0fd96779-24cc-4ea0-82a7-1e53e3cab151', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '2026-06-16 22:57:35', '2026-06-16 21:57:35'),
('3d252292-a224-4332-8d36-cf3f15588845', 'bd5f3f89-8414-4509-b151-ffd2027cbc6b', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '::1', 'Mozilla/5.0 (Linux; Android 13; SM-G981B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36', '2026-06-10 13:02:45', '2026-06-10 12:02:45'),
('3e088255-3b3e-4eed-aaae-6a99b9b93bac', 'bd5f3f89-8414-4509-b151-ffd2027cbc6b', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 OPR/131.0.0.0', '2026-06-11 11:49:03', '2026-06-11 10:49:03'),
('3e0f6a65-b186-4444-9038-d240bb2e7de3', 'bd5f3f89-8414-4509-b151-ffd2027cbc6b', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 OPR/131.0.0.0', '2026-06-11 10:58:15', '2026-06-11 09:58:15'),
('40587e4e-af81-43d7-a54c-b1a9cc596d88', '3c703bd5-c45a-4208-a47c-93ad10fdfbc2', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '::1', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '2026-06-11 11:13:30', '2026-06-11 10:13:30'),
('419a8c07-88d3-4e83-9ea2-6787dd6e0218', 'bd5f3f89-8414-4509-b151-ffd2027cbc6b', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '::1', 'Mozilla/5.0 (Linux; Android 13; SM-G981B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36', '2026-06-10 13:55:43', '2026-06-10 12:55:43'),
('45b63a2a-57e4-483b-9dbe-feec8acb7dc0', '0054bf66-4737-424a-b78b-5eb470037f30', 'f82bee2a-3f1b-4e8e-b489-a7851b1648f2', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '2026-06-15 15:54:03', '2026-06-15 14:54:03'),
('4f464acb-4466-441b-b24b-9fcc18cc10a6', '0fd96779-24cc-4ea0-82a7-1e53e3cab151', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 OPR/131.0.0.0', '2026-06-11 10:49:51', '2026-06-11 09:49:51'),
('5305a361-2dea-424a-b60c-4d2579a3ff3a', 'bd5f3f89-8414-4509-b151-ffd2027cbc6b', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '::1', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '2026-06-10 12:16:33', '2026-06-10 11:16:33'),
('562ee327-56f1-4875-ac95-801f8fe2586b', '3c703bd5-c45a-4208-a47c-93ad10fdfbc2', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '::1', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '2026-06-11 14:56:59', '2026-06-11 13:56:59'),
('5635b102-0a80-48d2-bc43-f8833d823e1f', '3c703bd5-c45a-4208-a47c-93ad10fdfbc2', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '::1', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '2026-06-11 15:25:29', '2026-06-11 14:25:29'),
('56df216b-2fa4-4fe8-92d1-fd95ee3fa3e2', '3c703bd5-c45a-4208-a47c-93ad10fdfbc2', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 OPR/131.0.0.0', '2026-06-11 14:47:45', '2026-06-11 13:47:45'),
('57d92785-3713-464f-b95b-90380722e466', 'bd5f3f89-8414-4509-b151-ffd2027cbc6b', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 OPR/131.0.0.0', '2026-06-11 10:50:26', '2026-06-11 09:50:26'),
('5974852d-699d-4e2c-bb31-f262e92e4beb', 'bd5f3f89-8414-4509-b151-ffd2027cbc6b', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '::1', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '2026-06-10 12:43:26', '2026-06-10 11:43:26'),
('59c095ea-f4d1-4c3b-bd67-7c234cc44a36', 'a794d1b3-5591-49dd-b7b8-bd7141ddceec', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 OPR/131.0.0.0', '2026-06-09 10:41:16', '2026-06-09 09:41:16'),
('5a593c07-560c-40f0-858a-dcb45bfeae09', 'd3e9cef7-894b-4f24-abfb-a6ab674aed9b', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 OPR/131.0.0.0', '2026-06-09 09:57:37', '2026-06-09 09:32:48'),
('5b866eab-58d7-4c56-8bdf-8d9546fdcc20', 'd3e9cef7-894b-4f24-abfb-a6ab674aed9b', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 OPR/131.0.0.0', '2026-06-12 10:13:43', '2026-06-12 09:13:43'),
('5b96f671-be32-4656-a290-b5acb79c4940', '0fd96779-24cc-4ea0-82a7-1e53e3cab151', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 OPR/131.0.0.0', '2026-06-09 13:01:57', '2026-06-09 12:01:57'),
('5e6950fe-5bbb-4eba-8be0-8e5c866dba13', '2a938c85-ab12-4cde-a1bf-a1f8c30c981b', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 OPR/131.0.0.0', '2026-06-11 10:46:55', '2026-06-11 09:46:55'),
('5f877415-e266-4eb6-bd16-42ce243c2eee', 'd3e9cef7-894b-4f24-abfb-a6ab674aed9b', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 OPR/131.0.0.0', '2026-06-09 10:23:57', '2026-06-09 09:32:48'),
('6222555a-25fa-4729-8bfc-f74dcbf068e6', 'd3e9cef7-894b-4f24-abfb-a6ab674aed9b', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '::1', 'Mozilla/5.0 (Linux; Android 13; SM-G981B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36', '2026-06-12 14:16:56', '2026-06-12 13:16:56'),
('63ba07e9-1002-4396-a3e3-9681f9f1e16b', 'bd5f3f89-8414-4509-b151-ffd2027cbc6b', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '::1', 'Mozilla/5.0 (Linux; Android 13; SM-G981B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36', '2026-06-10 13:43:09', '2026-06-10 12:43:09'),
('63efcc65-7c8d-4dc2-a43f-b72494edcb3c', '0fd96779-24cc-4ea0-82a7-1e53e3cab151', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 OPR/131.0.0.0', '2026-06-10 12:28:38', '2026-06-10 11:28:38'),
('64245d10-64b7-49f5-8630-c0543ab9e4dd', '3c703bd5-c45a-4208-a47c-93ad10fdfbc2', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 OPR/131.0.0.0', '2026-06-11 14:46:00', '2026-06-11 13:46:00'),
('66dc2e25-fe55-4cbe-a58d-b159f6578095', 'a794d1b3-5591-49dd-b7b8-bd7141ddceec', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 OPR/131.0.0.0', '2026-06-09 10:59:29', '2026-06-09 09:59:29'),
('67495384-8da2-4600-9d0d-89a872d37cda', 'bd5f3f89-8414-4509-b151-ffd2027cbc6b', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 OPR/131.0.0.0', '2026-06-11 11:58:54', '2026-06-11 10:58:54'),
('6b0ca665-7694-43c5-af4a-ee1cca4ba421', '3c703bd5-c45a-4208-a47c-93ad10fdfbc2', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '::1', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '2026-06-11 16:52:55', '2026-06-11 15:52:55'),
('6d009628-1b8f-452e-b9c1-34e2e9ac481b', '0fd96779-24cc-4ea0-82a7-1e53e3cab151', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 OPR/131.0.0.0', '2026-06-15 15:49:20', '2026-06-15 14:49:20'),
('6d815e53-32b7-4f8f-bbaf-d1ffce76ef0d', 'bd5f3f89-8414-4509-b151-ffd2027cbc6b', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '::1', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '2026-06-10 12:53:38', '2026-06-10 11:53:38'),
('6eb64557-146f-4128-a5db-f972939050f6', 'd3e9cef7-894b-4f24-abfb-a6ab674aed9b', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 OPR/131.0.0.0', '2026-06-12 10:22:36', '2026-06-12 09:22:36'),
('712de85e-bbe3-41bf-b54d-d44e4d119850', 'bd5f3f89-8414-4509-b151-ffd2027cbc6b', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 OPR/131.0.0.0', '2026-06-10 12:07:02', '2026-06-10 11:07:02'),
('733e7daf-a58d-4877-889f-7dedb8eededa', '3c703bd5-c45a-4208-a47c-93ad10fdfbc2', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '::1', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '2026-06-11 15:43:49', '2026-06-11 14:43:49'),
('745d579a-35e1-42ce-a541-29f57fd02b37', 'bd5f3f89-8414-4509-b151-ffd2027cbc6b', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '::1', 'Mozilla/5.0 (Linux; Android 13; SM-G981B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36', '2026-06-10 13:05:00', '2026-06-10 12:05:00'),
('7548e7e8-934b-4d38-969f-daa826d2dc3c', 'bd5f3f89-8414-4509-b151-ffd2027cbc6b', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '::1', 'Mozilla/5.0 (Linux; Android 13; SM-G981B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36', '2026-06-10 13:06:23', '2026-06-10 12:06:23'),
('75583f01-1a1d-4f13-86a3-2da31fff36c1', '1c0cf590-8cc8-4d71-97fc-058e478fe384', 'f82bee2a-3f1b-4e8e-b489-a7851b1648f2', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '2026-06-16 10:25:55', '2026-06-16 09:25:55'),
('76128d47-ab58-43be-b69d-38eeca29d485', 'bd5f3f89-8414-4509-b151-ffd2027cbc6b', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '::1', 'Mozilla/5.0 (Linux; Android 13; SM-G981B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36', '2026-06-10 14:05:16', '2026-06-10 13:05:16'),
('76d381e3-af74-443b-946f-7a172763b07a', '2a938c85-ab12-4cde-a1bf-a1f8c30c981b', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 OPR/131.0.0.0', '2026-06-10 11:17:53', '2026-06-10 10:17:53'),
('7e1ce98a-694c-472c-b3b2-78588eacf16c', '41bf6831-47fd-4c89-b622-cdb29415e534', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 OPR/131.0.0.0', '2026-06-13 12:43:30', '2026-06-13 11:43:30'),
('807768e3-0770-4406-8de4-e398a488057e', '0fd96779-24cc-4ea0-82a7-1e53e3cab151', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '::1', 'Mozilla/5.0 (Linux; Android 13; SM-G981B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36', '2026-06-11 10:18:31', '2026-06-11 09:18:31'),
('84fe6f69-19d0-4ab3-962f-de3ee5b1a587', 'd3e9cef7-894b-4f24-abfb-a6ab674aed9b', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 OPR/131.0.0.0', '2026-06-09 09:43:26', '2026-06-09 09:32:48'),
('86b1677d-52e3-49ba-94d8-d4edb4f9fa2d', 'bd5f3f89-8414-4509-b151-ffd2027cbc6b', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '::1', 'Mozilla/5.0 (Linux; Android 13; SM-G981B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36', '2026-06-10 14:04:05', '2026-06-10 13:04:05'),
('873156a7-e497-4189-bb64-205cbeef9e66', '0fd96779-24cc-4ea0-82a7-1e53e3cab151', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 OPR/131.0.0.0', '2026-06-10 12:28:07', '2026-06-10 11:28:07'),
('8a600010-2954-431a-9f44-a4ff31d68ea1', '2a938c85-ab12-4cde-a1bf-a1f8c30c981b', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 OPR/131.0.0.0', '2026-06-11 10:46:54', '2026-06-11 09:46:54'),
('8be2c87b-96da-470e-b182-1678a989e618', 'f30d9ac6-5108-47e6-b8c5-f4c3f5a0d7c6', 'f82bee2a-3f1b-4e8e-b489-a7851b1648f2', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-06-13 10:01:26', '2026-06-13 09:01:26'),
('8c3bd0ce-cf6e-4cfa-86e2-c378b24c345e', '41bf6831-47fd-4c89-b622-cdb29415e534', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 OPR/131.0.0.0', '2026-06-16 12:36:37', '2026-06-16 11:36:37'),
('8d3d3ba3-abea-48e9-b829-7e714f8a7e0f', 'bd5f3f89-8414-4509-b151-ffd2027cbc6b', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '::1', 'Mozilla/5.0 (Linux; Android 13; SM-G981B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36', '2026-06-10 13:06:37', '2026-06-10 12:06:37'),
('92c2b737-b3ff-4402-ad88-b38a895bf6d4', 'd3e9cef7-894b-4f24-abfb-a6ab674aed9b', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '::1', 'Mozilla/5.0 (Linux; Android 13; SM-G981B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36', '2026-06-12 14:50:30', '2026-06-12 13:50:30'),
('958d31f5-4438-475b-95dd-53b22a63e21d', 'd3e9cef7-894b-4f24-abfb-a6ab674aed9b', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 OPR/131.0.0.0', '2026-06-12 10:08:18', '2026-06-12 09:08:18'),
('980de4a8-6a94-4117-8d5d-6f028c8b8020', '3c703bd5-c45a-4208-a47c-93ad10fdfbc2', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '::1', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '2026-06-11 16:14:56', '2026-06-11 15:14:56'),
('9849d194-e1c9-44ff-9556-50cb7e7c9671', '2a938c85-ab12-4cde-a1bf-a1f8c30c981b', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 OPR/131.0.0.0', '2026-06-10 12:04:12', '2026-06-10 11:04:12'),
('9f79740e-d9c5-40a0-8e7d-c7da043ef01b', '0fd96779-24cc-4ea0-82a7-1e53e3cab151', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 OPR/131.0.0.0', '2026-06-09 11:12:09', '2026-06-09 10:12:09'),
('a91a7eea-1e2c-4dde-a530-9a67abcff12d', '3c703bd5-c45a-4208-a47c-93ad10fdfbc2', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '::1', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '2026-06-11 16:52:53', '2026-06-11 15:52:53'),
('a9321e2f-7cad-4e30-8b41-904bfa20a439', '0fd96779-24cc-4ea0-82a7-1e53e3cab151', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 OPR/131.0.0.0', '2026-06-15 15:53:38', '2026-06-15 14:53:38'),
('ad175913-2f4f-410d-8f7d-6b98ddc30ab4', '3c703bd5-c45a-4208-a47c-93ad10fdfbc2', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '::1', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '2026-06-11 16:52:56', '2026-06-11 15:52:56'),
('af81e6ae-b10b-4688-bf21-c1b435238eca', 'bd5f3f89-8414-4509-b151-ffd2027cbc6b', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '::1', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '2026-06-10 12:09:18', '2026-06-10 11:09:18'),
('b11b3d57-b461-4731-8928-d7e5bbbf809f', 'a794d1b3-5591-49dd-b7b8-bd7141ddceec', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 OPR/131.0.0.0', '2026-06-13 10:51:25', '2026-06-13 09:51:25'),
('b194f4e0-0e40-4e4c-b808-a98a7e681f7d', 'd3e9cef7-894b-4f24-abfb-a6ab674aed9b', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 OPR/131.0.0.0', '2026-06-09 09:51:06', '2026-06-09 09:32:48'),
('b2937933-be1a-44a3-8217-f769c2c616db', 'd3e9cef7-894b-4f24-abfb-a6ab674aed9b', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 OPR/131.0.0.0', '2026-06-12 10:38:40', '2026-06-12 09:38:40'),
('b2b26b82-fb3a-446d-84e5-005e3835bcae', '3c703bd5-c45a-4208-a47c-93ad10fdfbc2', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '::1', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '2026-06-11 14:49:42', '2026-06-11 13:49:42'),
('b59d0252-d01f-4693-9dca-4fbbe3ba4bd2', 'bd5f3f89-8414-4509-b151-ffd2027cbc6b', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '::1', 'Mozilla/5.0 (Linux; Android 13; SM-G981B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36', '2026-06-10 12:58:21', '2026-06-10 11:58:21'),
('b6bba97a-c0ee-4054-a1da-c9ba4b4e9b32', 'bd5f3f89-8414-4509-b151-ffd2027cbc6b', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '::1', 'Mozilla/5.0 (Linux; Android 13; SM-G981B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36', '2026-06-10 13:01:18', '2026-06-10 12:01:18'),
('b83f8aba-8949-4a96-9125-6d7f6a57573f', 'd3e9cef7-894b-4f24-abfb-a6ab674aed9b', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 OPR/131.0.0.0', '2026-06-09 10:24:40', '2026-06-09 09:32:48'),
('bc38842e-df73-4a1b-a288-512bc4c71912', 'bd5f3f89-8414-4509-b151-ffd2027cbc6b', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '::1', 'Mozilla/5.0 (Linux; Android 13; SM-G981B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36', '2026-06-10 13:56:47', '2026-06-10 12:56:47'),
('bef176ae-431d-4d6e-8484-dbd5330f1ccf', 'a794d1b3-5591-49dd-b7b8-bd7141ddceec', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '::1', 'Mozilla/5.0 (Linux; Android 13; SM-G981B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36', '2026-06-13 10:57:40', '2026-06-13 09:57:40'),
('c1b063e6-02cd-45fa-a9c3-4f11ebe88892', 'bd5f3f89-8414-4509-b151-ffd2027cbc6b', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '::1', 'Mozilla/5.0 (Linux; Android 13; SM-G981B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36', '2026-06-10 17:01:00', '2026-06-10 16:01:00'),
('c21f252a-0366-49d1-8bde-0ea28969fd13', '3c703bd5-c45a-4208-a47c-93ad10fdfbc2', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '::1', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '2026-06-11 14:54:05', '2026-06-11 13:54:05'),
('c4a71e6b-7dc8-466a-947e-1de645228355', 'd3e9cef7-894b-4f24-abfb-a6ab674aed9b', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '::1', 'Mozilla/5.0 (Linux; Android 13; SM-G981B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36', '2026-06-12 14:15:48', '2026-06-12 13:15:48'),
('c64d5f1c-831f-4fbe-8a37-8cd60b9eaa57', '3c703bd5-c45a-4208-a47c-93ad10fdfbc2', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '::1', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '2026-06-11 15:32:27', '2026-06-11 14:32:27'),
('c6f6c0b4-390c-49b9-8c22-0885c86f2a65', 'd3e9cef7-894b-4f24-abfb-a6ab674aed9b', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 OPR/131.0.0.0', '2026-06-09 10:25:03', '2026-06-09 09:32:48'),
('c76ee36c-410f-41d0-a3be-ffa81184e5fd', 'a794d1b3-5591-49dd-b7b8-bd7141ddceec', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 OPR/131.0.0.0', '2026-06-09 10:59:21', '2026-06-09 09:59:21'),
('c774942d-8abc-4114-ac63-c752cc7bc1ea', 'bd5f3f89-8414-4509-b151-ffd2027cbc6b', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '::1', 'Mozilla/5.0 (Linux; Android 13; SM-G981B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36', '2026-06-10 12:55:52', '2026-06-10 11:55:52'),
('c80bc55f-a3a5-4465-af65-d607f25a2055', 'a794d1b3-5591-49dd-b7b8-bd7141ddceec', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 OPR/131.0.0.0', '2026-06-09 10:25:53', '2026-06-09 09:32:48'),
('c9b751f1-6b7d-4d48-b64f-57c8c75ee6f9', '3c703bd5-c45a-4208-a47c-93ad10fdfbc2', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '::1', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '2026-06-11 15:27:30', '2026-06-11 14:27:30'),
('cb7af7b8-4602-467d-bc3a-1883cb0c0e1e', 'bd5f3f89-8414-4509-b151-ffd2027cbc6b', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '::1', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '2026-06-10 12:50:47', '2026-06-10 11:50:47'),
('cc464783-e914-4b1b-b92b-ffcb57f37e2b', '3c703bd5-c45a-4208-a47c-93ad10fdfbc2', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '::1', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '2026-06-11 16:14:53', '2026-06-11 15:14:53'),
('cd5c9bd8-7c93-47e8-bd24-79c351525943', 'd3e9cef7-894b-4f24-abfb-a6ab674aed9b', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '::1', 'Mozilla/5.0 (Linux; Android 13; SM-G981B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36', '2026-06-12 14:14:27', '2026-06-12 13:14:27'),
('ce3a20a5-4043-4eac-8ebb-1a4019867f69', '0fd96779-24cc-4ea0-82a7-1e53e3cab151', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 OPR/131.0.0.0', '2026-06-09 13:02:00', '2026-06-09 12:02:00'),
('ce4f539f-fb55-4960-9b04-57ed17f110ca', 'd3e9cef7-894b-4f24-abfb-a6ab674aed9b', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 OPR/131.0.0.0', '2026-06-12 10:40:16', '2026-06-12 09:40:16'),
('cf29f9be-d9e3-4285-bdb5-ac58ef96570d', '2a938c85-ab12-4cde-a1bf-a1f8c30c981b', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 OPR/131.0.0.0', '2026-06-11 10:41:51', '2026-06-11 09:41:51'),
('d62a35fb-95e5-41c5-bb27-6cb9e7221230', '0fd96779-24cc-4ea0-82a7-1e53e3cab151', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '::1', 'Mozilla/5.0 (Linux; Android 13; SM-G981B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36', '2026-06-11 10:25:57', '2026-06-11 09:25:57'),
('d962e388-667e-4207-ace9-19150c008e2b', 'bd5f3f89-8414-4509-b151-ffd2027cbc6b', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 OPR/131.0.0.0', '2026-06-11 12:28:24', '2026-06-11 11:28:24'),
('daef837a-a799-456f-876e-444bd21ea440', '0fd96779-24cc-4ea0-82a7-1e53e3cab151', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 OPR/131.0.0.0', '2026-06-15 15:48:44', '2026-06-15 14:48:44'),
('de84a95e-946b-4a6d-b101-d2dcd9ff0653', '3c703bd5-c45a-4208-a47c-93ad10fdfbc2', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '::1', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '2026-06-11 14:53:55', '2026-06-11 13:53:55'),
('e10f328a-4551-48ab-90e2-96f1c7e3df62', '3c703bd5-c45a-4208-a47c-93ad10fdfbc2', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '::1', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '2026-06-11 16:52:52', '2026-06-11 15:52:52'),
('e2014289-7a14-43d0-8eaa-5f4b14e0bded', 'bd5f3f89-8414-4509-b151-ffd2027cbc6b', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 OPR/131.0.0.0', '2026-06-11 14:18:55', '2026-06-11 13:18:55'),
('e4dc8a1b-611d-4932-b8e6-c23b5bdfcd6f', '2a938c85-ab12-4cde-a1bf-a1f8c30c981b', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 OPR/131.0.0.0', '2026-06-10 12:04:19', '2026-06-10 11:04:19'),
('e627f962-b9ae-46af-bd6e-5393eeeb3a7b', 'bd5f3f89-8414-4509-b151-ffd2027cbc6b', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '::1', 'Mozilla/5.0 (Linux; Android 13; SM-G981B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36', '2026-06-10 12:56:59', '2026-06-10 11:56:59'),
('e654e7ef-8188-49c7-9459-710a2f9bd1ca', '3c703bd5-c45a-4208-a47c-93ad10fdfbc2', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 OPR/131.0.0.0', '2026-06-11 14:46:34', '2026-06-11 13:46:34'),
('e6baa464-64c0-4a3e-8a59-b0cd3b23322d', '2a938c85-ab12-4cde-a1bf-a1f8c30c981b', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 OPR/131.0.0.0', '2026-06-10 12:11:21', '2026-06-10 11:11:21'),
('e746c73c-cd49-46ac-a1c4-b3bad9f9e04e', '0fd96779-24cc-4ea0-82a7-1e53e3cab151', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 OPR/131.0.0.0', '2026-06-09 13:02:52', '2026-06-09 12:02:52'),
('e8712a7f-9775-4105-aa39-6cb162520398', '3c703bd5-c45a-4208-a47c-93ad10fdfbc2', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '::1', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '2026-06-11 14:57:25', '2026-06-11 13:57:25'),
('ea1b47d6-27a1-4527-ab8a-7bb5341f383b', '3c703bd5-c45a-4208-a47c-93ad10fdfbc2', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '::1', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '2026-06-11 15:34:32', '2026-06-11 14:34:32'),
('ed3fc37f-365e-4a72-9ec0-292e249c45ab', 'bd5f3f89-8414-4509-b151-ffd2027cbc6b', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '::1', 'Mozilla/5.0 (Linux; Android 13; SM-G981B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36', '2026-06-10 14:01:19', '2026-06-10 13:01:19'),
('f0b5fd66-f5a3-47ae-8d70-26280ff3930f', 'd3e9cef7-894b-4f24-abfb-a6ab674aed9b', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '::1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; fr-FR) WindowsPowerShell/5.1.19041.6456', '2026-06-09 10:29:15', '2026-06-09 09:32:48'),
('f6624ecd-f925-4b9f-8f8b-2387a8c9e292', 'a794d1b3-5591-49dd-b7b8-bd7141ddceec', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '::1', 'Mozilla/5.0 (Linux; Android 13; SM-G981B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36', '2026-06-13 10:57:05', '2026-06-13 09:57:05'),
('f771c471-204f-4315-ab7f-34ba874bfd29', 'd3e9cef7-894b-4f24-abfb-a6ab674aed9b', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '::1', 'Mozilla/5.0 (Linux; Android 13; SM-G981B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36', '2026-06-12 14:15:29', '2026-06-12 13:15:29'),
('f7a5f8e5-7c20-414c-b245-6a943e544331', 'd3e9cef7-894b-4f24-abfb-a6ab674aed9b', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '::1', 'Mozilla/5.0 (Linux; Android 13; SM-G981B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36', '2026-06-12 14:13:37', '2026-06-12 13:13:37'),
('f92919a0-4d0b-4c09-93d2-e5dc723f16e4', 'd3e9cef7-894b-4f24-abfb-a6ab674aed9b', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 OPR/131.0.0.0', '2026-06-12 10:32:54', '2026-06-12 09:32:54'),
('fa3763fe-cc9d-4338-b523-0f41b4e201ef', '3c703bd5-c45a-4208-a47c-93ad10fdfbc2', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '::1', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '2026-06-11 16:17:48', '2026-06-11 15:17:48'),
('fa8986f9-6892-4552-8c81-32800e09eabe', 'd3e9cef7-894b-4f24-abfb-a6ab674aed9b', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 OPR/131.0.0.0', '2026-06-09 09:50:24', '2026-06-09 09:32:48'),
('fab917f0-1d58-4c0e-bbe2-5a52105a65b7', 'd3e9cef7-894b-4f24-abfb-a6ab674aed9b', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 OPR/131.0.0.0', '2026-06-12 10:02:28', '2026-06-12 09:02:28'),
('fc6466cb-7f28-437d-9f10-7f774ebf63c8', 'bd5f3f89-8414-4509-b151-ffd2027cbc6b', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '::1', 'Mozilla/5.0 (Linux; Android 13; SM-G981B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36', '2026-06-10 13:59:38', '2026-06-10 12:59:38'),
('fcc7f60b-1361-49ff-adab-3a16d6fd92c0', 'bd5f3f89-8414-4509-b151-ffd2027cbc6b', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 OPR/131.0.0.0', '2026-06-11 10:37:08', '2026-06-11 09:37:08'),
('fe83c0e7-4b23-4d24-a0dc-9c86de88878f', 'd3e9cef7-894b-4f24-abfb-a6ab674aed9b', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 OPR/131.0.0.0', '2026-06-12 10:28:11', '2026-06-12 09:28:12'),
('ff5e5b8d-db5b-4b19-8338-a4845792c0d6', '3c703bd5-c45a-4208-a47c-93ad10fdfbc2', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '::1', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '2026-06-11 16:53:53', '2026-06-11 15:53:53'),
('ff7f3ac0-1d0f-43c5-bd30-f3b96aead408', 'bd5f3f89-8414-4509-b151-ffd2027cbc6b', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '::1', 'Mozilla/5.0 (Linux; Android 13; SM-G981B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36', '2026-06-11 10:15:24', '2026-06-11 09:15:24'),
('fff66433-6217-4ea5-9ed1-85e600ab3634', 'bd5f3f89-8414-4509-b151-ffd2027cbc6b', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 OPR/131.0.0.0', '2026-06-10 12:05:14', '2026-06-10 11:05:14');

-- --------------------------------------------------------

--
-- Structure de la table `reservations`
--

CREATE TABLE `reservations` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `restaurant_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `table_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `first_name` varchar(50) NOT NULL,
  `last_name` varchar(50) NOT NULL,
  `email` varchar(191) DEFAULT NULL,
  `phone` varchar(20) NOT NULL,
  `reservation_date` date NOT NULL,
  `reservation_time` time NOT NULL,
  `covers` tinyint(4) NOT NULL DEFAULT 2,
  `zone` enum('SALLE','TERRASSE','ETAGE') DEFAULT 'SALLE',
  `notes` text DEFAULT NULL,
  `status` enum('EN_ATTENTE','CONFIRMEE','RAPPEL_ENVOYE','ARRIVEE','TERMINEE','ANNULEE','ANNULEE_CLIENT','ANNULEE_RESTAURANT','NO_SHOW') DEFAULT 'EN_ATTENTE',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `cancel_token` varchar(255) DEFAULT NULL,
  `cancel_reason` text DEFAULT NULL,
  `confirmed_at` datetime DEFAULT NULL,
  `reminder_sent` tinyint(4) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `reservations`
--

INSERT INTO `reservations` (`id`, `restaurant_id`, `table_id`, `first_name`, `last_name`, `email`, `phone`, `reservation_date`, `reservation_time`, `covers`, `zone`, `notes`, `status`, `created_at`, `updated_at`, `cancel_token`, `cancel_reason`, `confirmed_at`, `reminder_sent`) VALUES
('051d268b-3589-4400-8c93-a9f850091b5c', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', 'd3e9cef7-894b-4f24-abfb-a6ab674aed9b', 'client 2', 'RSERV2', 'client2@gmail.com', '23 8769000', '2026-06-11', '18:00:00', 4, 'TERRASSE', NULL, 'TERMINEE', '2026-06-11 09:31:26', '2026-06-12 12:20:41', NULL, NULL, '2026-06-11 09:31:46', 2),
('10f7eb1c-1297-4c52-9640-fe8744a5bb72', 'f82bee2a-3f1b-4e8e-b489-a7851b1648f2', 'f30d9ac6-5108-47e6-b8c5-f4c3f5a0d7c6', 'TEST', 'TEST3', 'TEST@gmail.com', '29345679', '2026-06-15', '20:00:00', 2, 'SALLE', NULL, 'CONFIRMEE', '2026-06-15 12:07:11', '2026-06-15 18:00:00', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwdXJwb3NlIjoiY2FuY2VsIiwicmVzdGF1cmFudF9pZCI6ImY4MmJlZTJhLTNmMWItNGU4ZS1iNDg5LWE3ODUxYjE2NDhmMiIsImlhdCI6MTc4MTUyMTYzMSwiZXhwIjoxNzgxNjk0NDMxfQ.GmNhpstMOZCij22vv8RDifeTDMPAlzVJs2GLqAyEyqs', NULL, '2026-06-15 12:08:11', 2),
('3d49f899-98d0-45b9-ae4c-f1be95899c32', 'f82bee2a-3f1b-4e8e-b489-a7851b1648f2', '0054bf66-4737-424a-b78b-5eb470037f30', 'cheibi', 'wiem', 'wiemchaibi96@gmail.com', '26345411', '2026-06-13', '21:30:00', 2, 'SALLE', NULL, 'TERMINEE', '2026-06-13 10:16:01', '2026-06-15 12:08:07', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwdXJwb3NlIjoiY2FuY2VsIiwicmVzdGF1cmFudF9pZCI6ImY4MmJlZTJhLTNmMWItNGU4ZS1iNDg5LWE3ODUxYjE2NDhmMiIsImlhdCI6MTc4MTM0MjE2MSwiZXhwIjoxNzgxNTE0OTYxfQ.PDb4rWKlO0kYFDYTPGF1Qtt30UMHqYEzVzjqLrvbi2c', NULL, '2026-06-13 10:16:20', 0),
('494b0388-40e0-4f5b-89e6-f9dbe4c547ce', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', NULL, 'clien3', 'wiem', 'hannibaladvanced@gmail.com', '26345411', '2026-06-13', '21:30:00', 2, 'SALLE', 'CX', 'ARRIVEE', '2026-06-13 09:35:21', '2026-06-16 13:48:21', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwdXJwb3NlIjoiY2FuY2VsIiwicmVzdGF1cmFudF9pZCI6ImVmNDUzZTNiLTMzZDUtNDNhYy05MWQyLTllYzg2YjkyNzAzNSIsImlhdCI6MTc4MTMzOTcyMSwiZXhwIjoxNzgxNTEyNTIxfQ.Elk7_6SgO7e_3yJRGpx7aedcHTI5upXm-u_g-jw2rE4', NULL, '2026-06-13 09:37:00', 0),
('661bda42-9617-4b67-890c-e575221d37e3', 'f82bee2a-3f1b-4e8e-b489-a7851b1648f2', NULL, 'cheibi', 'wiem', 'wiemchaibi96@gmail.com', '26345411', '2026-06-13', '20:00:00', 2, 'SALLE', NULL, 'TERMINEE', '2026-06-13 09:48:00', '2026-06-15 12:08:08', NULL, NULL, '2026-06-13 09:48:03', 0),
('6f1189e9-a59e-4def-ba35-3e1eb90ab127', '926f35f9-1a80-4272-a0e6-ea4dd37b2118', NULL, 'cheibi', 'wiem', 'wiemchaibi96@gmail.com', '26345411', '2026-06-14', '20:30:00', 2, 'SALLE', 'vfcdxswq', 'EN_ATTENTE', '2026-06-13 09:53:32', '2026-06-13 09:53:32', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwdXJwb3NlIjoiY2FuY2VsIiwicmVzdGF1cmFudF9pZCI6IjkyNmYzNWY5LTFhODAtNDI3Mi1hMGU2LWVhNGRkMzdiMjExOCIsImlhdCI6MTc4MTM0MDgxMiwiZXhwIjoxNzgxNTEzNjEyfQ.rQJEdQHMLTvlJojIdKPwaA8U3E33I-zxmHEYGQqIg54', NULL, NULL, 0),
('7628c5e7-dd36-4a04-928b-3fecc8b93c06', '926f35f9-1a80-4272-a0e6-ea4dd37b2118', NULL, 'cheibiggj', 'wiem', 'wiemchaibi96@gmail.com', '26345411', '2026-06-13', '21:30:00', 2, 'SALLE', NULL, 'CONFIRMEE', '2026-06-13 09:52:19', '2026-06-13 10:19:40', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwdXJwb3NlIjoiY2FuY2VsIiwicmVzdGF1cmFudF9pZCI6IjkyNmYzNWY5LTFhODAtNDI3Mi1hMGU2LWVhNGRkMzdiMjExOCIsImlhdCI6MTc4MTM0MDczOSwiZXhwIjoxNzgxNTEzNTM5fQ.1oAB4wjPnP90ZNOhFojXLwMKmu_LihDeBaVT2VulhLc', NULL, '2026-06-13 10:19:40', 0),
('7ed7c35e-75ba-4e8e-8768-d65ceb39c8c3', '926f35f9-1a80-4272-a0e6-ea4dd37b2118', NULL, 'cheibi', 'wiem', 'wiemchaibi96@gmail.com', '26345411', '2026-06-14', '20:30:00', 2, 'SALLE', NULL, 'EN_ATTENTE', '2026-06-13 10:15:15', '2026-06-13 10:15:15', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwdXJwb3NlIjoiY2FuY2VsIiwicmVzdGF1cmFudF9pZCI6IjkyNmYzNWY5LTFhODAtNDI3Mi1hMGU2LWVhNGRkMzdiMjExOCIsImlhdCI6MTc4MTM0MjExNSwiZXhwIjoxNzgxNTE0OTE1fQ.kObD5Xd-MoXO6zuuStonaiKjmkTndWNdvr8n2rztbbw', NULL, NULL, 0),
('a3b79299-affd-49ab-8bca-8ad7c9ce19cd', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', NULL, 'cheibi', 'wiem', 'wiemchaibi96@gmail.com', '26345411', '2026-06-15', '14:00:00', 2, 'SALLE', NULL, 'ARRIVEE', '2026-06-13 10:14:20', '2026-06-16 13:48:02', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwdXJwb3NlIjoiY2FuY2VsIiwicmVzdGF1cmFudF9pZCI6ImVmNDUzZTNiLTMzZDUtNDNhYy05MWQyLTllYzg2YjkyNzAzNSIsImlhdCI6MTc4MTM0MjA2MCwiZXhwIjoxNzgxNTE0ODYwfQ.H3j9LQ2tKAip2xqj5JYkXm4xeK0fwjaNq7a1YxAf-C8', NULL, '2026-06-13 10:14:42', 2),
('bfd26573-9ac0-4119-9ba8-bf71ab68ae0c', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '2a938c85-ab12-4cde-a1bf-a1f8c30c981b', 'cheibi', 'wiem', 'hannibaladvanced@gmail.com', '55720359', '2026-06-13', '12:30:00', 2, 'ETAGE', 'bvf', 'ARRIVEE', '2026-06-12 12:17:00', '2026-06-12 12:19:57', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwdXJwb3NlIjoiY2FuY2VsIiwicmVzdGF1cmFudF9pZCI6ImVmNDUzZTNiLTMzZDUtNDNhYy05MWQyLTllYzg2YjkyNzAzNSIsImlhdCI6MTc4MTI2MzAyMCwiZXhwIjoxNzgxNDM1ODIwfQ.--PDYxcdFZZojdxSfytETj7qe_P2NA9XwN0DQfLB_dk', NULL, '2026-06-12 12:17:56', 0),
('d0f3d6eb-e3d9-4529-83e1-8f25c0bf210b', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '3c703bd5-c45a-4208-a47c-93ad10fdfbc2', 'client1', 'cltrev1', 'client1@gmail.com', '24356987', '2026-06-09', '15:00:00', 2, 'SALLE', 'Meeting', 'TERMINEE', '2026-06-09 09:19:45', '2026-06-11 08:54:21', NULL, NULL, '2026-06-09 15:31:16', 0),
('dd2d78a5-4528-48ef-8e8f-23fbb8a9fa2f', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', 'd3e9cef7-894b-4f24-abfb-a6ab674aed9b', 'fg', 'lkjh', 'wieH@gmail.com', '23445678', '2026-06-16', '20:00:00', 4, 'TERRASSE', NULL, 'ARRIVEE', '2026-06-16 14:27:42', '2026-06-16 14:48:51', NULL, NULL, '2026-06-16 14:48:43', 0),
('e00801c5-c5d8-4b21-a649-bdf29de60f9c', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '2a938c85-ab12-4cde-a1bf-a1f8c30c981b', 'test', 'res', NULL, '12345678', '2026-06-10', '12:00:00', 2, 'SALLE', NULL, 'TERMINEE', '2026-06-09 00:27:48', '2026-06-12 12:20:34', NULL, NULL, '2026-06-12 12:20:31', 0);

-- --------------------------------------------------------

--
-- Structure de la table `reservation_settings`
--

CREATE TABLE `reservation_settings` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `restaurant_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `zones_enabled` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`zones_enabled`)),
  `capacity_salle` smallint(6) DEFAULT 50,
  `capacity_terrasse` smallint(6) DEFAULT 30,
  `capacity_etage` smallint(6) DEFAULT 20,
  `open_slots` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`open_slots`)),
  `service_duration_min` smallint(6) DEFAULT 90,
  `min_hours_before` tinyint(4) DEFAULT 2,
  `max_days_ahead` tinyint(4) DEFAULT 30,
  `auto_confirm` tinyint(4) DEFAULT 0,
  `reminder_j1_enabled` tinyint(4) DEFAULT 1,
  `reminder_j1_channel` enum('EMAIL','SMS','BOTH') DEFAULT 'EMAIL',
  `reminder_h2_enabled` tinyint(4) DEFAULT 0,
  `reminder_h2_channel` enum('SMS','WHATSAPP') DEFAULT 'SMS',
  `confirmation_message_fr` text DEFAULT NULL,
  `confirmation_message_en` text DEFAULT NULL,
  `confirmation_message_it` text DEFAULT NULL,
  `confirmation_message_ar` text DEFAULT NULL,
  `cancellation_policy` text DEFAULT NULL,
  `is_active` tinyint(4) DEFAULT 1,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `reservation_settings`
--

INSERT INTO `reservation_settings` (`id`, `restaurant_id`, `zones_enabled`, `capacity_salle`, `capacity_terrasse`, `capacity_etage`, `open_slots`, `service_duration_min`, `min_hours_before`, `max_days_ahead`, `auto_confirm`, `reminder_j1_enabled`, `reminder_j1_channel`, `reminder_h2_enabled`, `reminder_h2_channel`, `confirmation_message_fr`, `confirmation_message_en`, `confirmation_message_it`, `confirmation_message_ar`, `cancellation_policy`, `is_active`, `created_at`, `updated_at`) VALUES
('f2700db5-90a9-4c66-80ff-3513cc88a903', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '[\"SALLE\",\"TERRASSE\",\"ETAGE\"]', 50, 30, 20, '[{\"start\":\"12:00\",\"end\":\"14:30\"},{\"start\":\"19:00\",\"end\":\"22:30\"}]', 90, 2, 30, 0, 1, 'EMAIL', 0, 'SMS', NULL, NULL, NULL, NULL, NULL, 1, '2026-06-08 23:48:22', '2026-06-11 08:55:31');

-- --------------------------------------------------------

--
-- Structure de la table `restaurants`
--

CREATE TABLE `restaurants` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `owner_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `name` varchar(80) NOT NULL,
  `slug` varchar(100) NOT NULL,
  `type` enum('Restaurant','Café','Bar','Hôtel','Fast-food','Autre') DEFAULT 'Restaurant',
  `email` varchar(191) DEFAULT NULL,
  `phone` varchar(30) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `logo_url` varchar(500) DEFAULT NULL,
  `banner_url` varchar(500) DEFAULT NULL,
  `short_description` varchar(160) DEFAULT NULL,
  `template_id` enum('aurora_glass','bento_menu','classic_theme','dark_sleek','editorial_menu','modern_theme') DEFAULT 'classic_theme',
  `plan` enum('FREE','STARTER','PRO','PREMIUM') DEFAULT 'FREE',
  `is_active` tinyint(1) DEFAULT 1,
  `social_facebook` varchar(255) DEFAULT NULL,
  `social_instagram` varchar(255) DEFAULT NULL,
  `social_tripadvisor` varchar(255) DEFAULT NULL,
  `social_google_maps` varchar(255) DEFAULT NULL,
  `social_website` varchar(255) DEFAULT NULL,
  `social_whatsapp` varchar(30) DEFAULT NULL,
  `fiscal_matricule` varchar(100) DEFAULT NULL,
  `fiscal_company` varchar(255) DEFAULT NULL,
  `fiscal_address` text DEFAULT NULL,
  `created_by` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `activated_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `custom_colors` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`custom_colors`)),
  `custom_font` varchar(100) DEFAULT NULL,
  `menu_languages` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`menu_languages`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `restaurants`
--

INSERT INTO `restaurants` (`id`, `owner_id`, `name`, `slug`, `type`, `email`, `phone`, `address`, `logo_url`, `banner_url`, `short_description`, `template_id`, `plan`, `is_active`, `social_facebook`, `social_instagram`, `social_tripadvisor`, `social_google_maps`, `social_website`, `social_whatsapp`, `fiscal_matricule`, `fiscal_company`, `fiscal_address`, `created_by`, `activated_at`, `created_at`, `updated_at`, `custom_colors`, `custom_font`, `menu_languages`) VALUES
('926f35f9-1a80-4272-a0e6-ea4dd37b2118', '2864c7aa-63e1-4178-a14b-a170f43ced5f', 'delcapo restaurant', 'delcapo-restaurant', 'Restaurant', 'delcapo1@gmail.com', '+216 24 355 789', 'Marsa', 'http://localhost:3001/uploads/delcapo-restaurant/logo.jpg', 'http://localhost:3001/uploads/delcapo-restaurant/banner.jpeg', 'restaurant italien tunisie', 'aurora_glass', 'PRO', 1, 'https://www.facebook.com/Delcapopasta/', 'https://www.instagram.com/delcapo.restaurant/', '', '', '', '', NULL, NULL, NULL, '1c0a26db-a757-4f74-9645-920faa7f522c', '2026-06-10 09:01:46', '2026-06-10 09:01:46', '2026-06-13 09:31:35', '{\"accent\":\"#ff7547\",\"bg-primary\":\"#F7F7F7\",\"bg-secondary\":\"#FFFFFF\",\"card-bg\":\"#FFFFFF\",\"card-border\":\"#EFEFEF\",\"text-primary\":\"#1A1A1A\",\"text-secondary\":\"#9CA3AF\"}', 'Montserrat', '[\"fr\"]'),
('ef453e3b-33d5-43ac-91d2-9ec86b927035', '2fdb3f1b-9ac7-42ac-954d-fdf902f93a89', 'demo restaurant', 'demo-restaurant', 'Restaurant', 'demo@gmail.com', '+216 23 789 543', 'tunis marsa', 'http://localhost:3001/uploads/demo-restaurant/logo.png', 'http://localhost:3001/uploads/demo-restaurant/banner.jpeg', 'test1 demo restaurant', 'dark_sleek', 'PREMIUM', 1, '', 'https://www.instagram.com/delcapo.restaurant/', '', '', '', '#', NULL, NULL, NULL, '1c0a26db-a757-4f74-9645-920faa7f522c', '2026-06-08 00:18:42', '2026-06-08 00:18:42', '2026-06-15 17:47:59', '{\"accent\":\"#FF5C35\",\"bg-primary\":\"#0E0E0F\",\"bg-secondary\":\"#1A1A1B\",\"card-bg\":\"#1E1E1F\",\"card-border\":\"#2A2A2B\",\"text-primary\":\"#F5F5F5\",\"text-secondary\":\"#A0A0A0\"}', 'Lato', '[\"fr\",\"en\"]'),
('f82bee2a-3f1b-4e8e-b489-a7851b1648f2', 'bdf11593-ff2d-4f13-81ac-8c6cd8d1131d', 'Pavarotti Restaurant', 'pavarotti-restaurant', 'Restaurant', 'Pavarotti@gmail.com', '+216 58 799 209', 'LAC 1', 'http://localhost:3001/uploads/pavarotti-restaurant/logo.jpg', 'http://localhost:3001/uploads/pavarotti-restaurant/banner.jpeg', 'Cuisine italienne , Cocktails&Coffe, bar a Chicha', 'editorial_menu', 'PREMIUM', 1, 'https://www.facebook.com/p/Pavarotti-cafe-resto-61572452227150/', '', 'https://www.tripadvisor.fr/Restaurant_Review-g293758-d15072462-Reviews-Pavarotti_Pasta-Tunis_Tunis_Governorate.html', ' centre él halfaouine les berges du lac en face de dahdah, Tunis, Tunisia, 1053', '', '', NULL, NULL, NULL, '1c0a26db-a757-4f74-9645-920faa7f522c', '2026-06-13 09:45:55', '2026-06-13 09:45:55', '2026-06-15 11:56:47', '{\"accent\":\"#1A1A1A\",\"bg-primary\":\"#F9F7F4\",\"bg-secondary\":\"#F2EFE8\",\"card-bg\":\"#FFFFFF\",\"card-border\":\"#E0DDD8\",\"text-primary\":\"#1A1A1A\",\"text-secondary\":\"#6B6B6B\"}', NULL, '[\"fr\",\"en\"]');

-- --------------------------------------------------------

--
-- Structure de la table `restaurant_horaires`
--

CREATE TABLE `restaurant_horaires` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `restaurant_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `day_of_week` tinyint(4) NOT NULL,
  `open_time` time DEFAULT NULL,
  `close_time` time DEFAULT NULL,
  `is_closed` tinyint(1) DEFAULT 0,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `restaurant_horaires`
--

INSERT INTO `restaurant_horaires` (`id`, `restaurant_id`, `day_of_week`, `open_time`, `close_time`, `is_closed`, `created_at`, `updated_at`) VALUES
('0cba9632-f6f6-4b3c-a5db-d9e78a181153', 'f82bee2a-3f1b-4e8e-b489-a7851b1648f2', 2, '09:00:00', '23:00:00', 0, '2026-06-13 09:45:55', '2026-06-13 09:45:55'),
('1075aea7-b45c-4f8c-bdf5-77cb22cb01a1', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', 3, '09:00:00', '22:00:00', 0, '2026-06-08 00:18:42', '2026-06-08 00:18:42'),
('15bdcffd-edec-4ca9-90be-8ae03e5fa972', 'f82bee2a-3f1b-4e8e-b489-a7851b1648f2', 3, '09:00:00', '23:00:00', 0, '2026-06-13 09:45:55', '2026-06-13 09:45:55'),
('2130470e-0a8c-4d7a-b5d5-0c6160475546', '926f35f9-1a80-4272-a0e6-ea4dd37b2118', 0, '09:00:00', '23:00:00', 0, '2026-06-10 09:01:46', '2026-06-10 09:01:46'),
('5a0d244d-0959-460e-b515-76c764b05374', 'f82bee2a-3f1b-4e8e-b489-a7851b1648f2', 0, '09:00:00', '23:00:00', 0, '2026-06-13 09:45:55', '2026-06-13 09:45:55'),
('6078e903-a823-43b0-ba4b-3cea6942ffb6', '926f35f9-1a80-4272-a0e6-ea4dd37b2118', 1, '09:00:00', '23:00:00', 0, '2026-06-10 09:01:46', '2026-06-10 09:01:46'),
('62d036ff-ffec-45ec-b93d-010cf9e7a4ca', 'f82bee2a-3f1b-4e8e-b489-a7851b1648f2', 6, '09:00:00', '23:00:00', 0, '2026-06-13 09:45:55', '2026-06-13 09:45:55'),
('7371d315-99c9-4e5f-801e-40953dc5dbea', 'f82bee2a-3f1b-4e8e-b489-a7851b1648f2', 1, '09:00:00', '23:00:00', 0, '2026-06-13 09:45:55', '2026-06-13 09:45:55'),
('78b86331-e652-44b2-9862-c36601879892', '926f35f9-1a80-4272-a0e6-ea4dd37b2118', 2, '09:00:00', '22:00:00', 0, '2026-06-10 09:01:46', '2026-06-10 09:01:46'),
('7b597758-0d7e-4921-82a2-4f740b129765', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', 4, '09:00:00', '22:00:00', 0, '2026-06-08 00:18:42', '2026-06-08 00:18:42'),
('917c5608-a179-4acb-abd1-a9b54d9df552', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', 2, '09:00:00', '22:00:00', 0, '2026-06-08 00:18:42', '2026-06-08 00:18:42'),
('9ddff1c7-d99a-44d2-816f-3d67dfc96d68', '926f35f9-1a80-4272-a0e6-ea4dd37b2118', 4, '09:00:00', '22:00:00', 0, '2026-06-10 09:01:46', '2026-06-10 09:01:46'),
('a21535ad-2674-4989-ae6e-0c6c2528d7d2', 'f82bee2a-3f1b-4e8e-b489-a7851b1648f2', 4, '09:00:00', '23:00:00', 0, '2026-06-13 09:45:55', '2026-06-13 09:45:55'),
('bdac2247-9ba1-443c-8560-057f9db3fe1e', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', 5, '09:00:00', '22:00:00', 0, '2026-06-08 00:18:42', '2026-06-08 00:18:42'),
('c106b7fe-2fc6-4738-92b8-d047dba999a0', '926f35f9-1a80-4272-a0e6-ea4dd37b2118', 6, '09:00:00', '22:00:00', 0, '2026-06-10 09:01:46', '2026-06-10 09:01:46'),
('d8c3234f-d017-4d17-8deb-5087e64b6ffa', 'f82bee2a-3f1b-4e8e-b489-a7851b1648f2', 5, '09:00:00', '23:00:00', 0, '2026-06-13 09:45:55', '2026-06-13 09:45:55'),
('df93bbb6-4082-4a52-857c-20e8cac2d2f4', '926f35f9-1a80-4272-a0e6-ea4dd37b2118', 3, '09:00:00', '22:00:00', 0, '2026-06-10 09:01:46', '2026-06-10 09:01:46'),
('e3d0a5fc-e453-4df1-b343-8a03f063b6dc', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', 1, '09:00:00', '22:00:00', 0, '2026-06-08 00:18:42', '2026-06-08 00:18:42'),
('ed31e979-3dc6-4e55-9053-9ba6a105688c', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', 6, '09:00:00', '22:00:00', 0, '2026-06-08 00:18:42', '2026-06-08 00:18:42'),
('f22788ca-c851-40c6-aa08-ddbb3d4272be', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', 0, '09:00:00', '22:00:00', 0, '2026-06-08 00:18:42', '2026-06-08 00:18:42'),
('fa368cb6-d554-475e-8ee9-45ddde00bc5a', '926f35f9-1a80-4272-a0e6-ea4dd37b2118', 5, '09:00:00', '22:00:00', 0, '2026-06-10 09:01:46', '2026-06-10 09:01:46');

-- --------------------------------------------------------

--
-- Structure de la table `rooms`
--

CREATE TABLE `rooms` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `restaurant_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `name` varchar(60) NOT NULL,
  `capacity` smallint(6) DEFAULT 0,
  `zone` enum('SALLE','TERRASSE','ETAGE') DEFAULT 'SALLE',
  `menu_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `sort_order` int(11) DEFAULT 0,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `rooms`
--

INSERT INTO `rooms` (`id`, `restaurant_id`, `name`, `capacity`, `zone`, `menu_id`, `sort_order`, `created_at`, `updated_at`) VALUES
('05c0cbeb-ce3f-4943-a5cf-f601cd30d44d', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', 'ETAGE1', 0, 'ETAGE', NULL, 0, '2026-06-08 16:40:51', '2026-06-08 16:48:52'),
('36c7c846-fe90-49dc-a7fb-d81b17d941ea', '926f35f9-1a80-4272-a0e6-ea4dd37b2118', 'Terasse', 10, 'TERRASSE', NULL, 0, '2026-06-16 09:59:25', '2026-06-16 09:59:25'),
('3820d0b7-0191-428a-bd39-8731968bb63c', 'f82bee2a-3f1b-4e8e-b489-a7851b1648f2', 'Terrasse', 10, 'TERRASSE', NULL, 0, '2026-06-15 12:00:33', '2026-06-15 12:00:33'),
('4605ad24-1b92-4680-b017-97f4eb2de5bd', 'f82bee2a-3f1b-4e8e-b489-a7851b1648f2', 'Salle 1', 20, 'SALLE', NULL, 0, '2026-06-13 10:00:45', '2026-06-13 10:00:45'),
('5719460e-9101-4cb8-a4a1-f48f6938852e', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', 'SALLE', 0, 'SALLE', NULL, 0, '2026-06-08 16:33:33', '2026-06-08 16:48:10'),
('66927dbd-60f1-4110-b9ed-834a59c56bee', '926f35f9-1a80-4272-a0e6-ea4dd37b2118', 'Salle', 10, 'SALLE', NULL, 0, '2026-06-16 09:59:09', '2026-06-16 09:59:09'),
('e633c8bc-85ec-4e02-aa29-023e89cd61fd', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', 'Terrasse', 0, 'TERRASSE', NULL, 0, '2026-06-08 16:39:41', '2026-06-08 16:39:41');

-- --------------------------------------------------------

--
-- Structure de la table `service_closes`
--

CREATE TABLE `service_closes` (
  `id` char(36) NOT NULL,
  `restaurant_id` char(36) NOT NULL,
  `date` date NOT NULL,
  `total_cash` decimal(10,3) NOT NULL DEFAULT 0.000,
  `total_card` decimal(10,3) NOT NULL DEFAULT 0.000,
  `total_orders` int(11) NOT NULL DEFAULT 0,
  `total_revenue` decimal(10,3) NOT NULL DEFAULT 0.000,
  `notes` text DEFAULT NULL,
  `closed_by` char(36) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `service_closes`
--

INSERT INTO `service_closes` (`id`, `restaurant_id`, `date`, `total_cash`, `total_card`, `total_orders`, `total_revenue`, `notes`, `closed_by`, `created_at`) VALUES
('573c478e-903e-47c3-8993-1c60e920f86a', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '2026-06-09', '0.000', '0.000', 1, '0.000', 'Test cl�ture', '2fdb3f1b-9ac7-42ac-954d-fdf902f93a89', '2026-06-09 10:14:52'),
('b27afeb8-3dd8-4bbb-86ff-6956f9f461f5', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', '2026-06-09', '0.000', '0.000', 1, '0.000', NULL, '2fdb3f1b-9ac7-42ac-954d-fdf902f93a89', '2026-06-09 10:16:50');

-- --------------------------------------------------------

--
-- Structure de la table `subscriptions`
--

CREATE TABLE `subscriptions` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `restaurant_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `plan` enum('FREE','STARTER','PRO','PREMIUM') NOT NULL DEFAULT 'FREE',
  `billing_period` enum('MONTHLY','ANNUAL') DEFAULT 'MONTHLY',
  `status` enum('ACTIVE','TRIAL','EXPIRED','CANCELLED','SUSPENDED') DEFAULT 'TRIAL',
  `starts_at` date DEFAULT NULL,
  `ends_at` date DEFAULT NULL,
  `trial_ends_at` date DEFAULT NULL,
  `amount` decimal(10,3) DEFAULT 0.000,
  `currency` varchar(3) DEFAULT 'DT',
  `payment_ref` varchar(255) DEFAULT NULL,
  `admin_notes` text DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `subscriptions`
--

INSERT INTO `subscriptions` (`id`, `restaurant_id`, `plan`, `billing_period`, `status`, `starts_at`, `ends_at`, `trial_ends_at`, `amount`, `currency`, `payment_ref`, `admin_notes`, `created_at`, `updated_at`) VALUES
('59d392bc-f3b6-44d7-947f-3e39fc96c34e', 'f82bee2a-3f1b-4e8e-b489-a7851b1648f2', 'PREMIUM', 'MONTHLY', 'ACTIVE', '2026-06-13', '2026-07-13', NULL, '0.000', 'DT', '2', ' SSSSSSSSSSS', '2026-06-13 09:45:55', '2026-06-15 16:01:46'),
('889db9c6-894c-4e5a-8493-6743d4ff896c', '926f35f9-1a80-4272-a0e6-ea4dd37b2118', 'PRO', 'ANNUAL', 'ACTIVE', '2026-06-10', '2027-06-10', NULL, '0.000', 'DT', '', '', '2026-06-10 09:01:47', '2026-06-10 10:13:50'),
('ce7f8935-a85d-4aa0-8e12-b25a063fb07a', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', 'PREMIUM', 'MONTHLY', 'ACTIVE', '2026-06-07', '2026-07-07', NULL, '0.000', 'DT', '', '', '2026-06-08 00:18:42', '2026-06-15 17:47:59');

-- --------------------------------------------------------

--
-- Structure de la table `supplement_groups`
--

CREATE TABLE `supplement_groups` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `menu_item_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `name_fr` varchar(80) NOT NULL,
  `name_en` varchar(80) DEFAULT NULL,
  `name_it` varchar(80) DEFAULT NULL,
  `name_ar` varchar(80) DEFAULT NULL,
  `type` enum('radio','checkbox') DEFAULT 'radio',
  `min_select` tinyint(4) DEFAULT 0,
  `max_select` tinyint(4) DEFAULT 1,
  `is_required` tinyint(1) DEFAULT 0,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `supplement_groups`
--

INSERT INTO `supplement_groups` (`id`, `menu_item_id`, `name_fr`, `name_en`, `name_it`, `name_ar`, `type`, `min_select`, `max_select`, `is_required`, `created_at`, `updated_at`) VALUES
('cc1a7883-e89a-45b4-993b-19bb83c35254', 'f418a930-230c-469e-ab25-0afe3370f103', 'FRIT', '', '', '', 'radio', 0, 1, 0, '2026-06-11 23:14:59', '2026-06-11 23:14:59');

-- --------------------------------------------------------

--
-- Structure de la table `supplement_options`
--

CREATE TABLE `supplement_options` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `group_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `name_fr` varchar(80) NOT NULL,
  `name_en` varchar(80) DEFAULT NULL,
  `name_it` varchar(80) DEFAULT NULL,
  `name_ar` varchar(80) DEFAULT NULL,
  `extra_price` decimal(10,3) DEFAULT 0.000,
  `is_available` tinyint(1) DEFAULT 1,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `supplement_options`
--

INSERT INTO `supplement_options` (`id`, `group_id`, `name_fr`, `name_en`, `name_it`, `name_ar`, `extra_price`, `is_available`, `created_at`, `updated_at`) VALUES
('63e2a561-f047-451c-aec7-9f3152fb87e5', 'cc1a7883-e89a-45b4-993b-19bb83c35254', 'FRIT', '', '', '', '3.000', 1, '2026-06-11 23:15:09', '2026-06-11 23:15:09'),
('a51600f0-0044-4858-b390-6f48043bac85', 'cc1a7883-e89a-45b4-993b-19bb83c35254', 'FROMMAGE', '', '', '', '5.000', 1, '2026-06-11 23:16:58', '2026-06-11 23:16:58');

-- --------------------------------------------------------

--
-- Structure de la table `tables`
--

CREATE TABLE `tables` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `room_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `restaurant_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `number` tinyint(3) UNSIGNED DEFAULT NULL,
  `name` varchar(30) NOT NULL,
  `capacity` tinyint(3) UNSIGNED DEFAULT 2,
  `status` enum('LIBRE','OCCUPEE','RESERVEE','EN_ATTENTE','DESACTIVEE') DEFAULT 'LIBRE',
  `qr_token` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `qr_url` varchar(500) DEFAULT NULL,
  `position_x` int(11) DEFAULT 0,
  `position_y` int(11) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `tables`
--

INSERT INTO `tables` (`id`, `room_id`, `restaurant_id`, `number`, `name`, `capacity`, `status`, `qr_token`, `qr_url`, `position_x`, `position_y`, `is_active`, `created_at`, `updated_at`) VALUES
('0054bf66-4737-424a-b78b-5eb470037f30', '4605ad24-1b92-4680-b017-97f4eb2de5bd', 'f82bee2a-3f1b-4e8e-b489-a7851b1648f2', 2, 'Tab2', 2, 'LIBRE', 'fd1978fd-8313-4085-877e-7bd6eeed6ed2', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAgAAAAIACAYAAAD0eNT6AAAAAklEQVR4AewaftIAABbdSURBVO3BwbEkSa5lwZuQRwF24AD8UwMOsAMLOSnSi9p9txqx9oxoHNVfv/8QAABYxQQAANYxAQCAdUwAAGAdEwAAWMcEAADWMQEAgHVMAABgHRMAAFjHBAAA1jEBAIB1TAAAYB0TAABYxwQAANYxAQCAdUwAAGAdEwAAWMcEAADWMQEAgHVMAABgnR9d5pHCf0yXbvJIfaLp0ts8Up9quvSpPFK3TJdu8Ui9bbp0wiN1Yrr0xCN1Yrp0i0fqxHTpFo/UienSCY8U/mO6dIsJAACsYwIAAOuYAADAOiYAALCOCQAArGMCAADrmAAAwDomAACwzo/+gunSt/NIvW269Ik8UjdNl55Ml054pN7mkToxXXrbdOmJR+pTTZfeNl064ZG6xSN1Yrr0ZLp0wiP1zaZL38', 2, 2, 1, '2026-06-13 10:17:23', '2026-06-16 11:19:06'),
('04a22c64-b2bf-4367-89d5-dca6b4d4b9ce', '3820d0b7-0191-428a-bd39-8731968bb63c', 'f82bee2a-3f1b-4e8e-b489-a7851b1648f2', 3, '3', 2, 'LIBRE', 'a260b6b3-d3d4-4888-9216-ba7c18982da6', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAgAAAAIACAYAAAD0eNT6AAAAAklEQVR4AewaftIAABa7SURBVO3Bwa1kSYxlwZvEl4A7akD9paEG3FGFnARq0avB82p4v4woHrNfv/8QAABYxQQAANYxAQCAdUwAAGAdEwAAWMcEAADWMQEAgHVMAABgHRMAAFjHBAAA1jEBAIB1TAAAYB0TAABYxwQAANYxAQCAdUwAAGAdEwAAWMcEAADWMQEAgHVMAABgnR9d5pHCP6ZLN3mkPtF06W0eqU81XbrFI3ViunTCI/W26dITj9RN06VbPFInpktPPFInpku3eKROTJdu8UidmC6d8EjhH9OlW0wAAGAdEwAAWMcEAADWMQEAgHVMAABgHRMAAFjHBAAA1jEBAIB1fvQXTJe+nUfqFo/UienS2zxSTzxSN02XnkyXvp1H6sl06W3TpbdNl27ySD2ZLp2YLp3wSN3ikXqbR+', 4, 1, 1, '2026-06-15 12:01:08', '2026-06-16 11:16:33'),
('0fd96779-24cc-4ea0-82a7-1e53e3cab151', '05c0cbeb-ce3f-4943-a5cf-f601cd30d44d', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', 5, 'TAB5', 2, 'OCCUPEE', '0e38db58-65e3-4d71-be36-0e3486bdc0b3', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAgAAAAIACAYAAAD0eNT6AAAAAklEQVR4AewaftIAABbQSURBVO3Bwa0dW65l0SXiWsAePaD/1tAD9uiCSkAC//Uq9gN2hs5JzjF+/f5DAABgFRMAAFjHBAAA1jEBAIB1TAAAYB0TAABYxwQAANYxAQCAdUwAAGAdEwAAWMcEAADWMQEAgHVMAABgHRMAAFjHBAAA1jEBAIB1TAAAYB0TAABYxwQAANYxAQCAdX50mUcK/zFduskj9c2mS7d4pG6aLj3xSJ2YLp3wSD2ZLp3wSN0yXTrhkToxXXqbR+qW6dItHqmbpkufyCN1Yrp0wiOF/5gu3WICAADrmAAAwDomAACwjgkAAKxjAgAA65gAAMA6JgAAsI4JAACs86O/YLr07TxSn2i69DaP1KeaLp3wSN3ikToxXbplunSLR+pTeaROTJeeeKQ+1XTphEfqyXTphEfqm0', 5, 0, 1, '2026-06-08 16:50:04', '2026-06-16 14:59:27'),
('1a72ddd2-bd3d-4381-a958-e4ce759bd787', '05c0cbeb-ce3f-4943-a5cf-f601cd30d44d', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', 8, 'TAB8', 6, 'LIBRE', 'e950e36f-d4b2-4cc6-8de9-b38ca077300d', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAgAAAAIACAYAAAD0eNT6AAAAAklEQVR4AewaftIAABbTSURBVO3Bwa1kya5lwZ3ElYAzakD9paEGnFGF7AQe0DU8XoD/kxHFZfbr9x8CAACrmAAAwDomAACwjgkAAKxjAgAA65gAAMA6JgAAsI4JAACsYwIAAOuYAADAOiYAALCOCQAArGMCAADrmAAAwDomAACwjgkAAKxjAgAA65gAAMA6JgAAsI4JAACs86PLPFL4n+kS/uGRett06VN5pJ5Ml/APj9Snmi59Io/UienSLR6pE9OlEx4p/M906RYTAABYxwQAANYxAQCAdUwAAGAdEwAAWMcEAADWMQEAgHVMAABgnR/9BdOlb+eR+kQeqbdNl05Ml054pJ5Ml054pE5Ml554pE5MlzbwSL1tuvTNPFI3TZdu8Uh9s+nSt/NIvckEAADWMQEAgHVMAABgHRMAAFjHBA', 7, 1, 1, '2026-06-15 15:02:59', '2026-06-16 11:43:58'),
('1c0cf590-8cc8-4d71-97fc-058e478fe384', '4605ad24-1b92-4680-b017-97f4eb2de5bd', 'f82bee2a-3f1b-4e8e-b489-a7851b1648f2', 4, '4', 2, 'LIBRE', 'd96de35f-7ddf-4ba0-b9e1-220161a8de7a', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAgAAAAIACAYAAAD0eNT6AAAAAklEQVR4AewaftIAABcBSURBVO3Bwa1kSYxlwZvEl4A7akD9paEG3FGFnAQKmFw+rxnvVxHNY/br9x8CAACrmAAAwDomAACwjgkAAKxjAgAA65gAAMA6JgAAsI4JAACsYwIAAOuYAADAOiYAALCOCQAArGMCAADrmAAAwDomAACwjgkAAKxjAgAA65gAAMA6JgAAsI4JAACs86PLPFL4x3TphEfqlunSTR6pt02X3uaRejJdOuGROjFdeuKROjFdOuGR+kTTpRMeqVumSyc8UiemS7d4pE5Mlz6RR+rEdOmERwr/mC7dYgIAAOuYAADAOiYAALCOCQAArGMCAADrmAAAwDomAACwjgkAAKzzo//AdOnbeaQ2mC498UidmC6d8Eg9mS59qunSCY/Uk+kS/pounfBIPfFIvc0j9TaP1AbTpW', 5, 0, 1, '2026-06-15 15:54:45', '2026-06-16 11:09:59'),
('2a938c85-ab12-4cde-a1bf-a1f8c30c981b', '5719460e-9101-4cb8-a4a1-f48f6938852e', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', 1, 'TAB1', 2, 'LIBRE', '5118fa5d-62a5-4b5b-93b2-27b5f709e22f', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAgAAAAIACAYAAAD0eNT6AAAAAklEQVR4AewaftIAABdOSURBVO3Bwa0kyY5FwVvEk4A7akD9paEG3FGFmgL+opfhPXBEZTaP2a/ffwgAAKxiAgAA65gAAMA6JgAAsI4JAACsYwIAAOuYAADAOiYAALCOCQAArGMCAADrmAAAwDomAACwjgkAAKxjAgAA65gAAMA6JgAAsI4JAACsYwIAAOuYAADAOiYAALDOjy7zSOF/pks3eaS+2XTpFo/UTdOlJx6pE9OlWzxSN02XbvFInZguPfFI3TRdeuKRumm69MQjddN06RN5pE5Ml054pPA/06VbTAAAYB0TAABYxwQAANYxAQCAdUwAAGAdEwAAWMcEAADWMQEAgHV+9BdMl76dR+oWj9Qt06WbPFK3eKROTJdumS7dMl26ySN1y3TpFo/UTR6pW6ZLJzxST6ZLJzxSb5su3e', 1, 2, 1, '2026-06-08 16:34:42', '2026-06-16 13:45:15'),
('2b0e8abc-6b23-477d-b23c-ac9fe8133978', '66927dbd-60f1-4110-b9ed-834a59c56bee', '926f35f9-1a80-4272-a0e6-ea4dd37b2118', 2, '2', 4, 'LIBRE', 'e23e812d-5533-4813-bb0d-9098b8b9e398', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAgAAAAIACAYAAAD0eNT6AAAAAklEQVR4AewaftIAABcHSURBVO3BsbFkSY5FwVuwLwE4aAD9pYEG4KBCbZk1MbbUi96NeZ3ZOO6/fv8hAACwigkAAKxjAgAA65gAAMA6JgAAsI4JAACsYwIAAOuYAADAOiYAALCOCQAArGMCAADrmAAAwDomAACwjgkAAKxjAgAA65gAAMA6JgAAsI4JAACsYwIAAOuYAADAOj+6zCOFv0yXTnikPtV06RaP1KeaLn0ij9TbpksnPFInpkufyCN1Yrr0qTxST6ZLb/NInZgunfBI4S/TpVtMAABgHRMAAFjHBAAA1jEBAIB1TAAAYB0TAABYxwQAANYxAQCAdX70D5gufTuP1CeaLr3NI/W26dIJj9QtHqkT06UTHqkn06W3eaROTJdOeKSeTJdOeKROTJfe5pG6Zbp0i0dqg+nSt/NIvc', 0, 2, 1, '2026-06-16 09:59:52', '2026-06-16 09:59:57'),
('3c703bd5-c45a-4208-a47c-93ad10fdfbc2', '5719460e-9101-4cb8-a4a1-f48f6938852e', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', 3, 'Tab3', 2, 'LIBRE', 'a7b457a3-1831-4a1a-a9fc-c9e6da49b3ef', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAgAAAAIACAYAAAD0eNT6AAAAAklEQVR4AewaftIAABaaSURBVO3BsbFkSY5FwVuwLwE4aAD9pYEG4KBCbZk1MeSLXot5lTk47r9+/yEAALCKCQAArGMCAADrmAAAwDomAACwjgkAAKxjAgAA65gAAMA6JgAAsI4JAACsYwIAAOuYAADAOiYAALCOCQAArGMCAADrmAAAwDomAACwjgkAAKxjAgAA65gAAMA6P7rMI4V/TJdOeKROTJe+mUfqbdOlT+WRejJd+nYeqSfTpRMeqRPTpSceqRPTpW/mkToxXbrFI3ViunTCI4V/TJduMQEAgHVMAABgHRMAAFjHBAAA1jEBAIB1TAAAYB0TAABYxwQAANb50V8wXfp2Hqm3eaSeTJfe5pG6abr0iTxSN02X3uaRumW6dGK6dMt06YRH6m0eqVumSyc8Urd4pL7ZdOnbeaTeZA', 1, 0, 1, '2026-06-08 17:07:31', '2026-06-16 13:48:02'),
('41bf6831-47fd-4c89-b622-cdb29415e534', 'e633c8bc-85ec-4e02-aa29-023e89cd61fd', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', 7, 'tab7', 2, 'LIBRE', '65d4cac6-6744-4d53-99e2-40c661915d05', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAgAAAAIACAYAAAD0eNT6AAAAAklEQVR4AewaftIAABbpSURBVO3BwY0ox65twS2iLeCMHtB/a+gBZ3RBX4AGf1gpIF+d6ssV8dff/xAAAFjFBAAA1jEBAIB1TAAAYB0TAABYxwQAANYxAQCAdUwAAGAdEwAAWMcEAADWMQEAgHVMAABgHRMAAFjHBAAA1jEBAIB1TAAAYB0TAABYxwQAANYxAQCAdUwAAGCdH13mkcK/pksnPFInpktPPFInpksnPFJPpks3eaRumS79Zh6pE9OlEx6pJ9OlEx6pE9Olt3mknkyXbvJI3TJdusUjdWK6dItH6sR06YRHCv+aLt1iAgAA65gAAMA6JgAAsI4JAACsYwIAAOuYAADAOiYAALCOCQAArPOjP2C69Nt5pN7mkXoyXTrhkbrFI/W26dJv55F623TpiUfqxHTphEfqyXTpbR6pt0', 5, 2, 1, '2026-06-09 11:24:53', '2026-06-16 14:58:18'),
('66be200a-8fff-4842-8833-8aa9eb071fbf', '66927dbd-60f1-4110-b9ed-834a59c56bee', '926f35f9-1a80-4272-a0e6-ea4dd37b2118', 1, '1', 2, 'LIBRE', '508eb6be-4ff1-4296-8018-dcaee0422d1f', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAgAAAAIACAYAAAD0eNT6AAAAAklEQVR4AewaftIAABckSURBVO3Bwa0kyY5FwVvEk4A7akD9paEG3FGFmgJ68ZfhBfhEZzaP2a/ffwgAAKxiAgAA65gAAMA6JgAAsI4JAACsYwIAAOuYAADAOiYAALCOCQAArGMCAADrmAAAwDomAACwjgkAAKxjAgAA65gAAMA6JgAAsI4JAACsYwIAAOuYAADAOiYAALDOjy7zSOEf06UTHqlPNV26xSP1qaZL38wjdct06YRH6sR06YlH6ttNl97mkXoyXXqbR+rEdOmERwr/mC7dYgIAAOuYAADAOiYAALCOCQAArGMCAADrmAAAwDomAACwjgkAAKzzo3/BdOnbeaQ+0XTpU02XTniknkyXbvJI3TJdusUjdWK6dMIj9TaP1CeaLt3kkbplunSLR2qD6dK380i9yQQAANYxAQCAdU', 0, 0, 1, '2026-06-16 09:59:35', '2026-06-16 09:59:36'),
('a794d1b3-5591-49dd-b7b8-bd7141ddceec', 'e633c8bc-85ec-4e02-aa29-023e89cd61fd', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', 2, '2', 2, 'LIBRE', '5814f808-0ee9-4f58-9523-1befdbd93394', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAgAAAAIACAYAAAD0eNT6AAAAAklEQVR4AewaftIAABbhSURBVO3Bwa1lx65l0ZXEtYA9ekD/raEH7NGFrATUEH5rhwrxts4R5xi/fv8hAACwigkAAKxjAgAA65gAAMA6JgAAsI4JAACsYwIAAOuYAADAOiYAALCOCQAArGMCAADrmAAAwDomAACwjgkAAKxjAgAA65gAAMA6JgAAsI4JAACsYwIAAOuYAADAOj+6zCOFv0yXbvJIfbPp0i0eqZumS088UiemSyc8Uk+mSyc8UiemS7d4pDaYLt3ikbppuvSJPFInpksnPFL4y3TpFhMAAFjHBAAA1jEBAIB1TAAAYB0TAABYxwQAANYxAQCAdUwAAGCdH/0LpkvfziP1zaZLt3ik8DeP1Inp0hOP1Inp0tumS5/KI/XNpksnPFJPpksnPFLfbLr07TxSbzIBAIB1TAAAYB', 3, 0, 1, '2026-06-08 16:44:28', '2026-06-16 14:32:21'),
('bd5f3f89-8414-4509-b151-ffd2027cbc6b', '5719460e-9101-4cb8-a4a1-f48f6938852e', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', 6, 'tab6', 2, 'LIBRE', '6c6cec37-9262-478e-8bbd-e3245d4e0344', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAgAAAAIACAYAAAD0eNT6AAAAAklEQVR4AewaftIAABbSSURBVO3BwY0Ax65lwSuiLeCOHtB/a+gBd3RBI+AttPuVAnJK1eKJ+OPPvwgAAKxiAgAA65gAAMA6JgAAsI4JAACsYwIAAOuYAADAOiYAALCOCQAArGMCAADrmAAAwDomAACwjgkAAKxjAgAA65gAAMA6JgAAsI4JAACsYwIAAOuYAADAOiYAALDOjy7zSOF/pks3eaR+s+nSLR6pm6ZLTzxSJ6ZLJzxSt0yXTnikbpku3eKROjFdOuGRett06YlH6qbp0hd5pE5Ml054pPA/06VbTAAAYB0TAABYxwQAANYxAQCAdUwAAGAdEwAAWMcEAADWMQEAgHV+9C+YLv12Hqkvmi7hn/NI3eKROjFdeuKRumm69DaP1C0eqRPTpd9sunTCI/VkunTCI/WbTZd+O4/Um0', 3, 2, 1, '2026-06-09 11:15:45', '2026-06-12 14:34:27'),
('d3e9cef7-894b-4f24-abfb-a6ab674aed9b', '5719460e-9101-4cb8-a4a1-f48f6938852e', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', 4, 'Tab4', 4, 'LIBRE', '8e68e7fe-0ca3-41a6-8a0c-d2d53d0f4e77', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAgAAAAIACAYAAAD0eNT6AAAAAklEQVR4AewaftIAABbiSURBVO3Bwa0kyY5FwVvEk4A7akD9paEG3FGFmgJ6McvwD3hHZTaP2a/ffwgAAKxiAgAA65gAAMA6JgAAsI4JAACsYwIAAOuYAADAOiYAALCOCQAArGMCAADrmAAAwDomAACwjgkAAKxjAgAA65gAAMA6JgAAsI4JAACsYwIAAOuYAADAOiYAALDOjy7zSOEf06UTHqkT06UnHqkT06UTHqkn06WbPFK3TJe+mUfqxHTpFo/UienSp/JIPZku3eSRumW6dItH6sR06RaP1Inp0gmPFP4xXbrFBAAA1jEBAIB1TAAAYB0TAABYxwQAANYxAQCAdUwAAGAdEwAAWOdHf8F06dt5pN7mkXoyXTrhkfpm06UTHqkT06W3eaTwD4/UienSienSE4/U26ZLJzxSJ6ZLt3', 0, 1, 1, '2026-06-08 17:40:11', '2026-06-16 14:55:16'),
('f30d9ac6-5108-47e6-b8c5-f4c3f5a0d7c6', '4605ad24-1b92-4680-b017-97f4eb2de5bd', 'f82bee2a-3f1b-4e8e-b489-a7851b1648f2', 1, 'Tab1', 2, 'LIBRE', 'f5d4f059-4be6-449c-95b3-0800755338a3', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAgAAAAIACAYAAAD0eNT6AAAAAklEQVR4AewaftIAABa6SURBVO3Bwa0dW65l0SXiWsAePaD/1tAD9uiCSsAD6uG3YiewM3ROco7x6/cfAgAAq5gAAMA6JgAAsI4JAACsYwIAAOuYAADAOiYAALCOCQAArGMCAADrmAAAwDomAACwjgkAAKxjAgAA65gAAMA6JgAAsI4JAACsYwIAAOuYAADAOiYAALCOCQAArPOjyzxS+Md06YRH6ptNl97mkfpU06UTHqkn06WbPFJPpksnPFInpktPPFJvmy6d8EidmC498UidmC7d4pE6MV26xSN1Yrp0wiOFf0yXbjEBAIB1TAAAYB0TAABYxwQAANYxAQCAdUwAAGAdEwAAWMcEAADW+dFfMF36dh6pW6ZLt3ikTkyXvtl06YRH6pbp0ts8UiemSyemS088UiemSyc8Uk+mSyc8Um', 0, 0, 1, '2026-06-13 10:01:02', '2026-06-16 12:54:48');

-- --------------------------------------------------------

--
-- Structure de la table `users`
--

CREATE TABLE `users` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `username` varchar(30) NOT NULL,
  `email` varchar(191) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `name` varchar(100) NOT NULL,
  `phone` varchar(30) DEFAULT NULL,
  `role` enum('SUPER_ADMIN','OWNER','MANAGER','STAFF','CASHIER') NOT NULL,
  `restaurant_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `is_first_login` tinyint(1) DEFAULT 1,
  `language` enum('fr','en','it','ar') DEFAULT 'fr',
  `two_fa_secret` varchar(255) DEFAULT NULL,
  `two_fa_enabled` tinyint(1) DEFAULT 0,
  `created_by` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `login_attempts` int(11) DEFAULT 0,
  `locked_until` datetime DEFAULT NULL,
  `last_login_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `users`
--

INSERT INTO `users` (`id`, `username`, `email`, `password_hash`, `name`, `phone`, `role`, `restaurant_id`, `is_active`, `is_first_login`, `language`, `two_fa_secret`, `two_fa_enabled`, `created_by`, `login_attempts`, `locked_until`, `last_login_at`, `created_at`, `updated_at`) VALUES
('15028a04-e0d9-4fde-9025-8382e4916c54', 'pavaroti_rest', 'pavaroti@gmail.com', '$2a$12$oMWpaHaZgDHMQXgZroHyHeNcbgq9z/Vvuac9XIcPNwBE.L4MPJrq2', 'pavaroti', '', 'OWNER', NULL, 0, 1, 'fr', NULL, 0, '1c0a26db-a757-4f74-9645-920faa7f522c', 0, NULL, NULL, '2026-06-07 23:07:21', '2026-06-08 23:27:58'),
('1c0a26db-a757-4f74-9645-920faa7f522c', 'superadmin', 'hannibaladvanced@gmail.com', '$2a$12$pNPohaGVwDPvJxRoXgbKxepvzmnNmnh2vXmyy016r4j2TQ4ZnnyXq', 'Super Admin', NULL, 'SUPER_ADMIN', NULL, 1, 0, 'fr', NULL, 0, NULL, 0, NULL, '2026-06-16 15:37:54', '2026-06-07 19:46:46', '2026-06-16 15:37:54'),
('2864c7aa-63e1-4178-a14b-a170f43ced5f', 'delcapo_resto', 'delcapo1@gmail.com', '$2a$12$91.mBu5OjmhZZ5P41lW96Ots0rs9uy3vWjNgfDpF7B53XP.nMM6ci', 'delcapo restaurant', '+216 24 355 789', 'OWNER', '926f35f9-1a80-4272-a0e6-ea4dd37b2118', 1, 0, 'fr', NULL, 0, '1c0a26db-a757-4f74-9645-920faa7f522c', 0, NULL, '2026-06-16 09:57:54', '2026-06-10 09:01:46', '2026-06-16 09:57:54'),
('2fdb3f1b-9ac7-42ac-954d-fdf902f93a89', 'demo_restaurants', 'demoresto@gmail.com', '$2a$12$7XKIUdcsIZynlgJaurhUFuMyd91iG.kbMSNs8nSlmfiwvuM12VIKS', 'demo restaurant', '+216 23 789 543', 'OWNER', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', 1, 0, 'fr', NULL, 0, '1c0a26db-a757-4f74-9645-920faa7f522c', 0, NULL, '2026-06-16 13:48:41', '2026-06-08 00:18:42', '2026-06-16 13:48:41'),
('4f1c5a80-eecc-4bee-af97-b89e3103b88f', 'serv', 'serveur11@gmail.com', '$2a$12$aMBrvkCf55oYsvo2GvbEuO0yXMZofMSUJs/R6j99twpRjdYZ7/o9C', 'SERVEUR1', NULL, 'CASHIER', 'f82bee2a-3f1b-4e8e-b489-a7851b1648f2', 1, 0, 'fr', NULL, 0, 'bdf11593-ff2d-4f13-81ac-8c6cd8d1131d', 0, NULL, '2026-06-16 10:05:32', '2026-06-15 11:53:09', '2026-06-16 10:05:32'),
('5a9e109d-0aef-4001-884c-e06e059b6ab6', 'delcapo_restaurant', 'delcapo@gmail.com', '$2a$12$wN.aVrrhrfl.8jO8BkwowuoJAgCQ317it0qs2R6ui2EpU2gj4vOFy', 'delcapo restaurant', '+216 23 345 780', 'OWNER', NULL, 0, 1, 'fr', NULL, 0, '1c0a26db-a757-4f74-9645-920faa7f522c', 2, NULL, '2026-06-08 00:24:18', '2026-06-07 22:58:40', '2026-06-08 23:28:27'),
('6b6f2d26-778b-4429-abf1-188596a12906', 'owner_testbistro', 'owner@testbistro.tn', '$2a$12$kVV48Q7CLTkfBA1NgSP53ep0BNyXhBu.iV4I0V4vRMRTVwK0StEVO', 'Ahmed Ben Ali', NULL, 'OWNER', NULL, 0, 1, 'fr', NULL, 0, '1c0a26db-a757-4f74-9645-920faa7f522c', 0, NULL, NULL, '2026-06-07 23:00:28', '2026-06-08 00:13:25'),
('9cd55930-833f-420c-af71-c9ea7fc6eb92', 'demo', 'manger@gmail.com', '$2a$12$lMN1O09lOubmVeezFJb2/eQqdeMToXfUwTcQ4OkgpqhgD2Z7RhTWG', 'manager', NULL, 'MANAGER', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', 1, 0, 'fr', NULL, 0, '2fdb3f1b-9ac7-42ac-954d-fdf902f93a89', 0, NULL, '2026-06-15 22:24:55', '2026-06-15 15:11:13', '2026-06-15 22:24:55'),
('a9f6ddb4-c1f7-4ae6-ae1b-f7963e79ce98', '', '', '$2a$12$3N/h.PBqfn3kEQxc0.gtxucJ6ot9KoatWturKu9r02J.pYjuiCuoC', '', '', 'OWNER', NULL, 0, 1, 'fr', NULL, 0, '1c0a26db-a757-4f74-9645-920faa7f522c', 0, NULL, NULL, '2026-06-07 22:44:23', '2026-06-08 23:28:42'),
('bdf11593-ff2d-4f13-81ac-8c6cd8d1131d', 'Pavarotti_Restaurant', 'Pavarotti@gmail.com', '$2a$12$vez/f8pTt29ClD/iNAd7MeSJtX5ITwr6.MNYHD3J.EFcGfRB7ZGz6', 'Pavarotti Restaurant', '+216 58 799 209', 'OWNER', 'f82bee2a-3f1b-4e8e-b489-a7851b1648f2', 1, 0, 'fr', NULL, 0, '1c0a26db-a757-4f74-9645-920faa7f522c', 0, NULL, '2026-06-16 09:22:11', '2026-06-13 09:45:55', '2026-06-16 09:22:11'),
('c6a3e0df-2e20-4f3e-9df0-af50f4e6334f', 'salle', 'serveur1@gmail.com', '$2a$12$fPDiKovJIHr1.tRPQ7azRuRcTGHSMZGc4aFiUOGncJdB35sX0Boi6', 'serveur1', NULL, 'STAFF', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', 1, 0, 'fr', NULL, 0, '2fdb3f1b-9ac7-42ac-954d-fdf902f93a89', 3, NULL, '2026-06-16 15:13:45', '2026-06-08 17:45:05', '2026-06-16 15:13:45'),
('d496387b-d985-41f0-aeba-70d74b655795', 'caissier', 'ahmed@gmail.com', '$2a$12$3Hgcd.vd2LGoAIEIVv01sOtVPRBfpDW9UBNWcJ9YMktLTUsT70eK2', 'ahmed', NULL, 'CASHIER', 'ef453e3b-33d5-43ac-91d2-9ec86b927035', 1, 0, 'fr', NULL, 0, '2fdb3f1b-9ac7-42ac-954d-fdf902f93a89', 0, NULL, '2026-06-16 15:13:27', '2026-06-16 12:09:30', '2026-06-16 15:13:27'),
('d9fc8754-ca76-4aa1-b0a8-b08f7f36b7fa', 'owner_sami', 'sami@bistrotunis.tn', '$2a$12$z2w9g9X2UxTHbG3jqOFE1u4bkqPj47HJtHk0u0hEdMEYWO0GwT1yu', 'Sami Mansouri', NULL, 'OWNER', NULL, 0, 1, 'fr', NULL, 0, '1c0a26db-a757-4f74-9645-920faa7f522c', 0, NULL, '2026-06-08 00:00:55', '2026-06-07 23:02:55', '2026-06-08 23:28:03'),
('f6414970-145e-4b46-8e00-c04d60d3c054', 'demo_restaurant', 'demo@gmail.com', '$2a$12$wnrX3AZ10UB/JFUbe2njFugvSpbx0Uyt3yJ6qOkkJ.DjBZpnXK54y', 'demo restaurant', '+216 24 567 789', 'OWNER', NULL, 1, 1, 'en', NULL, 0, '1c0a26db-a757-4f74-9645-920faa7f522c', 0, NULL, NULL, '2026-06-07 23:19:25', '2026-06-10 10:04:25');

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `admin_logs`
--
ALTER TABLE `admin_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `admin_id` (`admin_id`);

--
-- Index pour la table `call_waiters`
--
ALTER TABLE `call_waiters`
  ADD PRIMARY KEY (`id`),
  ADD KEY `table_id` (`table_id`);

--
-- Index pour la table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD KEY `menu_id` (`menu_id`);

--
-- Index pour la table `invoices`
--
ALTER TABLE `invoices`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `invoice_number` (`invoice_number`);

--
-- Index pour la table `menus`
--
ALTER TABLE `menus`
  ADD PRIMARY KEY (`id`),
  ADD KEY `restaurant_id` (`restaurant_id`);

--
-- Index pour la table `menu_items`
--
ALTER TABLE `menu_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `category_id` (`category_id`);

--
-- Index pour la table `menu_item_variants`
--
ALTER TABLE `menu_item_variants`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_miv_item` (`menu_item_id`);

--
-- Index pour la table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `notification_settings`
--
ALTER TABLE `notification_settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `restaurant_id` (`restaurant_id`);

--
-- Index pour la table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `restaurant_id` (`restaurant_id`),
  ADD KEY `table_id` (`table_id`);

--
-- Index pour la table `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_id` (`order_id`),
  ADD KEY `menu_item_id` (`menu_item_id`);

--
-- Index pour la table `order_item_supplements`
--
ALTER TABLE `order_item_supplements`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_item_id` (`order_item_id`);

--
-- Index pour la table `order_status_logs`
--
ALTER TABLE `order_status_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_id` (`order_id`),
  ADD KEY `changed_by` (`changed_by`);

--
-- Index pour la table `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_payments_order_id` (`order_id`),
  ADD KEY `idx_payments_processed_by` (`processed_by`);

--
-- Index pour la table `plans`
--
ALTER TABLE `plans`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Index pour la table `qr_scans`
--
ALTER TABLE `qr_scans`
  ADD PRIMARY KEY (`id`),
  ADD KEY `table_id` (`table_id`);

--
-- Index pour la table `reservations`
--
ALTER TABLE `reservations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `cancel_token` (`cancel_token`),
  ADD KEY `restaurant_id` (`restaurant_id`);

--
-- Index pour la table `reservation_settings`
--
ALTER TABLE `reservation_settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `restaurant_id` (`restaurant_id`);

--
-- Index pour la table `restaurants`
--
ALTER TABLE `restaurants`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`),
  ADD UNIQUE KEY `slug_2` (`slug`),
  ADD UNIQUE KEY `slug_3` (`slug`),
  ADD UNIQUE KEY `slug_4` (`slug`),
  ADD UNIQUE KEY `slug_5` (`slug`),
  ADD UNIQUE KEY `slug_6` (`slug`),
  ADD UNIQUE KEY `slug_7` (`slug`),
  ADD UNIQUE KEY `slug_8` (`slug`),
  ADD UNIQUE KEY `slug_9` (`slug`),
  ADD UNIQUE KEY `slug_10` (`slug`),
  ADD UNIQUE KEY `slug_11` (`slug`),
  ADD UNIQUE KEY `slug_12` (`slug`),
  ADD UNIQUE KEY `slug_13` (`slug`),
  ADD UNIQUE KEY `slug_14` (`slug`),
  ADD UNIQUE KEY `slug_15` (`slug`),
  ADD UNIQUE KEY `slug_16` (`slug`),
  ADD UNIQUE KEY `slug_17` (`slug`),
  ADD UNIQUE KEY `slug_18` (`slug`),
  ADD UNIQUE KEY `slug_19` (`slug`),
  ADD UNIQUE KEY `slug_20` (`slug`),
  ADD UNIQUE KEY `slug_21` (`slug`),
  ADD UNIQUE KEY `slug_22` (`slug`),
  ADD UNIQUE KEY `slug_23` (`slug`),
  ADD UNIQUE KEY `slug_24` (`slug`),
  ADD UNIQUE KEY `slug_25` (`slug`),
  ADD UNIQUE KEY `slug_26` (`slug`),
  ADD UNIQUE KEY `slug_27` (`slug`),
  ADD UNIQUE KEY `slug_28` (`slug`),
  ADD UNIQUE KEY `slug_29` (`slug`),
  ADD UNIQUE KEY `slug_30` (`slug`),
  ADD UNIQUE KEY `slug_31` (`slug`),
  ADD UNIQUE KEY `slug_32` (`slug`),
  ADD UNIQUE KEY `slug_33` (`slug`),
  ADD UNIQUE KEY `slug_34` (`slug`),
  ADD UNIQUE KEY `slug_35` (`slug`),
  ADD UNIQUE KEY `slug_36` (`slug`),
  ADD UNIQUE KEY `slug_37` (`slug`),
  ADD UNIQUE KEY `slug_38` (`slug`),
  ADD UNIQUE KEY `slug_39` (`slug`),
  ADD UNIQUE KEY `slug_40` (`slug`),
  ADD UNIQUE KEY `slug_41` (`slug`),
  ADD UNIQUE KEY `slug_42` (`slug`),
  ADD UNIQUE KEY `slug_43` (`slug`),
  ADD UNIQUE KEY `slug_44` (`slug`),
  ADD UNIQUE KEY `slug_45` (`slug`),
  ADD UNIQUE KEY `slug_46` (`slug`),
  ADD UNIQUE KEY `slug_47` (`slug`),
  ADD UNIQUE KEY `slug_48` (`slug`),
  ADD UNIQUE KEY `slug_49` (`slug`),
  ADD UNIQUE KEY `slug_50` (`slug`),
  ADD UNIQUE KEY `slug_51` (`slug`),
  ADD UNIQUE KEY `slug_52` (`slug`),
  ADD UNIQUE KEY `slug_53` (`slug`),
  ADD UNIQUE KEY `slug_54` (`slug`),
  ADD UNIQUE KEY `slug_55` (`slug`),
  ADD UNIQUE KEY `slug_56` (`slug`),
  ADD UNIQUE KEY `slug_57` (`slug`),
  ADD UNIQUE KEY `slug_58` (`slug`),
  ADD UNIQUE KEY `slug_59` (`slug`),
  ADD UNIQUE KEY `slug_60` (`slug`),
  ADD UNIQUE KEY `slug_61` (`slug`),
  ADD UNIQUE KEY `slug_62` (`slug`),
  ADD KEY `owner_id` (`owner_id`);

--
-- Index pour la table `restaurant_horaires`
--
ALTER TABLE `restaurant_horaires`
  ADD PRIMARY KEY (`id`),
  ADD KEY `restaurant_id` (`restaurant_id`);

--
-- Index pour la table `rooms`
--
ALTER TABLE `rooms`
  ADD PRIMARY KEY (`id`),
  ADD KEY `restaurant_id` (`restaurant_id`);

--
-- Index pour la table `service_closes`
--
ALTER TABLE `service_closes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_service_closes_restaurant` (`restaurant_id`);

--
-- Index pour la table `subscriptions`
--
ALTER TABLE `subscriptions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `restaurant_id` (`restaurant_id`);

--
-- Index pour la table `supplement_groups`
--
ALTER TABLE `supplement_groups`
  ADD PRIMARY KEY (`id`),
  ADD KEY `menu_item_id` (`menu_item_id`);

--
-- Index pour la table `supplement_options`
--
ALTER TABLE `supplement_options`
  ADD PRIMARY KEY (`id`),
  ADD KEY `group_id` (`group_id`);

--
-- Index pour la table `tables`
--
ALTER TABLE `tables`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `qr_token` (`qr_token`),
  ADD UNIQUE KEY `qr_token_2` (`qr_token`),
  ADD UNIQUE KEY `qr_token_3` (`qr_token`),
  ADD UNIQUE KEY `qr_token_4` (`qr_token`),
  ADD UNIQUE KEY `qr_token_5` (`qr_token`),
  ADD UNIQUE KEY `qr_token_6` (`qr_token`),
  ADD UNIQUE KEY `qr_token_7` (`qr_token`),
  ADD UNIQUE KEY `qr_token_8` (`qr_token`),
  ADD UNIQUE KEY `qr_token_9` (`qr_token`),
  ADD UNIQUE KEY `qr_token_10` (`qr_token`),
  ADD UNIQUE KEY `qr_token_11` (`qr_token`),
  ADD UNIQUE KEY `qr_token_12` (`qr_token`),
  ADD UNIQUE KEY `qr_token_13` (`qr_token`),
  ADD UNIQUE KEY `qr_token_14` (`qr_token`),
  ADD UNIQUE KEY `qr_token_15` (`qr_token`),
  ADD UNIQUE KEY `qr_token_16` (`qr_token`),
  ADD UNIQUE KEY `qr_token_17` (`qr_token`),
  ADD UNIQUE KEY `qr_token_18` (`qr_token`),
  ADD UNIQUE KEY `qr_token_19` (`qr_token`),
  ADD UNIQUE KEY `qr_token_20` (`qr_token`),
  ADD UNIQUE KEY `qr_token_21` (`qr_token`),
  ADD UNIQUE KEY `qr_token_22` (`qr_token`),
  ADD UNIQUE KEY `qr_token_23` (`qr_token`),
  ADD UNIQUE KEY `qr_token_24` (`qr_token`),
  ADD UNIQUE KEY `qr_token_25` (`qr_token`),
  ADD UNIQUE KEY `qr_token_26` (`qr_token`),
  ADD UNIQUE KEY `qr_token_27` (`qr_token`),
  ADD UNIQUE KEY `qr_token_28` (`qr_token`),
  ADD UNIQUE KEY `qr_token_29` (`qr_token`),
  ADD UNIQUE KEY `qr_token_30` (`qr_token`),
  ADD UNIQUE KEY `qr_token_31` (`qr_token`),
  ADD UNIQUE KEY `qr_token_32` (`qr_token`),
  ADD UNIQUE KEY `qr_token_33` (`qr_token`),
  ADD UNIQUE KEY `qr_token_34` (`qr_token`),
  ADD UNIQUE KEY `qr_token_35` (`qr_token`),
  ADD UNIQUE KEY `qr_token_36` (`qr_token`),
  ADD UNIQUE KEY `qr_token_37` (`qr_token`),
  ADD UNIQUE KEY `qr_token_38` (`qr_token`),
  ADD UNIQUE KEY `qr_token_39` (`qr_token`),
  ADD UNIQUE KEY `qr_token_40` (`qr_token`),
  ADD UNIQUE KEY `qr_token_41` (`qr_token`),
  ADD UNIQUE KEY `qr_token_42` (`qr_token`),
  ADD UNIQUE KEY `qr_token_43` (`qr_token`),
  ADD UNIQUE KEY `qr_token_44` (`qr_token`),
  ADD UNIQUE KEY `qr_token_45` (`qr_token`),
  ADD UNIQUE KEY `qr_token_46` (`qr_token`),
  ADD KEY `room_id` (`room_id`),
  ADD KEY `restaurant_id` (`restaurant_id`);

--
-- Index pour la table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `restaurant_id` (`restaurant_id`);

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `admin_logs`
--
ALTER TABLE `admin_logs`
  ADD CONSTRAINT `admin_logs_ibfk_1` FOREIGN KEY (`admin_id`) REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- Contraintes pour la table `call_waiters`
--
ALTER TABLE `call_waiters`
  ADD CONSTRAINT `call_waiters_ibfk_1` FOREIGN KEY (`table_id`) REFERENCES `tables` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Contraintes pour la table `categories`
--
ALTER TABLE `categories`
  ADD CONSTRAINT `categories_ibfk_1` FOREIGN KEY (`menu_id`) REFERENCES `menus` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Contraintes pour la table `menus`
--
ALTER TABLE `menus`
  ADD CONSTRAINT `menus_ibfk_1` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Contraintes pour la table `menu_items`
--
ALTER TABLE `menu_items`
  ADD CONSTRAINT `menu_items_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Contraintes pour la table `menu_item_variants`
--
ALTER TABLE `menu_item_variants`
  ADD CONSTRAINT `fk_miv_item` FOREIGN KEY (`menu_item_id`) REFERENCES `menu_items` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_ibfk_89` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `orders_ibfk_90` FOREIGN KEY (`table_id`) REFERENCES `tables` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Contraintes pour la table `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_ibfk_89` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `order_items_ibfk_90` FOREIGN KEY (`menu_item_id`) REFERENCES `menu_items` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Contraintes pour la table `order_item_supplements`
--
ALTER TABLE `order_item_supplements`
  ADD CONSTRAINT `order_item_supplements_ibfk_1` FOREIGN KEY (`order_item_id`) REFERENCES `order_items` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Contraintes pour la table `order_status_logs`
--
ALTER TABLE `order_status_logs`
  ADD CONSTRAINT `order_status_logs_ibfk_59` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `order_status_logs_ibfk_60` FOREIGN KEY (`changed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Contraintes pour la table `qr_scans`
--
ALTER TABLE `qr_scans`
  ADD CONSTRAINT `qr_scans_ibfk_1` FOREIGN KEY (`table_id`) REFERENCES `tables` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Contraintes pour la table `reservations`
--
ALTER TABLE `reservations`
  ADD CONSTRAINT `reservations_ibfk_1` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Contraintes pour la table `restaurants`
--
ALTER TABLE `restaurants`
  ADD CONSTRAINT `restaurants_ibfk_1` FOREIGN KEY (`owner_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Contraintes pour la table `restaurant_horaires`
--
ALTER TABLE `restaurant_horaires`
  ADD CONSTRAINT `restaurant_horaires_ibfk_1` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Contraintes pour la table `rooms`
--
ALTER TABLE `rooms`
  ADD CONSTRAINT `rooms_ibfk_1` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Contraintes pour la table `subscriptions`
--
ALTER TABLE `subscriptions`
  ADD CONSTRAINT `subscriptions_ibfk_1` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Contraintes pour la table `supplement_groups`
--
ALTER TABLE `supplement_groups`
  ADD CONSTRAINT `supplement_groups_ibfk_1` FOREIGN KEY (`menu_item_id`) REFERENCES `menu_items` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Contraintes pour la table `supplement_options`
--
ALTER TABLE `supplement_options`
  ADD CONSTRAINT `supplement_options_ibfk_1` FOREIGN KEY (`group_id`) REFERENCES `supplement_groups` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Contraintes pour la table `tables`
--
ALTER TABLE `tables`
  ADD CONSTRAINT `tables_ibfk_24` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `tables_ibfk_25` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Contraintes pour la table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_ibfk_1` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

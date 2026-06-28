-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: May 29, 2026 at 01:50 PM
-- Server version: 8.0.30
-- PHP Version: 8.3.25

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `itebafolio`
--

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` int NOT NULL,
  `nama_kategori` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `comments`
--

CREATE TABLE `comments` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `project_id` int NOT NULL,
  `komentar` text NOT NULL,
  `created_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `comments`
--

INSERT INTO `comments` (`id`, `user_id`, `project_id`, `komentar`, `created_at`) VALUES
(1, 6, 2, 'keren banget project ini', '2026-05-18 18:11:45'),
(2, 6, 1, 'wah keren, bagaimana ini cara membuatnya?', '2026-05-19 16:04:30'),
(13, 6, 2, 'keren sih', '2026-05-21 10:58:31'),
(16, 6, 3, 'wah ******', '2026-05-21 12:43:40'),
(17, 6, 2, 'halaah ******l', '2026-05-26 14:52:31'),
(18, 6, 1, '*****', '2026-05-26 14:52:48'),
(19, 5, 3, 'halah ******', '2026-05-26 14:59:25');

-- --------------------------------------------------------

--
-- Table structure for table `likes`
--

CREATE TABLE `likes` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `project_id` int NOT NULL,
  `created_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `likes`
--

INSERT INTO `likes` (`id`, `user_id`, `project_id`, `created_at`) VALUES
(5, 6, 1, '2026-05-19 16:26:09'),
(7, 6, 3, '2026-05-19 16:26:12'),
(8, 6, 2, '2026-05-19 16:30:08'),
(9, 9, 2, '2026-05-19 16:49:40');

-- --------------------------------------------------------

--
-- Table structure for table `projects`
--

CREATE TABLE `projects` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `kategori_id` varchar(100) NOT NULL,
  `judul_project` varchar(255) NOT NULL,
  `link_project` varchar(255) DEFAULT NULL,
  `deskripsi` text,
  `cover` varchar(255) DEFAULT NULL,
  `highlight` text,
  `additional_media` text,
  `views` int DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `status` enum('published','pending') DEFAULT 'published'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `projects`
--

INSERT INTO `projects` (`id`, `user_id`, `kategori_id`, `judul_project`, `link_project`, `deskripsi`, `cover`, `highlight`, `additional_media`, `views`, `created_at`, `updated_at`, `status`) VALUES
(1, 5, 'Sistem Informasi', 'TANDA BACA COFFEESHOP WEBSITE', 'https://project-web-chairulaw.vercel.app/', 'Tanda Baca Coffeeshop is a web-based application designed to provide an online platform for coffee enthusiasts to explore and order their favorite coffee blends. The project was developed as part of my final semester project, where I collaborated with a team to design and implement the front-end and back-end functionalities.', 'cover-1778927712629-919372192.jpg', '[\"highlight-1778927712658-602984612.jpg\",\"highlight-1778927712660-856162985.jpg\",\"highlight-1778927712662-616229875.jpg\"]', '[]', 0, '2026-05-16 17:35:12', '2026-05-16 17:44:32', 'published'),
(2, 5, 'Teknik Komputer', 'Petani GO Website', 'http://petanigo.infinitelearningproject.com/', 'Petani GO is an agricultural education platform that provides information and insights to help individuals grow in the agricultural sector and contribute to building a better and more sustainable agricultural future. An experienced farmer has shifted to rice farming due to age and physical limitations. He needs support in technology and resources to remain productive and competitive. An AI-based digital platform offering interactive education, modern technology training, and discussion and chatbot features to help farmers improve yields and foster an efficient, modern agricultural community.', 'cover-1779092600865-376516155.jpg', '[\"highlight-1779092600910-613602986.jpg\",\"highlight-1779092600939-626866980.jpg\",\"highlight-1779092600972-623808579.jpg\",\"highlight-1779092601003-920773247.jpg\",\"highlight-1779092601042-637352567.jpg\"]', '[]', 0, '2026-05-18 15:23:21', '2026-05-18 15:23:21', 'published'),
(3, 6, 'Lainnya', 'Himarity Vol 3 Certificate', '', 'Sertifikat ini merupakan tanda keikutsertaan saya pada Himarity Vol 3 yang di adakan pada tahun 2025', '1779102046613-329185138.png', '[\"1779102046620-201653734.pdf\"]', '[]', 0, '2026-05-18 18:00:46', '2026-05-19 16:57:15', 'published');

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `id` int NOT NULL,
  `nama_role` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`id`, `nama_role`) VALUES
(1, 'admin'),
(2, 'mahasiswa');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int NOT NULL,
  `role_id` int NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `nim` varchar(20) DEFAULT NULL,
  `nama_user` varchar(100) NOT NULL,
  `prodi` varchar(100) DEFAULT NULL,
  `angkatan` int DEFAULT NULL,
  `bio` varchar(500) DEFAULT NULL,
  `website` varchar(255) DEFAULT NULL,
  `no_wa` varchar(20) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `avatar` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `role_id`, `email`, `password`, `nim`, `nama_user`, `prodi`, `angkatan`, `bio`, `website`, `no_wa`, `created_at`, `updated_at`, `avatar`) VALUES
(5, 2, 'chairul@iteba.ac.id', '$2b$10$Y.wWKTAlT8eQ47ipjP0iXu7N2vvOAfNNvdLd.r2uJa1NrunxqjF7m', '2221026', 'Muhammad Chairul Wibisono', 'Sistem Informasi', 2022, 'saya adalah seorang mahasiswa Sistem Informasi angkatan 2022 yang sedang menyusun skripsi. semoga tahun ini lulus Aamiin', 'chairulaw.vercel.app', '082171487329', '2026-05-13 12:08:56', '2026-05-28 14:23:18', 'avatar-1778688510026-788973902.jpg'),
(6, 2, 'adam@iteba.ac.id', '$2b$10$vudxm0gfyjLTkshQuAcnvOsNwX41fNMCTFOt6RhVOfrKrRVghXmF6', '201926', 'Adam Anwar', 'Sistem Informasi', 2020, 'Halo saya Adam Anwar', 'https://www.instagram.com/adamnanwar/', '', '2026-05-13 20:36:33', '2026-05-20 15:50:41', 'avatar-1778687807182-801106527.jpg'),
(7, 2, 'joko@iteba.ac.id', '$2b$10$iWybZg2JKa4tvYvBaX9aQedWCP1YMYbe2ZAY4PqdUdPMZqnKVsVSm', '222046', 'Joko Sugiyanto', 'Sistem Informasi', 2022, NULL, NULL, NULL, '2026-05-14 22:15:58', '2026-05-14 22:15:58', NULL),
(8, 2, 'efri@iteba.ac.id', '$2b$10$EGxEmlgMsSLnO8mUc4Jzle84teFMtWTEBUutxM8gXn2Hz68p2pi3y', '1234', 'Efri Efendi', 'Desain Komunikasi Visual', 2022, 'Hai saya Efri Efendi, seorang mahasiswa akhir dari prodi DKV angkatan 2022. Semoga kalian suka dengan karya saya', '', '082170074607', '2026-05-14 22:20:22', '2026-05-19 16:41:02', '1779183662137-886024329.jpg'),
(9, 2, 'pascal@iteba.ac.id', '$2b$10$MsJMiI/tuQ0BnyM4fOX1yeQdnWw4u/K6gv4IHWowpF4KOiYBE1/6C', '123456', 'Anugrah Pascal Pratama', 'Desain Komunikasi Visual', 2021, 'aku pascal, tahun depan lulus ceunah', '', '', '2026-05-19 16:42:55', '2026-05-19 16:45:40', '1779183940075-968032169.jpg'),
(10, 1, 'admin@iteba.ac.id', '$2b$10$iDnAEdXyWFmYFvgbS0cDGuyplXQ1taXIpMerh5PMI10lp1DR/sU2C', 'ADMIN001', 'Super Admin', NULL, NULL, NULL, NULL, NULL, '2026-05-20 15:18:32', '2026-05-20 15:18:32', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `violation_logs`
--

CREATE TABLE `violation_logs` (
  `id` int NOT NULL,
  `tipe_entitas` enum('Project','User Profile','Comment') NOT NULL,
  `entitas_id` int NOT NULL,
  `user_id` int NOT NULL,
  `alasan` varchar(255) NOT NULL,
  `status` enum('pending','resolved','dismissed') DEFAULT 'pending',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `violation_logs`
--

INSERT INTO `violation_logs` (`id`, `tipe_entitas`, `entitas_id`, `user_id`, `alasan`, `status`, `created_at`, `updated_at`) VALUES
(1, 'Comment', 3, 6, 'Komentar mengandung kata terlarang: tolol', 'resolved', '2026-05-20 16:38:54', '2026-05-25 16:19:08'),
(14, 'Project', 6, 6, 'Project di-pending otomatis: Mengandung kata bodoh', 'resolved', '2026-05-21 11:47:18', '2026-05-21 11:50:56'),
(15, 'Comment', 16, 6, 'Komentar disensor otomatis: Mengandung kata kontol', 'resolved', '2026-05-21 12:43:40', '2026-05-25 16:19:02'),
(16, 'Comment', 17, 6, 'Komentar disensor otomatis: Mengandung kata kontol', 'pending', '2026-05-26 14:52:31', '2026-05-26 14:52:31'),
(17, 'Comment', 18, 6, 'Komentar disensor otomatis: Mengandung kata memek', 'pending', '2026-05-26 14:52:48', '2026-05-26 14:52:48'),
(18, 'Comment', 19, 5, 'Komentar disensor otomatis: Mengandung kata jembut', 'pending', '2026-05-26 14:59:25', '2026-05-26 14:59:25');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `comments`
--
ALTER TABLE `comments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `project_id` (`project_id`);

--
-- Indexes for table `likes`
--
ALTER TABLE `likes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `project_id` (`project_id`);

--
-- Indexes for table `projects`
--
ALTER TABLE `projects`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nama_role` (`nama_role`),
  ADD UNIQUE KEY `nama_role_2` (`nama_role`),
  ADD UNIQUE KEY `nama_role_3` (`nama_role`),
  ADD UNIQUE KEY `nama_role_4` (`nama_role`),
  ADD UNIQUE KEY `nama_role_5` (`nama_role`),
  ADD UNIQUE KEY `nama_role_6` (`nama_role`),
  ADD UNIQUE KEY `nama_role_7` (`nama_role`),
  ADD UNIQUE KEY `nama_role_8` (`nama_role`),
  ADD UNIQUE KEY `nama_role_9` (`nama_role`),
  ADD UNIQUE KEY `nama_role_10` (`nama_role`),
  ADD UNIQUE KEY `nama_role_11` (`nama_role`),
  ADD UNIQUE KEY `nama_role_12` (`nama_role`),
  ADD UNIQUE KEY `nama_role_13` (`nama_role`),
  ADD UNIQUE KEY `nama_role_14` (`nama_role`),
  ADD UNIQUE KEY `nama_role_15` (`nama_role`),
  ADD UNIQUE KEY `nama_role_16` (`nama_role`),
  ADD UNIQUE KEY `nama_role_17` (`nama_role`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `email_2` (`email`),
  ADD UNIQUE KEY `email_3` (`email`),
  ADD UNIQUE KEY `email_4` (`email`),
  ADD UNIQUE KEY `email_5` (`email`),
  ADD UNIQUE KEY `email_6` (`email`),
  ADD UNIQUE KEY `email_7` (`email`),
  ADD UNIQUE KEY `email_8` (`email`),
  ADD UNIQUE KEY `email_9` (`email`),
  ADD UNIQUE KEY `email_10` (`email`),
  ADD UNIQUE KEY `email_11` (`email`),
  ADD UNIQUE KEY `email_12` (`email`),
  ADD UNIQUE KEY `email_13` (`email`),
  ADD UNIQUE KEY `nim` (`nim`),
  ADD UNIQUE KEY `nim_2` (`nim`),
  ADD UNIQUE KEY `nim_3` (`nim`),
  ADD UNIQUE KEY `nim_4` (`nim`),
  ADD UNIQUE KEY `nim_5` (`nim`),
  ADD UNIQUE KEY `nim_6` (`nim`),
  ADD UNIQUE KEY `nim_7` (`nim`),
  ADD UNIQUE KEY `nim_8` (`nim`),
  ADD UNIQUE KEY `nim_9` (`nim`),
  ADD UNIQUE KEY `nim_10` (`nim`),
  ADD UNIQUE KEY `nim_11` (`nim`),
  ADD UNIQUE KEY `nim_12` (`nim`),
  ADD UNIQUE KEY `nim_13` (`nim`),
  ADD KEY `role_id` (`role_id`);

--
-- Indexes for table `violation_logs`
--
ALTER TABLE `violation_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `comments`
--
ALTER TABLE `comments`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `likes`
--
ALTER TABLE `likes`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `projects`
--
ALTER TABLE `projects`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `violation_logs`
--
ALTER TABLE `violation_logs`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `comments`
--
ALTER TABLE `comments`
  ADD CONSTRAINT `comments_ibfk_10` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `comments_ibfk_9` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `likes`
--
ALTER TABLE `likes`
  ADD CONSTRAINT `likes_ibfk_10` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `likes_ibfk_9` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `projects`
--
ALTER TABLE `projects`
  ADD CONSTRAINT `projects_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `violation_logs`
--
ALTER TABLE `violation_logs`
  ADD CONSTRAINT `violation_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

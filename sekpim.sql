-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Jul 01, 2026 at 07:14 AM
-- Server version: 8.0.30
-- PHP Version: 8.3.28

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `sekpim`
--

-- --------------------------------------------------------

--
-- Table structure for table `arsip_surats`
--

CREATE TABLE `arsip_surats` (
  `id` bigint UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cache`
--

CREATE TABLE `cache` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` bigint NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cache_locks`
--

CREATE TABLE `cache_locks` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `owner` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` bigint NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `failed_jobs`
--

CREATE TABLE `failed_jobs` (
  `id` bigint UNSIGNED NOT NULL,
  `uuid` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `connection` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `queue` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `exception` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `jobs`
--

CREATE TABLE `jobs` (
  `id` bigint UNSIGNED NOT NULL,
  `queue` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `attempts` smallint UNSIGNED NOT NULL,
  `reserved_at` int UNSIGNED DEFAULT NULL,
  `available_at` int UNSIGNED NOT NULL,
  `created_at` int UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `job_batches`
--

CREATE TABLE `job_batches` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_jobs` int NOT NULL,
  `pending_jobs` int NOT NULL,
  `failed_jobs` int NOT NULL,
  `failed_job_ids` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `options` mediumtext COLLATE utf8mb4_unicode_ci,
  `cancelled_at` int DEFAULT NULL,
  `created_at` int NOT NULL,
  `finished_at` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `kode_pemiliks`
--

CREATE TABLE `kode_pemiliks` (
  `id` bigint UNSIGNED NOT NULL,
  `kode` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nama_pemilik` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `unit` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `kode_pemiliks`
--

INSERT INTO `kode_pemiliks` (`id`, `kode`, `nama_pemilik`, `unit`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'SI', 'Sistem Informasi', 'prodi', 1, '2026-06-29 06:24:58', '2026-06-29 06:24:58'),
(2, 'LOG', 'Logistik', 'logistik', 1, '2026-06-29 06:29:10', '2026-06-29 06:29:10'),
(3, 'KU', 'keuangan', 'keuangan', 1, '2026-06-29 07:00:09', '2026-06-29 07:00:09');

-- --------------------------------------------------------

--
-- Table structure for table `kode_perihals`
--

CREATE TABLE `kode_perihals` (
  `id` bigint UNSIGNED NOT NULL,
  `kode` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nama_perihal` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `deskripsi` text COLLATE utf8mb4_unicode_ci,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `kode_perihals`
--

INSERT INTO `kode_perihals` (`id`, `kode`, `nama_perihal`, `deskripsi`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'KU', 'Keuangan', 'Minta uang jajan', 1, '2026-06-29 06:24:30', '2026-06-29 06:24:30'),
(2, 'LOG', 'Logistik', NULL, 1, '2026-06-29 06:28:51', '2026-06-29 06:28:51');

-- --------------------------------------------------------

--
-- Table structure for table `migrations`
--

CREATE TABLE `migrations` (
  `id` int UNSIGNED NOT NULL,
  `migration` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '0001_01_01_000000_create_users_table', 1),
(2, '0001_01_01_000001_create_cache_table', 1),
(3, '0001_01_01_000002_create_jobs_table', 1),
(4, '2026_06_29_070314_add_username_unit_to_users_table', 2),
(5, '2026_06_29_125636_create_kode_perihals_table', 3),
(6, '2026_06_29_125651_create_kode_pemiliks_table', 3),
(7, '2026_06_29_125659_create_nomor_surat_requests_table', 3),
(8, '2026_06_29_125707_create_nomor_surat_counters_table', 3),
(9, '2026_06_29_125712_create_arsip_surats_table', 3),
(10, '2026_06_29_140707_update_nomor_surat_counters_to_yearly_global', 4),
(11, '2026_06_29_142412_add_final_document_to_nomor_surat_requests', 5);

-- --------------------------------------------------------

--
-- Table structure for table `nomor_surat_counters`
--

CREATE TABLE `nomor_surat_counters` (
  `id` bigint UNSIGNED NOT NULL,
  `tahun` year NOT NULL,
  `last_number` int NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `nomor_surat_counters`
--

INSERT INTO `nomor_surat_counters` (`id`, `tahun`, `last_number`, `created_at`, `updated_at`) VALUES
(1, '2026', 3, '2026-06-29 07:16:41', '2026-06-29 07:35:26');

-- --------------------------------------------------------

--
-- Table structure for table `nomor_surat_requests`
--

CREATE TABLE `nomor_surat_requests` (
  `id` bigint UNSIGNED NOT NULL,
  `user_id` bigint UNSIGNED NOT NULL,
  `kode_perihal_id` bigint UNSIGNED NOT NULL,
  `kode_pemilik_id` bigint UNSIGNED NOT NULL,
  `tanggal_surat` date NOT NULL,
  `tahun` year NOT NULL,
  `judul_surat` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tujuan_surat` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `keterangan` text COLLATE utf8mb4_unicode_ci,
  `status` enum('pending','approved','final_submitted','completed','rejected') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `nomor_urut` int DEFAULT NULL,
  `nomor_surat` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `file_dokumen` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `file_dokumen_final` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `final_uploaded_at` timestamp NULL DEFAULT NULL,
  `completed_by` bigint UNSIGNED DEFAULT NULL,
  `completed_at` timestamp NULL DEFAULT NULL,
  `completed_note` text COLLATE utf8mb4_unicode_ci,
  `approved_by` bigint UNSIGNED DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT NULL,
  `rejected_by` bigint UNSIGNED DEFAULT NULL,
  `rejected_at` timestamp NULL DEFAULT NULL,
  `rejected_reason` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `nomor_surat_requests`
--

INSERT INTO `nomor_surat_requests` (`id`, `user_id`, `kode_perihal_id`, `kode_pemilik_id`, `tanggal_surat`, `tahun`, `judul_surat`, `tujuan_surat`, `keterangan`, `status`, `nomor_urut`, `nomor_surat`, `file_dokumen`, `file_dokumen_final`, `final_uploaded_at`, `completed_by`, `completed_at`, `completed_note`, `approved_by`, `approved_at`, `rejected_by`, `rejected_at`, `rejected_reason`, `created_at`, `updated_at`) VALUES
(1, 2, 2, 2, '2026-06-29', '2026', 'permohonan beli kursi', 'Kepala urusan sekpim', 'tes', 'completed', 1, '001/LOG/LOG/2026', NULL, 'dokumen-final-surat/re8K9fMBlBcABumZpJI7uneDUHrp56CumoSspOIh.pdf', '2026-06-29 09:26:15', 1, '2026-06-29 09:26:38', 'dokumen sudah sesuai', 1, '2026-06-29 07:16:41', NULL, NULL, NULL, '2026-06-29 07:15:50', '2026-06-29 09:26:38'),
(2, 4, 1, 3, '2026-06-29', '2026', 'tes', 'tes', 'tes', 'approved', 2, '002/KU/KU/2026', NULL, NULL, NULL, NULL, NULL, NULL, 1, '2026-06-29 07:16:45', NULL, NULL, NULL, '2026-06-29 07:16:31', '2026-06-29 07:16:45'),
(3, 2, 2, 2, '2026-06-29', '2026', 'tesss', 'tesssss', 'tessss', 'completed', 3, '003/LOG/LOG/2026', 'dokumen-surat/pnVIoCo5AZbEF3QaMkPcyd7pTD3d4WIqoXE0K1x5.pdf', 'dokumen-final-surat/YmRw9aNKKcd24u2PmtaUy6JUClx7ynuBnxWfaBg5.pdf', '2026-06-29 08:05:05', 1, '2026-06-29 08:06:05', 'aman', 1, '2026-06-29 07:35:26', NULL, NULL, NULL, '2026-06-29 07:17:59', '2026-06-29 08:06:05');

-- --------------------------------------------------------

--
-- Table structure for table `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` bigint UNSIGNED DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_activity` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sessions`
--

INSERT INTO `sessions` (`id`, `user_id`, `ip_address`, `user_agent`, `payload`, `last_activity`) VALUES
('fCyvbJcrFjvcu7veUoWwhAyp0lfYnpFhKdtEMurd', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Code/1.126.0 Chrome/148.0.7778.97 Electron/42.2.0 Safari/537.36', 'eyJfdG9rZW4iOiJreDB3b3ZGRXkzUHFzZFVHT0lmYW45ZVFqMDN3Yks1MUg4NDFHWXIxIiwiX3ByZXZpb3VzIjp7InVybCI6Imh0dHA6XC9cLzEyNy4wLjAuMTo4MDAwXC9tZSIsInJvdXRlIjpudWxsfSwiX2ZsYXNoIjp7Im9sZCI6W10sIm5ldyI6W119fQ==', 1782744014),
('GWESE8IC9uxEoQZLsvhFuBLd21fPRInVswojWZ6p', 4, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'eyJfdG9rZW4iOiJranplRHlFWWFIMVp2aXl4RXFvbFZ5czVqWlFPN2R1Z0RiOUVzcm9ZIiwiX3ByZXZpb3VzIjp7InVybCI6Imh0dHA6XC9cLzEyNy4wLjAuMTo4MDAwXC9rb2RlLXBlbWlsaWsiLCJyb3V0ZSI6bnVsbH0sIl9mbGFzaCI6eyJvbGQiOltdLCJuZXciOltdfSwibG9naW5fd2ViXzU5YmEzNmFkZGMyYjJmOTQwMTU4MGYwMTRjN2Y1OGVhNGUzMDk4OWQiOjR9', 1782744016),
('hwjcQX2pdLt3RhhiNNB6gSpF2MIiqz9BY5U3gMtm', 2, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0', 'eyJfdG9rZW4iOiJrelg0NEhpZ1lGTU93c2pLOVV3SG5KOHZvVU9ZNDFZaFJZRTA0TUlxIiwiX2ZsYXNoIjp7Im9sZCI6W10sIm5ldyI6W119LCJsb2dpbl93ZWJfNTliYTM2YWRkYzJiMmY5NDAxNTgwZjAxNGM3ZjU4ZWE0ZTMwOTg5ZCI6MiwiX3ByZXZpb3VzIjp7InVybCI6Imh0dHA6XC9cLzEyNy4wLjAuMTo4MDAwXC9ub21vci1zdXJhdCIsInJvdXRlIjpudWxsfX0=', 1782744088),
('LjXJRofcSVIVaaPvBcAXOG8W0mTVQLqs14nMbPPh', 1, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'eyJfdG9rZW4iOiJ5UHFNeXBpMm9vZ1Q0cks4dWFqSW55SngzVnAxOHNXMG03RVZtQ0QyIiwiX3ByZXZpb3VzIjp7InVybCI6Imh0dHA6XC9cLzEyNy4wLjAuMTo4MDAwXC9ub21vci1zdXJhdCIsInJvdXRlIjpudWxsfSwiX2ZsYXNoIjp7Im9sZCI6W10sIm5ldyI6W119LCJsb2dpbl93ZWJfNTliYTM2YWRkYzJiMmY5NDAxNTgwZjAxNGM3ZjU4ZWE0ZTMwOTg5ZCI6MX0=', 1782744016);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `username` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `unit` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'logistik',
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `remember_token` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `username`, `unit`, `email`, `email_verified_at`, `password`, `remember_token`, `created_at`, `updated_at`) VALUES
(1, 'Admin SEKPIM', 'adminsekpim', 'sekpim', 'adminsekpim@telkomuniversity.ac.id', NULL, '$2y$12$Kfv3G1OTrNYx69/DL8Kai.WLIvvrryPG7UHWxZMMTdGtJhMSUdn1a', NULL, '2026-06-29 00:06:28', '2026-06-29 00:06:28'),
(2, 'Unit Logistik', 'logistik', 'logistik', 'logistik@telkomuniversity.ac.id', NULL, '$2y$12$tmWIEdz3lohrbGReugauceaSsqqQuI9HhtwxdOJoDi7wyZgf0wDzK', NULL, '2026-06-29 00:06:28', '2026-06-29 00:06:28'),
(4, 'Keuangan', 'keuangan', 'keuangan', 'keuangan@gmail.com', NULL, '$2y$12$4uiq5U7gctFZzL07z84SseMuRR2VcuWpOPqoT5Ms5WNcKGYWEW2Dq', NULL, '2026-06-29 06:59:45', '2026-06-29 06:59:45');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `arsip_surats`
--
ALTER TABLE `arsip_surats`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `cache`
--
ALTER TABLE `cache`
  ADD PRIMARY KEY (`key`),
  ADD KEY `cache_expiration_index` (`expiration`);

--
-- Indexes for table `cache_locks`
--
ALTER TABLE `cache_locks`
  ADD PRIMARY KEY (`key`),
  ADD KEY `cache_locks_expiration_index` (`expiration`);

--
-- Indexes for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`),
  ADD KEY `failed_jobs_connection_queue_failed_at_index` (`connection`,`queue`,`failed_at`);

--
-- Indexes for table `jobs`
--
ALTER TABLE `jobs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `jobs_queue_index` (`queue`);

--
-- Indexes for table `job_batches`
--
ALTER TABLE `job_batches`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `kode_pemiliks`
--
ALTER TABLE `kode_pemiliks`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `kode_pemiliks_kode_unique` (`kode`);

--
-- Indexes for table `kode_perihals`
--
ALTER TABLE `kode_perihals`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `kode_perihals_kode_unique` (`kode`);

--
-- Indexes for table `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `nomor_surat_counters`
--
ALTER TABLE `nomor_surat_counters`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nomor_surat_counters_tahun_unique` (`tahun`);

--
-- Indexes for table `nomor_surat_requests`
--
ALTER TABLE `nomor_surat_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `nomor_surat_requests_user_id_foreign` (`user_id`),
  ADD KEY `nomor_surat_requests_kode_perihal_id_foreign` (`kode_perihal_id`),
  ADD KEY `nomor_surat_requests_kode_pemilik_id_foreign` (`kode_pemilik_id`),
  ADD KEY `nomor_surat_requests_approved_by_foreign` (`approved_by`),
  ADD KEY `nomor_surat_requests_rejected_by_foreign` (`rejected_by`);

--
-- Indexes for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`email`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sessions_user_id_index` (`user_id`),
  ADD KEY `sessions_last_activity_index` (`last_activity`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_unique` (`email`),
  ADD UNIQUE KEY `users_username_unique` (`username`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `arsip_surats`
--
ALTER TABLE `arsip_surats`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `jobs`
--
ALTER TABLE `jobs`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `kode_pemiliks`
--
ALTER TABLE `kode_pemiliks`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `kode_perihals`
--
ALTER TABLE `kode_perihals`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `nomor_surat_counters`
--
ALTER TABLE `nomor_surat_counters`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `nomor_surat_requests`
--
ALTER TABLE `nomor_surat_requests`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `nomor_surat_requests`
--
ALTER TABLE `nomor_surat_requests`
  ADD CONSTRAINT `nomor_surat_requests_approved_by_foreign` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `nomor_surat_requests_kode_pemilik_id_foreign` FOREIGN KEY (`kode_pemilik_id`) REFERENCES `kode_pemiliks` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `nomor_surat_requests_kode_perihal_id_foreign` FOREIGN KEY (`kode_perihal_id`) REFERENCES `kode_perihals` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `nomor_surat_requests_rejected_by_foreign` FOREIGN KEY (`rejected_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `nomor_surat_requests_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

-- Menyesuaikan tabel `categories` dengan model Sequelize saat ini
-- (fitur filter dinamis: slug, deskripsi, image, tipe)
ALTER TABLE `categories`
  ADD COLUMN `slug` VARCHAR(150) NULL,
  ADD COLUMN `deskripsi` TEXT NULL,
  ADD COLUMN `image` VARCHAR(255) NULL,
  ADD COLUMN `tipe` ENUM('kategori', 'prodi', 'spesial') NOT NULL DEFAULT 'kategori';

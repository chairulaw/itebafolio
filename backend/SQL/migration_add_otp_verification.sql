-- Menambahkan kolom untuk verifikasi akun via OTP email (lihat authController.js:
-- register, verifyOtp, resendOtp) yang dipakai model User.js tapi belum ada di SQL dump lama.
-- Akun lama otomatis dianggap terverifikasi (DEFAULT 1) agar tidak terkunci saat migrasi ini dijalankan.
ALTER TABLE `users`
  ADD COLUMN `otp_code` VARCHAR(6) NULL,
  ADD COLUMN `otp_expires_at` DATETIME NULL,
  ADD COLUMN `is_verified` TINYINT(1) NOT NULL DEFAULT 1;

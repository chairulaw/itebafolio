-- Menambahkan role "Pengunjung" (id=3) yang dipakai default oleh authController.js
-- saat registrasi akun "Pengunjung Umum", tapi belum ada di SQL dump lama.
INSERT INTO `roles` (`id`, `nama_role`) VALUES (3, 'pengunjung');

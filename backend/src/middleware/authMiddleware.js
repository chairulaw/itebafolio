import jwt from "jsonwebtoken";

// 1. Middleware untuk mengecek apakah user sudah login (Membawa Token Valid)
export const verifyToken = (req, res, next) => {
    // Mengambil header Authorization (format: Bearer <token>)
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "Akses ditolak: Token tidak ditemukan, silakan login." });
    }

    try {
        // Verifikasi token (Pastikan ACCESS_TOKEN_SECRET ada di file .env Anda)
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Menyimpan data user dari token ke dalam req.user agar bisa diakses oleh Controller
        // Asumsinya payload token berisi { id, role_id, email, dll }
        req.user = decoded;

        // Lanjut ke proses/controller berikutnya
        next();
    } catch (error) {
        return res.status(403).json({ message: "Akses ditolak: Token tidak valid atau sudah kadaluarsa." });
    }
};

// 2. Middleware khusus untuk membatasi akses HANYA untuk Admin (role_id === 1)
export const verifyAdmin = (req, res, next) => {
    // Harus melewati verifyToken terlebih dahulu sebelum middleware ini
    if (!req.user) {
        return res.status(401).json({ message: "Akses ditolak: Data pengguna tidak ditemukan." });
    }

    // Cek apakah role_id adalah 1 (Admin)
    if (req.user.role_id !== 1) {
        return res.status(403).json({ message: "Akses ditolak: Hanya Admin yang dapat melakukan aksi ini." });
    }

    next();
};

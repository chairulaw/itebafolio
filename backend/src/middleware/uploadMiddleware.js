import multer from "multer";
import path from "path";

// 1. Konfigurasi tempat penyimpanan dan nama file
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "public/uploads/");
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    },
});

// 2. Filter jenis file
const fileFilter = (req, file, cb) => {
    // Aturan ketat untuk Cover & Avatar (HANYA GAMBAR)
    if (file.fieldname === "cover" || file.fieldname === "avatar") {
        const allowedImageTypes = /jpeg|jpg|png|webp|gif/;
        const extname = allowedImageTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedImageTypes.test(file.mimetype);

        if (extname && mimetype) {
            cb(null, true);
        } else {
            cb(new Error("Error: Hanya file gambar (JPG, PNG, WEBP, GIF) yang diizinkan untuk cover dan avatar!"));
        }
    }
    // Aturan fleksibel untuk Highlight Media (GAMBAR, PDF, MP4, MP3)
    else if (file.fieldname === "highlight" || file.fieldname === "additional_media") {
        const validMimeTypes = [
            "image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif",
            "application/pdf",
            "video/mp4",
            "audio/mpeg", "audio/mp3"
        ];

        if (validMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Error: Highlight media hanya mendukung Gambar, PDF, MP4, dan MP3!"));
        }
    }
    // Fallback aman
    else {
        cb(null, true);
    }
};

// 3. Inisialisasi Multer Dasar
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 100 * 1024 * 1024 // LIMIT 100MB
    },
});

// --- EXPORTS KHUSUS ---

// Export untuk Avatar di userRoutes.js
export const uploadAvatar = upload;

// Export untuk Project di projectRoutes.js (Nama sudah disamakan menjadi uploadProjectFiles)
export const uploadProjectFiles = upload.fields([
    { name: 'cover', maxCount: 1 },
    { name: 'highlight', maxCount: 10 },
    { name: 'additional_media', maxCount: 10 }
]);

export default upload;
import express from "express";
import { getUser, getPublicUserById, updateUser, changePassword } from "../controllers/userController.js";
import { verifyToken, verifyAdmin } from "../middleware/authMiddleware.js";
import { uploadAvatar } from "../middleware/uploadMiddleware.js";

const router = express.Router();

// GET: Mengambil data user
router.get("/", verifyToken, getUser);

// PUT: Mengubah password (WAJIB PALING ATAS DARI PUT LAINNYA)
router.put('/change-password', verifyToken, changePassword);

// PUT: Mengubah data profil (Ini HANYA SATU dan sudah dilengkapi Multer)
router.put("/:id", verifyToken, uploadAvatar.single('avatar'), updateUser);

// DELETE: Menghapus akun
// router.delete("/:id", verifyToken);

// GET: Melihat profil publik pengguna berdasarkan ID (tanpa middleware auth)
router.get('/:id', getPublicUserById);

export default router;
import express from "express";
import { getProjects, getProjectById, createProject, updateProject, deleteProject, getUserGivenLikes } from "../controllers/projectController.js";
import { toggleLike, getComments, createComment } from "../controllers/interactionsController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { uploadProjectFiles } from "../middleware/uploadMiddleware.js";

const router = express.Router();

// GET: Publik bisa melihat semua project
router.get("/", getProjects);

// GET: Publik bisa melihat DETAIL 1 project (TAMBAHKAN BARIS INI)
router.get("/:id", getProjectById);

// POST: Mahasiswa membuat project baru
router.post("/", verifyToken, uploadProjectFiles, createProject);

// PUT: Edit project
router.put("/:id", verifyToken, uploadProjectFiles, updateProject);

// DELETE: Hapus project
router.delete("/:id", verifyToken, deleteProject);

// Like/Unlike Project (Hanya user login)
router.post("/:id/like", verifyToken, toggleLike);

// Ambil Komentar (Publik bisa baca)
router.get("/:id/comments", getComments);

// Tambah Komentar (Hanya user login)
router.post("/:id/comments", verifyToken, createComment);

// Hitung jumlah like yang diberikan oleh user tertentu
router.get("/users/:userId/likes", getUserGivenLikes);

export default router;
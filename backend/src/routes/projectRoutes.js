import express from "express";
import { getProjects, getProjectById, createProject, updateProject, deleteProject, getUserGivenLikes } from "../controllers/projectController.js";
import { toggleLike, getComments,  createComment, getCommentsByUser } from "../controllers/interactionsController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { uploadProjectFiles } from "../middleware/uploadMiddleware.js";

const router = express.Router();

// 1. GET: Publik bisa melihat semua project
router.get("/", getProjects);

// 2. RUTE SPESIFIK (Wajib diletakkan DI ATAS rute /:id)
router.get('/comments/user/:id', getCommentsByUser);
router.get("/users/:userId/likes", getUserGivenLikes);

// 3. GET: Publik bisa melihat DETAIL 1 project
router.get("/:id", getProjectById);

// 4. POST: Mahasiswa membuat project baru
router.post("/", verifyToken, uploadProjectFiles, createProject);

// 5. PUT: Edit project
router.put("/:id", verifyToken, uploadProjectFiles, updateProject);

// 6. DELETE: Hapus project
router.delete("/:id", verifyToken, deleteProject);

// 7. Like/Unlike Project (Hanya user login)
router.post("/:id/like", verifyToken, toggleLike);

// 8. Ambil Komentar (Publik bisa baca)
router.get("/:id/comments", getComments);

// 9. Tambah Komentar (Hanya user login)
router.post("/:id/comments", verifyToken, createComment);

export default router;
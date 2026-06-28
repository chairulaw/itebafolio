import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { 
    getDashboardStats, 
    getViolationLogs, 
    updateViolationStatus,
    getAllUsers,
    updateUser,
    deleteUser,
    getAllProjects,       // <--- Tambahan baru
    deleteAdminProject    // <--- Tambahan baru
} from "../controllers/adminController.js"; 

const router = express.Router();

// Route Dashboard & Moderasi
router.get("/dashboard", verifyToken, getDashboardStats);
router.get("/violations", verifyToken, getViolationLogs);
router.put("/violations/:id", verifyToken, updateViolationStatus);

// Route Manage Users
router.get("/users", verifyToken, getAllUsers);
router.put("/users/:id", verifyToken, updateUser);
router.delete("/users/:id", verifyToken, deleteUser);

// Route Manage Projects
router.get("/projects", verifyToken, getAllProjects);               // <--- Tambahan baru
router.delete("/projects/:id", verifyToken, deleteAdminProject);    // <--- Tambahan baru

export default router;
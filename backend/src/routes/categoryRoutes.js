import express from 'express';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../controllers/categoryController.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js'; // Pastikan path multer Anda sesuai

const router = express.Router();

router.get('/', getCategories);
router.post('/', verifyToken, upload.single('image'), createCategory);
router.put('/:id', verifyToken, upload.single('image'), updateCategory);
router.delete('/:id', verifyToken, deleteCategory);

export default router;
import Category from "../models/category.js";

// Helper sederhana pembuat slug
const createSlug = (text) => {
    return text.toString().toLowerCase().trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '');
};

// [PUBLIC] GET: Ambil semua kategori/filter
export const getCategories = async (req, res) => {
    try {
        const categories = await Category.findAll();
        res.status(200).json(categories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// [ADMIN] POST: Tambah filter/kategori baru
export const createCategory = async (req, res) => {
    try {
        if (req.user.role_id !== 1) {
            return res.status(403).json({ message: "Hanya Admin yang dapat menambahkan kategori!" });
        }

        const { nama_kategori, deskripsi, tipe } = req.body;
        const imagePath = req.file ? req.file.filename : null;
        const slug = createSlug(nama_kategori);

        const newCategory = await Category.create({
            nama_kategori,
            slug,
            deskripsi,
            image: imagePath,
            tipe: tipe || 'kategori'
        });

        res.status(201).json({ message: "Filter/Kategori berhasil ditambahkan", data: newCategory });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// [ADMIN] PUT: Edit filter/kategori
export const updateCategory = async (req, res) => {
    try {
        if (req.user.role_id !== 1) {
            return res.status(403).json({ message: "Hanya Admin yang dapat mengedit kategori!" });
        }

        const category = await Category.findByPk(req.params.id);
        if (!category) return res.status(404).json({ message: "Kategori tidak ditemukan" });

        const { nama_kategori, deskripsi, tipe } = req.body;
        const imagePath = req.file ? req.file.filename : category.image;
        const slug = nama_kategori ? createSlug(nama_kategori) : category.slug;

        await Category.update({
            nama_kategori,
            slug,
            deskripsi,
            image: imagePath,
            tipe
        }, { where: { id: req.params.id } });

        res.status(200).json({ message: "Filter/Kategori berhasil diperbarui" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// [ADMIN] DELETE: Hapus filter/kategori
export const deleteCategory = async (req, res) => {
    try {
        if (req.user.role_id !== 1) {
            return res.status(403).json({ message: "Hanya Admin yang dapat menghapus kategori!" });
        }

        await Category.destroy({ where: { id: req.params.id } });
        res.status(200).json({ message: "Kategori berhasil dihapus" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
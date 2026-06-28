import { Like, Comment, User, Project, ViolationLog } from '../models/index.js';
import { checkProfanity } from '../utils/profanityChecker.js';

// --- FITUR LIKE ---
export const toggleLike = async (req, res) => {
    try {
        const project_id = req.params.id;
        const user_id = req.user.id;

        const project = await Project.findByPk(project_id);
        if (!project) return res.status(404).json({ message: "Project tidak ditemukan" });

        const existingLike = await Like.findOne({ where: { user_id, project_id } });

        if (existingLike) {
            await existingLike.destroy();
            return res.status(200).json({ message: "Project di-unlike", isLiked: false });
        } else {
            await Like.create({ user_id, project_id });
            return res.status(201).json({ message: "Project di-like", isLiked: true });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- FITUR KOMENTAR ---
export const getComments = async (req, res) => {
    try {
        const project_id = req.params.id;
        const comments = await Comment.findAll({
            where: { project_id },
            include: [{
                model: User,
                attributes: ['nama_user', 'avatar']
            }],
            order: [['created_at', 'DESC']]
        });
        res.status(200).json(comments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// [MAHASISWA/ADMIN] POST: Tambah Komentar Baru
export const createComment = async (req, res) => {
    try {
        const project_id = req.params.id;
        const user_id = req.user.id;
        const { komentar } = req.body;

        if (!komentar || komentar.trim() === "") {
            return res.status(400).json({ message: "Komentar tidak boleh kosong" });
        }

        // 1. Cek dan Sensor Kata Kasar
        const profanityResult = checkProfanity(komentar);

        // 2. Tentukan teks yang akan disimpan (pakai teks sensor jika melanggar)
        const finalCommentText = profanityResult.isViolating ? profanityResult.censoredText : komentar;

        // 3. Langsung simpan komentar (TIDAK DITOLAK)
        const newComment = await Comment.create({
            user_id,
            project_id,
            komentar: finalCommentText
        });

        // 4. JIKA MELANGGAR: Lapor ke Log Admin
        if (profanityResult.isViolating) {
            const alasanPelanggaran = `Komentar disensor otomatis: Mengandung kata ${profanityResult.matchedWords.join(', ')}`;
            
            await ViolationLog.create({
                tipe_entitas: 'Comment',
                entitas_id: newComment.id, // Sekarang ID aslinya bisa kita simpan
                user_id: user_id,
                alasan: alasanPelanggaran,
                status: 'pending'
            });
        }

        // 5. Kembalikan data ke frontend
        const createdComment = await Comment.findOne({
            where: { id: newComment.id },
            include: [{ model: User, attributes: ['nama_user', 'avatar'] }]
        });

        res.status(201).json({
            message: "Komentar berhasil ditambahkan",
            data: createdComment
        });
    } catch (error) {
        console.error("Error saat membuat komentar:", error);
        res.status(500).json({ message: error.message });
    }
};
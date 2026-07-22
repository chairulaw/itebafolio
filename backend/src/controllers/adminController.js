import { Sequelize } from 'sequelize';
// MENGIMPOR MODEL YANG DIBUTUHKAN, TERMASUK COMMENT
import { User, Project, ViolationLog, Comment } from '../models/index.js';

export const getAllUsers = async (req, res) => {
    try {
        if (req.user.role_id !== 1) return res.status(403).json({ message: "Akses ditolak." });

        const users = await User.findAll({
            order: [['created_at', 'DESC']]
        });

        res.status(200).json({ success: true, data: users });
    } catch (error) {
        console.error("Error di getAllUsers:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// [PERBAIKAN]: Fungsi Update User yang bisa menerima null/kosong
export const updateUser = async (req, res) => {
    try {
        if (req.user.role_id !== 1) return res.status(403).json({ message: "Akses ditolak." });

        // TAMBAHAN: Tangkap angkatan, bio, website, dan no_wa dari req.body
        const { nama_user, email, nim, prodi, role_id, angkatan, bio, website, no_wa } = req.body;
        const user = await User.findByPk(req.params.id);

        if (!user) return res.status(404).json({ message: "Pengguna tidak ditemukan." });

        // Menggunakan undefined check agar bisa menerima nilai null (kosong)
        await user.update({
            nama_user: nama_user !== undefined ? nama_user : user.nama_user,
            email: email !== undefined ? email : user.email,
            nim: nim !== undefined ? nim : user.nim,
            prodi: prodi !== undefined ? prodi : user.prodi,
            role_id: role_id !== undefined ? role_id : user.role_id,
            // TAMBAHAN: Masukkan ke fungsi update
            angkatan: angkatan !== undefined ? angkatan : user.angkatan,
            bio: bio !== undefined ? bio : user.bio,
            website: website !== undefined ? website : user.website,
            no_wa: no_wa !== undefined ? no_wa : user.no_wa
        });

        res.status(200).json({ success: true, message: "Data pengguna berhasil diperbarui!" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteUser = async (req, res) => {
    try {
        if (req.user.role_id !== 1) return res.status(403).json({ message: "Akses ditolak." });

        const user = await User.findByPk(req.params.id);
        if (!user) return res.status(404).json({ message: "Pengguna tidak ditemukan." });

        await user.destroy();
        res.status(200).json({ success: true, message: "Pengguna berhasil dihapus." });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getAllProjects = async (req, res) => {
    try {
        if (req.user.role_id !== 1) return res.status(403).json({ message: "Akses ditolak." });

        const projects = await Project.findAll({
            include: [
                {
                    model: User,
                    attributes: ['nama_user', 'nim']
                }
            ],
            attributes: {
                include: [
                    [
                        Sequelize.literal(`(
                            SELECT COUNT(*)
                            FROM likes
                            WHERE likes.project_id = projects.id
                        )`),
                        'likes_count'
                    ]
                ]
            },
            order: [['created_at', 'DESC']]
        });

        res.status(200).json({ success: true, data: projects });
    } catch (error) {
        console.error("Error di getAllProjects:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteAdminProject = async (req, res) => {
    try {
        if (req.user.role_id !== 1) return res.status(403).json({ message: "Akses ditolak." });

        const project = await Project.findByPk(req.params.id);
        if (!project) return res.status(404).json({ message: "Project tidak ditemukan." });

        await project.destroy();
        res.status(200).json({ success: true, message: "Project berhasil dihapus." });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getDashboardStats = async (req, res) => {
    try {
        if (req.user.role_id !== 1) {
            return res.status(403).json({ message: "Akses ditolak: Area khusus Administrator." });
        }

        const totalUsers = await User.count({ where: { role_id: 2 } });
        const totalProjects = await Project.count();
        const pendingViolations = await ViolationLog.count({ where: { status: 'pending' } });

        const categoryStats = await Project.findAll({
            attributes: [
                ['kategori_id', 'name'],
                [Sequelize.fn('COUNT', Sequelize.col('id')), 'total']
            ],
            group: ['kategori_id']
        });

        const trendStats = await Project.findAll({
            attributes: [
                [Sequelize.fn('MONTHNAME', Sequelize.col('created_at')), 'name'],
                [Sequelize.fn('COUNT', Sequelize.col('id')), 'projects']
            ],
            group: [
                Sequelize.fn('MONTH', Sequelize.col('created_at')),
                Sequelize.fn('MONTHNAME', Sequelize.col('created_at'))
            ],
            order: [[Sequelize.fn('MONTH', Sequelize.col('created_at')), 'ASC']]
        });

        res.status(200).json({
            success: true,
            stats: {
                totalUsers,
                totalProjects,
                pendingViolations
            },
            charts: {
                categories: categoryStats,
                trends: trendStats
            }
        });
    } catch (error) {
        console.error("❌ Error di getDashboardStats:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getViolationLogs = async (req, res) => {
    try {
        if (req.user.role_id !== 1) return res.status(403).json({ message: "Akses ditolak." });

        const logs = await ViolationLog.findAll({
            include: [{
                model: User,
                attributes: ['id', 'nama_user', 'nim']
            }],
            order: [['created_at', 'DESC']]
        });

        const enrichedLogs = await Promise.all(logs.map(async (log) => {
            let entitas_nama = null;
            if (log.tipe_entitas === 'Project' && log.entitas_id !== 0) {
                const project = await Project.findByPk(log.entitas_id, { attributes: ['judul_project'] });
                entitas_nama = project ? project.judul_project : 'Upload Project Ditolak';
            } else if (log.tipe_entitas === 'Comment' && log.entitas_id !== 0) {
                const comment = await Comment.findByPk(log.entitas_id, { attributes: ['komentar'] });
                entitas_nama = comment ? `Komentar: "${comment.komentar.substring(0, 30)}..."` : 'Komentar Terhapus';
            }
            return {
                ...log.toJSON(),
                entitas_nama: entitas_nama || 'Percobaan Upload Ditolak'
            };
        }));

        res.status(200).json({ success: true, data: enrichedLogs });
    } catch (error) {
        console.error("❌ Error di getViolationLogs:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// [PERBAIKAN]: Fungsi Hapus Konten Berdasarkan Tipe Pelanggaran
export const updateViolationStatus = async (req, res) => {
    try {
        if (req.user.role_id !== 1) return res.status(403).json({ message: "Akses ditolak." });

        const { id } = req.params;
        const { status } = req.body;

        const log = await ViolationLog.findByPk(id);
        if (!log) return res.status(404).json({ message: "Log tidak ditemukan." });

        // Jika statusnya 'resolved' (tombol hapus ditekan), hapus entitas terkait
        if (status === 'resolved' && log.entitas_id !== 0) {
            if (log.tipe_entitas === 'Project') {
                await Project.destroy({ where: { id: log.entitas_id } });
            } else if (log.tipe_entitas === 'Comment') {
                await Comment.destroy({ where: { id: log.entitas_id } });
            }
        }

        // Setelah entitas dihapus, perbarui status lognya
        await log.update({ status });

        res.status(200).json({ success: true, message: `Status pelanggaran diperbarui dan tindakan telah dieksekusi.` });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
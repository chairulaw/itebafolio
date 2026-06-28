import { Sequelize, Op } from 'sequelize';
import { Project, ViolationLog, User, Like } from '../models/index.js'; 
import { checkProfanity } from '../utils/profanityChecker.js'; 

import jwt from 'jsonwebtoken'; // <--- TAMBAHAN BARU: Wajib di-import

// [PUBLIC/MAHASISWA/ADMIN] GET: Melihat list project 
// [PUBLIC/MAHASISWA/ADMIN] GET: Melihat list project 
export const getProjects = async (req, res) => {
    try {
        const requestUserId = req.query.user_id; 
        const searchKeyword = req.query.q; // <--- TANGKAP KATA KUNCI PENCARIAN DARI URL
        let loggedInUserId = null;
        
        const authHeader = req.headers['authorization'];
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            const decoded = jwt.decode(token);
            if (decoded && decoded.id) {
                loggedInUserId = decoded.id;
            }
        }

        // ==========================================
        // MATA-MATA KITA (Lihat di Terminal VS Code)
        // ==========================================
        console.log("\n--- CEK AKSES HALAMAN PROFIL / EXPLORE ---");
        console.log("1. ID Profil yang sedang dibuka (requestUserId):", requestUserId);
        console.log("2. ID Orang yang sedang login (loggedInUserId):", loggedInUserId);
        console.log("3. Apakah ID cocok?:", Number(loggedInUserId) === Number(requestUserId));
        if (searchKeyword) console.log("🔍 KATA KUNCI PENCARIAN:", searchKeyword);
        // ==========================================

        // Kita siapkan penampung kondisi query kosong
        let kondisiQuery = {};

        // 1. LOGIKA STATUS & USER ID
        if (requestUserId) {
            kondisiQuery.user_id = requestUserId;
            if (loggedInUserId && Number(loggedInUserId) === Number(requestUserId)) {
                // Jangan batasi status, biar Pending juga kelihatan
                console.log("4. Akses Diberikan! (Menampilkan data Pending & Published)");
            } else {
                kondisiQuery.status = 'published';
                console.log("4. Akses Ditolak! (Hanya menampilkan Published)");
            }
        } else {
            kondisiQuery.status = 'published';
            console.log("4. Mode Explore Umum (Hanya menampilkan Published)");
        }

        // 2. LOGIKA PENCARIAN (SEARCH BAR)
        // Jika ada kata kunci, tambahkan filter judul_project ke kondisiQuery
        if (searchKeyword) {
            kondisiQuery.judul_project = {
                [Op.like]: `%${searchKeyword}%` // Op.like mencari teks yang "mirip" atau mengandung kata kunci
            };
        }

        // 3. EKSEKUSI PENCARIAN KE DATABASE
        const projects = await Project.findAll({
            where: kondisiQuery, 
            include: [
                { model: User, attributes: ['nama_user', 'avatar', 'prodi'] },
                { model: Like, attributes: ['user_id'] }
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

        res.status(200).json(projects);
    } catch (error) {
        console.error("❌ ERROR PADA getProjects:", error.message);
        res.status(500).json({ message: error.message });
    }
};

export const getProjectById = async (req, res) => {
    try {
        const project = await Project.findByPk(req.params.id, {
            include: [{
                model: User,
                attributes: ['nama_user', 'avatar']
            }]
        });

        if (!project) {
            return res.status(404).json({ message: "Project tidak ditemukan" });
        }

        project.views += 1;
        await project.save();

        const projectLikes = await Like.findAll({
            where: { project_id: req.params.id },
            attributes: ['user_id']
        });

        const responseData = {
            ...project.toJSON(),
            likes: projectLikes
        };

        res.status(200).json(responseData);
    } catch (error) {
        console.error("Error di getProjectById:", error); 
        res.status(500).json({ message: error.message });
    }
};

// [MAHASISWA] POST: Membuat project baru
export const createProject = async (req, res) => {
    try {
        // --- PROTEKSI API: BLOKIR PENGUNJUNG EKSPLISIT ---
        if (req.user.role_id === 3) {
            return res.status(403).json({ message: "Akses Ditolak! Pengunjung umum tidak diizinkan mengunggah karya." });
        }

        if (req.user.role_id !== 2) {
            return res.status(403).json({ message: "Hanya mahasiswa yang dapat mengunggah karya" });
        }

        const { kategori_id, judul_project, link_project, deskripsi } = req.body;

        const coverPath = req.files?.['cover'] ? req.files['cover'][0].filename : null;
        const highlightFiles = req.files?.['highlight'] ? req.files['highlight'].map(f => f.filename) : [];
        const mediaFiles = req.files?.['additional_media'] ? req.files['additional_media'].map(f => f.filename) : [];

        const highlightString = JSON.stringify(highlightFiles);
        const additionalMediaString = JSON.stringify(mediaFiles);

        // 1. Cek Profanity pada Judul dan Deskripsi
        const textToCheck = `${judul_project} ${deskripsi}`;
        const profanityResult = checkProfanity(textToCheck);

        // 2. Tentukan status project (jika kasar = pending, jika aman = published)
        const projectStatus = profanityResult.isViolating ? 'pending' : 'published';

        // 3. Tetap Simpan Project ke Database
        const newProject = await Project.create({
            user_id: req.user.id,
            kategori_id,
            judul_project,
            link_project,
            deskripsi,
            cover: coverPath,
            highlight: highlightString,
            additional_media: additionalMediaString,
            status: projectStatus 
        });

        // 4. JIKA MELANGGAR: Lapor ke Log Admin
        if (profanityResult.isViolating) {
            const alasanPelanggaran = `Project di-pending otomatis: Mengandung kata ${profanityResult.matchedWords.join(', ')}`;

            await ViolationLog.create({
                tipe_entitas: 'Project',
                entitas_id: newProject.id, 
                user_id: req.user.id,
                alasan: alasanPelanggaran,
                status: 'pending'
            });
        }

        res.status(201).json({
            message: "Project berhasil diunggah",
            data: newProject,
            warning: profanityResult.isViolating ? "Karya Anda sedang ditinjau oleh Admin karena terdeteksi pelanggaran pedoman." : null
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// [MAHASISWA & ADMIN] PUT: Edit project
export const updateProject = async (req, res) => {
    try {
        // --- PROTEKSI API: BLOKIR PENGUNJUNG EKSPLISIT ---
        if (req.user.role_id === 3) {
            return res.status(403).json({ message: "Akses Ditolak! Pengunjung umum tidak diizinkan mengedit karya." });
        }

        const projectId = req.params.id;
        const project = await Project.findByPk(projectId);

        if (!project) return res.status(404).json({ message: "Project tidak ditemukan" });

        if (req.user.role_id !== 1 && project.user_id !== req.user.id) {
            return res.status(403).json({ message: "Akses ditolak: Anda tidak memiliki akses ke project ini" });
        }

        const { kategori_id, judul_project, link_project, deskripsi } = req.body;

        const coverPath = req.files?.['cover'] ? req.files['cover'][0].filename : project.cover;

        const highlightString = req.files?.['highlight']
            ? JSON.stringify(req.files['highlight'].map(f => f.filename))
            : project.highlight;

        const additionalMediaString = req.files?.['additional_media']
            ? JSON.stringify(req.files['additional_media'].map(f => f.filename))
            : project.additional_media;

        // Cek kembali kata kasar saat update
        const textToCheck = `${judul_project} ${deskripsi}`;
        const profanityResult = checkProfanity(textToCheck);
        
        // --- TAMBAHAN AMAN: Ubah status jika hasil edit malah menjadi kasar ---
        const projectStatus = profanityResult.isViolating ? 'pending' : 'published';

        await Project.update(
            {
                kategori_id,
                judul_project,
                link_project,
                deskripsi,
                cover: coverPath,
                highlight: highlightString,
                additional_media: additionalMediaString,
                status: projectStatus // <-- Memperbarui status
            },
            { where: { id: projectId } }
        );

        // Catat pelanggaran baru jika ditemukan saat mengedit
        if (profanityResult.isViolating) {
            await ViolationLog.create({
                tipe_entitas: 'Project',
                entitas_id: projectId,
                user_id: req.user.id,
                alasan: `Update mengandung kata terlarang: ${profanityResult.matchedWords.join(', ')}`,
                status: 'pending'
            });
        }

        res.status(200).json({ message: "Project berhasil diperbarui" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// [MAHASISWA & ADMIN] DELETE: Hapus project
export const deleteProject = async (req, res) => {
    try {
        // --- PROTEKSI API: BLOKIR PENGUNJUNG EKSPLISIT ---
        if (req.user.role_id === 3) {
            return res.status(403).json({ message: "Akses Ditolak! Pengunjung umum tidak diizinkan menghapus karya." });
        }

        const projectId = req.params.id;
        const project = await Project.findByPk(projectId);

        if (!project) return res.status(404).json({ message: "Project tidak ditemukan" });

        if (req.user.role_id !== 1 && project.user_id !== req.user.id) {
            return res.status(403).json({ message: "Akses ditolak: Anda tidak memiliki akses untuk menghapus project ini" });
        }

        await Project.destroy({ where: { id: projectId } });
        res.status(200).json({ message: "Project berhasil dihapus" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// [MAHASISWA & PENGUNJUNG] GET: Mengambil total like yang diberikan oleh user tertentu
export const getUserGivenLikes = async (req, res) => {
    try {
        const userId = req.params.userId;
        
        // Menghitung jumlah record di tabel Like di mana user_id adalah user tersebut
        const totalLikes = await Like.count({ 
            where: { user_id: userId } 
        });
        
        res.status(200).json({ total: totalLikes });
    } catch (error) {
        console.error("Error di getUserGivenLikes:", error);
        res.status(500).json({ message: error.message });
    }
};
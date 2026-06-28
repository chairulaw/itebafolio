import bcrypt from 'bcryptjs';
import { User } from '../models/index.js';


// [MAHASISWA & ADMIN] GET: Melihat profil sendiri atau admin melihat semua user
export const getUser = async (req, res) => {
    try {
        if (req.user.role_id === 1) {
            // ADMIN: Bisa melihat semua data mahasiswa (role 2)
            const users = await User.findAll({ where: { role_id: 2 } });
            return res.status(200).json(users);
        } else {
            // MAHASISWA: Hanya bisa melihat data dirinya sendiri
            const user = await User.findByPk(req.user.id);
            if (!user) return res.status(404).json({ message: "User tidak ditemukan" });
            return res.status(200).json(user);
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// [PUBLIC] GET: Melihat profil publik pengguna berdasarkan ID
export const getPublicUserById = async (req, res) => {
    try {
        const userId = req.params.id;
        
        // Cari user berdasarkan ID, tapi KECUALIKAN password dan email (demi keamanan)
        const user = await User.findByPk(userId, {
            attributes: ['id', 'nama_user', 'avatar', 'bio', 'prodi', 'angkatan', 'website', 'role_id'] 
        });

        if (!user) {
            return res.status(404).json({ message: "Pengguna tidak ditemukan" });
        }

        res.status(200).json(user);
    } catch (error) {
        console.error("❌ Error di getPublicUserById:", error.message);
        res.status(500).json({ message: error.message });
    }
};

// Update fungsi updateUser yang sudah ada menjadi seperti ini:
export const updateUser = async (req, res) => {
    try {
        const userId = req.params.id;
        if (req.user.role_id !== 1 && req.user.id !== parseInt(userId)) {
            return res.status(403).json({ message: "Akses ditolak" });
        }

        const { nama_user, nim, prodi, angkatan, bio, website, no_wa } = req.body;

        // Siapkan data yang akan diupdate
        const updateData = { nama_user, nim, prodi, angkatan, bio, website, no_wa };

        // Jika ada file gambar yang diunggah, masukkan nama filenya
        if (req.file) {
            updateData.avatar = req.file.filename;
        }

        await User.update(updateData, { where: { id: userId } });
        res.status(200).json({ message: "Profil berhasil diperbarui" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Tambahkan fungsi baru untuk Ganti Password:
export const changePassword = async (req, res) => {
    try {
        const userId = req.user.id;
        const { newPassword } = req.body;

        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({ message: "Password baru minimal 6 karakter!" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        await User.update({ password: hashedPassword }, { where: { id: userId } });

        res.status(200).json({ message: "Kata sandi berhasil diperbarui!" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

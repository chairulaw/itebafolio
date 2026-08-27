import bcrypt from "bcryptjs";
import { User, Role } from "../models/index.js"; // Import dari index.js models
import { generateAccessToken } from "../utils/generateToken.js";

export const register = async (req, res) => {
    const { nama_user, email, password, nim, prodi, angkatan, email_kontak, no_wa } = req.body;

    try {
        let assignedRoleId = 3; // Default: 3 (Pengunjung)

        if (nim && prodi) {
            // Validasi domain resmi ITEBA
            if (!email.endsWith('@student.iteba.ac.id')) {
                return res.status(400).json({ message: "Mahasiswa wajib menggunakan email @student.iteba.ac.id" });
            }
            
            // Validasi email kontak wajib untuk mahasiswa
            if (!email_kontak) {
                return res.status(400).json({ message: "Email Kontak (Publik) wajib diisi oleh mahasiswa!" });
            }
            assignedRoleId = 2; // Role Mahasiswa
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await User.create({
            nama_user,
            email,
            password: hashedPassword,
            nim: nim || null,     
            prodi: prodi || null, 
            angkatan: angkatan || null, 
            email_kontak: email_kontak || null,
            no_wa: no_wa || null,
            role_id: assignedRoleId
        });

        res.status(201).json({ message: "Registrasi berhasil!" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Cari user berdasarkan email
        const user = await User.findOne({ where: { email } });
        if (!user) return res.status(404).json({ message: "Akun tidak ditemukan!" });

        // 2. Cek apakah password cocok
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Password salah!" });

        // 3. Jika berhasil, buat Token JWT
        const token = generateAccessToken(user);

        // 4. Kirim respon berisi token dan data dasar user
        res.status(200).json({
            message: "Login berhasil!",
            token: token,
            user: {
                id: user.id,
                nama_user: user.nama_user,
                role_id: user.role_id
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
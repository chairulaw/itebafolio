import bcrypt from "bcryptjs";
import { User, Role } from "../models/index.js"; // Import dari index.js models
import { generateAccessToken } from "../utils/generateToken.js";
import nodemailer from  'nodemailer';

// === REGISTER (PENDAFTARAN) ===
export const register = async (req, res) => {
    const { nama_user, email, password, nim, prodi, angkatan, email_kontak, no_wa } = req.body;

    try {
        let assignedRoleId = 3; // Default: 3 (Pengunjung)

        if (nim && prodi) {
            // [PERUBAHAN]: Validasi ganti ke @student.ac.id
            if (!email.endsWith('@student.iteba.ac.id')) {
    return res.status(400).json({ message: "Mahasiswa wajib menggunakan email @student.iteba.ac.id" });
}
            
            if (!email_kontak) {
                return res.status(400).json({ message: "Email Kontak (Publik) wajib diisi oleh mahasiswa!" });
            }
            assignedRoleId = 2; 
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

// === LOGIN (MASUK) ===
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Cari user berdasarkan email
        const user = await User.findOne({ where: { email } });
        if (!user) return res.status(404).json({ message: "Akun tidak ditemukan!" });

        // 2. Cek apakah password cocok
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Password salah!" });

        // --- TAMBAHAN LOGIKA OTP KHUSUS MAHASISWA (ROLE 2) ---
        if (user.role_id === 2) {
            const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit acak
            const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // Kedaluwarsa 5 menit

            await User.update({ otp_code: otp, otp_expires: otpExpires }, { where: { id: user.id } });

            // Kirim Email OTP menggunakan Outlook Kampus
            const transporter = nodemailer.createTransport({
                host: 'smtp.office365.com',
                port: 587,
                secure: false,
                auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
                tls: { ciphers: 'SSLv3' }
            });

            await transporter.sendMail({
                from: `"Keamanan ITEBAFolio" <${process.env.EMAIL_USER}>`,
                to: user.email,
                subject: "Kode Verifikasi Login ITEBAFolio",
                text: `Halo ${user.nama_user},\n\nKode OTP Anda adalah: ${otp}\n\nKode ini akan kedaluwarsa dalam 5 menit. Jangan berikan kepada siapapun.`
            });

            // Hentikan proses, beritahu frontend untuk membuka form OTP
            return res.status(200).json({ 
                requiresOtp: true, 
                email: user.email,
                message: "Kode OTP telah dikirim ke email mahasiswa Anda." 
            });
        }
        // --- AKHIR TAMBAHAN OTP ---

        // 3. Jika berhasil (Hanya Admin & Pengunjung yang sampai sini), buat Token JWT
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

// --- FUNGSI BARU: VERIFIKASI OTP ---
export const verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;
        
        const user = await User.findOne({ where: { email } });
        if (!user) return res.status(404).json({ message: "User tidak ditemukan!" });

        // Cek kecocokan dan masa berlaku OTP
        if (user.otp_code !== otp) return res.status(400).json({ message: "Kode OTP salah!" });
        if (new Date() > new Date(user.otp_expires)) return res.status(400).json({ message: "Kode OTP sudah kedaluwarsa!" });

        // Bersihkan OTP dari database setelah berhasil
        await User.update({ otp_code: null, otp_expires: null }, { where: { id: user.id } });

        // Generate JWT Token persis seperti login biasa
        const token = generateAccessToken(user);

        res.status(200).json({ 
            message: "Verifikasi berhasil!",
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

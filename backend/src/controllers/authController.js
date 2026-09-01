import bcrypt from "bcryptjs";
import { User, Role } from "../models/index.js"; // Import dari index.js models
import { generateAccessToken } from "../utils/generateToken.js";
import { generateOtp, getOtpExpiry } from "../utils/otp.js";
import { sendOtpEmail } from "../utils/mailer.js";

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
        const otpCode = generateOtp();

        await User.create({
            nama_user,
            email,
            password: hashedPassword,
            nim: nim || null,
            prodi: prodi || null,
            angkatan: angkatan || null,
            email_kontak: email_kontak || null,
            no_wa: no_wa || null,
            role_id: assignedRoleId,
            is_verified: false,
            otp_code: otpCode,
            otp_expires_at: getOtpExpiry()
        });

        try {
            await sendOtpEmail(email, otpCode);
        } catch (mailError) {
            console.error("Gagal mengirim email OTP:", mailError.message);
        }

        res.status(201).json({ message: "Registrasi berhasil! Cek email Anda untuk kode verifikasi.", email });
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

        // 2b. Cek apakah akun sudah diverifikasi via OTP email
        if (!user.is_verified) {
            return res.status(403).json({
                message: "Akun belum diverifikasi. Silakan cek email Anda untuk kode OTP.",
                needVerification: true,
                email: user.email
            });
        }

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

export const verifyOtp = async (req, res) => {
    try {
        const { email, otp_code } = req.body;

        const user = await User.findOne({ where: { email } });
        if (!user) return res.status(404).json({ message: "Akun tidak ditemukan!" });

        if (user.is_verified) {
            return res.status(400).json({ message: "Akun sudah terverifikasi." });
        }

        if (!user.otp_code || user.otp_code !== otp_code) {
            return res.status(400).json({ message: "Kode OTP salah!" });
        }

        if (!user.otp_expires_at || new Date() > new Date(user.otp_expires_at)) {
            return res.status(400).json({ message: "Kode OTP sudah kedaluwarsa. Silakan minta kode baru." });
        }

        user.is_verified = true;
        user.otp_code = null;
        user.otp_expires_at = null;
        await user.save();

        res.status(200).json({ message: "Verifikasi berhasil! Silakan masuk." });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const resendOtp = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ where: { email } });
        if (!user) return res.status(404).json({ message: "Akun tidak ditemukan!" });

        if (user.is_verified) {
            return res.status(400).json({ message: "Akun sudah terverifikasi." });
        }

        const otpCode = generateOtp();
        user.otp_code = otpCode;
        user.otp_expires_at = getOtpExpiry();
        await user.save();

        await sendOtpEmail(email, otpCode);

        res.status(200).json({ message: "Kode OTP baru telah dikirim ke email Anda." });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
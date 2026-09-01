import bcrypt from "bcryptjs";
import { User, Role } from "../models/index.js"; 
import { generateAccessToken } from "../utils/generateToken.js";
import { generateOtp, getOtpExpiry } from "../utils/otp.js";
import { sendOtpEmail } from "../utils/mailer.js";

export const register = async (req, res) => {
    const { nama_user, email, password, nim, prodi, angkatan, email_kontak, no_wa } = req.body;

    try {
        let assignedRoleId = 3; 

        if (nim && prodi) {
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
            role_id: assignedRoleId,
            is_verified: true, // Otomatis terverifikasi karena OTP dipindah ke Login
            otp_code: null,
            otp_expires_at: null
        });

        res.status(201).json({ message: "Registrasi berhasil! Silakan masuk dengan akun Anda.", email });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ where: { email } });
        if (!user) return res.status(404).json({ message: "Akun tidak ditemukan!" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Password salah!" });

        // Generate dan Kirim OTP setiap kali berhasil memasukkan password
        const otpCode = generateOtp();
        user.otp_code = otpCode;
        user.otp_expires_at = getOtpExpiry();
        await user.save();

        try {
            await sendOtpEmail(email, otpCode);
        } catch (mailError) {
            console.error("Gagal mengirim email OTP:", mailError.message);
            return res.status(500).json({ message: "Gagal mengirim OTP ke email Anda." });
        }

        res.status(200).json({
            message: "Kode OTP telah dikirim. Silakan cek email Anda.",
            needVerification: true,
            email: user.email
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

        if (!user.otp_code || user.otp_code !== otp_code) {
            return res.status(400).json({ message: "Kode OTP salah!" });
        }

        if (!user.otp_expires_at || new Date() > new Date(user.otp_expires_at)) {
            return res.status(400).json({ message: "Kode OTP sudah kedaluwarsa. Silakan minta kode baru." });
        }

        // OTP Valid -> Bersihkan OTP dan Terbitkan Token JWT
        user.otp_code = null;
        user.otp_expires_at = null;
        await user.save();

        const token = generateAccessToken(user);

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

export const resendOtp = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ where: { email } });
        if (!user) return res.status(404).json({ message: "Akun tidak ditemukan!" });

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
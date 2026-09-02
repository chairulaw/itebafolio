import nodemailer from "nodemailer";
import { OTP_EXPIRY_MINUTES } from "./otp.js";

// Konfigurasi kurir Nodemailer menggunakan Gmail SMTP
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, // Alamat Gmail Anda
        pass: process.env.EMAIL_PASS  // 16 digit Sandi Aplikasi
    }
});

export const sendOtpEmail = async (to, otpCode) => {
    try {
        await transporter.sendMail({
            from: `"ITEBAFolio" <${process.env.EMAIL_USER}>`,
            to,
            subject: "Kode Verifikasi Akun ITEBAFolio",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 440px; margin: 0 auto; color: #1a1a1a;">
                    <h2 style="margin-bottom: 4px;">Verifikasi Akun ITEBAFolio</h2>
                    <p>Gunakan kode berikut untuk memverifikasi akun Anda:</p>
                    <p style="font-size: 32px; font-weight: bold; letter-spacing: 8px; margin: 24px 0;">${otpCode}</p>
                    <p>Kode ini berlaku selama ${OTP_EXPIRY_MINUTES} menit. Jangan bagikan kode ini kepada siapa pun.</p>
                    <p style="color: #888; font-size: 12px; margin-top: 32px;">Jika Anda tidak merasa mendaftar di ITEBAFolio, abaikan email ini.</p>
                </div>
            `
        });
        console.log(`Email OTP berhasil dikirim ke: ${to}`);
    } catch (error) {
        console.error("Gagal mengirim email via Nodemailer:", error);
        throw new Error("Sistem gagal mengirimkan OTP. Pastikan konfigurasi email valid.");
    }
};
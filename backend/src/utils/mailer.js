import { Resend } from "resend";
import { OTP_EXPIRY_MINUTES } from "./otp.js";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendOtpEmail = async (to, otpCode) => {
    await resend.emails.send({
        from: process.env.EMAIL_FROM,
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
};

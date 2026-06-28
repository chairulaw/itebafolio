import jwt from "jsonwebtoken";

export const generateAccessToken = (user) => {
    return jwt.sign(
        {
            id: user.id,
            role_id: user.role_id // Disesuaikan dengan database ITEBAFolio
        },
        process.env.JWT_SECRET, // Pastikan ini sama dengan di file .env Anda
        { expiresIn: "1d" } // Berlaku untuk 1 hari (bisa diubah ke "7d" jika mau)
    );
};

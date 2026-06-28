import bcrypt from "bcrypt";
import { User } from "./src/models/index.js";

const generateAdmin = async () => {
    try {
        console.log("Memulai proses pembuatan akun Admin...");

        // 1. Enkripsi password 'admin123'
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash("admin123", salt);

        // 2. Simpan ke database menggunakan model Sequelize
        await User.create({
            role_id: 1, // 1 = Role Admin
            nama_user: "Super Admin",
            nim: "ADMIN001",
            email: "admin@iteba.ac.id",
            password: hashPassword
        });

        console.log("✅ SUKSES: Akun Admin berhasil ditambahkan ke database!");
        console.log("Silakan login menggunakan email: admin@iteba.ac.id | pass: admin123");
        
        // Mematikan script setelah selesai
        process.exit(0); 
    } catch (error) {
        console.error("❌ GAGAL: Terjadi kesalahan saat membuat admin.");
        console.error(error.message);
        process.exit(1);
    }
};

generateAdmin();
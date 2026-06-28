import db from "./src/config/database.js";
import { Role } from "./src/models/index.js";

const seedRoles = async () => {
    try {
        await db.authenticate();
        console.log("Mencoba koneksi database...");
        
        // Memasukkan data default ke tabel roles
        await Role.bulkCreate([
            { id: 1, nama_role: "admin" },
            { id: 2, nama_role: "mahasiswa" }
        ], { ignoreDuplicates: true });

        console.log("✅ Berhasil! Data Role (admin & mahasiswa) sudah ditambahkan ke database.");
        process.exit();
    } catch (error) {
        console.error("❌ Gagal memasukkan data:", error);
        process.exit(1);
    }
};

seedRoles();

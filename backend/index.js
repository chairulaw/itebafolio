import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// Import Konfigurasi Database & Models
// import db from "./src/config/database.js";
import "./src/models/index.js"; // Memuat semua model agar dikenali oleh Sequelize

// routes
import authRoutes from "./src/routes/authRoutes.js";
import userRoutes from "./src/routes/userRoutes.js";
import projectRoutes from "./src/routes/projectRoutes.js";
import adminRoutes from "./src/routes/adminRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// --- SINKRONISASI DATABASE-- -
// (async () => {
//     try {
//         await db.authenticate();
//         console.log("Database Connected...");

//         // Mode ALTER dihidupkan sementara untuk menambahkan kolom 'avatar'
//         // dan mengubah null constraint pada prodi & angkatan
//         await db.sync({ alter: true });
//         console.log("Tabel berhasil di-alter/diperbarui!");
//     } catch (error) {
//         console.error("Connection error:", error);
//     }
// })();

// --- MIDDLEWARE ---
app.use(cors());
app.use(express.json());

// Membuka akses folder uploads agar gambar profil bisa diakses oleh Frontend
app.use("/uploads", express.static("public/uploads"));

// --- ROUTES ---
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/admin", adminRoutes);

app.listen(PORT, () => {
    console.log(`Server running on PORT ${PORT}`);
});
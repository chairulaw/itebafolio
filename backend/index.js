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
import categoryRoutes from "./src/routes/categoryRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// --- SINKRONISASI DATABASE-- -
// (async () => {
//     try {
//         await db.sync({ alter: true });
//         console.log("Database berhasil disinkronisasi!");
//     } catch (error) {
//         console.error("Gagal sinkronisasi:", error);
//     }
// })();

// --- MIDDLEWARE ---
app.use(cors());

// Tambahkan limit: '200mb' di dalam kurung
app.use(express.json({ limit: '500mb' }));
app.use(express.urlencoded({ limit: '500mb', extended: true }));

// Membuka akses folder uploads agar gambar profil bisa diakses oleh Frontend
app.use("/uploads", express.static("public/uploads"));


// --- HEALTH CHECK ---
app.get("/api/health", (req, res) => {
    res.json({ status: "ok", uptime: process.uptime() });
});

// --- ROUTES ---
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/categories", categoryRoutes);

app.listen(PORT, () => {
    console.log(`Server running on PORT ${PORT}`);
});
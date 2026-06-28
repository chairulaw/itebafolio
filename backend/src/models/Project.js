import { Sequelize } from "sequelize";
import db from "../config/database.js";

const { DataTypes } = Sequelize;

const Project = db.define("projects", {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },

    // DIKEMBALIKAN KE INTEGER: Wajib sama dengan tipe data ID di tabel Categories
    kategori_id: { type: DataTypes.INTEGER, allowNull: false },

    judul_project: { type: DataTypes.STRING(255), allowNull: false },
    link_project: { type: DataTypes.STRING(255) },
    deskripsi: { type: DataTypes.TEXT },
    cover: { type: DataTypes.STRING(255) },
    highlight: { type: DataTypes.TEXT },
    additional_media: { type: DataTypes.TEXT },
    views: { type: DataTypes.INTEGER, defaultValue: 0 },
    status: { 
        type: DataTypes.ENUM('published', 'pending'), 
        defaultValue: 'published' 
    }
}, {
    freezeTableName: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

export default Project;

// --- SINKRONISASI DATABASE ---
// Biarkan ini menyala SEKALI SAJA agar kolom 'status' berhasil masuk
// (async () => {
//     try {
//         await db.authenticate();
//         await db.sync({ alter: true });
//         console.log("Tabel berhasil di-alter/diperbarui tanpa error!");
//     } catch (error) {
//         console.error("Connection error:", error);
//     }
// })();
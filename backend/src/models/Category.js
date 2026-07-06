import { Sequelize } from "sequelize";
import db from "../config/database.js";

const { DataTypes } = Sequelize;

const Category = db.define("categories", {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    nama_kategori: { type: DataTypes.STRING(100), allowNull: false },
    
    // --- TAMBAHAN BARU UNTUK FITUR FILTER DINAMIS ---
    slug: { type: DataTypes.STRING(150), allowNull: true },
    deskripsi: { type: DataTypes.TEXT, allowNull: true },
    image: { type: DataTypes.STRING(255), allowNull: true },
    tipe: { 
        type: DataTypes.ENUM('kategori', 'prodi', 'spesial'), 
        defaultValue: 'kategori' 
    }
}, {
    timestamps: false
});

export default Category;
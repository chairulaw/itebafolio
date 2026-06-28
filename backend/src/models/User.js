import { Sequelize } from "sequelize";
import db from "../config/database.js";

const { DataTypes } = Sequelize;

const User = db.define("users", {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    role_id: { type: DataTypes.INTEGER, allowNull: false },
    email: { type: DataTypes.STRING(255), unique: true, allowNull: false },
    password: { type: DataTypes.STRING(255), allowNull: false },
    nim: { type: DataTypes.STRING(20), unique: true, allowNull: true },
    nama_user: { type: DataTypes.STRING(100), allowNull: false },

    // UBAH: allowNull menjadi true agar registrasi minimalis bisa berjalan
    prodi: { type: DataTypes.STRING(100), allowNull: true },
    angkatan: { type: DataTypes.INTEGER, allowNull: true },

    bio: { type: DataTypes.STRING(500), allowNull: true },
    website: { type: DataTypes.STRING(255), allowNull: true },
    no_wa: { type: DataTypes.STRING(20), allowNull: true },

    // TAMBAH: Kolom avatar untuk menyimpan nama file foto profil
    avatar: { type: DataTypes.STRING(255), allowNull: true }
}, {
    freezeTableName: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

export default User;
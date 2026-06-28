import { Sequelize } from "sequelize";
import db from "../config/database.js";

const { DataTypes } = Sequelize;

const Role = db.define("roles", {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    nama_role: { type: DataTypes.STRING(50), unique: true, allowNull: false }
}, {
    timestamps: false // Karena di tabel SQL tidak ada created_at/updated_at untuk role
});

export default Role;

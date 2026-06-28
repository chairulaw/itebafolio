import { Sequelize } from "sequelize";
import db from "../config/database.js";

const { DataTypes } = Sequelize;

const Category = db.define("categories", {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    nama_kategori: { type: DataTypes.STRING(100), allowNull: false }
}, {
    timestamps: false
});

export default Category;

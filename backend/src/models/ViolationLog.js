import { Sequelize } from "sequelize";
import db from "../config/database.js";

const { DataTypes } = Sequelize;

const ViolationLog = db.define("violation_logs", {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    tipe_entitas: { type: DataTypes.ENUM('Project', 'User Profile', 'Comment'), allowNull: false },
    entitas_id: { type: DataTypes.INTEGER, allowNull: false },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    alasan: { type: DataTypes.STRING(255), allowNull: false },
    status: { type: DataTypes.ENUM('pending', 'resolved', 'dismissed'), defaultValue: 'pending' }
}, {
    freezeTableName: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

export default ViolationLog;

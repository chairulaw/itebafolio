import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

// Mengambil data dari variabel di .env
const dbName = process.env.DB_NAME || "itebafolio";
const dbUser = process.env.DB_USER || "root";
const dbPass = process.env.DB_PASS || "";
const dbHost = process.env.DB_HOST || "localhost";

// Membuat instance koneksi Sequelize
const db = new Sequelize(dbName, dbUser, dbPass, {
    host: dbHost,
    dialect: "mysql", // Karena kita menggunakan MySQL
    logging: false,   // Set ke 'console.log' jika ingin melihat query SQL yang berjalan di terminal
    timezone: "+07:00", // Menyesuaikan timezone (opsional, disesuaikan dengan WIB)
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
});

export default db;

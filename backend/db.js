import pkg from "pg";
import dotenv from "dotenv";
const { Pool } = pkg;

dotenv.config();
console.log("1");
const pool = new Pool(
  process.env.DATABASE_URL
    ? { connectionString: process.env.DATABASE_URL }
    : {
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_DATABASE,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT,
      }
);

pool.on("connect", () => {
  console.log("✅ Database connection established");
});

export default pool;

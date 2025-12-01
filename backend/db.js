// backend/db.js
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

// 🔊 Debug logs so we SEE what Vercel is using
console.log(">>> [db.js] NODE_ENV:", process.env.NODE_ENV);
console.log(">>> [db.js] DATABASE_URL defined? ", !!process.env.DATABASE_URL);
console.log(">>> [db.js] DB_HOST:", process.env.DB_HOST);

const isProduction = process.env.NODE_ENV === "production";

// Base config: URL in prod, individual fields in dev
const baseConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
    }
  : {
      user: process.env.DB_USER,
      host: process.env.DB_HOST,
      database: process.env.DB_DATABASE,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT,
    };

// FINAL config (we **force safe SSL** in prod)
const finalConfig = {
  ...baseConfig,
  ssl: isProduction
    ? { rejectUnauthorized: false } // accept self-signed certs
    : false, // for local dev with non-SSL postgres
};

console.log(">>> [db.js] Final PG config:", JSON.stringify(finalConfig, null, 2));

const pool = new Pool(finalConfig);

pool.on("connect", () => {
  console.log("✅ [db.js] Database connection established");
});

export default pool;

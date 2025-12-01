// backend/db.js
import pkg from "pg";
import dotenv from "dotenv";

const { Pool } = pkg;

dotenv.config();

// Are we running in production? (Vercel sets NODE_ENV=production by default)
const isProduction = process.env.NODE_ENV === "production";

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

const pool = new Pool({
  ...baseConfig,
  // In production, DB requires SSL, but its cert is self-signed → ignore cert verification
  ssl: isProduction
    ? { rejectUnauthorized: false }
    : false, // local dev: no SSL if your local DB doesn’t use SSL
});

pool.on("connect", () => {
  console.log("✅ Database connection established");
});

export default pool;

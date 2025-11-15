import pool from "../db.js";

const createRefreshTokensTable = async () => {
  const queryText = `CREATE TABLE IF NOT EXISTS refresh_tokens (
  id SERIAL PRIMARY KEY,
  token VARCHAR(500) NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  revoked BOOLEAN DEFAULT FALSE
);`
  
   try {
    await pool.query(queryText);
    console.log("✅ Refresh tokens table created if not exists");
  } catch (error) {
    console.error("❌ Error creating refresh tokens table:", error);
    throw error;
  }
};

export default createRefreshTokensTable;



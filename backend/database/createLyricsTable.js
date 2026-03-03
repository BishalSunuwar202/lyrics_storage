import pool from "../db.js";


const createLyricsTable = async () => {
  const queryText = `CREATE TABLE IF NOT EXISTS lyrics (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    writer_name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('Bhajan', 'Koras', 'Other')),
    number VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved')),
    submitted_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  )`;

  try {
    await pool.query(queryText);
    console.log("✅ Lyrics table created if not exists");
  } catch (error) {
    console.error("❌ Error creating lyrics table:", error);
    throw error; // Re-throw to prevent server from starting if table creation fails
  }
};


export default createLyricsTable
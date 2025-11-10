import pool from "../db.js";

const createSessionTable = async () => {
  // This is the schema that connect-pg-simple expects
  const queryText = `CREATE TABLE IF NOT EXISTS session (
    sid VARCHAR NOT NULL COLLATE "default",
    sess JSON NOT NULL,
    expire TIMESTAMP(6) NOT NULL,
    CONSTRAINT session_pkey PRIMARY KEY (sid) NOT DEFERRABLE INITIALLY IMMEDIATE
  )
  WITH (OIDS=FALSE);
  
  CREATE INDEX IF NOT EXISTS IDX_session_expire ON session(expire);`;

  try {
    await pool.query(queryText);
    console.log("✅ Session table created if not exists");
  } catch (error) {
    console.error("❌ Error creating session table:", error);
    throw error; // Re-throw to prevent server from starting if table creation fails
  }
};

export default createSessionTable;



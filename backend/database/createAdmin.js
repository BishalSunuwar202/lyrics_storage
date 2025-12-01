import pool from "../db.js";
import bcrypt from "bcryptjs";

const createAdmin = async () => {
  const adminQueryText =  `CREATE TABLE IF NOT EXISTS admin (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
)`
    try {
        const plain = "spaceX202@";
const hash = await bcrypt.hash(plain, 10);
        await pool.query(adminQueryText)
        console.log("admin table created if not existed")
    } catch(err) {
        console.log("error while creating admin table", err)
        throw err
    }

}
export default createAdmin;
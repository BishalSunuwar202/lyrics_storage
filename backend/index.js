import express from 'express';
import cors from 'cors';
// import helmet from 'helmet';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import lyricsRoutes from './routes/lyrics.js';
import pool from './db.js';
import createLyricsTable from './database/createLyricsTable.js';
import createRefreshTokensTable from './database/createRefreshTokensTable.js';
import createAdmin from './database/createAdmin.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

//app.use(helmet());
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true // Enable credentials for sessions
}));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/lyrics', lyricsRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

//testing postgress connection
app.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT current_database()");
    res.send(`the database name is ${result.rows[0].current_database}`);
  } catch (error) {
    console.error("Error testing postgres connection:", error);
    res.status(500).json({ error: "Error testing postgres connection" });
  }
});

// Initialize database tables and start server
const startServer = async () => {
  try {
    // Create tables before starting server
    // Create admin table first since refresh_tokens references it
    await createAdmin();
    await createLyricsTable();
    await createRefreshTokensTable();
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to initialize database tables:", error);
    process.exit(1); // Exit if table creation fails
  }
};

startServer();

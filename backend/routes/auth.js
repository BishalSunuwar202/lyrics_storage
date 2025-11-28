import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../db.js';
import { loginSchema } from '../validation/schemas.js';
import { validate } from '../middleware/validate.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();



router.post(
  '/login',
  validate(loginSchema),
  async (req, res) => {
    const { email, password } = req.body;

    try {
      const result = await pool.query(
        'SELECT * FROM admin WHERE email = $1',
        [email]
      );

      if (result.rows.length === 0) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const user = result.rows[0];

      const isPasswordValid = await bcrypt.compare(password, user.password_hash);
      console.log(isPasswordValid)
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const accessToken = jwt.sign(
        { id: user.id, role: 'admin' },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '15m' }
      );
      const refreshToken = jwt.sign(
        { id: user.id, role: 'admin' },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRY || '1d' }
      );

      //hasing the refresh token before sending it to the database table 
      const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
      const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24);

      // TODO: console.log('refreshToken:', hashedRefreshToken);
      // ?console.log('expiresAt:', expiresAt);
      // *console.log('user.id:', user.id);
      // !set the refresh token in the refresh_tokens table
      await pool.query(
        `INSERT INTO refresh_tokens (user_id, hashed_token, expires_at, revoked) VALUES ($1, $2, $3, false)`,
        [user.id, hashedRefreshToken, expiresAt]
      );

      //set the cookie 
      const isProd = process.env.NODE_ENV === 'production';
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: 'Strict',
        maxAge: 24 * 60 * 60 * 1000   // 1 day in milliseconds
      });
      
      //send response to the client
     return res.status(200).json({
        accessToken, 
        user: {
          id: user.id,
          email: user.email,
          role: 'admin'
        },
        message: 'User logged in successfully'  
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Server error during login' });
    }
  }
);

/**
 * REFRESH TOKEN route
 */
router.post('/refresh-token', async (req, res) => {
  const rawRefreshToken = req.cookies?.refreshToken;
  if (!rawRefreshToken) {
    return res.status(401).json({ error: 'Refresh token missing' });
  }

  try {
    // 1. Verify refresh token signature
    const payload = jwt.verify(rawRefreshToken, process.env.REFRESH_TOKEN_SECRET);
    const userId = payload.id;

    // 2. Fetch tokens for user
    const result = await pool.query(
      `SELECT * FROM refresh_tokens WHERE user_id = $1`,
      [userId]
    );
    const rows = result.rows;

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Refresh token not found' });
    }

    // 3. Find a valid token row (not revoked, not expired, matches hash)
    const validRow = rows.find(row => 
      !row.revoked &&
      row.expires_at > new Date() &&
      bcrypt.compareSync(rawRefreshToken, row.hashed_token)
    );

    if (!validRow) {
      return res.status(401).json({ error: 'Refresh token invalid or expired' });
    }

    // 4. Issue new access token
    const newAccessToken = jwt.sign(
      { id: userId, role: payload.role || 'admin' },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '15m' }
    );

    // (Optional) Rotate refresh token: revoke old one, insert new one, set new cookie
    // For now, reuse old refresh token

    return res.status(200).json({
      accessToken: newAccessToken,
      message: 'Token refreshed successfully'
    });

  } catch (err) {
    console.error('Refresh token error:', err);
    return res.status(403).json({ error: 'Invalid or expired refresh token' });
  }
});



export default router;

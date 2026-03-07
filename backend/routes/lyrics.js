import express from 'express';
import pool from '../db.js';
import { authenticateToken, isAdmin } from '../middleware/auth.js';
import { lyricSchema, lyricUpdateSchema } from '../validation/schemas.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

router.get('/', async (req, res) => {
  const { page = 1, limit = 10, category, search } = req.query;
  //console.log(typeof(page))
  //console.log(category)

 

  const offset = (Number(page) - 1) * Number(limit);

  try {
    let query = `SELECT * FROM lyrics`;
    const queryParams = [];
    let paramCount = 1;
    const conditions = [`status = 'approved'`];

    if (category) {
      conditions.push(`category = $${paramCount}`);
      queryParams.push(category);
      paramCount++;
    }

    if (search) {
      conditions.push(`(
        title ILIKE $${paramCount} OR
        writer_name ILIKE $${paramCount} OR
        content ILIKE $${paramCount}
      )`);
      queryParams.push(`%${search}%`);
      paramCount++;
    }

    query += ` WHERE ${conditions.join(' AND ')}`;
    query += ` ORDER BY created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    queryParams.push(limit, offset);

    const result = await pool.query(query, queryParams);

    // Build count query with same conditions
    let countQuery = `SELECT COUNT(*) FROM lyrics`;
    const countConditions = [`status = 'approved'`];
    let countParamCount = 1;

    if (category) {
      countConditions.push(`category = $${countParamCount}`);
      countParamCount++;
    }

    if (search) {
      countConditions.push(`(
        title ILIKE $${countParamCount} OR
        writer_name ILIKE $${countParamCount} OR
        content ILIKE $${countParamCount}
      )`);
      countParamCount++;
    }

    countQuery += ` WHERE ${countConditions.join(' AND ')}`;

    const countParams = [];
    if (category) countParams.push(category);
    if (search) countParams.push(`%${search}%`);

    const countResult = await pool.query(countQuery, countParams);
    //console.log("resultcount", countResult)

    res.json({
      lyrics: result.rows,
      total: parseInt(countResult.rows[0].count),
      page: parseInt(page),
      totalPages: Math.ceil(countResult.rows[0].count / limit)
    });
  } catch (error) {
    
    console.error('Error fetching lyrics:', error);
    console.log('stack', error.stack)
    res.status(500).json({ error: 'Server error fetching lyrics' });
  }
});

router.get('/pending', authenticateToken, isAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM lyrics WHERE status = 'pending' ORDER BY created_at DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching pending lyrics:', error);
    res.status(500).json({ error: 'Server error fetching pending lyrics' });
  }
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'SELECT * FROM lyrics WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Lyric not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching lyric:', error);
    res.status(500).json({ error: 'Server error fetching lyric' });
  }
});

router.post(
  '/',
  validate(lyricSchema),
  async (req, res) => {
    const { title, writer_name, category, number, content, submitted_by } = req.body;

    try {
      const result = await pool.query(
        `INSERT INTO lyrics (title, writer_name, category, number, content, submitted_by, status)
         VALUES ($1, $2, $3, $4, $5, $6, 'pending')
         RETURNING *`,
        [title, writer_name || '', category, number || '', content, submitted_by || null]
      );

      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error creating lyric:', error);
      res.status(500).json({ error: 'Server error creating lyric' });
    }
  }
);

router.put(
  '/:id',
  authenticateToken,
  isAdmin,
  validate(lyricUpdateSchema),
  async (req, res) => {
    const { id } = req.params;
    const { title, writer_name, category, number, content, status } = req.body;

    try {
      const updates = [];
      const values = [];
      let paramCount = 1;

      if (title) {
        updates.push(`title = $${paramCount}`);
        values.push(title);
        paramCount++;
      }
      if (writer_name !== undefined) {
        updates.push(`writer_name = $${paramCount}`);
        values.push(writer_name);
        paramCount++;
      }
      if (category) {
        updates.push(`category = $${paramCount}`);
        values.push(category);
        paramCount++;
      }
      if (number !== undefined) {
        updates.push(`number = $${paramCount}`);
        values.push(number);
        paramCount++;
      }
      if (content) {
        updates.push(`content = $${paramCount}`);
        values.push(content);
        paramCount++;
      }
      if (status) {
        updates.push(`status = $${paramCount}`);
        values.push(status);
        paramCount++;
      }

      if (updates.length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
      }

      values.push(id);

      const result = await pool.query(
        `UPDATE lyrics SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
        values
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Lyric not found' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error updating lyric:', error);
      res.status(500).json({ error: 'Server error updating lyric' });
    }
  }
);

router.patch('/:id/approve', authenticateToken, isAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `UPDATE lyrics SET status = 'approved' WHERE id = $1 RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Lyric not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error approving lyric:', error);
    res.status(500).json({ error: 'Server error approving lyric' });
  }
});

router.delete('/:id', authenticateToken, isAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'DELETE FROM lyrics WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Lyric not found' });
    }

    res.json({ message: 'Lyric deleted successfully' });
  } catch (error) {
    console.error('Error deleting lyric:', error);
    res.status(500).json({ error: 'Server error deleting lyric' });
  }
});

export default router;

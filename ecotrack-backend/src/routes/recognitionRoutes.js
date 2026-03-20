const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// GET all recognitions
router.get('/', async (req, res) => {
  try {
    const user = req.user;
    
    let whereClause = '';
    let params = [];
    
    if (user.role === 'principal') {
      whereClause = 'WHERE school = $1';
      params = [user.school];
    } else if (user.role === 'beo' && user.block) {
      whereClause = 'WHERE block = $1';
      params = [user.block];
    } else if (user.role === 'deo' && user.district) {
      whereClause = 'WHERE district = $1';
      params = [user.district];
    }
    
    const query = `
      SELECT * FROM recognitions 
      ${whereClause}
      ORDER BY date DESC
    `;
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching recognitions:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET single recognition
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM recognitions WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Recognition not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching recognition:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST create new recognition (State only)
router.post('/', async (req, res) => {
  try {
    const user = req.user;
    
    // Only State officers can create recognitions
    if (user.role !== 'state') {
      return res.status(403).json({ error: 'Only State officers can create recognitions' });
    }
    
    const {
      title, description, recipient, recipient_role,
      school, district, block, date, type, category, image_url
    } = req.body;

    const result = await pool.query(
      `INSERT INTO recognitions 
       (title, description, recipient, recipient_role, school, district, block, 
        date, type, category, image_url, status, likes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       RETURNING *`,
      [title, description, recipient, recipient_role, school, district, block,
       date, type, category, image_url, 'published', 0]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating recognition:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT update recognition (State only)
router.put('/:id', async (req, res) => {
  try {
    const user = req.user;
    
    if (user.role !== 'state') {
      return res.status(403).json({ error: 'Only State officers can update recognitions' });
    }
    
    const { id } = req.params;
    const updates = req.body;
    
    const setClause = Object.keys(updates)
      .map((key, index) => `${key} = $${index + 1}`)
      .join(', ');
    
    const values = [...Object.values(updates), id];
    
    const result = await pool.query(
      `UPDATE recognitions SET ${setClause} WHERE id = $${values.length} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Recognition not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating recognition:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE recognition (State only)
router.delete('/:id', async (req, res) => {
  try {
    const user = req.user;
    
    if (user.role !== 'state') {
      return res.status(403).json({ error: 'Only State officers can delete recognitions' });
    }
    
    const { id } = req.params;
    const result = await pool.query('DELETE FROM recognitions WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Recognition not found' });
    }

    res.json({ message: 'Recognition deleted successfully' });
  } catch (error) {
    console.error('Error deleting recognition:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST like recognition
router.post('/:id/like', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'UPDATE recognitions SET likes = likes + 1 WHERE id = $1 RETURNING likes',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Recognition not found' });
    }

    res.json({ likes: result.rows[0].likes });
  } catch (error) {
    console.error('Error liking recognition:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
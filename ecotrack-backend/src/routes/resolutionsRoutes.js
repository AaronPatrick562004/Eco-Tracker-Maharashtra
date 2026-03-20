const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// GET all resolutions
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM resolutions ORDER BY date DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching resolutions:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET recent resolutions (last 5)
router.get('/recent', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM resolutions ORDER BY date DESC LIMIT 5'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching recent resolutions:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET single resolution
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM resolutions WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Resolution not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching resolution:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST create new resolution (State only)
router.post('/', async (req, res) => {
  try {
    const user = req.user;
    
    // Only State officers can create resolutions
    if (user.role !== 'state') {
      return res.status(403).json({ error: 'Only State officers can create resolutions' });
    }
    
    const {
      title, number, date, department, category,
      description, file_url, file_size, tags, is_new
    } = req.body;

    const result = await pool.query(
      `INSERT INTO resolutions 
       (title, number, date, department, category, description, 
        file_url, file_size, tags, is_new, downloads)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [title, number, date, department, category, description,
       file_url, file_size, tags || [], is_new || false, 0]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating resolution:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT update resolution (State only)
router.put('/:id', async (req, res) => {
  try {
    const user = req.user;
    
    if (user.role !== 'state') {
      return res.status(403).json({ error: 'Only State officers can update resolutions' });
    }
    
    const { id } = req.params;
    const updates = req.body;
    
    const setClause = Object.keys(updates)
      .map((key, index) => `${key} = $${index + 1}`)
      .join(', ');
    
    const values = [...Object.values(updates), id];
    
    const result = await pool.query(
      `UPDATE resolutions SET ${setClause} WHERE id = $${values.length} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Resolution not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating resolution:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE resolution (State only)
router.delete('/:id', async (req, res) => {
  try {
    const user = req.user;
    
    if (user.role !== 'state') {
      return res.status(403).json({ error: 'Only State officers can delete resolutions' });
    }
    
    const { id } = req.params;
    const result = await pool.query('DELETE FROM resolutions WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Resolution not found' });
    }

    res.json({ message: 'Resolution deleted successfully' });
  } catch (error) {
    console.error('Error deleting resolution:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST increment download count
router.post('/:id/download', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'UPDATE resolutions SET downloads = downloads + 1 WHERE id = $1 RETURNING downloads',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Resolution not found' });
    }

    res.json({ downloads: result.rows[0].downloads });
  } catch (error) {
    console.error('Error updating download count:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
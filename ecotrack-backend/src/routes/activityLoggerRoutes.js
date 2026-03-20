const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// GET all activities
router.get('/', async (req, res) => {
  try {
    const user = req.user;
    
    let query = `
      SELECT a.*, s.name as school_name 
      FROM activities a
      LEFT JOIN schools s ON a.school_id = s.id
    `;
    
    let whereClause = '';
    let params = [];
    
    // Role-based filtering
    if (user.role === 'principal') {
      whereClause = ' WHERE s.name = $1';
      params = [user.school];
    } else if (user.role === 'beo' && user.block) {
      whereClause = ' WHERE s.block = $1';
      params = [user.block];
    } else if (user.role === 'deo' && user.district) {
      whereClause = ' WHERE s.district = $1';
      params = [user.district];
    }
    
    query += whereClause + ' ORDER BY a.date DESC';
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET single activity
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT a.*, s.name as school_name 
       FROM activities a
       LEFT JOIN schools s ON a.school_id = s.id
       WHERE a.id = $1`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Activity not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching activity:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST create new activity (Principal only)
router.post('/', async (req, res) => {
  try {
    const user = req.user;
    
    // Only principals can create activities
    if (user.role !== 'principal') {
      return res.status(403).json({ error: 'Only principals can create activities' });
    }
    
    const {
      title, type, school_id, school_name, date,
      students_participated, photos_count, gps_coordinates, status
    } = req.body;

    const result = await pool.query(
      `INSERT INTO activities 
       (title, type, school_id, school_name, date, students_participated, 
        photos_count, gps_coordinates, status, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [title, type, school_id, school_name, date, students_participated || 0,
       photos_count || 0, gps_coordinates, status || 'pending', user.id]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating activity:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT update activity
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const user = req.user;
    
    // Check if activity exists
    const activityCheck = await pool.query('SELECT * FROM activities WHERE id = $1', [id]);
    if (activityCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Activity not found' });
    }
    
    // Build dynamic update query
    const setClause = Object.keys(updates)
      .map((key, index) => `${key} = $${index + 1}`)
      .join(', ');
    
    const values = [...Object.values(updates), id];
    
    const result = await pool.query(
      `UPDATE activities SET ${setClause} WHERE id = $${values.length} RETURNING *`,
      values
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating activity:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT approve activity (BEO/DEO/State)
router.put('/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;
    
    // Check permissions
    if (!['beo', 'deo', 'state'].includes(user.role)) {
      return res.status(403).json({ error: 'Not authorized to approve activities' });
    }
    
    const result = await pool.query(
      `UPDATE activities 
       SET status = 'approved', approved_by = $1, approved_at = NOW() 
       WHERE id = $2 RETURNING *`,
      [user.id, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Activity not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error approving activity:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT reject activity (BEO/DEO/State)
router.put('/:id/reject', async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;
    
    if (!['beo', 'deo', 'state'].includes(user.role)) {
      return res.status(403).json({ error: 'Not authorized to reject activities' });
    }
    
    const result = await pool.query(
      `UPDATE activities SET status = 'rejected' WHERE id = $1 RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Activity not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error rejecting activity:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE activity
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;
    
    // Only State officers can delete activities
    if (user.role !== 'state') {
      return res.status(403).json({ error: 'Only State officers can delete activities' });
    }
    
    const result = await pool.query('DELETE FROM activities WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Activity not found' });
    }

    res.json({ message: 'Activity deleted successfully' });
  } catch (error) {
    console.error('Error deleting activity:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
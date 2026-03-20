const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// GET blocks data
router.get('/blocks', async (req, res) => {
  try {
    const user = req.user;
    
    let query = 'SELECT * FROM blocks';
    let params = [];
    
    if (user.role === 'beo' && user.block) {
      query += ' WHERE name = $1';
      params = [user.block];
    } else if (user.role === 'deo' && user.district) {
      query += ' WHERE district = $1';
      params = [user.district];
    }
    
    query += ' ORDER BY name';
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching blocks:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET compliance data
router.get('/compliance', async (req, res) => {
  try {
    const user = req.user;
    
    let query = `
      SELECT s.name, s.district, s.block, s.compliance,
        COUNT(a.id) as activities_count,
        MAX(a.date) as last_activity
      FROM schools s
      LEFT JOIN activities a ON s.id = a.school_id
    `;
    
    let whereClause = '';
    let params = [];
    
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
    
    query += whereClause + ' GROUP BY s.id ORDER BY s.name';
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching compliance:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
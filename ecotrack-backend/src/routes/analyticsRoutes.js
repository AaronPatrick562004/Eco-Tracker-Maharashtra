const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// GET districts data
router.get('/districts', async (req, res) => {
  try {
    const user = req.user;
    
    let query = 'SELECT * FROM districts';
    let params = [];
    
    if (user.role === 'deo' && user.district) {
      query += ' WHERE name = $1';
      params = [user.district];
    }
    
    query += ' ORDER BY name';
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching districts:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET monthly trends
router.get('/trends', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM monthly_trends ORDER BY year, month_num'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching trends:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET activity types
router.get('/activity-types', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM activity_types');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching activity types:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// ==================== STUDENTS ENDPOINTS ====================

// GET all students
router.get('/students', async (req, res) => {
  try {
    const user = req.user;
    
    let query = 'SELECT * FROM students';
    let params = [];
    
    // Role-based filtering
    if (user.role === 'principal') {
      query += ' WHERE school = $1';
      params = [user.school];
    } else if (user.role === 'beo' && user.block) {
      query += ' WHERE block = $1';
      params = [user.block];
    } else if (user.role === 'deo' && user.district) {
      query += ' WHERE district = $1';
      params = [user.district];
    }
    
    query += ' ORDER BY points DESC';
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET single student
router.get('/students/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM students WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching student:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST create new student
router.post('/students', async (req, res) => {
  try {
    const {
      name, class: studentClass, school, school_id,
      district, block, points, level, rank, status
    } = req.body;

    const result = await pool.query(
      `INSERT INTO students 
       (name, class, school, school_id, district, block, points, level, rank, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [name, studentClass, school, school_id, district, block,
       points || 0, level || 1, rank || 'Bronze', status || 'active']
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating student:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT update student
router.put('/students/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const setClause = Object.keys(updates)
      .map((key, index) => `${key} = $${index + 1}`)
      .join(', ');
    
    const values = [...Object.values(updates), id];
    
    const result = await pool.query(
      `UPDATE students SET ${setClause} WHERE id = $${values.length} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating student:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST add points to student
router.post('/students/:id/points', async (req, res) => {
  try {
    const { id } = req.params;
    const { points } = req.body;
    
    const result = await pool.query(
      `UPDATE students 
       SET points = points + $1, 
           level = floor((points + $1) / 250) + 1
       WHERE id = $2 
       RETURNING *`,
      [points, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error adding points:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE student
router.delete('/students/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;
    
    if (user.role !== 'state') {
      return res.status(403).json({ error: 'Only State officers can delete students' });
    }
    
    const result = await pool.query('DELETE FROM students WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== BADGES ENDPOINTS ====================

// GET all badges
router.get('/badges', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM badges ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching badges:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET single badge
router.get('/badges/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM badges WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Badge not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching badge:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET badges for a specific student
router.get('/students/:id/badges', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      `SELECT b.*, sb.earned_date 
       FROM badges b
       JOIN student_badges sb ON b.id = sb.badge_id
       WHERE sb.student_id = $1
       ORDER BY sb.earned_date DESC`,
      [id]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching student badges:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST award badge to student
router.post('/students/:id/badges', async (req, res) => {
  try {
    const { id } = req.params;
    const { badge_id } = req.body;
    
    // Check if already awarded
    const check = await pool.query(
      'SELECT * FROM student_badges WHERE student_id = $1 AND badge_id = $2',
      [id, badge_id]
    );
    
    if (check.rows.length > 0) {
      return res.status(400).json({ error: 'Badge already awarded to this student' });
    }
    
    await pool.query(
      'INSERT INTO student_badges (student_id, badge_id) VALUES ($1, $2)',
      [id, badge_id]
    );
    
    // Update student badges count
    await pool.query(
      'UPDATE students SET badges_count = badges_count + 1 WHERE id = $1',
      [id]
    );
    
    res.status(201).json({ message: 'Badge awarded successfully' });
  } catch (error) {
    console.error('Error awarding badge:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
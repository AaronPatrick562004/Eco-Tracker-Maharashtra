const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// GET /api/school-portal - All schools with details
router.get('/', async (req, res) => {
  try {
    const user = req.user;
    
    let filterClause = '';
    let params = [];
    let paramIndex = 1;
    
    if (user.role === 'principal') {
      filterClause = `WHERE s.name = $${paramIndex}`;
      params = [user.school];
    } else if (user.role === 'beo' && user.block) {
      filterClause = `WHERE s.block = $${paramIndex}`;
      params = [user.block];
    } else if (user.role === 'deo' && user.district) {
      filterClause = `WHERE s.district = $${paramIndex}`;
      params = [user.district];
    }

    const query = `
      SELECT 
        s.*,
        COUNT(DISTINCT a.id) as total_activities,
        COUNT(DISTINCT CASE WHEN a.status = 'approved' OR a.status = 'verified' THEN a.id END) as approved_activities,
        MAX(a.date) as last_activity_date
      FROM schools s
      LEFT JOIN activities a ON s.id = a.school_id
      ${filterClause}
      GROUP BY s.id
      ORDER BY s.name
    `;
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching schools:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/school-portal/:id - Get single school by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;
    
    const result = await pool.query('SELECT * FROM schools WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'School not found' });
    }
    
    const school = result.rows[0];
    
    // Role-based access check
    if (user.role === 'principal' && school.name !== user.school) {
      return res.status(403).json({ error: 'Access denied' });
    }
    if (user.role === 'beo' && school.block !== user.block) {
      return res.status(403).json({ error: 'Access denied' });
    }
    if (user.role === 'deo' && school.district !== user.district) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    res.json(school);
  } catch (error) {
    console.error('Error fetching school:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/school-portal/stats - Summary stats
router.get('/stats', async (req, res) => {
  try {
    const user = req.user;
    
    let whereClause = '';
    let params = [];
    
    if (user.role === 'principal') {
      whereClause = 'WHERE name = $1';
      params = [user.school];
    } else if (user.role === 'beo' && user.block) {
      whereClause = 'WHERE block = $1';
      params = [user.block];
    } else if (user.role === 'deo' && user.district) {
      whereClause = 'WHERE district = $1';
      params = [user.district];
    }
    
    const query = `
      SELECT 
        COUNT(*) as total_schools,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_schools,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_schools,
        COUNT(CASE WHEN status = 'inactive' THEN 1 END) as inactive_schools
      FROM schools
      ${whereClause}
    `;
    
    const result = await pool.query(query, params);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching school stats:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/school-portal - Create new school
router.post('/', async (req, res) => {
  try {
    const {
      name, udise, district, block, coordinator_name,
      coordinator_phone, coordinator_email, students_count,
      status, compliance
    } = req.body;

    // Check if school with same UDISE already exists
    const existing = await pool.query('SELECT id FROM schools WHERE udise = $1', [udise]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'School with this UDISE code already exists' });
    }

    const result = await pool.query(
      `INSERT INTO schools 
       (name, udise, district, block, coordinator_name, coordinator_phone, 
        coordinator_email, students_count, status, compliance)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [name, udise, district, block, coordinator_name, coordinator_phone,
       coordinator_email, students_count || 0, status || 'active', compliance || 'green']
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating school:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/school-portal/:id - Update school
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const user = req.user;
    
    // Check if school exists
    const schoolCheck = await pool.query('SELECT * FROM schools WHERE id = $1', [id]);
    if (schoolCheck.rows.length === 0) {
      return res.status(404).json({ error: 'School not found' });
    }
    
    // Role-based access check
    const school = schoolCheck.rows[0];
    if (user.role === 'principal' && school.name !== user.school) {
      return res.status(403).json({ error: 'You can only edit your own school' });
    }
    
    // Build dynamic update query
    const setClause = Object.keys(updates)
      .map((key, index) => `${key} = $${index + 1}`)
      .join(', ');
    
    const values = [...Object.values(updates), id];
    
    const result = await pool.query(
      `UPDATE schools SET ${setClause} WHERE id = $${values.length} RETURNING *`,
      values
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating school:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/school-portal/:id - Delete school
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;
    
    // Only State officers can delete schools
    if (user.role !== 'state') {
      return res.status(403).json({ error: 'Only State officers can delete schools' });
    }
    
    const result = await pool.query('DELETE FROM schools WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'School not found' });
    }

    res.json({ message: 'School deleted successfully', school: result.rows[0] });
  } catch (error) {
    console.error('Error deleting school:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
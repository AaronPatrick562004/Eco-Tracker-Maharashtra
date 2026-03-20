const db = require('../config/database');

// Get all schools (filtered by role)
const getSchools = async (req, res) => {
    try {
        const user = req.user;
        let query = 'SELECT * FROM schools';
        let params = [];

        // Apply role-based filtering
        if (user.role === 'principal') {
            query += ' WHERE name = $1';
            params = [user.school];
        } else if (user.role === 'beo' && user.block) {
            query += ' WHERE block = $1';
            params = [user.block];
        } else if (user.role === 'deo' && user.district) {
            query += ' WHERE district = $1';
            params = [user.district];
        }
        // State sees all, no filter

        query += ' ORDER BY name';
        const result = await db.query(query, params);
        res.json(result.rows);
    } catch (error) {
        console.error('Get schools error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = { getSchools };
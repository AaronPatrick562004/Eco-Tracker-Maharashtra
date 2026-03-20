const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// ==================== POSTS ENDPOINTS ====================

// GET all posts
router.get('/posts', async (req, res) => {
  try {
    const user = req.user;
    
    let query = `
      SELECT p.*, 
        (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comments_count,
        u.name as author_name,
        u.role as author_role
      FROM community_posts p
      LEFT JOIN users u ON p.author_id = u.id
    `;
    
    let whereClause = ' WHERE p.status = $1';
    let params = ['published'];
    let paramIndex = 2;
    
    // Role-based filtering
    if (user.role === 'principal') {
      whereClause += ` AND p.school = $${paramIndex}`;
      params.push(user.school);
      paramIndex++;
    } else if (user.role === 'beo' && user.block) {
      whereClause += ` AND p.block = $${paramIndex}`;
      params.push(user.block);
      paramIndex++;
    } else if (user.role === 'deo' && user.district) {
      whereClause += ` AND p.district = $${paramIndex}`;
      params.push(user.district);
    }
    
    // State sees all, including flagged posts for moderation
    if (user.role === 'state') {
      whereClause = ' WHERE 1=1'; // State sees everything
      params = [];
    }
    
    query += whereClause + ' ORDER BY p.pinned DESC, p.created_at DESC';
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET single post
router.get('/posts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      `SELECT p.*, 
        (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comments_count,
        u.name as author_name,
        u.role as author_role
       FROM community_posts p
       LEFT JOIN users u ON p.author_id = u.id
       WHERE p.id = $1`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST create new post
router.post('/posts', async (req, res) => {
  try {
    const user = req.user;
    
    const {
      content, image_url, school, district, block, activity_id
    } = req.body;

    const result = await pool.query(
      `INSERT INTO community_posts 
       (author, author_role, author_id, school, district, block, content, image_url, activity_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [user.name, user.role, user.id, school, district, block,
       content, image_url, activity_id]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT update post
router.put('/posts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const user = req.user;
    
    // Check if post exists
    const postCheck = await pool.query('SELECT * FROM community_posts WHERE id = $1', [id]);
    if (postCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    // Check permissions (author or state)
    if (postCheck.rows[0].author_id !== user.id && user.role !== 'state') {
      return res.status(403).json({ error: 'Not authorized to edit this post' });
    }
    
    const setClause = Object.keys(updates)
      .map((key, index) => `${key} = $${index + 1}`)
      .join(', ');
    
    const values = [...Object.values(updates), id];
    
    const result = await pool.query(
      `UPDATE community_posts SET ${setClause} WHERE id = $${values.length} RETURNING *`,
      values
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST like post
router.post('/posts/:id/like', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'UPDATE community_posts SET likes = likes + 1 WHERE id = $1 RETURNING likes',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.json({ likes: result.rows[0].likes });
  } catch (error) {
    console.error('Error liking post:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST pin post (State only)
router.post('/posts/:id/pin', async (req, res) => {
  try {
    const user = req.user;
    
    if (user.role !== 'state') {
      return res.status(403).json({ error: 'Only State officers can pin posts' });
    }
    
    const { id } = req.params;
    
    const result = await pool.query(
      'UPDATE community_posts SET pinned = NOT pinned WHERE id = $1 RETURNING pinned',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.json({ pinned: result.rows[0].pinned });
  } catch (error) {
    console.error('Error pinning post:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE post
router.delete('/posts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;
    
    // Check if post exists
    const postCheck = await pool.query('SELECT * FROM community_posts WHERE id = $1', [id]);
    if (postCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    // Check permissions (author or state)
    if (postCheck.rows[0].author_id !== user.id && user.role !== 'state') {
      return res.status(403).json({ error: 'Not authorized to delete this post' });
    }
    
    // Delete comments first (foreign key)
    await pool.query('DELETE FROM comments WHERE post_id = $1', [id]);
    
    // Delete post
    await pool.query('DELETE FROM community_posts WHERE id = $1', [id]);

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== COMMENTS ENDPOINTS ====================

// GET comments for a post
router.get('/posts/:id/comments', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'SELECT * FROM comments WHERE post_id = $1 ORDER BY created_at ASC',
      [id]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST add comment
router.post('/posts/:id/comments', async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;
    const { content } = req.body;

    const result = await pool.query(
      `INSERT INTO comments (post_id, author, author_role, content)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [id, user.name, user.role, content]
    );

    // Update comments count on post
    await pool.query(
      'UPDATE community_posts SET comments_count = comments_count + 1 WHERE id = $1',
      [id]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE comment
router.delete('/comments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;
    
    // Check if comment exists
    const commentCheck = await pool.query('SELECT * FROM comments WHERE id = $1', [id]);
    if (commentCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Comment not found' });
    }
    
    // Check permissions (author or state)
    if (commentCheck.rows[0].author !== user.name && user.role !== 'state') {
      return res.status(403).json({ error: 'Not authorized to delete this comment' });
    }
    
    const postId = commentCheck.rows[0].post_id;
    
    await pool.query('DELETE FROM comments WHERE id = $1', [id]);
    
    // Update comments count on post
    await pool.query(
      'UPDATE community_posts SET comments_count = comments_count - 1 WHERE id = $1',
      [postId]
    );

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== EVENTS ENDPOINTS ====================

// GET all events
router.get('/events', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM events ORDER BY date ASC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET single event
router.get('/events/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM events WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST create event
router.post('/events', async (req, res) => {
  try {
    const user = req.user;
    
    // Only State and DEO can create events
    if (!['state', 'deo'].includes(user.role)) {
      return res.status(403).json({ error: 'Not authorized to create events' });
    }
    
    const {
      title, description, date, location,
      district, block, participants, organizer, status, image_url
    } = req.body;

    const result = await pool.query(
      `INSERT INTO events 
       (title, description, date, location, district, block, participants, organizer, status, image_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [title, description, date, location, district, block,
       participants || 0, organizer || user.name, status || 'upcoming', image_url]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT update event
router.put('/events/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const user = req.user;
    
    // Check permissions
    if (!['state', 'deo'].includes(user.role)) {
      return res.status(403).json({ error: 'Not authorized to update events' });
    }
    
    const setClause = Object.keys(updates)
      .map((key, index) => `${key} = $${index + 1}`)
      .join(', ');
    
    const values = [...Object.values(updates), id];
    
    const result = await pool.query(
      `UPDATE events SET ${setClause} WHERE id = $${values.length} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE event
router.delete('/events/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;
    
    if (!['state', 'deo'].includes(user.role)) {
      return res.status(403).json({ error: 'Not authorized to delete events' });
    }
    
    const result = await pool.query('DELETE FROM events WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
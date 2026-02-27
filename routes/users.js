const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcryptjs'); // ✅
const jwt = require('jsonwebtoken');

// -------------------------
// Auth middleware
// -------------------------
function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1] || null;
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // attach user info
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// -------------------------
// Role restriction middleware
// -------------------------
function authorizeRoles(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
}

// -------------------------
// GET ALL USERS (manager only)
// -------------------------
router.get('/', authMiddleware, authorizeRoles('manager'), async (req, res) => {
  try {
    const result = await pool.query('SELECT id, username, role FROM users ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// -------------------------
// CREATE USER (manager only)
// -------------------------
router.post('/', authMiddleware, authorizeRoles('manager'), async (req, res) => {
  try {
    const { username, password, role } = req.body;

    if (!username || !password || !role) {
      return res.status(400).json({ error: 'Please provide username, password, and role' });
    }

    // Check if user already exists
    const existingUser = await pool.query('SELECT * FROM users WHERE username=$1', [username]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user
    const result = await pool.query(
      'INSERT INTO users (username, password, role) VALUES ($1, $2, $3) RETURNING id, username, role',
      [username, hashedPassword, role]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// -------------------------
// DELETE USER (manager only)
// -------------------------
router.delete('/:id', authMiddleware, authorizeRoles('manager'), async (req, res) => {
  try {
    await pool.query('DELETE FROM users WHERE id = $1', [req.params.id]);
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
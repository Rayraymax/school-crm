const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcryptjs');  // ✅
const authMiddleware = require('../middleware/authMiddleware');

// Role restriction
function authorizeRoles(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
}

/* =============================
   GET ALL USERS
============================= */
router.get('/', authMiddleware, authorizeRoles('manager'), async (req, res) => {
  const result = await pool.query(
    'SELECT id, username, role FROM users ORDER BY id ASC'
  );
  res.json(result.rows);
});

/* =============================
   CREATE USER
============================= */
router.post('/', authMiddleware, authorizeRoles('manager'), async (req, res) => {
  const { username, password, role } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  const result = await pool.query(
    'INSERT INTO users (username, password, role) VALUES ($1, $2, $3) RETURNING id, username, role',
    [username, hashedPassword, role]
  );

  res.json(result.rows[0]);
});

/* =============================
   DELETE USER
============================= */
router.delete('/:id', authMiddleware, authorizeRoles('manager'), async (req, res) => {
  await pool.query('DELETE FROM users WHERE id = $1', [req.params.id]);
  res.json({ message: 'User deleted successfully' });
});

module.exports = router;
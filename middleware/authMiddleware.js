const jwt = require('jsonwebtoken');
const pool = require('../db');

// Middleware to protect routes and attach user role
async function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch user from DB to get latest role
    const result = await pool.query('SELECT id, username, role FROM users WHERE id = $1', [decoded.id]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Attach user info to request
    req.user = result.rows[0];

    next();
  } catch (err) {
    console.error(err.message);
    return res.status(401).json({ error: 'Invalid token' });
  }
}

module.exports = authMiddleware;

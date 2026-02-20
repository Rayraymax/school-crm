const express = require('express');
const router = express.Router();
const pool = require('../db');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Utility: role-based authorization
function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden: insufficient role' });
    }
    next();
  };
};

// Submit new lead (only marketers and managers)
router.post(
  '/',
  authMiddleware,
  authorizeRoles('marketer', 'manager'),
  upload.single('lead_image'),
  async (req, res) => {
    try {
      // ✅ Multer populates req.body and req.file
      const {
        school_name,
        school_type,
        location,
        contact_name,
        contact_role,
        phone,
        email,
        visit_date,
        interest_level,
        notes,
        next_action,
        follow_up_date
      } = req.body;

      const imagePath = req.file ? req.file.filename : null;

      const result = await pool.query(
        `INSERT INTO school_leads 
        (school_name, school_type, location, contact_name, contact_role, phone, email, visit_date, interest_level, notes, next_action, follow_up_date, image_path, created_at) 
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,NOW()) RETURNING *`,
        [
          school_name,
          school_type,
          location,
          contact_name,
          contact_role,
          phone,
          email,
          visit_date,
          interest_level,
          notes,
          next_action,
          follow_up_date,
          imagePath
        ]
      );

      res.json(result.rows[0]);
    } catch (err) {
      console.error('Error inserting lead:', err);
      res.status(500).send('Server error');
    }
  }
);
// Get all leads (any authenticated user)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM school_leads ORDER BY created_at DESC");
    res.json(result.rows);   // ✅ return JSON array
  } catch (err) {
    console.error('Error fetching leads:', err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;

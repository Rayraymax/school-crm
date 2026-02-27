const express = require('express');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');
const leadsRoutes = require('./routes/leads');
const authRoutes = require('./routes/auth');
const usersRoutes = require('./routes/users');

const app = express();

// -------------------------
// Middleware
// -------------------------
app.use(cors({
  origin: '*', // allow all origins or specify frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(express.json());

// -------------------------
// Serve frontend files
// -------------------------
app.use(express.static(path.join(__dirname, 'public'), { index: false }));

// Default route → login
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Public login route
app.get('/login.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// -------------------------
// Auth middleware
// -------------------------
function ensureAuthenticated(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1] || null;
  if (!token) return res.sendFile(path.join(__dirname, 'public', 'login.html'));

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // attach user info
    next();
  } catch (err) {
    return res.sendFile(path.join(__dirname, 'public', 'login.html'));
  }
}

// -------------------------
// Protected routes
// -------------------------
app.get('/dashboard.html', ensureAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

app.get('/index.html', ensureAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// -------------------------
// API routes
// -------------------------
app.use('/api/leads', leadsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);

// -------------------------
// Start server
// -------------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
const express = require('express');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');
const leadsRoutes = require('./routes/leads');
const authRoutes = require('./routes/auth');

const app = express();
app.use(cors());
app.use(express.json());

// Default route → always go to login
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Serve static frontend files but disable automatic index.html
app.use(express.static(path.join(__dirname, 'public'), { index: false }));

// API routes
app.use('/api/leads', leadsRoutes);
app.use('/api/auth', authRoutes);

// Middleware to protect routes
function ensureAuthenticated(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1] || null;

  if (!token) {
    return res.sendFile(path.join(__dirname, 'public', 'login.html'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // attach decoded user info
    next();
  } catch (err) {
    return res.sendFile(path.join(__dirname, 'public', 'login.html'));
  }
}

// Public login route
app.get('/login.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Protected dashboard route
app.get('/dashboard.html', ensureAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// Protected marketer submission route
app.get('/index.html', ensureAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

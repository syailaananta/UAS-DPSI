// middlewares/auth.js
const jwt = require('jsonwebtoken');
const JWT_SECRET = 'arethisisajoke';

const authenticateToken = (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) return res.status(401).send('Access denied. No token provided.');

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(400).send('Invalid token.');
  }
};


const isLibrarian = (req, res, next) => {
  if (req.user.role !== 'librarian') return res.status(403).send('Access Denied');
  next();
};

module.exports = { authenticateToken, isLibrarian };

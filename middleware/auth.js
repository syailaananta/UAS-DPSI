// middlewares/auth.js
const jwt = require('jsonwebtoken');
const JWT_SECRET = 'selasela';

const authenticateToken = (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) return res.status(401).send('Access Denied');
  
  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).send('Invalid Token');
  }
};

const isLibrarian = (req, res, next) => {
  if (req.user.role !== 'librarian') return res.status(403).send('Access Denied');
  next();
};

module.exports = { authenticateToken, isLibrarian };

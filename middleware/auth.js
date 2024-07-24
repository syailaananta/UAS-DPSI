// middlewares/auth.js
const jwt = require('jsonwebtoken');
const JWT_SECRET = 'arethisisajoke';

const authenticate = async (req, res, next) => {
  const token = req.header('Authorization').replace('Bearer ', '');
  if (!token) return res.status(401).send('Access denied. No token provided.');

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userId; // Assuming the payload contains the userId

    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();
    if (!userDoc.exists) return res.status(404).send('User not found.');

    req.user = { id: userId, ...userDoc.data() };
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

// middlewares/auth.js
const jwt = require('jsonwebtoken');
const JWT_SECRET = 'arethisisajoke';

const authenticateToken = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    console.error('No token provided');
    return res.status(401).send('Access denied. No token provided.');
  }

  try {
    const decoded = jwt.verify(token, 'arethisisajoke');
    const userId = decoded.userId; // Ensure payload contains userId
    console.log('Decoded Token:', decoded);

    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();
    if (!userDoc.exists) {
      console.error('User not found');
      return res.status(404).send('User not found.');
    }

    req.user = { id: userId, ...userDoc.data() };
    console.log('User set in req:', req.user);
    next();
  } catch (error) {
    console.error('Invalid token:', error.message);
    res.status(400).send('Invalid token.');
  }
};



const isLibrarian = (req, res, next) => {
  if (req.user.role !== 'librarian') return res.status(403).send('Access Denied');
  next();
};

module.exports = { authenticateToken, isLibrarian };

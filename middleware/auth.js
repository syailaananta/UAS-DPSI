// middlewares/auth.js
const jwt = require('jsonwebtoken');
const JWT_SECRET = 'selasela';

const authenticateToken = async (req, res, next) => {
  // 1. Get the token from the request headers
  const token = req.header('Authorization');

  // 2. Check if a token was provided
  if (!token) return res.status(401).send('Access denied. No token provided.');

  try {
    // 3. Verify and decode the token
    const decoded = jwt.verify(token, JWT_SECRET);

    // 4. Attach decoded payload to the request for later use
    req.user = decoded; 

    // 5. Proceed to the next middleware or route handler
    next();
  } catch (error) {
    // 6. Handle invalid tokens
    res.status(400).send('Invalid token.');
  }
};


const isLibrarian = (req, res, next) => {
  if (req.user.role !== 'librarian') return res.status(403).send('Access Denied');
  next();
};

module.exports = { authenticateToken, isLibrarian };

// controllers/userController.js
const db = require('../config');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const JWT_SECRET = 'arethisisajoke';

const registerUser = async (req, res) => {
  const { username, password, role } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);
  await db.collection('users').add({ username, password: hashedPassword, role });

  res.send('User registered');
};

const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    const users = await db.collection('users').where('username', '==', username).get();
    if (users.empty) return res.status(400).send('Invalid Credentials');

    const userDoc = users.docs[0];
    const user = userDoc.data();
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).send('Invalid Credentials');

    const token = jwt.sign({ id: userDoc.id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
    res.header('Authorization', `Bearer ${token}`).send('Logged in');
  } catch (error) {
    res.status(500).send('Error logging in: ' + error.message);
  }
};

module.exports = { registerUser, loginUser };

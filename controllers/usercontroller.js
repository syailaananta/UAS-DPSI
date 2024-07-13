// controllers/userController.js
const db = require('../config');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const JWT_SECRET = 'selasela';

const registerUser = async (req, res) => {
  const { username, password, role } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);
  await db.collection('users').add({ username, password: hashedPassword, role });

  res.send('User registered');
};

const loginUser = async (req, res) => {
  const { username, password } = req.body;

  const users = await db.collection('users').where('username', '==', username).get();
  if (users.empty) return res.status(400).send('Invalid Credentials');

  const user = users.docs[0].data();
  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) return res.status(400).send('Invalid Credentials');

  const token = jwt.sign({ id: users.docs[0].id, role: user.role }, JWT_SECRET);
  res.header('Authorization', token).send('Logged in');
};

module.exports = { registerUser, loginUser };

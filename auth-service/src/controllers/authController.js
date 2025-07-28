// src/controllers/authController.js
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import User from '../models/auth.js';
import validator from 'validator';


const {
  JWT_SECRET = 'super-secret-super-secret-super-secret-super-secret',
  JWT_ALGORITHM = 'HS256',
  JWT_EXPIRES_IN = '1d' 
} = process.env;

const tokenBlacklist = new Set();

const signToken = (user) =>
  jwt.sign(
    { sub: user._id.toString(), role: user.role, email: user.email },
    JWT_SECRET,
    { algorithm: JWT_ALGORITHM, expiresIn: JWT_EXPIRES_IN }
  );

const buildPublicUser = (u) => ({
  userId: u._id,
  username: u.username,
  email: u.email,
  role: u.role,
  createdAt: u.createdAt,
  updatedAt: u.updatedAt
});

export const register = async (req, res) => {
  const { username, email, password, role } = req.body;

  try {
    const user = await User.create({ username, email, password, role });
    return res.status(201).json({
      message: 'User registered successfully.',
      user: buildPublicUser(user)
    });
  } catch (err) {
    if (err.code === 11000) {
      const field = Object.keys(err.keyValue)[0];
      return res.status(409).json({ error: `${field} already exists.` });
    }
    console.error('Registration error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};


export const login = async (req, res) => {
  const { email, username, password } = req.body;

  if ((!email && !username) || (email && username) || !password) {
    return res.status(400).json({
      error: 'Provide email or username please.'
    });
  }

  let query;
  if (email) {
    if (!validator.isEmail(email)) {
      return res.status(400).json({ error: 'Email format is invalid.' });
    }
    query = { email: validator.normalizeEmail(email) };
  } else {
    query = { username: username.trim() };
  }

  try {
    const user = await User.findOne(query).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res
        .status(401)
        .json({ error: 'Email/username or password is incorrect.' });
    }

    const token = signToken(user);
    return res.status(200).json({
      token,
      user: {
        userId: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const logout = async (req, res) => {
  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (token) tokenBlacklist.add(token); 
  return res.status(204).send(); 
};

export const me = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ error: 'User not found.' });
    return res.status(200).json(buildPublicUser(user));
  } catch (err) {
    console.error('Fetch /me error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const validateToken = (req, res) => {
  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');

  if (tokenBlacklist.has(token)) {
    return res.status(401).json({ error: 'Token revoked.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      algorithms: [JWT_ALGORITHM]
    });
    return res.status(200).json({
      valid: true,
      userId: decoded.sub,
      role: decoded.role,
      exp: decoded.exp
    });
  } catch (err) {
    return res.status(401).json({ error: err.message });
  }
};

export const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res
      .status(400)
      .json({ error: 'Both currentPassword and newPassword are required.' });
  }
  try {
    const user = await User.findById(req.user.userId).select('+password');
    if (!user || !(await user.comparePassword(currentPassword))) {
      return res.status(401).json({ error: 'Current password is incorrect.' });
    }
    user.password = newPassword;
    await user.save();
    const token = signToken(user);
    return res
      .status(200)
      .json({ message: 'Password updated successfully.', token });
  } catch (err) {
    console.error('Change‑password error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
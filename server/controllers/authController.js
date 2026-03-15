const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');

/**
 * POST /api/auth/register
 */
const register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { name, email, password, role } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email already registered.' });
    }

    const user = await User.create({ name, email, password, role: role || 'sales' });
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    res.status(201).json({ success: true, token, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * POST /api/auth/login
 */
const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account is deactivated.' });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    res.json({ success: true, token, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/auth/me
 */
const getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};

module.exports = { register, login, getMe };

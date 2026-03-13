const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ── Helper: sign a JWT ────────────────────────────────────────────────────────
function signToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

// ── Helper: format user for API response ─────────────────────────────────────
function formatUser(user) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    organization: user.organization,
    createdAt: user.createdAt,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/register
// ─────────────────────────────────────────────────────────────────────────────
async function register(req, res, next) {
  try {
    const { name, email, password, role = 'consumer', organization = '' } = req.body;

    // Basic validation
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'name, email, and password are required.' });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters.' });
    }

    // Check duplicate email
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    // Hash password
    const passwordHash = await User.hashPassword(password);

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      role,
      organization: organization.trim(),
    });

    const token = signToken(user._id);
    res.status(201).json({ token, user: formatUser(user) });
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/login
// ─────────────────────────────────────────────────────────────────────────────
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    // Include passwordHash (select: false by default)
    const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ error: 'Account is deactivated.' });
    }

    const match = await user.comparePassword(password);
    if (!match) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = signToken(user._id);
    res.json({ token, user: formatUser(user) });
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/auth/me   (requires protect middleware)
// ─────────────────────────────────────────────────────────────────────────────
async function getMe(req, res) {
  res.json({ user: formatUser(req.user) });
}

module.exports = { register, login, getMe };

const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * protect — verifies the JWT and attaches req.user to the request.
 * If the token is missing or invalid, returns 401.
 */
async function protect(req, res, next) {
  let token;

  // Support "Authorization: Bearer <token>"
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.slice(7);
  }

  if (!token) {
    return res.status(401).json({ error: 'Authentication required. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach fresh user document (excluding passwordHash)
    const user = await User.findById(decoded.id).select('-passwordHash');
    if (!user) {
      return res.status(401).json({ error: 'User not found. Token is invalid.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ error: 'Account is deactivated.' });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired. Please log in again.' });
    }
    return res.status(401).json({ error: 'Invalid token.' });
  }
}

/**
 * optionalAuth — like protect but does not fail if no token is present.
 * Attaches req.user if a valid token exists, otherwise req.user = null.
 */
async function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }

  const token = authHeader.slice(7);
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-passwordHash');
  } catch {
    req.user = null;
  }
  next();
}

module.exports = { protect, optionalAuth };

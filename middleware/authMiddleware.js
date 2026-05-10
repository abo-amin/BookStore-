const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes — requires valid JWT
exports.protect = async (req, res, next) => {
  let token;

  // Read token from httpOnly cookie
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    if (req.headers['x-requested-with'] === 'XMLHttpRequest') {
      return res.status(401).json({ success: false, message: 'Not authorized, please login' });
    }
    return res.redirect('/login');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) {
      if (req.headers['x-requested-with'] === 'XMLHttpRequest') {
        return res.status(401).json({ success: false, message: 'User not found' });
      }
      return res.redirect('/login');
    }
    next();
  } catch (err) {
    if (req.headers['x-requested-with'] === 'XMLHttpRequest') {
      return res.status(401).json({ success: false, message: 'Token invalid or expired' });
    }
    res.clearCookie('token');
    return res.redirect('/login');
  }
};

// Attach user to res.locals if logged in (for views)
exports.attachUser = async (req, res, next) => {
  res.locals.user = null;
  if (req.cookies && req.cookies.token) {
    try {
      const decoded = jwt.verify(req.cookies.token, process.env.JWT_SECRET);
      res.locals.user = await User.findById(decoded.id).select('-password');
    } catch (e) {
      res.clearCookie('token');
    }
  }
  next();
};

// Admin only
exports.adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') return next();
  if (req.headers['x-requested-with'] === 'XMLHttpRequest') {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }
  return res.status(403).render('error', { message: 'Access denied: Admins only', layout: 'layouts/main' });
};

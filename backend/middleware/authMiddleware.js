const jwt = require('jsonwebtoken');
const { query } = require('../config/db');

// Verify JWT and attach user object
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. Authentication token is missing.'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'car_rental_super_secret_jwt_key_2026_mca_project');
    const { rows } = await query('SELECT user_id, name, email, phone, role, status, address, driving_license FROM users WHERE user_id = ?', [decoded.id]);

    if (!rows || rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'The user belonging to this token no longer exists.'
      });
    }

    if (rows[0].status !== 'Active') {
      return res.status(403).json({
        success: false,
        message: 'Your account is deactivated or suspended. Please contact administrator.'
      });
    }

    req.user = rows[0];
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token. Please log in again.'
    });
  }
};

// Role-based access control
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access requires one of the following roles: [${roles.join(', ')}]`
      });
    }
    next();
  };
};

module.exports = {
  protect,
  authorize
};

const jwt = require('jsonwebtoken');

// Extract and verify JWT from "Authorization: Bearer <token>"
// On success, req.user is set to { id, role, name, email } and we call next()
const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token — please log in' });
  }
  try {
    req.user = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: 'Token is invalid or expired' });
  }
};

// Usage: allowRoles('admin') or allowRoles('admin', 'technician')
const allowRoles = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Access denied' });
  }
  next();
};

module.exports = { protect, allowRoles };

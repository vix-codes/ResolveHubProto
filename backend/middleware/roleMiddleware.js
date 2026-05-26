// Restricts a route to specific roles.
// Usage: router.get('/...', protect, allowRoles('admin'), handler)
//
// It's a factory function — you pass in the allowed roles and it returns
// the actual middleware. This way one function covers any role combination
// instead of writing a separate middleware per role.

const allowRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    next();
  };
};

module.exports = { allowRoles };

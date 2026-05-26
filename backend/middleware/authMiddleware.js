// Protects routes from unauthenticated access.
//
// The frontend sends every request with this header:
//   Authorization: Bearer <jwt_token>
//
// We extract the token, verify it with our secret, and attach the decoded
// user info to req.user so any route handler knows who's making the request.
// If the token is missing or invalid, we stop the request with a 401.

const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token — please log in' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, role, name, email }
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is invalid or expired' });
  }
};

module.exports = { protect };

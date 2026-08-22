const jwt = require('jsonwebtoken');
const User = require('../models/User.model');
const { error } = require('../utils/response.utils');

const protect = async (req, res, next) => {
  try {
    let token;

    // 1. Check Cookies (Primary for 'Zero Management' flow)
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }
    // 2. Fallback to Authorization Header
    else if (req.headers.authorization) {
      if (req.headers.authorization.startsWith('Bearer ')) {
        token = req.headers.authorization.split(' ')[1];
      } else {
        token = req.headers.authorization;
      }
    } 
    // 3. Fallback to Custom Header or Query
    else {
      token = req.headers['x-auth-token'] || req.query.token;
    }

    if (!token || token === 'null' || token === 'undefined') {
      return error(res, 'Authentication failed: No token provided.', 401);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) return error(res, 'User not found.', 401);

    req.user = user;
    next();
  } catch (err) {
    console.error('Auth Error:', err.message);
    return error(res, 'Invalid or Expired Token.', 401);
  }
};

module.exports = { protect };

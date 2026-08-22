const { error } = require('../utils/response.utils');

const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return error(res, 'Access denied. Admin only.', 403);
  }
  next();
};

module.exports = { adminOnly };

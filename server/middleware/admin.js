module.exports = function (req, res, next) {
  // Allow both 'admin' and 'super_admin' roles
  if (req.user.role !== 'admin' && req.user.role !== 'super_admin' && req.user.role !== 'Admin') {
    return res.status(403).json({ message: 'Access denied. Admins only.' });
  }
  next();
};

const isAuthorized = (requiredRole) => {
  return (req, res, next) => {
    if (req.user.role !== requiredRole) {
      return res.status(403).json({
        message: "You are not authorized to access this resource",
      });
    }

    next();
  };
};

module.exports = isAuthorized;
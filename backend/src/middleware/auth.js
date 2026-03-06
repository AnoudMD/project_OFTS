function requireRole(roles) {
  return (req, res, next) => {
    const role = req.headers["x-role"];

    if (!role) {
      return res.status(401).json({ message: "Missing x-role header" });
    }

    if (!roles.includes(role)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    req.role = role;
    next();
  };
}

module.exports = { requireRole };
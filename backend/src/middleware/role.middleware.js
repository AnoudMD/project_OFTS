/**
 * authorize(...roles) — must be used AFTER the protect middleware.
 * Checks that req.user.role is in the allowed list.
 *
 * Usage:
 *   router.post('/batches', protect, authorize('producer'), createBatch);
 *   router.patch('/certify', protect, authorize('certifier'), certifyBatch);
 */
function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Access denied. Required role(s): ${allowedRoles.join(', ')}. Your role: ${req.user.role}`,
      });
    }

    next();
  };
}

module.exports = { authorize };

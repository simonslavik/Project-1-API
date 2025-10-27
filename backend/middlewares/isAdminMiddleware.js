

// Admin role check middleware
const adminOnly = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Admin role required.',
            error: {
                type: 'AuthorizationError',
                requiredRole: 'admin',
                userRole: req.user.role,
                timestamp: new Date().toISOString()
            }
        });
    }
    next();
};

module.exports = { adminOnly };
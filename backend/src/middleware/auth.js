/**
 * Middleware для перевірки аутентифікації користувача
 */
export function requireAuth(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  }
  
  return res.status(401).json({ 
    error: 'Unauthorized',
    message: 'Please log in to access this resource'
  });
}

/**
 * Middleware для перевірки ролі адміна
 */
export function requireAdmin(req, res, next) {
  if (req.session && req.session.user && req.session.user.role === 'admin') {
    return next();
  }
  
  return res.status(403).json({ 
    error: 'Forbidden',
    message: 'Admin access required'
  });
}

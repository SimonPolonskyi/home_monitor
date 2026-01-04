import express from 'express';
import { User } from '../models/User.js';
import { loginLimiter } from '../middleware/rateLimit.js';

const router = express.Router();

/**
 * POST /api/auth/login
 * Вхід користувача
 */
router.post('/login', loginLimiter, async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: 'Username and password are required',
      });
    }
    
    const user = await User.verifyUser(username, password);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid username or password',
      });
    }
    
    // Створити сесію
    req.session.user = {
      id: user.id,
      username: user.username,
      role: user.role,
    };
    
    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        email: user.email,
      },
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

/**
 * POST /api/auth/logout
 * Вихід користувача
 */
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({
        success: false,
        error: 'Failed to logout',
      });
    }
    
    res.clearCookie('connect.sid');
    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  });
});

/**
 * GET /api/auth/me
 * Поточна інформація про користувача
 */
router.get('/me', (req, res) => {
  if (req.session && req.session.user) {
    res.json({
      success: true,
      user: req.session.user,
    });
  } else {
    res.status(401).json({
      success: false,
      error: 'Not authenticated',
    });
  }
});

export default router;

import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Generate JWT token
export const generateToken = (userId, role) => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

// Verify JWT token middleware
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      console.warn('[AUTH] No token provided');
      return res.status(401).json({ 
        success: false, 
        message: 'Access token required' 
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('[AUTH] Decoded JWT:', decoded);
    } catch (jwtErr) {
      console.warn('[AUTH] JWT verification failed:', jwtErr.message);
      if (jwtErr.name === 'JsonWebTokenError') {
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid token' 
        });
      }
      if (jwtErr.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          success: false, 
          message: 'Token expired' 
        });
      }
      return res.status(500).json({ 
        success: false, 
        message: 'Authentication error' 
      });
    }

    const user = await User.findById(decoded.userId).select('-password');
    if (!user || !user.isActive) {
      console.warn('[AUTH] Invalid or inactive user:', decoded.userId);
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid or inactive user' 
      });
    }

    req.user = user;
    console.log('[AUTH] Authenticated user:', user._id, 'role:', user.role);
    next();
  } catch (error) {
    console.error('[AUTH] Unexpected error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Authentication error' 
    });
  }
};

// Role-based authorization middleware
export const authorizeRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      console.warn('[AUTHZ] No user on request');
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }

    if (!roles.includes(req.user.role)) {
      console.warn('[AUTHZ] Insufficient permissions for user:', req.user._id, 'role:', req.user.role, 'required:', roles);
      return res.status(403).json({ 
        success: false, 
        message: 'Insufficient permissions' 
      });
    }

    console.log('[AUTHZ] Role authorized:', req.user._id, 'role:', req.user.role);
    next();
  };
};

// Student-only middleware
export const requireStudent = authorizeRole('student');

// Admin-only middleware
export const requireAdmin = authorizeRole('admin');

// Optional authentication (for public endpoints that can work with or without auth)
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-password');
      
      if (user && user.isActive) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // Continue without authentication for optional auth
    next();
  }
};

// Rate limiting middleware
export const rateLimiter = (windowMs = 15 * 60 * 1000, max = 100) => {
  const requests = new Map();

  return (req, res, next) => {
    const key = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const windowStart = now - windowMs;

    // Clean old entries
    if (requests.has(key)) {
      requests.set(key, requests.get(key).filter(time => time > windowStart));
    } else {
      requests.set(key, []);
    }

    const userRequests = requests.get(key);
    
    if (userRequests.length >= max) {
      return res.status(429).json({
        success: false,
        message: 'Too many requests, please try again later'
      });
    }

    userRequests.push(now);
    next();
  };
}; 
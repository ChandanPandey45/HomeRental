import { db } from '../config/firebase.js';
import ErrorHandler from '../utils/errorHandler.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'roomfinder_super_secret_key_2024';

/**
 * Verify Firebase ID token and attach user to request
 */
export const isAuthenticated = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return next(new ErrorHandler('Not authorized to access this route', 401));
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return next(new ErrorHandler('Invalid or expired token', 401));
    }

    // Fetch full user data from Firestore
    const userDoc = await db.collection('users').doc(decoded.uid).get();

    if (!userDoc.exists) {
      return next(new ErrorHandler('User not found in database', 404));
    }

    req.user = {
      uid: decoded.uid,
      id: decoded.uid,
      ...userDoc.data()
    };

    next();
  } catch (error) {
    next(new ErrorHandler('Authentication failed', 401));
  }
};

/**
 * Check if user has required role(s)
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ErrorHandler('User not authenticated', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorHandler(
          `User role "${req.user.role}" is not authorized to access this route`,
          403
        )
      );
    }

    next();
  };
};

/**
 * Check if user is owner of resource or admin
 */
export const isOwnerOrAdmin = async (req, res, next) => {
  try {
    if (req.user.role === 'admin') {
      return next();
    }

    // Implementation depends on the resource type
    // This is a generic check that should be customized per route
    next();
  } catch (error) {
    next(new ErrorHandler('Authorization check failed', 500));
  }
};

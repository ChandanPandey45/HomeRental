import express from 'express';
import {
  registerUser,
  loginUser,
  getCurrentUser,
  updateUserProfile,
  getUserById,
  getAllUsers
} from '../controllers/authController.js';
import { isAuthenticated, authorize } from '../middleware/auth.js';
import { handleValidationErrors } from '../middleware/validation.js';
import {
  validateUserRegistration,
  validateUserLogin,
  validateUserUpdate,
  validateFirestoreId
} from '../validators/index.js';

const router = express.Router();

// Public routes
router.post('/register', validateUserRegistration, handleValidationErrors, registerUser);
router.post('/login', validateUserLogin, handleValidationErrors, loginUser);

// Protected routes
router.get('/me', isAuthenticated, getCurrentUser);
router.put('/profile', isAuthenticated, validateUserUpdate, handleValidationErrors, updateUserProfile);

// Get user by ID (public - limited info)
router.get('/:id', validateFirestoreId, handleValidationErrors, getUserById);

// Admin routes
router.get('/', isAuthenticated, authorize('admin'), getAllUsers);

export default router;

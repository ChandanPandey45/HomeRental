import express from 'express';
import {
  createBooking,
  getAllBookings,
  getUserBookings,
  getOwnerBookings,
  getBookingById,
  updateBookingStatus,
  cancelBooking,
  getBookingStats
} from '../controllers/bookingController.js';
import { isAuthenticated, authorize } from '../middleware/auth.js';
import { handleValidationErrors } from '../middleware/validation.js';
import {
  validateBookingCreation,
  validateFirestoreId
} from '../validators/index.js';

const router = express.Router();

// Protected routes
router.post(
  '/',
  isAuthenticated,
  validateBookingCreation,
  handleValidationErrors,
  createBooking
);

router.get('/my-bookings', isAuthenticated, getUserBookings);
router.get('/owner/bookings', isAuthenticated, authorize('roomOwner', 'admin'), getOwnerBookings);

// Get single booking
router.get('/:id', isAuthenticated, validateFirestoreId, handleValidationErrors, getBookingById);

// Update booking status
router.put('/:id/status', isAuthenticated, validateFirestoreId, handleValidationErrors, updateBookingStatus);

// Cancel booking
router.put('/:id/cancel', isAuthenticated, validateFirestoreId, handleValidationErrors, cancelBooking);

// Admin routes
router.get('/', isAuthenticated, authorize('admin'), getAllBookings);
router.get('/stats', isAuthenticated, authorize('admin'), getBookingStats);

export default router;

import express from 'express';
import {
  createRoom,
  getAllRooms,
  searchRoomsByLocation,
  getRoomById,
  updateRoom,
  deleteRoom,
  getRoomsByOwner,
  filterRooms
} from '../controllers/roomController.js';
import { isAuthenticated, authorize } from '../middleware/auth.js';
import { handleValidationErrors } from '../middleware/validation.js';
import {
  validateRoomCreation,
  validateRoomUpdate,
  validateLocationSearch,
  validateFirestoreId,
  validatePriceFilter
} from '../validators/index.js';

const router = express.Router();

// Public routes
router.get('/', getAllRooms);
router.get('/search/location', validateLocationSearch, handleValidationErrors, searchRoomsByLocation);
router.get('/filter/advanced', filterRooms);
router.get('/:id', validateFirestoreId, handleValidationErrors, getRoomById);

// Protected routes - Room Owner
router.post(
  '/',
  isAuthenticated,
  authorize('roomOwner', 'admin'),
  validateRoomCreation,
  handleValidationErrors,
  createRoom
);

router.put(
  '/:id',
  isAuthenticated,
  authorize('roomOwner', 'admin'),
  validateRoomUpdate,
  handleValidationErrors,
  updateRoom
);

router.delete(
  '/:id',
  isAuthenticated,
  authorize('roomOwner', 'admin'),
  validateFirestoreId,
  handleValidationErrors,
  deleteRoom
);

// Get rooms by owner
router.get('/owner/:ownerId', getRoomsByOwner);
router.get('/my-rooms/list', isAuthenticated, authorize('roomOwner', 'admin'), getRoomsByOwner);

export default router;

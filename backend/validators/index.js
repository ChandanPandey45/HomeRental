import { body, param, query } from 'express-validator';

// User validators
export const validateUserRegistration = [
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Passwords do not match');
    }
    return true;
  }),
  body('phone').optional().trim()
];

export const validateUserLogin = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

export const validateUserUpdate = [
  body('firstName').optional().trim().notEmpty().withMessage('First name cannot be empty'),
  body('lastName').optional().trim().notEmpty().withMessage('Last name cannot be empty'),
  body('phone').optional().trim(),
  body('bio').optional().trim().isLength({ max: 500 }).withMessage('Bio cannot exceed 500 characters')
];

// Room validators
export const validateRoomCreation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('price')
    .isNumeric()
    .withMessage('Price must be a number')
    .custom((value) => value >= 0)
    .withMessage('Price cannot be negative'),
  body('bedrooms')
    .isNumeric()
    .withMessage('Bedrooms must be a number')
    .custom((value) => value >= 0)
    .withMessage('Bedrooms cannot be negative'),
  body('bathrooms')
    .isNumeric()
    .withMessage('Bathrooms must be a number')
    .custom((value) => value >= 0)
    .withMessage('Bathrooms cannot be negative'),
  body('squareFeet')
    .isNumeric()
    .withMessage('Square feet must be a number')
    .custom((value) => value > 0)
    .withMessage('Square feet must be greater than 0'),
  body('address.street').notEmpty().withMessage('Street address is required'),
  body('address.city').notEmpty().withMessage('City is required'),
  body('address.state').notEmpty().withMessage('State is required'),
  body('address.zipCode').notEmpty().withMessage('Zip code is required'),
  body('address.country').notEmpty().withMessage('Country is required'),
  body('location.latitude')
    .isNumeric()
    .withMessage('Location latitude is required and must be a number'),
  body('location.longitude')
    .isNumeric()
    .withMessage('Location longitude is required and must be a number'),
  body('availableFrom').isISO8601().withMessage('Available from date must be a valid date'),
  body('amenities').optional().isArray().withMessage('Amenities must be an array'),
  body('rules.maxOccupants').optional().isNumeric().withMessage('Max Occupants must be a number'),
  body('rules.petPolicy').optional().trim().notEmpty().withMessage('Pet Policy cannot be empty')
];

export const validateRoomUpdate = [
  body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
  body('description').optional().trim().notEmpty().withMessage('Description cannot be empty'),
  body('price')
    .optional()
    .isNumeric()
    .withMessage('Price must be a number')
    .custom((value) => value >= 0)
    .withMessage('Price cannot be negative'),
  body('bedrooms')
    .optional()
    .isNumeric()
    .withMessage('Bedrooms must be a number'),
  body('bathrooms')
    .optional()
    .isNumeric()
    .withMessage('Bathrooms must be a number'),
  body('amenities').optional().isArray().withMessage('Amenities must be an array')
];

// Booking validators
export const validateBookingCreation = [
  body('roomId').notEmpty().withMessage('Room ID is required'),
  body('checkInDate')
    .isISO8601()
    .withMessage('Check-in date must be a valid date'),
  body('checkOutDate')
    .isISO8601()
    .withMessage('Check-out date must be a valid date')
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.checkInDate)) {
        throw new Error('Check-out date must be after check-in date');
      }
      return true;
    })
];

// Search validators
export const validateLocationSearch = [
  query('latitude')
    .isNumeric()
    .withMessage('Latitude must be a number')
    .custom((value) => value >= -90 && value <= 90)
    .withMessage('Latitude must be between -90 and 90'),
  query('longitude')
    .isNumeric()
    .withMessage('Longitude must be a number')
    .custom((value) => value >= -180 && value <= 180)
    .withMessage('Longitude must be between -180 and 180'),
  query('radius')
    .optional()
    .isNumeric()
    .withMessage('Radius must be a number')
    .custom((value) => value > 0)
    .withMessage('Radius must be greater than 0')
];

export const validatePriceFilter = [
  query('minPrice')
    .optional()
    .isNumeric()
    .withMessage('Min price must be a number')
    .custom((value) => value >= 0)
    .withMessage('Min price cannot be negative'),
  query('maxPrice')
    .optional()
    .isNumeric()
    .withMessage('Max price must be a number')
    .custom((value) => value >= 0)
    .withMessage('Max price cannot be negative')
];

// ID validator
// Generic Firestore ID validator (non-empty string)
export const validateFirestoreId = [
  param('id').custom((value) => {
    if (typeof value !== 'string' || !value.trim()) {
      throw new Error('Invalid ID format');
    }
    return true;
  })
];

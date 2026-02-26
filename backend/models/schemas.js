/**
 * Firestore Schema Definitions
 * These define the structure and validation for Firestore collections
 */

// User Collection Schema
export const userSchema = {
  firstName: { type: String, required: true, maxLength: 50 },
  lastName: { type: String, required: true, maxLength: 50 },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  role: { type: String, enum: ['admin', 'roomOwner', 'tenant'], default: 'tenant' },
  profilePicture: { type: String },
  bio: { type: String, maxLength: 500 },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  isVerified: { type: Boolean, default: false },
  rooms: { type: Array, default: [] }, // Array of room IDs
  bookings: { type: Array, default: [] }, // Array of booking IDs
  ratings: {
    averageRating: { type: Number, min: 0, max: 5, default: 0 },
    totalReviews: { type: Number, default: 0 }
  },
  createdAt: { type: 'timestamp' },
  updatedAt: { type: 'timestamp' }
};

// Room Collection Schema
export const roomSchema = {
  title: { type: String, required: true, maxLength: 100 },
  description: { type: String, required: true, maxLength: 2000 },
  owner: { type: String, required: true }, // User ID
  price: { type: Number, required: true, min: 0 },
  currency: { type: String, default: 'USD' },
  bedrooms: { type: Number, required: true, min: 0 },
  bathrooms: { type: Number, required: true, min: 0 },
  squareFeet: { type: Number, required: true },
  amenities: {
    type: Array,
    enum: [
      'WiFi',
      'Parking',
      'Air Conditioning',
      'Heating',
      'Kitchen',
      'Washer',
      'Dryer',
      'Dishwasher',
      'Gym',
      'Pool',
      'Patio',
      'Balcony',
      'Furnace',
      'TV Cable',
      'Pet Friendly',
      'Security System',
      'Elevator',
      'Doorman'
    ],
    default: []
  },
  images: {
    type: Array,
    items: {
      url: String,
      altText: String,
      uploadedAt: { type: 'timestamp' }
    }
  },
  coverImage: { type: String, required: true },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
    formattedAddress: String
  },
  // Geospatial location in GeoPoint format for Firestore
  location: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    geopoint: 'GeoPoint' // Firestore GeoPoint field
  },
  // For Geofire queries - store geohash
  geohash: { type: String },
  availableFrom: { type: 'timestamp', required: true },
  availableUntil: { type: 'timestamp' },
  availability: { type: Boolean, default: true },
  rules: {
    maxOccupants: Number,
    petPolicy: { type: String, enum: ['not-allowed', 'small-only', 'allowed'], default: 'not-allowed' },
    smokingPolicy: Boolean,
    guestPolicy: String,
    cancellationPolicy: String
  },
  ratings: {
    averageRating: { type: Number, min: 0, max: 5, default: 0 },
    totalReviews: { type: Number, default: 0 }
  },
  reviews: { type: Array, default: [] }, // Array of review IDs
  bookings: { type: Array, default: [] }, // Array of booking IDs
  isActive: { type: Boolean, default: true },
  createdAt: { type: 'timestamp' },
  updatedAt: { type: 'timestamp' }
};

// Booking Collection Schema
export const bookingSchema = {
  room: { type: String, required: true }, // Room ID
  tenant: { type: String, required: true }, // User ID
  owner: { type: String, required: true }, // User ID
  checkInDate: { type: 'timestamp', required: true },
  checkOutDate: { type: 'timestamp', required: true },
  numberOfMonths: { type: Number, required: true },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'checked-in', 'checked-out', 'cancelled', 'dispute'],
    default: 'pending'
  },
  totalPrice: { type: Number, required: true, min: 0 },
  deposit: {
    amount: Number,
    paid: { type: Boolean, default: false },
    paidDate: { type: 'timestamp' }
  },
  payment: {
    amount: Number,
    status: { type: String, enum: ['pending', 'completed', 'failed', 'refunded'], default: 'pending' },
    method: { type: String, enum: ['credit_card', 'debit_card', 'bank_transfer', 'digital_wallet'] },
    transactionId: String,
    paidDate: { type: 'timestamp' }
  },
  notes: {
    tenant: String,
    owner: String
  },
  messages: {
    type: Array,
    items: {
      sender: String,
      message: String,
      sentAt: { type: 'timestamp' }
    }
  },
  createdAt: { type: 'timestamp' },
  updatedAt: { type: 'timestamp' }
};

// Export validation functions
export const validateUser = (data) => {
  const errors = [];
  
  if (!data.firstName || data.firstName.length > 50) {
    errors.push('Invalid firstName');
  }
  if (!data.lastName || data.lastName.length > 50) {
    errors.push('Invalid lastName');
  }
  if (!data.email || !isValidEmail(data.email)) {
    errors.push('Invalid email');
  }
  if (data.role && !['admin', 'roomOwner', 'tenant'].includes(data.role)) {
    errors.push('Invalid role');
  }
  
  return errors;
};

export const validateRoom = (data) => {
  const errors = [];
  
  if (!data.title || data.title.length > 100) {
    errors.push('Invalid title');
  }
  if (!data.description || data.description.length > 2000) {
    errors.push('Invalid description');
  }
  if (!data.owner) {
    errors.push('Owner is required');
  }
  if (typeof data.price !== 'number' || data.price < 0) {
    errors.push('Invalid price');
  }
  if (typeof data.bedrooms !== 'number' || data.bedrooms < 0) {
    errors.push('Invalid bedrooms');
  }
  if (typeof data.bathrooms !== 'number' || data.bathrooms < 0) {
    errors.push('Invalid bathrooms');
  }
  if (typeof data.squareFeet !== 'number') {
    errors.push('Invalid squareFeet');
  }
  if (!data.coverImage) {
    errors.push('Cover image is required');
  }
  if (!data.location || !data.location.latitude || !data.location.longitude) {
    errors.push('Invalid location');
  }
  
  return errors;
};

export const validateBooking = (data) => {
  const errors = [];
  
  if (!data.room) {
    errors.push('Room is required');
  }
  if (!data.tenant) {
    errors.push('Tenant is required');
  }
  if (!data.owner) {
    errors.push('Owner is required');
  }
  if (!data.checkInDate) {
    errors.push('Check-in date is required');
  }
  if (!data.checkOutDate) {
    errors.push('Check-out date is required');
  }
  if (data.checkInDate >= data.checkOutDate) {
    errors.push('Check-out date must be after check-in date');
  }
  if (typeof data.numberOfMonths !== 'number' || data.numberOfMonths < 1) {
    errors.push('Invalid number of months');
  }
  if (typeof data.totalPrice !== 'number' || data.totalPrice < 0) {
    errors.push('Invalid total price');
  }
  
  return errors;
};

function isValidEmail(email) {
  const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return emailRegex.test(email);
}

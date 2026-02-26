import { auth, db } from '../config/firebase.js';
import ErrorHandler from '../utils/errorHandler.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'roomfinder_super_secret_key_2024';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '7d';

const signToken = (uid, email, role) => jwt.sign({ uid, email, role }, JWT_SECRET, { expiresIn: JWT_EXPIRE });

/**
 * Register a new user
 * Creates Firebase Auth user and Firestore user document
 */
export const registerUser = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, role } = req.body;

    // Validate input
    if (!firstName || !lastName || !email || !password) {
      return next(new ErrorHandler('Please provide all required fields', 400));
    }

    // Check if user already exists in Firestore
    const userQuery = await db.collection('users').where('email', '==', email).limit(1).get();
    if (!userQuery.empty) {
      return next(new ErrorHandler('User already exists with this email', 400));
    }

    // Create Firebase Auth user
    let firebaseUser;
    try {
      firebaseUser = await auth.createUser({
        email,
        password,
        displayName: `${firstName} ${lastName}`
      });
    } catch (authError) {
      if (authError.code === 'auth/email-already-exists') {
        return next(new ErrorHandler('User already exists with this email', 400));
      }
      return next(new ErrorHandler(authError.message, 400));
    }

    // Create user document in Firestore
    const userData = {
      uid: firebaseUser.uid,
      firstName,
      lastName,
      email,
      role: role || 'tenant',
      profilePicture: null,
      bio: '',
      address: {},
      isVerified: false,
      rooms: [],
      bookings: [],
      ratings: {
        averageRating: 0,
        totalReviews: 0
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await db.collection('users').doc(firebaseUser.uid).set(userData);

    // Generate JWT token
    const token = signToken(firebaseUser.uid, email, role || 'tenant');

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: firebaseUser.uid,
        firstName,
        lastName,
        email,
        role: role || 'tenant'
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login user
 * Firebase Auth handles password verification
 * Returns custom token for backend
 */
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new ErrorHandler('Please provide email and password', 400));
    }

    try {
      // Get user by email from Firebase Auth
      const userRecord = await auth.getUserByEmail(email);

      // Fetch user data from Firestore
      const userDoc = await db.collection('users').doc(userRecord.uid).get();

      if (!userDoc.exists) {
        return next(new ErrorHandler('User data not found', 404));
      }

      const userData = userDoc.data();

      // Generate JWT token
      const token = signToken(userRecord.uid, userData.email, userData.role);

      res.status(200).json({
        success: true,
        message: 'Logged in successfully',
        token,
        user: {
          id: userRecord.uid,
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          role: userData.role
        }
      });
    } catch (authError) {
      if (authError.code === 'auth/user-not-found') {
        return next(new ErrorHandler('Invalid email or password', 401));
      }
      return next(new ErrorHandler('Invalid credentials', 401));
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Get current authenticated user
 */
export const getCurrentUser = async (req, res, next) => {
  try {
    const userId = req.user.uid || req.user.id;

    const userDoc = await db.collection('users').doc(userId).get();

    if (!userDoc.exists) {
      return next(new ErrorHandler('User not found', 404));
    }

    const userData = userDoc.data();

    // Fetch related rooms if needed
    if (userData.rooms && userData.rooms.length > 0) {
      const roomsSnapshot = await db.collection('rooms')
        .where('__name__', 'in', userData.rooms.slice(0, 10)) // Firestore limit
        .get();
      userData.rooms = roomsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }

    res.status(200).json({
      success: true,
      user: userData
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user profile
 */
export const updateUserProfile = async (req, res, next) => {
  try {
    const userId = req.user.uid || req.user.id;
    const { firstName, lastName, phone, bio, address } = req.body;

    const updateData = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (phone) updateData.phone = phone;
    if (bio) updateData.bio = bio;
    if (address) updateData.address = address;

    updateData.updatedAt = new Date();

    await db.collection('users').doc(userId).update(updateData);

    // Fetch updated user
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.data();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: userData
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user by ID
 */
export const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const userDoc = await db.collection('users').doc(id).get();

    if (!userDoc.exists) {
      return next(new ErrorHandler('User not found', 404));
    }

    const userData = userDoc.data();

    res.status(200).json({
      success: true,
      user: userData
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all users (Admin only)
 */
export const getAllUsers = async (req, res, next) => {
  try {
    const { role, search } = req.query;

    let query = db.collection('users');

    if (role) {
      query = query.where('role', '==', role);
    }

    const snapshot = await query.limit(100).get();

    let users = snapshot.docs.map(doc => {
      const userData = doc.data();
      delete userData.password; // Remove password field if present
      return { id: doc.id, ...userData };
    });

    // Client-side search if needed
    if (search) {
      const searchLower = search.toLowerCase();
      users = users.filter(user =>
        user.firstName.toLowerCase().includes(searchLower) ||
        user.lastName.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower)
      );
    }

    res.status(200).json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    next(error);
  }
};

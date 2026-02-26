import { db, default as admin } from '../config/firebase.js';
import ErrorHandler from '../utils/errorHandler.js';

const bookingsCollection = () => db.collection('bookings');
const roomsCollection = () => db.collection('rooms');
const usersCollection = () => db.collection('users');

// Create Booking
export const createBooking = async (req, res, next) => {
  try {
    const { roomId, checkInDate, checkOutDate, numberOfMonths } = req.body;

    const roomDoc = await roomsCollection().doc(roomId).get();
    if (!roomDoc.exists) return next(new ErrorHandler('Room not found', 404));
    const room = roomDoc.data();

    if (!room.availability) return next(new ErrorHandler('Room is not available for booking', 400));

    // Check for date conflicts (simple scan)
    const existing = await bookingsCollection().where('room', '==', roomId).where('status', 'in', ['confirmed', 'checked-in']).get();
    for (const doc of existing.docs) {
      const b = doc.data();
      const bIn = new Date(b.checkInDate);
      const bOut = new Date(b.checkOutDate);
      if (bIn < new Date(checkOutDate) && bOut > new Date(checkInDate)) {
        return next(new ErrorHandler('Room is already booked for selected dates', 400));
      }
    }

    const totalPrice = (room.price || 0) * Number(numberOfMonths || 1);

    const bookingData = {
      room: roomId,
      tenant: req.user.uid || req.user.id,
      owner: room.owner,
      checkInDate: new Date(checkInDate),
      checkOutDate: new Date(checkOutDate),
      numberOfMonths: Number(numberOfMonths || 1),
      status: 'pending',
      totalPrice,
      deposit: { amount: totalPrice * 0.2, paid: false },
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    const docRef = await bookingsCollection().add(bookingData);

    // Add booking id to room and user (best effort)
    try { await roomsCollection().doc(roomId).update({ bookings: admin.firestore.FieldValue.arrayUnion(docRef.id) }); } catch(e){}
    try { await usersCollection().doc(req.user.uid || req.user.id).update({ bookings: admin.firestore.FieldValue.arrayUnion(docRef.id) }); } catch(e){}

    const booking = { id: docRef.id, ...bookingData };
    res.status(201).json({ success: true, message: 'Booking created successfully', booking });
  } catch (error) {
    next(error);
  }
};

// Get All Bookings (Admin)
export const getAllBookings = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 12 } = req.query;
    let query = bookingsCollection().orderBy('createdAt', 'desc');
    const snapshot = await query.limit(1000).get();
    let bookings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    if (status) bookings = bookings.filter(b => b.status === status);
    const totalBookings = bookings.length;
    const currentPage = Number(page);
    const perPage = Number(limit);
    const paged = bookings.slice((currentPage - 1) * perPage, currentPage * perPage);
    res.status(200).json({ success: true, count: paged.length, totalBookings, totalPages: Math.ceil(totalBookings / perPage), currentPage, bookings: paged });
  } catch (error) {
    next(error);
  }
};

// Get User's Bookings
export const getUserBookings = async (req, res, next) => {
  try {
    const uid = req.user.uid || req.user.id;
    const snapshot = await bookingsCollection().where('tenant', '==', uid).get();
    const bookings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json({ success: true, count: bookings.length, bookings });
  } catch (error) {
    next(error);
  }
};

// Get Owner's Bookings
export const getOwnerBookings = async (req, res, next) => {
  try {
    const uid = req.user.uid || req.user.id;
    const snapshot = await bookingsCollection().where('owner', '==', uid).get();
    const bookings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json({ success: true, count: bookings.length, bookings });
  } catch (error) {
    next(error);
  }
};

// Get Single Booking
export const getBookingById = async (req, res, next) => {
  try {
    const doc = await bookingsCollection().doc(req.params.id).get();
    if (!doc.exists) return next(new ErrorHandler('Booking not found', 404));
    const b = { id: doc.id, ...doc.data() };
    const uid = req.user.uid || req.user.id;
    if (b.tenant !== uid && b.owner !== uid && req.user.role !== 'admin') return next(new ErrorHandler('Not authorized to view this booking', 403));
    res.status(200).json({ success: true, booking: b });
  } catch (error) {
    next(error);
  }
};

// Update Booking Status
export const updateBookingStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const docRef = bookingsCollection().doc(req.params.id);
    const doc = await docRef.get();
    if (!doc.exists) return next(new ErrorHandler('Booking not found', 404));
    const b = doc.data();
    const uid = req.user.uid || req.user.id;
    if (b.owner !== uid && b.tenant !== uid && req.user.role !== 'admin') return next(new ErrorHandler('Not authorized to update this booking', 403));
    await docRef.update({ status, updatedAt: admin.firestore.FieldValue.serverTimestamp() });
    const updated = await docRef.get();
    res.status(200).json({ success: true, message: 'Booking status updated successfully', booking: { id: updated.id, ...updated.data() } });
  } catch (error) {
    next(error);
  }
};

// Cancel Booking
export const cancelBooking = async (req, res, next) => {
  try {
    const docRef = bookingsCollection().doc(req.params.id);
    const doc = await docRef.get();
    if (!doc.exists) return next(new ErrorHandler('Booking not found', 404));
    const b = doc.data();
    const uid = req.user.uid || req.user.id;
    if (b.tenant !== uid && req.user.role !== 'admin') return next(new ErrorHandler('Not authorized to cancel this booking', 403));
    if (b.status === 'checked-in') return next(new ErrorHandler('Cannot cancel a checked-in booking', 400));
    await docRef.update({ status: 'cancelled', updatedAt: admin.firestore.FieldValue.serverTimestamp() });
    const updated = await docRef.get();
    res.status(200).json({ success: true, message: 'Booking cancelled successfully', booking: { id: updated.id, ...updated.data() } });
  } catch (error) {
    next(error);
  }
};

// Get Booking Statistics
export const getBookingStats = async (req, res, next) => {
  try {
    const snapshot = await bookingsCollection().get();
    const bookings = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    const totalBookings = bookings.length;
    const pendingBookings = bookings.filter(b => b.status === 'pending').length;
    const confirmedBookings = bookings.filter(b => b.status === 'confirmed').length;
    const completedBookings = bookings.filter(b => b.status === 'checked-out').length;
    const totalRevenue = bookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
    res.status(200).json({ success: true, stats: { totalBookings, pendingBookings, confirmedBookings, completedBookings, totalRevenue } });
  } catch (error) {
    next(error);
  }
};

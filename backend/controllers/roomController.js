import { db, default as admin } from '../config/firebase.js';
import ErrorHandler from '../utils/errorHandler.js';
import { geohashQueryBounds, distanceBetween, geohashForLocation } from 'geofire-common';

const roomsCollection = () => db.collection('rooms');
const usersCollection = () => db.collection('users');

// Create Room
export const createRoom = async (req, res, next) => {
  try {
    const {
      title,
      description,
      price,
      bedrooms,
      bathrooms,
      squareFeet,
      amenities = [],
      coverImage,
      images = [],
      address = {},
      location, // { latitude, longitude }
      availableFrom,
      availableUntil,
      rules = {}
    } = req.body;

    if (!location || typeof location.latitude !== 'number' || typeof location.longitude !== 'number') {
      return next(new ErrorHandler('Invalid location provided', 400));
    }

    const geohash = geohashForLocation([location.latitude, location.longitude]);

    const roomData = {
      title,
      description,
      price,
      bedrooms,
      bathrooms,
      squareFeet,
      amenities,
      coverImage,
      images,
      address,
      location: {
        latitude: location.latitude,
        longitude: location.longitude
      },
      geohash,
      availableFrom: availableFrom ? new Date(availableFrom) : null,
      availableUntil: availableUntil ? new Date(availableUntil) : null,
      availability: true,
      rules,
      owner: req.user.uid || req.user.id,
      bookings: [],
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    const docRef = await roomsCollection().add(roomData);

    // Add room id to user's rooms array (best effort)
    try {
      await usersCollection().doc(req.user.uid || req.user.id).set({ rooms: admin.firestore.FieldValue.arrayUnion(docRef.id) }, { merge: true });
    } catch (e) {
      // ignore
    }

    const room = { id: docRef.id, ...roomData };

    res.status(201).json({ success: true, message: 'Room created successfully', room });
  } catch (error) {
    next(error);
  }
};

// Get All Rooms
export const getAllRooms = async (req, res, next) => {
  try {
    const { keyword, minPrice, maxPrice, bedrooms, bathrooms, amenities, availability, page = 1, limit = 12 } = req.query;

    let query = roomsCollection().orderBy('createdAt', 'desc');

    // Firestore doesn't support very dynamic queries easily; fetch and filter server-side
    const snapshot = await query.limit(1000).get();
    let rooms = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    if (keyword) {
      const keywordLower = keyword.toLowerCase();
      rooms = rooms.filter(r =>
        (r.title || '').toLowerCase().includes(keywordLower) ||
        (r.address?.city || '').toLowerCase().includes(keywordLower)
      );
    }

    if (minPrice) rooms = rooms.filter(r => r.price >= Number(minPrice));
    if (maxPrice) rooms = rooms.filter(r => r.price <= Number(maxPrice));
    if (bedrooms) rooms = rooms.filter(r => r.bedrooms >= Number(bedrooms));
    if (bathrooms) rooms = rooms.filter(r => r.bathrooms >= Number(bathrooms));
    if (amenities) {
      const amenityArray = Array.isArray(amenities) ? amenities : [amenities];
      rooms = rooms.filter(r => amenityArray.every(a => (r.amenities || []).includes(a)));
    }
    if (availability === 'true') rooms = rooms.filter(r => r.availability === true);

    const totalRooms = rooms.length;
    const currentPage = Number(page);
    const perPage = Number(limit);
    const paged = rooms.slice((currentPage - 1) * perPage, currentPage * perPage);

    res.status(200).json({
      success: true,
      count: paged.length,
      totalRooms,
      totalPages: Math.ceil(totalRooms / perPage),
      currentPage,
      rooms: paged
    });
  } catch (error) {
    next(error);
  }
};

// Search Rooms by Location
export const searchRoomsByLocation = async (req, res, next) => {
  try {
    const { latitude, longitude, radius = 50000, minPrice, maxPrice, bedrooms, bathrooms, amenities, page = 1, limit = 12 } = req.query;

    const center = [Number(latitude), Number(longitude)];
    const radiusInM = Number(radius);

    const bounds = geohashQueryBounds(center, radiusInM);
    const promises = bounds.map(b => roomsCollection().orderBy('geohash').startAt(b[0]).endAt(b[1]).get());
    const snapshots = await Promise.all(promises);

    let matchingDocs = [];
    for (const snap of snapshots) {
      for (const doc of snap.docs) {
        const data = doc.data();
        const lat = data.location?.latitude;
        const lon = data.location?.longitude;
        if (typeof lat !== 'number' || typeof lon !== 'number') continue;
        const distanceInM = distanceBetween([lat, lon], center) * 1000;
        if (distanceInM <= radiusInM) {
          matchingDocs.push({ id: doc.id, distance: distanceInM, ...data });
        }
      }
    }

    if (minPrice) matchingDocs = matchingDocs.filter(r => r.price >= Number(minPrice));
    if (maxPrice) matchingDocs = matchingDocs.filter(r => r.price <= Number(maxPrice));
    if (bedrooms) matchingDocs = matchingDocs.filter(r => r.bedrooms >= Number(bedrooms));
    if (bathrooms) matchingDocs = matchingDocs.filter(r => r.bathrooms >= Number(bathrooms));
    if (amenities) {
      const amenityArray = Array.isArray(amenities) ? amenities : [amenities];
      matchingDocs = matchingDocs.filter(r => amenityArray.every(a => (r.amenities || []).includes(a)));
    }

    const totalRooms = matchingDocs.length;
    const currentPage = Number(page);
    const perPage = Number(limit);
    const paged = matchingDocs.slice((currentPage - 1) * perPage, currentPage * perPage);

    res.status(200).json({
      success: true,
      count: paged.length,
      totalRooms,
      totalPages: Math.ceil(totalRooms / perPage),
      currentPage,
      rooms: paged
    });
  } catch (error) {
    next(error);
  }
};

// Get Single Room
export const getRoomById = async (req, res, next) => {
  try {
    const doc = await roomsCollection().doc(req.params.id).get();
    if (!doc.exists) return next(new ErrorHandler('Room not found', 404));
    const room = { id: doc.id, ...doc.data() };
    res.status(200).json({ success: true, room });
  } catch (error) {
    next(error);
  }
};

// Update Room
export const updateRoom = async (req, res, next) => {
  try {
    const docRef = roomsCollection().doc(req.params.id);
    const doc = await docRef.get();
    if (!doc.exists) return next(new ErrorHandler('Room not found', 404));
    const room = doc.data();

    if (room.owner !== (req.user.uid || req.user.id) && req.user.role !== 'admin') {
      return next(new ErrorHandler('Not authorized to update this room', 403));
    }

    const updateData = { ...req.body, updatedAt: admin.firestore.FieldValue.serverTimestamp() };
    await docRef.update(updateData);
    const updated = await docRef.get();

    res.status(200).json({ success: true, message: 'Room updated successfully', room: { id: updated.id, ...updated.data() } });
  } catch (error) {
    next(error);
  }
};

// Delete Room
export const deleteRoom = async (req, res, next) => {
  try {
    const docRef = roomsCollection().doc(req.params.id);
    const doc = await docRef.get();
    if (!doc.exists) return next(new ErrorHandler('Room not found', 404));
    const room = doc.data();

    if (room.owner !== (req.user.uid || req.user.id) && req.user.role !== 'admin') {
      return next(new ErrorHandler('Not authorized to delete this room', 403));
    }

    await docRef.delete();
    // Optionally remove from user.rooms (best-effort)
    try {
      await usersCollection().doc(room.owner).update({ rooms: admin.firestore.FieldValue.arrayRemove(req.params.id) });
    } catch (e) { }

    res.status(200).json({ success: true, message: 'Room deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Get Rooms by Owner
export const getRoomsByOwner = async (req, res, next) => {
  try {
    const ownerId = req.params.ownerId || (req.user.uid || req.user.id);
    const snapshot = await roomsCollection().where('owner', '==', ownerId).get();
    const rooms = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json({ success: true, count: rooms.length, rooms });
  } catch (error) {
    next(error);
  }
};

// Filter by distance and price (Google Maps integration ready)
export const filterRooms = async (req, res, next) => {
  try {
    // If lat/lon provided, use geospatial search, else fallback to list filters
    const { latitude, longitude } = req.query;
    if (latitude && longitude) {
      return searchRoomsByLocation(req, res, next);
    }
    return getAllRooms(req, res, next);
  } catch (error) {
    next(error);
  }
};

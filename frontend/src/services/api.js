import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getCurrentUser: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  getUserById: (id) => api.get(`/auth/${id}`)
};

// Room API
export const roomAPI = {
  getAllRooms: (params) => api.get('/rooms', { params }),
  searchByLocation: (params) => api.get('/rooms/search/location', { params }),
  filterRooms: (params) => api.get('/rooms/filter/advanced', { params }),
  getRoomById: (id) => api.get(`/rooms/${id}`),
  createRoom: (data) => api.post('/rooms', data),
  updateRoom: (id, data) => api.put(`/rooms/${id}`, data),
  deleteRoom: (id) => api.delete(`/rooms/${id}`),
  getRoomsByOwner: () => api.get('/rooms/my-rooms/list'),
  getRoomsByOwnerId: (ownerId) => api.get(`/rooms/owner/${ownerId}`)
};

// Booking API
export const bookingAPI = {
  createBooking: (data) => api.post('/bookings', data),
  getAllBookings: (params) => api.get('/bookings', { params }),
  getUserBookings: () => api.get('/bookings/my-bookings'),
  getOwnerBookings: () => api.get('/bookings/owner/bookings'),
  getBookingById: (id) => api.get(`/bookings/${id}`),
  updateBookingStatus: (id, data) => api.put(`/bookings/${id}/status`, data),
  cancelBooking: (id) => api.put(`/bookings/${id}/cancel`),
  getBookingStats: () => api.get('/bookings/stats')
};

// Upload API
export const uploadAPI = {
  uploadRoomImage: (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post('/upload/room-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }
};

// Maps API
// Maps are handled client-side with Leaflet/OpenStreetMap. Backend map routes were removed.

export default api;

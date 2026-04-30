// frontend/src/services/api.js
import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5000/api' });

export const registerUser = (userData) => API.post('/auth/register', userData);
export const loginUser = (userData) => API.post('/auth/login', userData);
export const createRide = (rideData) => API.post('/rides/create', rideData);
export const searchRides = (query) => API.get('/rides/search', { params: query });
export const bookRide = (rideId, userId) => API.put(`/rides/book/${rideId}`, { userId });
export const getDriverRides = (driverId) => API.get(`/rides/driver/${driverId}`);

export const getMyBookings = (userId) => API.get(`/rides/my-bookings/${userId}`);
export const cancelBooking = (rideId, userId) => API.put(`/rides/cancel-booking/${rideId}`, { userId });
export const googleLogin = (token) => API.post('/auth/google-login', { token });
export const getUserProfile = (id) => API.get('/auth/me/' + id);
export const updateUserProfile = (id, formData) => API.put('/auth/update/' + id, formData, { headers: { 'Content-Type': 'multipart/form-data' } });

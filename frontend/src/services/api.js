// frontend/src/services/api.js
import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5000/api' });

export const registerUser = (userData) => API.post('/auth/register', userData);
export const loginUser = (userData) => API.post('/auth/login', userData);
export const createRide = (rideData) => API.post('/rides/create', rideData);
export const searchRides = (query) => API.get('/rides/search', { params: query });
export const requestRide = (rideId, userId, pickupLocation, dropLocation) => API.put(`/rides/request/${rideId}`, { userId, pickupLocation, dropLocation });
export const acceptRequest = (rideId, requestId) => API.put(`/rides/${rideId}/request/${requestId}/accept`);
export const rejectRequest = (rideId, requestId) => API.put(`/rides/${rideId}/request/${requestId}/reject`);
export const getDriverRides = (driverId) => API.get(`/rides/driver/${driverId}`);

export const getMyBookings = (userId) => API.get(`/rides/my-bookings/${userId}`);
export const cancelBooking = (rideId, userId) => API.put(`/rides/cancel-booking/${rideId}`, { userId });
export const googleLogin = (token) => API.post('/auth/google-login', { token });
export const getUserProfile = (id) => API.get('/auth/me/' + id);
export const updateUserProfile = (id, formData) => API.put('/auth/update/' + id, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const updateRide = (rideId, rideData) => API.put(`/rides/update/${rideId}`, rideData);
export const deleteRide = (rideId) => API.delete(`/rides/delete/${rideId}`);
export const switchRole = (userId) => API.put('/auth/switch-role/' + userId);
export const createReview = (reviewData) => API.post('/reviews/create', reviewData);
export const getUserReviews = (userId) => API.get(`/reviews/user/${userId}`);

import { useState, useEffect, useRef, useCallback } from 'react';
import io from 'socket.io-client';
import { getUnreadCounts } from '../services/api';

const SOCKET_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace('/api', '')
  : 'http://localhost:5000';

/**
 * useChatNotifications
 * 
 * Maintains a real-time unread message count map keyed by "rideId_senderId".
 * Connects to the user's personal Socket.io room and listens for new_message_notification.
 * 
 * @param {string} userId - the current user's ID
 * @returns {{ unreadMap: Object, clearUnread: Function, refreshUnread: Function }}
 */
export function useChatNotifications(userId) {
  const [unreadMap, setUnreadMap] = useState({});
  const socketRef = useRef(null);
  const token = localStorage.getItem('token');

  // Load initial unread counts from DB
  const refreshUnread = useCallback(async () => {
    if (!userId || !token) return;
    try {
      const res = await getUnreadCounts(userId, token);
      setUnreadMap(res.data);
    } catch (err) {
      console.error('Failed to fetch unread counts:', err);
    }
  }, [userId, token]);

  // Clear unread for a specific ride+sender (called when chat is opened)
  const clearUnread = useCallback((rideId, senderId) => {
    const key = `${rideId}_${senderId}`;
    setUnreadMap(prev => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  // Connect to personal notification socket room
  useEffect(() => {
    if (!userId) return;

    refreshUnread();

    const sock = io(SOCKET_URL, { transports: ['websocket', 'polling'] });
    socketRef.current = sock;

    sock.on('connect', () => {
      sock.emit('join_user_room', { userId });
    });

    sock.on('new_message_notification', ({ rideId, senderId }) => {
      const key = `${rideId}_${senderId}`;
      setUnreadMap(prev => ({ ...prev, [key]: (prev[key] || 0) + 1 }));
    });

    return () => {
      sock.disconnect();
      socketRef.current = null;
    };
  }, [userId]); // eslint-disable-line

  return { unreadMap, clearUnread, refreshUnread };
}

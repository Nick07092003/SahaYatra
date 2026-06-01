import React, { useState, useEffect, useRef, useCallback } from 'react';
import io from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import { format, isToday, isYesterday } from 'date-fns';
import { getChatHistory, markChatRead } from '../services/api';

/* ─── Helpers ──────────────────────────────────────────────────────────── */
const SOCKET_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace('/api', '')
  : 'http://localhost:5000';

function formatTimestamp(dateStr) {
  const d = new Date(dateStr);
  if (isToday(d)) return format(d, 'h:mm a');
  if (isYesterday(d)) return `Yesterday ${format(d, 'h:mm a')}`;
  return format(d, 'MMM d, h:mm a');
}

function shouldShowTimestamp(messages, index) {
  if (index === 0) return true;
  const diff = new Date(messages[index].createdAt) - new Date(messages[index - 1].createdAt);
  return diff > 5 * 60 * 1000; // 5 minutes
}

function getInitials(name = '') {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';
}

/* ─── Component ─────────────────────────────────────────────────────────── */
const ChatModal = ({ isOpen, onClose, rideId, currentUserId, otherUser }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const token = localStorage.getItem('token');

  const otherId = otherUser?._id || otherUser?.id;

  /* ── Socket + history setup ───────────────────────────────────────────── */
  useEffect(() => {
    if (!isOpen || !rideId || !otherUser) return;

    setLoading(true);
    setMessages([]);

    // Connect socket
    const sock = io(SOCKET_URL, { transports: ['websocket', 'polling'] });

    sock.on('connect', () => {
      sock.emit('join_room', { rideId, userId1: currentUserId, userId2: otherId });
    });

    sock.on('receive_message', (msg) => {
      setMessages(prev => {
        // Deduplicate by _id
        if (prev.some(m => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
    });

    setSocket(sock);

    // Fetch history + mark read
    const init = async () => {
      try {
        const res = await getChatHistory(rideId, otherId, token);
        setMessages(res.data);
        await markChatRead(rideId, otherId, token);
      } catch (err) {
        console.error('Chat history error:', err);
      } finally {
        setLoading(false);
      }
    };
    init();

    return () => {
      sock.disconnect();
      setSocket(null);
    };
  }, [isOpen, rideId, otherId, currentUserId, token]); // eslint-disable-line

  /* ── Auto-scroll ──────────────────────────────────────────────────────── */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  /* ── Focus input on open ─────────────────────────────────────────────── */
  useEffect(() => {
    if (isOpen && !loading) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, loading]);

  /* ── Send message ────────────────────────────────────────────────────── */
  const handleSend = useCallback((e) => {
    e.preventDefault();
    const text = newMessage.trim();
    if (!text || !socket || sending) return;

    setSending(true);
    socket.emit('send_message', {
      rideId,
      senderId: currentUserId,
      receiverId: otherId,
      text,
    });
    setNewMessage('');
    setSending(false);
  }, [newMessage, socket, sending, rideId, currentUserId, otherId]);

  /* ── Keyboard: send on Enter, newline on Shift+Enter ─────────────────── */
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  if (!isOpen || !otherUser) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 60, scale: 0.96 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative bg-white w-full sm:w-[440px] h-[88vh] sm:h-[600px] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden z-10"
          onClick={e => e.stopPropagation()}
        >
          {/* ── Header ── */}
          <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 text-white px-5 py-4 flex items-center gap-3 shrink-0">
            {/* Avatar */}
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center font-extrabold text-sm tracking-wide">
                {getInitials(otherUser.name)}
              </div>
              {/* Online dot */}
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-300 rounded-full border-2 border-emerald-600 block" />
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-base leading-tight truncate">{otherUser.name}</h3>
              <p className="text-emerald-100 text-xs font-medium">Private Ride Chat</p>
            </div>

            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-xl transition-all"
              aria-label="Close chat"
            >
              <span className="material-symbols-outlined text-[22px]">close</span>
            </button>
          </div>

          {/* ── Info banner ── */}
          <div className="bg-emerald-50 border-b border-emerald-100 px-4 py-2 flex items-center gap-2 text-emerald-700 text-xs font-semibold shrink-0">
            <span className="material-symbols-outlined text-[14px]">lock</span>
            Messages are only visible to you and {otherUser.name.split(' ')[0]}
          </div>

          {/* ── Messages ── */}
          <div className="flex-1 overflow-y-auto px-4 py-4 bg-slate-50 space-y-1">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-400">
                <div className="w-8 h-8 border-2 border-emerald-300 border-t-emerald-600 rounded-full animate-spin" />
                <p className="text-sm">Loading messages…</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-400">
                <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-3xl text-emerald-400">forum</span>
                </div>
                <p className="text-sm font-semibold text-slate-500">Start the conversation!</p>
                <p className="text-xs text-center max-w-[200px] leading-relaxed">
                  Say hi to {otherUser.name.split(' ')[0]} to coordinate your ride details.
                </p>
              </div>
            ) : (
              messages.map((msg, index) => {
                const isMe = msg.sender === currentUserId || msg.sender?._id === currentUserId;
                const showTs = shouldShowTimestamp(messages, index);

                return (
                  <div key={msg._id || index} className="flex flex-col">
                    {/* Timestamp divider */}
                    {showTs && (
                      <div className="flex items-center gap-2 my-3">
                        <div className="flex-1 h-px bg-slate-200" />
                        <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 whitespace-nowrap">
                          {formatTimestamp(msg.createdAt)}
                        </span>
                        <div className="flex-1 h-px bg-slate-200" />
                      </div>
                    )}

                    {/* Bubble */}
                    <div className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'} mb-1`}>
                      {/* Other user avatar for consecutive messages */}
                      {!isMe && (
                        <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold text-[9px] shrink-0 mb-0.5">
                          {getInitials(otherUser.name)}
                        </div>
                      )}

                      <div
                        className={`max-w-[72%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words shadow-sm ${
                          isMe
                            ? 'bg-emerald-600 text-white rounded-br-sm'
                            : 'bg-white text-slate-700 border border-slate-200 rounded-bl-sm'
                        }`}
                      >
                        {msg.text}
                        {/* Read receipt for sender's last message */}
                        {isMe && index === messages.length - 1 && (
                          <span className="block text-right mt-1">
                            <span className={`text-[10px] ${msg.read ? 'text-emerald-200' : 'text-emerald-300/70'}`}>
                              {msg.read ? '✓✓' : '✓'}
                            </span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* ── Input ── */}
          <div className="px-4 py-3 bg-white border-t border-slate-100 shrink-0">
            <form onSubmit={handleSend} className="flex items-end gap-2">
              <div className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all overflow-hidden">
                <textarea
                  ref={inputRef}
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message… (Enter to send)"
                  rows={1}
                  className="w-full bg-transparent border-none focus:ring-0 text-sm px-4 py-3 outline-none resize-none leading-relaxed max-h-28"
                  style={{ overflowY: newMessage.split('\n').length > 2 ? 'auto' : 'hidden' }}
                />
              </div>
              <motion.button
                whileTap={{ scale: 0.9 }}
                type="submit"
                disabled={!newMessage.trim() || sending}
                className="w-11 h-11 bg-emerald-600 text-white rounded-2xl flex items-center justify-center shrink-0 hover:bg-emerald-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-emerald-600/20"
              >
                <span className="material-symbols-outlined text-[20px] translate-x-0.5">send</span>
              </motion.button>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ChatModal;

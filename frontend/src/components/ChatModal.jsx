import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

const ChatModal = ({ isOpen, onClose, rideId, currentUserId, otherUser }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const messagesEndRef = useRef(null);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const token = localStorage.getItem('token');

  // Setup Socket.io connection
  useEffect(() => {
    if (isOpen && rideId && otherUser) {
      // Use the root URL (without /api) for socket connection
      const socketUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000';
      const newSocket = io(socketUrl);
      
      newSocket.on('connect', () => {
        // Join the unique room for this ride and these two users
        newSocket.emit('join_room', { 
          rideId: rideId, 
          userId1: currentUserId, 
          userId2: otherUser._id || otherUser.id 
        });
      });

      newSocket.on('receive_message', (message) => {
        setMessages((prevMessages) => {
          // Avoid duplicate messages if already in state
          if (prevMessages.find(m => m._id === message._id)) return prevMessages;
          return [...prevMessages, message];
        });
      });

      setSocket(newSocket);

      // Fetch chat history
      const fetchHistory = async () => {
        try {
          const response = await axios.get(`${API_URL}/chat/${rideId}/${otherUser._id || otherUser.id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setMessages(response.data);
          
          // Mark as read
          await axios.put(`${API_URL}/chat/read/${rideId}/${otherUser._id || otherUser.id}`, {}, {
            headers: { Authorization: `Bearer ${token}` }
          });
        } catch (error) {
          console.error("Error fetching chat history", error);
        }
      };

      fetchHistory();

      return () => {
        newSocket.disconnect();
      };
    }
  }, [isOpen, rideId, otherUser, currentUserId, API_URL, token]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() === '' || !socket) return;

    const messageData = {
      rideId,
      senderId: currentUserId,
      receiverId: otherUser._id || otherUser.id,
      text: newMessage,
      createdAt: new Date().toISOString()
    };

    socket.emit('send_message', messageData);
    setNewMessage('');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.95 }}
          className="bg-white w-full sm:w-[450px] h-[80vh] sm:h-[600px] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="bg-emerald-600 text-white p-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold uppercase text-lg border-2 border-white/30">
                {otherUser.name ? otherUser.name.charAt(0) : '?'}
              </div>
              <div>
                <h3 className="font-bold text-lg leading-tight">{otherUser.name}</h3>
                <p className="text-emerald-100 text-xs">Ride Chat</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-all">
              <span className="material-symbols-outlined text-[24px]">close</span>
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 bg-slate-50 space-y-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-2">
                <span className="material-symbols-outlined text-4xl opacity-50">forum</span>
                <p className="text-sm font-medium">Say hi to {otherUser.name.split(' ')[0]}!</p>
              </div>
            ) : (
              messages.map((msg, index) => {
                const isMe = msg.sender === currentUserId;
                const showTime = index === 0 || new Date(msg.createdAt).getTime() - new Date(messages[index - 1].createdAt).getTime() > 5 * 60 * 1000;
                
                return (
                  <div key={msg._id || index} className="flex flex-col">
                    {showTime && (
                      <div className="text-center my-3">
                        <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-full">
                          {format(new Date(msg.createdAt), 'MMM d, h:mm a')}
                        </span>
                      </div>
                    )}
                    <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div 
                        className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${
                          isMe 
                            ? 'bg-emerald-600 text-white rounded-br-sm shadow-md shadow-emerald-600/10' 
                            : 'bg-white text-slate-700 border border-slate-200 rounded-bl-sm shadow-sm'
                        }`}
                      >
                        <p className="leading-relaxed whitespace-pre-wrap break-words">{msg.text}</p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-slate-100 shrink-0">
            <form onSubmit={handleSendMessage} className="flex items-end gap-2">
              <div className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all overflow-hidden flex items-center p-1">
                <input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="w-full bg-transparent border-none focus:ring-0 text-sm px-3 py-2 outline-none"
                  autoFocus
                />
              </div>
              <button 
                type="submit" 
                disabled={!newMessage.trim()}
                className="w-11 h-11 bg-emerald-600 text-white rounded-full flex items-center justify-center shrink-0 hover:bg-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              >
                <span className="material-symbols-outlined text-[20px] ml-1">send</span>
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ChatModal;

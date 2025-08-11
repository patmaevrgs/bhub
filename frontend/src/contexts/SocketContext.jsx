import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import API_BASE_URL from '../config';

const SocketContext = createContext();

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Create socket connection
    const newSocket = io(API_BASE_URL, {
      withCredentials: true
    });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      setIsConnected(true);
      console.log('Connected to server');
      
      // Join appropriate room based on user type
      const userType = localStorage.getItem('userType');
      const userId = localStorage.getItem('user');
      const firstName = localStorage.getItem('firstName');
      const lastName = localStorage.getItem('lastName');
      
      if (userType && userId) {
        newSocket.emit('join', {
          userId,
          userType,
          name: `${firstName} ${lastName}`
        });
      }
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
      console.log('Disconnected from server');
    });

    // Listen for new requests (for admins)
    newSocket.on('new_request', (notification) => {
      setNotifications(prev => [notification, ...prev.slice(0, 49)]); // Keep last 50
      
      // Show browser notification if permission granted
      if (Notification.permission === 'granted') {
        new Notification('New Request', {
          body: notification.message,
          icon: '/logo192.png'
        });
      }
    });

    // Listen for status updates (for residents)
    newSocket.on('status_update', (update) => {
      setNotifications(prev => [update, ...prev.slice(0, 49)]);
      
      if (Notification.permission === 'granted') {
        new Notification('Status Update', {
          body: update.message,
          icon: '/logo192.png'
        });
      }
    });

    return () => {
      newSocket.close();
    };
  }, []);

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const clearNotifications = () => {
    setNotifications([]);
  };

  const value = {
    socket,
    isConnected,
    notifications,
    clearNotifications
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
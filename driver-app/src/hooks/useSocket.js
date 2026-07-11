import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useSelector } from 'react-redux';

const SOCKET_URL = 'http://localhost:5001'; // Update for production

export const useSocket = (tripId) => {
  const socketRef = useRef(null);
  const { token } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!token) return;

    socketRef.current = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket'],
    });

    socketRef.current.on('connect', () => {
      console.log('Connected to socket server');
      if (tripId) {
        socketRef.current.emit('join:trip', tripId);
      }
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [token, tripId]);

  const emitLocation = (data) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('location:update', data);
    }
  };

  return { emitLocation, socket: socketRef.current };
};

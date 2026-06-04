import { io, Socket } from 'socket.io-client';
import { API_BASE_URL } from './api';

export const createSocket = (token?: string): Socket => {
  return io(API_BASE_URL, {
    autoConnect: false,
    auth: {
      token,
    },
    transports: ['websocket', 'polling'],
    withCredentials: true,
  });
};

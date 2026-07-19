import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { chatService } from '../services/chat.service';

const connectedUsers = new Map<string, string>();

export const handleChatSocket = (io: Server) => {
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication error'));

    if (!process.env.JWT_SECRET) {
      return next(new Error('Server configuration error'));
    }
    jwt.verify(token, process.env.JWT_SECRET, (err: any, decoded: any) => {
      if (err) return next(new Error('Authentication error'));
      socket.data.userId = decoded.userId;
      next();
    });
  });

  io.on('connection', (socket: Socket) => {
    const userId = socket.data.userId;
    connectedUsers.set(userId, socket.id);
    io.emit('user_status', { userId, status: 'online' });

    socket.on('join_conversation', (conversationId: string) => {
      socket.join(`conversation_${conversationId}`);
    });

    socket.on('leave_conversation', (conversationId: string) => {
      socket.leave(`conversation_${conversationId}`);
    });

    socket.on('send_message', async (data) => {
      const { conversationId, content } = data;
      try {
        const message = await chatService.sendMessage(conversationId, userId, content);
        io.to(`conversation_${conversationId}`).emit('receive_message', message);
        socket.emit('message_sent', message);
      } catch (error) {
        console.error('Error sending message via service:', error);
        socket.emit('message_error', { error: 'Failed to send message' });
      }
    });

    socket.on('typing', (data) => {
      const { conversationId } = data;
      socket.to(`conversation_${conversationId}`).emit('user_typing', { userId, conversationId });
    });

    socket.on('profile_updated', (profile) => {
      socket.broadcast.emit('profile_updated', profile);
    });

    socket.on('read_messages', async (data) => {
      const { conversationId } = data;
      try {
        const result = await chatService.markMessagesAsRead(conversationId, userId);
        socket.to(`conversation_${conversationId}`).emit('messages_read', {
          conversationId,
          readerId: userId,
          count: result.count,
        });
      } catch (error) {
        console.error('Error marking messages read via socket:', error);
      }
    });

    socket.on('call_user', (data) => {
      const { userToCall, signalData, from, name } = data;
      const receiverSocketId = connectedUsers.get(userToCall);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('incoming_call', { signal: signalData, from, name });
      }
    });

    socket.on('answer_call', (data) => {
      const receiverSocketId = connectedUsers.get(data.to);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('call_accepted', data.signal);
      }
    });

    socket.on('end_call', (data) => {
      const receiverSocketId = connectedUsers.get(data.to);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('call_ended');
      }
    });

    socket.on('disconnect', () => {
      connectedUsers.delete(userId);
      io.emit('user_status', { userId, status: 'offline' });
    });
  });
};

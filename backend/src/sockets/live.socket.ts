import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { giftService, liveService } from '../services';

export const handleLiveSocket = (io: Server) => {
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication error'));

    jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret', (err: any, decoded: any) => {
      if (err) return next(new Error('Authentication error'));
      socket.data.userId = decoded.userId;
      next();
    });
  });

  io.on('connection', (socket: Socket) => {
    const userId = socket.data.userId;
    socket.data.streamId = null;

    const leaveCurrentStream = async () => {
      const current = socket.data.streamId as string | null;
      if (!current) return;
      try {
        const count = await liveService.leaveStream(current, userId);
        io.to(`stream_${current}`).emit('viewer_count', { streamId: current, viewers: count });
        io.to(`stream_${current}`).emit('viewer_left', { streamId: current, userId });
      } catch (err) {
        console.error('Error leaving stream on disconnect:', err);
      } finally {
        socket.leave(`stream_${current}`);
        socket.data.streamId = null;
      }
    };

    socket.on('join_stream', async (streamId: string) => {
      try {
        await leaveCurrentStream();
        await liveService.joinStream(streamId, userId);
        socket.join(`stream_${streamId}`);
        socket.data.streamId = streamId;
        const count = await liveService.countViewers(streamId);
        io.to(`stream_${streamId}`).emit('viewer_count', { streamId, viewers: count });
        io.to(`stream_${streamId}`).emit('viewer_joined', { streamId, userId });
      } catch (err) {
        console.error('Error joining stream:', err);
        socket.emit('stream_error', { error: 'Unable to join the stream' });
      }
    });

    socket.on('leave_stream', async (streamId: string) => {
      try {
        await liveService.leaveStream(streamId, userId);
        socket.leave(`stream_${streamId}`);
        socket.data.streamId = null;
        const count = await liveService.countViewers(streamId);
        io.to(`stream_${streamId}`).emit('viewer_count', { streamId, viewers: count });
        io.to(`stream_${streamId}`).emit('viewer_left', { streamId, userId });
      } catch (err) {
        console.error('Error leaving stream:', err);
      }
    });

    socket.on('send_comment', async (data) => {
      const { streamId, comment } = data;
      try {
        const chatMessage = await liveService.postChatMessage(streamId, userId, comment);
        io.to(`stream_${streamId}`).emit('new_comment', { streamId, message: chatMessage });
      } catch (err) {
        console.error('Error sending comment:', err);
        socket.emit('chat_error', { error: 'Unable to send comment' });
      }
    });

    socket.on('send_gift', async (data) => {
      const { streamId, giftId } = data;
      try {
        const stream = await liveService.getStream(streamId);
        const tx = await giftService.sendGift(userId, stream.hostId, giftId);
        io.to(`stream_${streamId}`).emit('gift_received', { streamId, transaction: tx });
        socket.emit('gift_sent', tx);
      } catch (err) {
        console.error('Error sending gift:', err);
        socket.emit('gift_error', { error: 'Failed to send gift' });
      }
    });

    socket.on('end_stream', async (data) => {
      const { streamId } = data;
      try {
        await liveService.endStream(streamId, userId);
        io.to(`stream_${streamId}`).emit('stream_ended', { streamId });
      } catch (err) {
        console.error('Error ending stream:', err);
      }
    });

    socket.on('disconnect', async () => {
      await leaveCurrentStream();
    });
  });
};

import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { liveService, giftService } from '../services';
import { liveKitService } from '../services/livekit.service';

export const handleLiveSocket = (io: Server) => {
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
      } catch (err: any) {
        console.error('Error sending comment:', err);
        socket.emit('chat_error', { error: err.message || 'Unable to send comment' });
      }
    });

    socket.on('reaction', async (data) => {
      const { streamId, emoji } = data;
      try {
        await liveService.addReaction(streamId, userId, emoji);
        io.to(`stream_${streamId}`).emit('reaction', { streamId, userId, emoji });
      } catch (err) {
        console.error('Error sending reaction:', err);
      }
    });

    socket.on('send_gift', async (data) => {
      const { streamId, giftId, quantity } = data;
      try {
        const stream = await liveService.getStream(streamId);
        if (!stream) throw new Error('Stream not found');
        
        const tx = await giftService.sendGift(userId, stream.hostId, giftId);
        const giftEvent = {
          streamId,
          amount: tx.amount || tx.coins,
          senderName: tx.sender?.username || 'Anonymous',
          giftName: tx.gift?.name || 'Gift',
          giftEmoji: tx.gift?.emoji || '🎁',
        };
        
        io.to(`stream_${streamId}`).emit('gift_received', { streamId, transaction: giftEvent });
        socket.emit('gift_sent', tx);
      } catch (err) {
        console.error('Error sending gift:', err);
        socket.emit('gift_error', { error: 'Failed to send gift' });
      }
    });

    // Host controls
    socket.on('end_stream', async (data) => {
      const { streamId } = data;
      try {
        await liveService.endStream(streamId, userId);
        io.to(`stream_${streamId}`).emit('stream_ended', { streamId });
        // Close LiveKit room in background
        const stream = await liveService.getStream(streamId);
        if (stream?.liveKitRoom) {
          liveKitService.closeRoom(stream.liveKitRoom).catch(() => {});
        }
      } catch (err) {
        console.error('Error ending stream:', err);
      }
    });

    socket.on('mute_viewer', async (data) => {
      const { streamId, targetUserId } = data;
      try {
        await liveService.muteViewer(streamId, userId, targetUserId);
        io.to(`stream_${streamId}`).emit('viewer_muted', { streamId, userId: targetUserId });
      } catch (err) {
        console.error('Error muting viewer:', err);
      }
    });

    socket.on('ban_viewer', async (data) => {
      const { streamId, targetUserId } = data;
      try {
        await liveService.banViewer(streamId, userId, targetUserId);
        io.to(`stream_${streamId}`).emit('viewer_banned', { streamId, userId: targetUserId });
        // Also disconnect their socket from the room
        const sockets = await io.in(`stream_${streamId}`).fetchSockets();
        sockets.forEach(s => {
          if (s.data.userId === targetUserId) {
            s.leave(`stream_${streamId}`);
            s.emit('banned_from_stream', { streamId });
          }
        });
      } catch (err) {
        console.error('Error banning viewer:', err);
      }
    });

    socket.on('toggle_chat_pause', async (data) => {
      const { streamId } = data;
      try {
        const stream = await liveService.toggleChatPause(streamId, userId);
        io.to(`stream_${streamId}`).emit('chat_paused', { 
          streamId, 
          paused: stream.chatPaused 
        });
      } catch (err) {
        console.error('Error toggling chat pause:', err);
      }
    });

    socket.on('toggle_slow_mode', async (data) => {
      const { streamId, interval } = data;
      try {
        const stream = await liveService.toggleSlowMode(streamId, userId, interval);
        io.to(`stream_${streamId}`).emit('slow_mode', { 
          streamId, 
          enabled: stream.slowMode,
          interval: stream.slowModeInterval 
        });
      } catch (err) {
        console.error('Error toggling slow mode:', err);
      }
    });

    socket.on('update_stream_settings', async (data) => {
      const { streamId, settings } = data;
      try {
        await liveService.updateStreamSettings(streamId, userId, settings);
        io.to(`stream_${streamId}`).emit('stream_settings_updated', { streamId, settings });
      } catch (err) {
        console.error('Error updating stream settings:', err);
      }
    });

    socket.on('disconnect', async () => {
      await leaveCurrentStream();
    });
  });
};
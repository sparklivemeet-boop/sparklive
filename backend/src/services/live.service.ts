import { prisma } from "../prisma";
import { cacheService, CACHE_KEYS, CACHE_TTL } from "./cache.service";
import { dbPerformanceTracker } from "./monitoring.service";
import { liveKitService } from "./livekit.service";

export class LiveService {
  async getActiveStreams(cursor?: string, limit: number = 20) {
    return cacheService.getOrSet(CACHE_KEYS.LIVE_STREAMS, async () => {
      const queryStart = Date.now();
      
      const streams = await prisma.liveStream.findMany({
        where: { active: true, status: "LIVE" },
        orderBy: { viewerCount: "desc" },
        take: limit + 1,
        ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
        include: {
          host: { select: { id: true, username: true, fullName: true, avatar: true, verified: true } },
          category: { select: { name: true } },
          _count: { select: { viewers: true, giftEvents: true } },
        },
      });

      dbPerformanceTracker.trackQuery('LiveStream', Date.now() - queryStart, 'findManyActive');

      const nextCursor = streams.length > limit ? streams.pop()?.id : undefined;
      return { items: streams, nextCursor };
    }, CACHE_TTL.SHORT);
  }

  async getStream(streamId: string) {
    return cacheService.getOrSet(CACHE_KEYS.LIVE_STREAM(streamId), async () => {
      const queryStart = Date.now();
      
      const stream = await prisma.liveStream.findUnique({
        where: { id: streamId },
        include: {
          host: { select: { id: true, username: true, fullName: true, avatar: true, verified: true, bio: true } },
          category: { select: { name: true } },
          coHost: { select: { id: true, username: true, fullName: true, avatar: true, verified: true } },
          _count: { select: { viewers: true, giftEvents: true, reactions: true } },
        },
      });

      dbPerformanceTracker.trackQuery('LiveStream', Date.now() - queryStart, 'findUnique');
      
      return stream;
    }, CACHE_TTL.SHORT);
  }

  async startStream(
    hostId: string, 
    title: string, 
    categoryName?: string, 
    description?: string, 
    thumbnailUrl?: string, 
    allowGifts?: boolean, 
    allowPK?: boolean,
    language?: string,
    country?: string,
    recordingEnabled?: boolean
  ) {
    // Create LiveKit room
    const roomName = liveKitService.generateRoomName(hostId);
    await liveKitService.createRoom(roomName);

    // Get host info for token
    const host = await prisma.user.findUnique({
      where: { id: hostId },
      select: { id: true, username: true, fullName: true, avatar: true },
    });

    // Generate host token
    const hostToken = liveKitService.generateHostToken(
      roomName, 
      hostId, 
      host?.username || hostId
    );

    const stream = await prisma.liveStream.create({
      data: { 
        hostId, 
        title, 
        description: description || '', 
        categoryName,
        thumbnailUrl,
        allowGifts: allowGifts ?? true,
        allowPK: allowPK ?? false,
        language: language || 'en',
        country,
        recordingEnabled: recordingEnabled ?? false,
        liveKitRoom: roomName,
        liveKitToken: hostToken,
        status: 'LIVE',
        active: true,
        startedAt: new Date(),
        viewerCount: 0,
        peakViewers: 0,
        totalViewers: 0,
      },
      include: {
        host: { select: { id: true, username: true, fullName: true, avatar: true, verified: true } },
        category: { select: { name: true } },
      },
    });

    // Invalidate streams cache
    await cacheService.del(CACHE_KEYS.LIVE_STREAMS);
    
    return stream;
  }

  async endStream(streamId: string, hostId: string) {
    const stream = await prisma.liveStream.findUnique({
      where: { id: streamId },
    });

    if (!stream) throw new Error("Stream not found");
    if (stream.hostId !== hostId) throw new Error("Unauthorized");

    // Calculate duration
    const duration = stream.startedAt 
      ? Math.floor((Date.now() - stream.startedAt.getTime()) / 1000) 
      : 0;

    // Close LiveKit room
    if (stream.liveKitRoom) {
      await liveKitService.closeRoom(stream.liveKitRoom);
    }

    const updated = await prisma.liveStream.update({
      where: { id: streamId },
      data: { 
        active: false, 
        status: 'ENDED',
        endedAt: new Date(),
        duration,
      },
    });

    // Invalidate caches
    await cacheService.del(CACHE_KEYS.LIVE_STREAMS);
    await cacheService.del(CACHE_KEYS.LIVE_STREAM(streamId));
    
    return updated;
  }

  async joinStream(streamId: string, userId: string) {
    // Check if already joined
    const existing = await prisma.streamViewer.findUnique({
      where: { streamId_userId: { streamId, userId } },
    });

    if (!existing) {
      await prisma.streamViewer.create({
        data: { streamId, userId },
      });

      // Update viewer counts
      const count = await prisma.streamViewer.count({ where: { streamId } });
      const stream = await prisma.liveStream.findUnique({ where: { id: streamId } });
      
      await prisma.liveStream.update({
        where: { id: streamId },
        data: { 
          viewerCount: count,
          totalViewers: { increment: 1 },
          peakViewers: Math.max(count, stream?.peakViewers || 0),
        },
      });
    }

    return this.countViewers(streamId);
  }

  async leaveStream(streamId: string, userId: string) {
    await prisma.streamViewer.deleteMany({
      where: { streamId, userId },
    });

    const count = await prisma.streamViewer.count({ where: { streamId } });
    await prisma.liveStream.update({
      where: { id: streamId },
      data: { viewerCount: count },
    });

    return count;
  }

  async countViewers(streamId: string): Promise<number> {
    return prisma.streamViewer.count({ where: { streamId } });
  }

  async updateViewerCount(streamId: string, delta: number) {
    const stream = await prisma.liveStream.update({
      where: { id: streamId },
      data: { viewerCount: { increment: delta } },
    });

    // Update cache in background
    cacheService.del(CACHE_KEYS.LIVE_STREAMS).catch(() => {});
    cacheService.del(CACHE_KEYS.LIVE_STREAM(streamId)).catch(() => {});
    
    return stream;
  }

  async getStreamChat(streamId: string, cursor?: string, limit: number = 50) {
    const messages = await prisma.liveChatMessage.findMany({
      where: { streamId },
      orderBy: { createdAt: "desc" },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      include: {
        user: { select: { id: true, username: true, avatar: true, verified: true } },
      },
    });

    const nextCursor = messages.length > limit ? messages.pop()?.id : undefined;
    return { items: messages.reverse(), nextCursor };
  }

  async postChatMessage(streamId: string, userId: string, message: string) {
    // Check if stream has chat paused
    const stream = await prisma.liveStream.findUnique({
      where: { id: streamId },
      select: { chatPaused: true, slowMode: true, slowModeInterval: true, bannedUsers: true, mutedUsers: true },
    });

    if (!stream) throw new Error("Stream not found");
    if (stream.chatPaused) throw new Error("Chat is paused");
    
    // Check if user is banned
    const bannedUsers: string[] = stream.bannedUsers ? JSON.parse(stream.bannedUsers) : [];
    if (bannedUsers.includes(userId)) throw new Error("You are banned from this stream");

    // Check if user is muted
    const mutedUsers: string[] = stream.mutedUsers ? JSON.parse(stream.mutedUsers) : [];
    if (mutedUsers.includes(userId)) throw new Error("You are muted in this stream");

    // Slow mode check
    if (stream.slowMode) {
      const lastMessage = await prisma.liveChatMessage.findFirst({
        where: { streamId, userId },
        orderBy: { createdAt: 'desc' },
      });
      if (lastMessage) {
        const elapsed = (Date.now() - lastMessage.createdAt.getTime()) / 1000;
        if (elapsed < (stream.slowModeInterval || 3)) {
          throw new Error(`Please wait ${stream.slowModeInterval} seconds between messages`);
        }
      }
    }

    const chatMessage = await prisma.liveChatMessage.create({
      data: { streamId, userId, message },
      include: {
        user: { select: { id: true, username: true, avatar: true, verified: true } },
      },
    });

    return chatMessage;
  }

  async addReaction(streamId: string, userId: string, emoji: string) {
    const reaction = await prisma.liveReaction.create({
      data: { streamId, userId, emoji },
    });
    return reaction;
  }

  async getCategories() {
    return cacheService.getOrSet('stream_categories', async () => {
      return prisma.streamCategory.findMany({
        orderBy: { name: 'asc' },
      });
    }, CACHE_TTL.MEDIUM);
  }

  async getDiscoveryStreams(limit: number = 20, category?: string) {
    const where: any = { active: true, status: 'LIVE' };
    if (category && category !== 'all') {
      where.categoryName = category;
    }

    const streams = await prisma.liveStream.findMany({
      where,
      orderBy: [{ viewerCount: 'desc' }, { createdAt: 'desc' }],
      take: limit,
      include: {
        host: { select: { id: true, username: true, fullName: true, avatar: true, verified: true } },
        category: { select: { name: true } },
        _count: { select: { viewers: true, giftEvents: true } },
      },
    });

    return streams;
  }

  async getFollowingStreams(userId: string) {
    const follows = await prisma.streamFollower.findMany({
      where: { followerId: userId },
      select: { streamerId: true },
    });

    const streamerIds = follows.map(f => f.streamerId);

    if (streamerIds.length === 0) return [];

    return prisma.liveStream.findMany({
      where: { 
        hostId: { in: streamerIds },
        active: true,
        status: 'LIVE',
      },
      orderBy: { viewerCount: 'desc' },
      include: {
        host: { select: { id: true, username: true, fullName: true, avatar: true, verified: true } },
        category: { select: { name: true } },
        _count: { select: { viewers: true } },
      },
    });
  }

  async getStreamHistory(hostId: string, limit: number = 10) {
    return prisma.liveStream.findMany({
      where: { hostId, status: 'ENDED' },
      orderBy: { endedAt: 'desc' },
      take: limit,
      include: {
        _count: { select: { viewers: true, giftEvents: true } },
      },
    });
  }

  async getHostStats(hostId: string) {
    const [totalStreams, totalViewers, totalGifts, totalDuration] = await Promise.all([
      prisma.liveStream.count({ where: { hostId } }),
      prisma.liveStream.aggregate({ where: { hostId }, _sum: { totalViewers: true } }),
      prisma.liveStream.aggregate({ where: { hostId }, _sum: { gifts: true } }),
      prisma.liveStream.aggregate({ where: { hostId, status: 'ENDED' }, _sum: { duration: true } }),
    ]);

    return {
      totalStreams,
      totalViewers: totalViewers._sum.totalViewers || 0,
      totalGifts: totalGifts._sum.gifts || 0,
      totalDuration: totalDuration._sum.duration || 0,
    };
  }

  async followStreamer(streamerId: string, followerId: string) {
    const existing = await prisma.streamFollower.findUnique({
      where: { streamerId_followerId: { streamerId, followerId } },
    });

    if (existing) {
      await prisma.streamFollower.delete({
        where: { streamerId_followerId: { streamerId, followerId } },
      });
      return { following: false };
    }

    await prisma.streamFollower.create({
      data: { streamerId, followerId },
    });

    return { following: true };
  }

  // Host moderation methods
  async muteViewer(streamId: string, hostId: string, targetUserId: string) {
    const stream = await prisma.liveStream.findUnique({ where: { id: streamId } });
    if (!stream || stream.hostId !== hostId) throw new Error("Unauthorized");

    const mutedUsers: string[] = stream.mutedUsers ? JSON.parse(stream.mutedUsers) : [];
    if (!mutedUsers.includes(targetUserId)) {
      mutedUsers.push(targetUserId);
      await prisma.liveStream.update({
        where: { id: streamId },
        data: { mutedUsers: JSON.stringify(mutedUsers) },
      });
    }
  }

  async unmuteViewer(streamId: string, hostId: string, targetUserId: string) {
    const stream = await prisma.liveStream.findUnique({ where: { id: streamId } });
    if (!stream || stream.hostId !== hostId) throw new Error("Unauthorized");

    const mutedUsers: string[] = stream.mutedUsers ? JSON.parse(stream.mutedUsers) : [];
    const filtered = mutedUsers.filter(id => id !== targetUserId);
    await prisma.liveStream.update({
      where: { id: streamId },
      data: { mutedUsers: JSON.stringify(filtered) },
    });
  }

  async banViewer(streamId: string, hostId: string, targetUserId: string) {
    const stream = await prisma.liveStream.findUnique({ where: { id: streamId } });
    if (!stream || stream.hostId !== hostId) throw new Error("Unauthorized");

    const bannedUsers: string[] = stream.bannedUsers ? JSON.parse(stream.bannedUsers) : [];
    if (!bannedUsers.includes(targetUserId)) {
      bannedUsers.push(targetUserId);
      await prisma.liveStream.update({
        where: { id: streamId },
        data: { bannedUsers: JSON.stringify(bannedUsers) },
      });
    }

    // Also remove from viewers
    await prisma.streamViewer.deleteMany({
      where: { streamId, userId: targetUserId },
    });
  }

  async unbanViewer(streamId: string, hostId: string, targetUserId: string) {
    const stream = await prisma.liveStream.findUnique({ where: { id: streamId } });
    if (!stream || stream.hostId !== hostId) throw new Error("Unauthorized");

    const bannedUsers: string[] = stream.bannedUsers ? JSON.parse(stream.bannedUsers) : [];
    const filtered = bannedUsers.filter(id => id !== targetUserId);
    await prisma.liveStream.update({
      where: { id: streamId },
      data: { bannedUsers: JSON.stringify(filtered) },
    });
  }

  async toggleChatPause(streamId: string, hostId: string) {
    const stream = await prisma.liveStream.findUnique({ where: { id: streamId } });
    if (!stream || stream.hostId !== hostId) throw new Error("Unauthorized");

    return prisma.liveStream.update({
      where: { id: streamId },
      data: { chatPaused: !stream.chatPaused },
    });
  }

  async toggleSlowMode(streamId: string, hostId: string, interval?: number) {
    const stream = await prisma.liveStream.findUnique({ where: { id: streamId } });
    if (!stream || stream.hostId !== hostId) throw new Error("Unauthorized");

    return prisma.liveStream.update({
      where: { id: streamId },
      data: { 
        slowMode: !stream.slowMode,
        ...(interval ? { slowModeInterval: interval } : {}),
      },
    });
  }

  async updateStreamSettings(streamId: string, hostId: string, settings: any) {
    const stream = await prisma.liveStream.findUnique({ where: { id: streamId } });
    if (!stream || stream.hostId !== hostId) throw new Error("Unauthorized");

    return prisma.liveStream.update({
      where: { id: streamId },
      data: settings,
    });
  }

  async getViewerToken(streamId: string, userId: string) {
    const stream = await prisma.liveStream.findUnique({ 
      where: { id: streamId },
      select: { liveKitRoom: true },
    });
    if (!stream || !stream.liveKitRoom) throw new Error("Stream not found or not active");

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { username: true },
    });

    return liveKitService.generateViewerToken(stream.liveKitRoom, userId, user?.username || userId);
  }

  async getHostToken(streamId: string, hostId: string) {
    const stream = await prisma.liveStream.findUnique({ 
      where: { id: streamId },
      select: { liveKitRoom: true, hostId: true },
    });
    if (!stream || !stream.liveKitRoom) throw new Error("Stream not found");
    if (stream.hostId !== hostId) throw new Error("Unauthorized");

    const user = await prisma.user.findUnique({
      where: { id: hostId },
      select: { username: true },
    });

    return liveKitService.generateHostToken(stream.liveKitRoom, hostId, user?.username || hostId);
  }

  async likeStream(streamId: string) {
    return prisma.liveStream.update({
      where: { id: streamId },
      data: { likes: { increment: 1 } },
    });
  }
}

export const liveService = new LiveService();
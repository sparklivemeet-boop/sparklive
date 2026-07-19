import { prisma } from "../prisma";
import { cacheService, CACHE_KEYS, CACHE_TTL } from "./cache.service";
import { dbPerformanceTracker } from "./monitoring.service";

export class LiveService {
  async getActiveStreams(cursor?: string, limit: number = 20) {
    return cacheService.getOrSet(CACHE_KEYS.LIVE_STREAMS, async () => {
      const queryStart = Date.now();
      
      const streams = await prisma.liveStream.findMany({
        where: { active: true },
        orderBy: { viewerCount: "desc" },
        take: limit + 1,
        ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
        include: {
          host: { select: { id: true, username: true, fullName: true, avatar: true, verified: true } },
          category: { select: { name: true } },
          _count: { select: { viewers: true } },
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
          _count: { select: { viewers: true, giftEvents: true } },
        },
      });

      dbPerformanceTracker.trackQuery('LiveStream', Date.now() - queryStart, 'findUnique');
      
      return stream;
    }, CACHE_TTL.SHORT); // Short TTL for live data
  }

  async createStream(hostId: string, title: string, description?: string, categoryName?: string) {
    const stream = await prisma.liveStream.create({
      data: { hostId, title, description: description || '', categoryName },
      include: {
        host: { select: { id: true, username: true, avatar: true } },
      },
    });

    // Invalidate streams cache
    await cacheService.del(CACHE_KEYS.LIVE_STREAMS);
    
    return stream;
  }

  async endStream(streamId: string, hostId: string) {
    const stream = await prisma.liveStream.update({
      where: { id: streamId },
      data: { active: false },
    });

    if (stream.hostId !== hostId) throw new Error("Unauthorized");

    // Invalidate caches
    await cacheService.del(CACHE_KEYS.LIVE_STREAMS);
    await cacheService.del(CACHE_KEYS.LIVE_STREAM(streamId));
    
    return stream;
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
}

export const liveService = new LiveService();
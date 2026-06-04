import crypto from 'crypto';
import { prisma } from '../prisma';

export class LiveService {
  private async getOrCreateCategory(name: string) {
    const categoryName = name?.trim() || 'Just Chatting';
    return prisma.streamCategory.upsert({
      where: { name: categoryName },
      update: {},
      create: {
        name: categoryName,
        description: `${categoryName} livestream category`,
      },
    });
  }

  async startStream(
    hostId: string,
    title: string,
    category: string,
    description?: string,
    thumbnailUrl?: string,
    allowGifts = true,
    allowPK = false,
  ) {
    const categoryRecord = await this.getOrCreateCategory(category);
    const streamKey = crypto.randomBytes(16).toString('hex');
    const playbackUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/stream/${title.replace(/\s+/g, '-').toLowerCase()}/${crypto.randomUUID()}.m3u8`;

    const stream = await prisma.liveStream.create({
      data: {
        hostId,
        title,
        description,
        thumbnailUrl,
        streamKey,
        playbackUrl,
        allowGifts,
        allowPK,
        active: true,
        categoryName: categoryRecord.name,
      },
      include: {
        host: {
          select: { id: true, username: true, avatar: true },
        },
      },
    });

    return stream;
  }

  async endStream(streamId: string, hostId: string) {
    const stream = await prisma.liveStream.findUnique({
      where: { id: streamId },
    });

    if (!stream || stream.hostId !== hostId) {
      throw new Error('Stream not found or unauthorized');
    }

    const updated = await prisma.liveStream.update({
      where: { id: streamId },
      data: { active: false },
    });

    return updated;
  }

  async getActiveStreams(limit: number = 20, category?: string) {
    const where: any = { active: true };
    if (category) {
      where.category = { name: category };
    }

    return prisma.liveStream.findMany({
      where,
      include: {
        host: {
          select: { id: true, username: true, avatar: true },
        },
        category: true,
      },
      orderBy: { viewerCount: 'desc', createdAt: 'desc' },
      take: limit,
    });
  }

  async getDiscoveryStreams(limit: number = 20, category?: string) {
    const where: any = { active: true };
    if (category) {
      where.category = { name: category };
    }

    return prisma.liveStream.findMany({
      where,
      include: {
        host: {
          select: { id: true, username: true, avatar: true },
        },
        category: true,
      },
      orderBy: { viewerCount: 'desc', createdAt: 'desc' },
      take: limit,
    });
  }

  async getFollowingStreams(userId: string, limit: number = 20) {
    const following = await prisma.streamFollower.findMany({
      where: { followerId: userId },
      select: { streamerId: true },
    });

    const streamerIds = following.map((item) => item.streamerId);
    if (!streamerIds.length) {
      return [];
    }

    return prisma.liveStream.findMany({
      where: { active: true, hostId: { in: streamerIds } },
      include: {
        host: {
          select: { id: true, username: true, avatar: true },
        },
        category: true,
      },
      orderBy: { viewerCount: 'desc', createdAt: 'desc' },
      take: limit,
    });
  }

  async getStream(streamId: string) {
    const stream = await prisma.liveStream.findUnique({
      where: { id: streamId },
      include: {
        host: {
          select: { id: true, username: true, avatar: true, bio: true, premium: true },
        },
        category: true,
        chatMessages: {
          orderBy: { createdAt: 'desc' },
          take: 40,
          include: {
            user: {
              select: { id: true, username: true, avatar: true },
            },
          },
        },
      },
    });

    if (!stream) {
      throw new Error('Stream not found');
    }

    return stream;
  }

  async getStreamChat(streamId: string, limit = 40) {
    return prisma.liveChatMessage.findMany({
      where: { streamId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        user: {
          select: { id: true, username: true, avatar: true },
        },
      },
    });
  }

  async joinStream(streamId: string, userId: string) {
    await prisma.streamViewer.upsert({
      where: { streamId_userId: { streamId, userId } },
      create: { streamId, userId },
      update: {},
    });

    const stream = await prisma.liveStream.update({
      where: { id: streamId },
      data: { viewerCount: { increment: 1 } },
    });

    return stream.viewerCount;
  }

  async leaveStream(streamId: string, userId: string) {
    await prisma.streamViewer.deleteMany({
      where: { streamId, userId },
    });

    const stream = await prisma.liveStream.findUnique({
      where: { id: streamId },
    });

    if (!stream) {
      throw new Error('Stream not found');
    }

    const count = Math.max(0, stream.viewerCount - 1);
    await prisma.liveStream.update({
      where: { id: streamId },
      data: { viewerCount: count },
    });

    return count;
  }

  async countViewers(streamId: string) {
    const viewerCount = await prisma.streamViewer.count({
      where: { streamId },
    });

    return viewerCount;
  }

  async postChatMessage(streamId: string, userId: string, message: string) {
    const chatMessage = await prisma.liveChatMessage.create({
      data: {
        streamId,
        userId,
        message,
      },
      include: {
        user: {
          select: { id: true, username: true, avatar: true },
        },
      },
    });

    return chatMessage;
  }

  async getCategories() {
    return prisma.streamCategory.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async followStreamer(streamerId: string, followerId: string) {
    if (streamerId === followerId) {
      throw new Error('Cannot follow yourself');
    }

    return prisma.streamFollower.upsert({
      where: { streamerId_followerId: { streamerId, followerId } },
      create: { streamerId, followerId },
      update: {},
    });
  }

  async getStreamHistory(hostId: string, limit: number = 10) {
    return prisma.liveStream.findMany({
      where: { hostId, active: false },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async getHostStats(hostId: string) {
    const streams = await prisma.liveStream.findMany({
      where: { hostId },
    });

    const gifts = await prisma.giftTransaction.findMany({
      where: { receiverId: hostId },
    });

    const totalEarnings = gifts.reduce((sum, gift) => sum + gift.amount, 0);
    const totalStreams = streams.length;
    const totalViewers = await prisma.streamViewer.count({
      where: { stream: { hostId } },
    });

    return {
      totalEarnings,
      totalStreams,
      totalViewers,
      averageViewers: totalStreams > 0 ? totalViewers / totalStreams : 0,
    };
  }
}

export const liveService = new LiveService();

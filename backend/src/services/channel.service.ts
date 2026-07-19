import { prisma } from "../prisma";

export class ChannelService {
  async createChannel(ownerId: string, name: string, description?: string, category?: string) {
    const existing = await prisma.channel.findUnique({ where: { name } });
    if (existing) throw new Error("Channel name already exists");

    const channel = await prisma.channel.create({
      data: {
        name,
        description,
        category,
        ownerId,
        members: {
          create: { userId: ownerId, role: "ADMIN" },
        },
      },
      include: {
        owner: { select: { id: true, username: true, avatar: true } },
        _count: { select: { members: true, messages: true } },
      },
    });

    return channel;
  }

  async getChannels(cursor?: string, limit: number = 20) {
    const channels = await prisma.channel.findMany({
      orderBy: { createdAt: "desc" },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      include: {
        owner: { select: { id: true, username: true, avatar: true } },
        _count: { select: { members: true, messages: true } },
      },
    });

    const nextCursor = channels.length > limit ? channels.pop()?.id : undefined;
    return { items: channels, nextCursor };
  }

  async getChannelById(id: string) {
    return prisma.channel.findUnique({
      where: { id },
      include: {
        owner: { select: { id: true, username: true, avatar: true } },
        members: {
          include: { user: { select: { id: true, username: true, avatar: true } } },
        },
        _count: { select: { members: true, messages: true } },
      },
    });
  }

  async joinChannel(channelId: string, userId: string) {
    const existing = await prisma.channelMember.findUnique({
      where: { channelId_userId: { channelId, userId } },
    });
    if (existing) return existing;

    return prisma.channelMember.create({
      data: { channelId, userId },
      include: { user: { select: { id: true, username: true, avatar: true } } },
    });
  }

  async leaveChannel(channelId: string, userId: string) {
    await prisma.channelMember.deleteMany({
      where: { channelId, userId },
    });
    return { success: true };
  }

  async sendMessage(channelId: string, authorId: string, content: string) {
    const member = await prisma.channelMember.findUnique({
      where: { channelId_userId: { channelId, userId: authorId } },
    });
    if (!member) throw new Error("Not a member of this channel");

    return prisma.channelMessage.create({
      data: { channelId, authorId, content },
      include: { author: { select: { id: true, username: true, avatar: true } } },
    });
  }

  async getMessages(channelId: string, cursor?: string, limit: number = 50) {
    const messages = await prisma.channelMessage.findMany({
      where: { channelId },
      orderBy: { createdAt: "desc" },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      include: { author: { select: { id: true, username: true, avatar: true } } },
    });

    const nextCursor = messages.length > limit ? messages.pop()?.id : undefined;
    return { items: messages.reverse(), nextCursor };
  }

  async deleteChannel(id: string, userId: string) {
    const channel = await prisma.channel.findUnique({ where: { id } });
    if (!channel) throw new Error("Channel not found");
    if (channel.ownerId !== userId) throw new Error("Unauthorized");

    await prisma.channel.delete({ where: { id } });
    return { success: true };
  }
}

export const channelService = new ChannelService();
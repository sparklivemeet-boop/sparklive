import { prisma } from "../prisma";

export class ChatService {
  async getConversations(userId: string, limit: number = 25, cursor?: string) {
    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: { userId },
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatar: true,
                bio: true,
                verified: true,
              },
            },
          },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          include: {
            sender: {
              select: {
                id: true,
                username: true,
                avatar: true,
              },
            },
            reads: true,
          },
        },
      },
      orderBy: { updatedAt: "desc" },
      take: limit,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    });

    const enriched = await Promise.all(
      conversations.map(async (conversation) => {
        const partner = conversation.participants.find((p) => p.userId !== userId)?.user;
        const unreadCount = await prisma.message.count({
          where: {
            conversationId: conversation.id,
            senderId: { not: userId },
            reads: { none: { userId } },
          },
        });

        return {
          id: conversation.id,
          isGroup: conversation.isGroup,
          name: conversation.name,
          partner,
          lastMessage: conversation.messages[0] || null,
          unreadCount,
          updatedAt: conversation.updatedAt,
        };
      })
    );

    return enriched;
  }

  async getMessages(conversationId: string, userId: string, limit: number = 50, offset: number = 0) {
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        participants: true,
      },
    });

    if (!conversation || !conversation.participants.some((p) => p.userId === userId)) {
      throw new Error("Conversation not found or unauthorized");
    }

    const messages = await prisma.message.findMany({
      where: { conversationId },
      include: {
        sender: {
          select: { id: true, username: true, avatar: true },
        },
        reads: true,
      },
      orderBy: { createdAt: "asc" },
      take: limit,
      skip: offset,
    });

    return messages;
  }

  async sendMessage(conversationId: string, senderId: string, content: string) {
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { participants: true },
    });

    if (!conversation || !conversation.participants.some((p) => p.userId === senderId)) {
      throw new Error("Conversation not found or unauthorized");
    }

    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId,
        content,
      },
      include: {
        sender: {
          select: { id: true, username: true, avatar: true },
        },
        reads: true,
      },
    });

    return message;
  }

  async markMessagesAsRead(conversationId: string, userId: string) {
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { participants: true },
    });

    if (!conversation || !conversation.participants.some((p) => p.userId === userId)) {
      throw new Error("Conversation not found or unauthorized");
    }

    const unreadMessages = await prisma.message.findMany({
      where: {
        conversationId,
        senderId: { not: userId },
        reads: { none: { userId } },
      },
      select: { id: true },
    });

    const records = unreadMessages.map((message) => ({ messageId: message.id, userId }));
    if (records.length) {
      await prisma.messageRead.createMany({ data: records });
    }

    return { count: records.length };
  }

  async searchMessages(conversationId: string, userId: string, query: string) {
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { participants: true },
    });

    if (!conversation || !conversation.participants.some((p) => p.userId === userId)) {
      throw new Error("Conversation not found or unauthorized");
    }

    const messages = await prisma.message.findMany({
      where: {
        conversationId,
        content: {
          contains: query,
        },
      },
      include: {
        sender: {
          select: { id: true, username: true, avatar: true },
        },
        reads: true,
      },
      orderBy: { createdAt: "asc" },
    });

    return messages;
  }

  async createConversation(userIds: string[], name?: string) {
    if (userIds.length < 2) {
      throw new Error("At least two users are required to start a conversation");
    }

    const existing = await prisma.conversation.findFirst({
      where: {
        isGroup: false,
        participants: {
          every: {
            userId: { in: userIds },
          },
        },
      },
      include: { participants: true },
    });

    if (existing) {
      return existing;
    }

    const conversation = await prisma.conversation.create({
      data: {
        name,
        participants: {
          create: userIds.map((userId) => ({ userId })),
        },
      },
    });

    return conversation;
  }
}

export const chatService = new ChatService();

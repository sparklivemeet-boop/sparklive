import { ChatService } from '../services/chat.service';
import { prisma } from '../prisma';

jest.mock('../prisma', () => ({
  prisma: {
    conversation: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    message: {
      findMany: jest.fn(),
      create: jest.fn(),
      count: jest.fn(),
    },
    messageRead: {
      createMany: jest.fn(),
    },
  },
}));

const chatService = new ChatService();

describe('ChatService', () => {
  const mockConversation = {
    id: 'conv1',
    isGroup: false,
    name: null,
    participants: [{ id: 'p1', userId: 'user1' }, { id: 'p2', userId: 'user2' }],
    messages: [],
    updatedAt: new Date(),
    createdAt: new Date(),
  };

  const mockMessage = {
    id: 'msg1',
    conversationId: 'conv1',
    senderId: 'user1',
    content: 'Hello!',
    createdAt: new Date(),
    sender: { id: 'user1', username: 'user1', avatar: null },
    reads: [],
  };

  beforeEach(() => jest.clearAllMocks());

  describe('getConversations', () => {
    test('should return enriched conversations with unread counts', async () => {
      (prisma.conversation.findMany as jest.Mock).mockResolvedValue([mockConversation]);
      (prisma.message.count as jest.Mock).mockResolvedValue(2);

      const result = await chatService.getConversations('user1');
      expect(result).toHaveLength(1);
      expect(result[0].unreadCount).toBe(2);
    });

    test('should return empty array when no conversations', async () => {
      (prisma.conversation.findMany as jest.Mock).mockResolvedValue([]);
      const result = await chatService.getConversations('user1');
      expect(result).toHaveLength(0);
    });
  });

  describe('getMessages', () => {
    test('should return messages for authorized user', async () => {
      (prisma.conversation.findUnique as jest.Mock).mockResolvedValue(mockConversation);
      (prisma.message.findMany as jest.Mock).mockResolvedValue([mockMessage]);

      const result = await chatService.getMessages('conv1', 'user1');
      expect(result).toHaveLength(1);
      expect(result[0].content).toBe('Hello!');
    });

    test('should throw for unauthorized user', async () => {
      const convWithoutUser = {
        ...mockConversation,
        participants: [{ id: 'p3', userId: 'user3' }],
      };
      (prisma.conversation.findUnique as jest.Mock).mockResolvedValue(convWithoutUser);

      await expect(chatService.getMessages('conv1', 'user1')).rejects.toThrow(
        'Conversation not found or unauthorized'
      );
    });
  });

  describe('sendMessage', () => {
    test('should send message successfully', async () => {
      (prisma.conversation.findUnique as jest.Mock).mockResolvedValue(mockConversation);
      (prisma.message.create as jest.Mock).mockResolvedValue(mockMessage);

      const result = await chatService.sendMessage('conv1', 'user1', 'Hello!');
      expect(result.content).toBe('Hello!');
    });

    test('should throw for unauthorized sender', async () => {
      (prisma.conversation.findUnique as jest.Mock).mockResolvedValue(mockConversation);

      await expect(chatService.sendMessage('conv1', 'user3', 'Hi')).rejects.toThrow(
        'Conversation not found or unauthorized'
      );
    });
  });

  describe('markMessagesAsRead', () => {
    test('should mark unread messages as read', async () => {
      (prisma.conversation.findUnique as jest.Mock).mockResolvedValue(mockConversation);
      (prisma.message.findMany as jest.Mock).mockResolvedValue([{ id: 'msg1' }, { id: 'msg2' }]);
      (prisma.messageRead.createMany as jest.Mock).mockResolvedValue({ count: 2 });

      const result = await chatService.markMessagesAsRead('conv1', 'user1');
      expect(result.count).toBe(2);
    });

    test('should return 0 when no unread messages', async () => {
      (prisma.conversation.findUnique as jest.Mock).mockResolvedValue(mockConversation);
      (prisma.message.findMany as jest.Mock).mockResolvedValue([]);

      const result = await chatService.markMessagesAsRead('conv1', 'user1');
      expect(result.count).toBe(0);
    });
  });

  describe('createConversation', () => {
    test('should create a new conversation', async () => {
      (prisma.conversation.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.conversation.create as jest.Mock).mockResolvedValue(mockConversation);

      const result = await chatService.createConversation(['user1', 'user2']);
      expect(result).toEqual(mockConversation);
    });

    test('should return existing conversation if one exists', async () => {
      (prisma.conversation.findFirst as jest.Mock).mockResolvedValue(mockConversation);

      const result = await chatService.createConversation(['user1', 'user2']);
      expect(result).toEqual(mockConversation);
      expect(prisma.conversation.create).not.toHaveBeenCalled();
    });

    test('should throw when fewer than 2 users provided', async () => {
      await expect(chatService.createConversation(['user1'])).rejects.toThrow(
        'At least two users are required to start a conversation'
      );
    });
  });

  describe('searchMessages', () => {
    test('should search messages in conversation', async () => {
      (prisma.conversation.findUnique as jest.Mock).mockResolvedValue(mockConversation);
      (prisma.message.findMany as jest.Mock).mockResolvedValue([mockMessage]);

      const result = await chatService.searchMessages('conv1', 'user1', 'Hello');
      expect(result).toHaveLength(1);
    });
  });
});
import { LiveService } from '../services/live.service';
import { prisma } from '../prisma';

jest.mock('../prisma', () => ({
  prisma: {
    liveStream: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    streamCategory: {
      upsert: jest.fn(),
      findMany: jest.fn(),
    },
    streamViewer: {
      upsert: jest.fn(),
      deleteMany: jest.fn(),
      count: jest.fn(),
    },
    streamFollower: {
      findMany: jest.fn(),
      upsert: jest.fn(),
    },
    liveChatMessage: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    giftTransaction: {
      findMany: jest.fn(),
    },
  },
}));

const liveService = new LiveService();

describe('LiveService', () => {
  const mockStream = {
    id: 'stream1',
    hostId: 'host1',
    title: 'Test Stream',
    description: 'A test stream',
    thumbnailUrl: null,
    streamKey: 'key123',
    playbackUrl: 'http://localhost:3000/stream/test-stream/abc.m3u8',
    allowGifts: true,
    allowPK: false,
    active: true,
    viewerCount: 0,
    categoryName: 'Just Chatting',
    createdAt: new Date(),
    host: { id: 'host1', username: 'host', avatar: null },
    category: { name: 'Just Chatting', description: 'Chat category' },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (prisma.streamCategory.upsert as jest.Mock).mockResolvedValue({
      id: 'cat1',
      name: 'Just Chatting',
      description: 'Chat category',
    });
  });

  describe('startStream', () => {
    test('should start a new stream', async () => {
      (prisma.liveStream.create as jest.Mock).mockResolvedValue(mockStream);

      const result = await liveService.startStream('host1', 'Test Stream', 'Just Chatting');
      expect(result.streamKey).toBeDefined();
      expect(result.playbackUrl).toBeDefined();
      expect(result.active).toBe(true);
    });
  });

  describe('endStream', () => {
    test('should end an active stream', async () => {
      (prisma.liveStream.findUnique as jest.Mock).mockResolvedValue(mockStream);
      (prisma.liveStream.update as jest.Mock).mockResolvedValue({ ...mockStream, active: false });

      const result = await liveService.endStream('stream1', 'host1');
      expect(result.active).toBe(false);
    });

    test('should throw for non-existent stream', async () => {
      (prisma.liveStream.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(liveService.endStream('nonexistent', 'host1')).rejects.toThrow('Stream not found or unauthorized');
    });

    test('should throw if not stream host', async () => {
      (prisma.liveStream.findUnique as jest.Mock).mockResolvedValue(mockStream);

      await expect(liveService.endStream('stream1', 'otherUser')).rejects.toThrow('Stream not found or unauthorized');
    });
  });

  describe('getActiveStreams', () => {
    test('should return active streams', async () => {
      (prisma.liveStream.findMany as jest.Mock).mockResolvedValue([mockStream]);

      const result = await liveService.getActiveStreams(10);
      expect(result).toHaveLength(1);
    });
  });

  describe('getStream', () => {
    test('should return stream with chat messages', async () => {
      const streamWithChat = {
        ...mockStream,
        chatMessages: [
          { id: 'chat1', userId: 'user2', message: 'Hello!', user: { id: 'user2', username: 'viewer', avatar: null } },
        ],
      };
      (prisma.liveStream.findUnique as jest.Mock).mockResolvedValue(streamWithChat);

      const result = await liveService.getStream('stream1');
      expect(result.chatMessages).toHaveLength(1);
    });

    test('should throw for non-existent stream', async () => {
      (prisma.liveStream.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(liveService.getStream('nonexistent')).rejects.toThrow('Stream not found');
    });
  });

  describe('joinStream', () => {
    test('should increment viewer count on join', async () => {
      (prisma.streamViewer.upsert as jest.Mock).mockResolvedValue({});
      (prisma.liveStream.update as jest.Mock).mockResolvedValue({ ...mockStream, viewerCount: 5 });

      const result = await liveService.joinStream('stream1', 'viewer1');
      expect(result).toBe(5);
    });
  });

  describe('leaveStream', () => {
    test('should decrement viewer count on leave', async () => {
      (prisma.streamViewer.deleteMany as jest.Mock).mockResolvedValue({ count: 1 });
      (prisma.liveStream.findUnique as jest.Mock).mockResolvedValue({ ...mockStream, viewerCount: 5 });
      (prisma.liveStream.update as jest.Mock).mockResolvedValue({});

      const result = await liveService.leaveStream('stream1', 'viewer1');
      expect(result).toBe(4);
    });
  });

  describe('postChatMessage', () => {
    test('should post a chat message', async () => {
      const mockChatMsg = {
        id: 'chat1',
        streamId: 'stream1',
        userId: 'viewer1',
        message: 'Hello stream!',
        user: { id: 'viewer1', username: 'viewer', avatar: null },
      };
      (prisma.liveChatMessage.create as jest.Mock).mockResolvedValue(mockChatMsg);

      const result = await liveService.postChatMessage('stream1', 'viewer1', 'Hello stream!');
      expect(result.message).toBe('Hello stream!');
    });
  });

  describe('followStreamer', () => {
    test('should follow a streamer', async () => {
      (prisma.streamFollower.upsert as jest.Mock).mockResolvedValue({ id: 'follow1', streamerId: 'host1', followerId: 'viewer1' });

      const result = await liveService.followStreamer('host1', 'viewer1');
      expect(result).toBeDefined();
    });

    test('should throw when following yourself', async () => {
      await expect(liveService.followStreamer('host1', 'host1')).rejects.toThrow('Cannot follow yourself');
    });
  });

  describe('getHostStats', () => {
    test('should return host statistics', async () => {
      (prisma.liveStream.findMany as jest.Mock).mockResolvedValue([mockStream]);
      (prisma.giftTransaction.findMany as jest.Mock).mockResolvedValue([{ amount: 10 }, { amount: 20 }]);
      (prisma.streamViewer.count as jest.Mock).mockResolvedValue(50);

      const result = await liveService.getHostStats('host1');
      expect(result.totalEarnings).toBe(30);
      expect(result.totalStreams).toBe(1);
      expect(result.totalViewers).toBe(50);
    });
  });

  describe('getCategories', () => {
    test('should return stream categories', async () => {
      (prisma.streamCategory.findMany as jest.Mock).mockResolvedValue([{ id: 'cat1', name: 'Gaming' }]);
      const result = await liveService.getCategories();
      expect(result).toHaveLength(1);
    });
  });
});
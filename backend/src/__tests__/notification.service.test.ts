import { NotificationService } from '../services/notification.service';
import { prisma } from '../prisma';

jest.mock('../prisma', () => ({
  prisma: {
    notification: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      updateMany: jest.fn(),
    },
  },
}));

const notificationService = new NotificationService();

describe('NotificationService', () => {
  const mockNotification = {
    id: 'notif1',
    userId: 'user1',
    type: 'follow',
    title: 'New Follower',
    body: 'user2 started following you',
    metadata: '{"followerId":"user2","followerUsername":"user2"}',
    read: false,
    createdAt: new Date(),
  };

  beforeEach(() => jest.clearAllMocks());

  describe('getNotifications', () => {
    test('should return notifications with cursor pagination', async () => {
      (prisma.notification.findMany as jest.Mock).mockResolvedValue([mockNotification]);
      const result = await notificationService.getNotifications('user1');
      expect(result.items).toHaveLength(1);
    });
  });

  describe('getUnreadCount', () => {
    test('should return unread count', async () => {
      (prisma.notification.count as jest.Mock).mockResolvedValue(3);
      const result = await notificationService.getUnreadCount('user1');
      expect(result).toBe(3);
    });
  });

  describe('markAsRead', () => {
    test('should mark notification as read', async () => {
      (prisma.notification.findUnique as jest.Mock).mockResolvedValue(mockNotification);
      (prisma.notification.update as jest.Mock).mockResolvedValue({ ...mockNotification, read: true });

      const result = await notificationService.markAsRead('notif1', 'user1');
      expect(result.read).toBe(true);
    });

    test('should throw for unauthorized user', async () => {
      (prisma.notification.findUnique as jest.Mock).mockResolvedValue(mockNotification);

      await expect(notificationService.markAsRead('notif1', 'user2')).rejects.toThrow('Notification not found or unauthorized');
    });
  });

  describe('markAllAsRead', () => {
    test('should mark all notifications as read', async () => {
      (prisma.notification.updateMany as jest.Mock).mockResolvedValue({ count: 5 });

      const result = await notificationService.markAllAsRead('user1');
      expect(result.message).toBe('All notifications marked as read');
    });
  });

  describe('deleteNotification', () => {
    test('should delete notification', async () => {
      (prisma.notification.findUnique as jest.Mock).mockResolvedValue(mockNotification);
      (prisma.notification.delete as jest.Mock).mockResolvedValue(mockNotification);

      const result = await notificationService.deleteNotification('notif1', 'user1');
      expect(result.message).toBe('Notification deleted');
    });
  });

  describe('createNotification', () => {
    test('should create notification with metadata', async () => {
      (prisma.notification.create as jest.Mock).mockResolvedValue(mockNotification);
      (prisma.notification.count as jest.Mock).mockResolvedValue(3);

      const result = await notificationService.createNotification('user1', 'follow', 'New Follower', 'Someone followed you', { followerId: 'user2' });
      expect(result.type).toBe('follow');
    });
  });

  describe('notifyFollow', () => {
    test('should create follow notification', async () => {
      (prisma.notification.create as jest.Mock).mockResolvedValue(mockNotification);
      (prisma.notification.count as jest.Mock).mockResolvedValue(1);

      const result = await notificationService.notifyFollow('user1', 'user2', 'user2');
      expect(result.body).toContain('started following you');
    });
  });

  describe('notifyLiveStarted', () => {
    test('should notify all followers about live stream', async () => {
      const followers = ['f1', 'f2', 'f3'];
      (prisma.notification.create as jest.Mock).mockResolvedValue(mockNotification);
      (prisma.notification.count as jest.Mock).mockResolvedValue(1);

      const result = await notificationService.notifyLiveStarted(followers, 'host1', 'stream1', 'Live Now');
      expect(result).toHaveLength(3);
    });
  });
});
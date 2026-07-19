import { prisma } from "../prisma";

// Store reference to emit notifications via socket
let ioRef: any = null;

export const setNotificationIO = (io: any) => {
  ioRef = io;
};

const emitToUser = (userId: string, event: string, data: any) => {
  if (ioRef) {
    ioRef.to(`user_${userId}`).emit(event, data);
  }
};

export class NotificationService {
  async getNotifications(userId: string, limit: number = 50, cursor?: string) {
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });

    const nextCursor = notifications.length > limit ? notifications.pop()?.id : undefined;
    return { items: notifications, nextCursor };
  }

  async getUnreadCount(userId: string) {
    const count = await prisma.notification.count({
      where: {
        userId,
        read: false,
      },
    });

    return count;
  }

  async markAsRead(notificationId: string, userId: string) {
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification || notification.userId !== userId) {
      throw new Error("Notification not found or unauthorized");
    }

    const updated = await prisma.notification.update({
      where: { id: notificationId },
      data: { read: true },
    });

    return updated;
  }

  async markAllAsRead(userId: string) {
    await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });

    emitToUser(userId, "notifications_read", { all: true });
    return { message: "All notifications marked as read" };
  }

  async deleteNotification(notificationId: string, userId: string) {
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification || notification.userId !== userId) {
      throw new Error("Notification not found or unauthorized");
    }

    await prisma.notification.delete({
      where: { id: notificationId },
    });

    return { message: "Notification deleted" };
  }

  async createNotification(
    userId: string,
    type: string,
    title: string,
    body: string,
    metadata?: any
  ) {
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        body,
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    });

    // Emit real-time notification via socket
    emitToUser(userId, "new_notification", notification);
    
    // Also emit unread count update
    const unreadCount = await this.getUnreadCount(userId);
    emitToUser(userId, "unread_count", { count: unreadCount });

    return notification;
  }

  async notifyFollow(userId: string, followerUsername: string, followerId: string) {
    return this.createNotification(
      userId,
      "follow",
      "New Follower",
      `${followerUsername} started following you`,
      { followerId, followerUsername }
    );
  }

  async notifyLike(userId: string, likerUsername: string, postId: string) {
    return this.createNotification(
      userId,
      "like",
      "New Like",
      `${likerUsername} liked your post`,
      { postId, likerUsername }
    );
  }

  async notifyComment(userId: string, commenterUsername: string, postId: string, commentContent: string) {
    return this.createNotification(
      userId,
      "comment",
      "New Comment",
      `${commenterUsername} commented: "${commentContent.substring(0, 50)}"`,
      { postId, commenterUsername, commentContent }
    );
  }

  async notifyNewMessage(receiverId: string, senderUsername: string, conversationId: string) {
    return this.createNotification(
      receiverId,
      "message",
      "New Message",
      `${senderUsername} sent you a message`,
      { conversationId, senderUsername }
    );
  }

  async notifyGiftReceived(receiverId: string, senderUsername: string, giftName: string, amount: number) {
    return this.createNotification(
      receiverId,
      "gift",
      "Gift Received! 🎁",
      `${senderUsername} sent you ${giftName} worth ${amount} coins`,
      { senderUsername, giftName, amount }
    );
  }

  async notifyLiveStarted(followers: string[], hostUsername: string, streamId: string, title: string) {
    const notifications = await Promise.all(
      followers.map(followerId =>
        this.createNotification(
          followerId,
          "live",
          "🔴 Live Now",
          `${hostUsername} is live: "${title}"`,
          { streamId, hostUsername, title }
        )
      )
    );
    return notifications;
  }

  async notifyStreamEnded(hostId: string, streamTitle: string) {
    return this.createNotification(
      hostId,
      "system",
      "Stream Ended",
      `Your stream "${streamTitle}" has ended. Check your analytics for details.`,
      { streamTitle }
    );
  }

  async notifyWithdrawalStatus(userId: string, status: string, amount: number) {
    const statusText = status === "COMPLETED" ? "approved" : status === "REJECTED" ? "rejected" : "pending";
    return this.createNotification(
      userId,
      "wallet",
      "Withdrawal Update",
      `Your withdrawal of $${amount} has been ${statusText}`,
      { status, amount }
    );
  }

  async notifyMilestone(userId: string, milestone: string, value: number) {
    return this.createNotification(
      userId,
      "system",
      "🏆 Milestone Reached",
      `Congratulations! You've reached ${value} ${milestone}`,
      { milestone, value }
    );
  }
}

export const notificationService = new NotificationService();

import { prisma } from "../prisma";

export class NotificationService {
  async getNotifications(userId: string, limit: number = 50) {
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return notifications;
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
    body: string
  ) {
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        body,
      },
    });

    return notification;
  }

  async notifyNewMatch(user1Id: string, user2Id: string, matchId: string) {
    const user1 = await prisma.user.findUnique({
      where: { id: user1Id },
      select: { username: true },
    });

    const user2 = await prisma.user.findUnique({
      where: { id: user2Id },
      select: { username: true },
    });

    await Promise.all([
      this.createNotification(
        user1Id,
        "NEW_MATCH",
        "New Match!",
        `You matched with ${user2?.username}`
      ),
      this.createNotification(
        user2Id,
        "NEW_MATCH",
        "New Match!",
        `You matched with ${user1?.username}`
      ),
    ]);
  }

  async notifyNewMessage(receiverId: string, senderUsername: string) {
    await this.createNotification(
      receiverId,
      "NEW_MESSAGE",
      "New Message",
      `${senderUsername} sent you a message`
    );
  }

  async notifyGiftReceived(receiverId: string, senderUsername: string, giftName: string) {
    await this.createNotification(
      receiverId,
      "GIFT_RECEIVED",
      "Gift Received!",
      `${senderUsername} sent you ${giftName}`
    );
  }

  async notifyLiveStarted(hostId: string, title: string) {
    // Notify all followers that user is live
    // In a real app, fetch followers from a Follower model
    await this.createNotification(
      hostId,
      "LIVE_STARTED",
      "Stream Started",
      `Your stream "${title}" is now live`
    );
  }

  async notifyWithdrawalStatus(userId: string, status: string) {
    const statusText = status === "COMPLETED" ? "approved" : "pending";
    await this.createNotification(
      userId,
      "WITHDRAWAL_STATUS",
      "Withdrawal Update",
      `Your withdrawal request has been ${statusText}`
    );
  }
}

export const notificationService = new NotificationService();

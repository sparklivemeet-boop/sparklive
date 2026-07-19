import { prisma } from "../prisma";

export class GroupService {
  async createGroup(ownerId: string, name: string, description?: string, memberIds?: string[]) {
    // Deduplicate and ensure owner is included
    const allMemberIds = [ownerId, ...(memberIds?.filter(id => id !== ownerId) || [])];
    const uniqueMemberIds = [...new Set(allMemberIds)];

    const group = await prisma.group.create({
      data: {
        name,
        description,
        ownerId,
        members: {
          create: uniqueMemberIds.map(userId => ({
            userId,
            role: userId === ownerId ? "ADMIN" : "MEMBER",
          })),
        },
      },
      include: {
        owner: { select: { id: true, username: true, avatar: true } },
        members: {
          include: { user: { select: { id: true, username: true, avatar: true } } },
        },
        _count: { select: { members: true, messages: true } },
      },
    });

    return group;
  }

  async getMyGroups(userId: string) {
    return prisma.group.findMany({
      where: { members: { some: { userId } } },
      include: {
        owner: { select: { id: true, username: true, avatar: true } },
        members: {
          include: { user: { select: { id: true, username: true, avatar: true } } },
        },
        _count: { select: { members: true, messages: true } },
      },
      orderBy: { updatedAt: "desc" },
    });
  }

  async getGroupById(id: string) {
    return prisma.group.findUnique({
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

  async addMember(groupId: string, userId: string, requesterId: string) {
    const group = await prisma.group.findUnique({ where: { id: groupId } });
    if (!group) throw new Error("Group not found");

    // Only admins can add members
    const requester = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId: requesterId } },
    });
    if (!requester || requester.role !== "ADMIN") throw new Error("Unauthorized");

    const existing = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId } },
    });
    if (existing) throw new Error("Already a member");

    return prisma.groupMember.create({
      data: { groupId, userId },
      include: { user: { select: { id: true, username: true, avatar: true } } },
    });
  }

  async removeMember(groupId: string, userId: string, requesterId: string) {
    if (userId === requesterId) {
      // User leaving themselves
      await prisma.groupMember.deleteMany({ where: { groupId, userId } });
      return { success: true };
    }

    const requester = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId: requesterId } },
    });
    if (!requester || requester.role !== "ADMIN") throw new Error("Unauthorized");

    await prisma.groupMember.deleteMany({ where: { groupId, userId } });
    return { success: true };
  }

  async sendMessage(groupId: string, authorId: string, content: string) {
    const member = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId: authorId } },
    });
    if (!member) throw new Error("Not a member of this group");

    return prisma.groupMessage.create({
      data: { groupId, authorId, content },
      include: { author: { select: { id: true, username: true, avatar: true } } },
    });
  }

  async getMessages(groupId: string, cursor?: string, limit: number = 50) {
    const messages = await prisma.groupMessage.findMany({
      where: { groupId },
      orderBy: { createdAt: "desc" },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      include: { author: { select: { id: true, username: true, avatar: true } } },
    });

    const nextCursor = messages.length > limit ? messages.pop()?.id : undefined;
    return { items: messages.reverse(), nextCursor };
  }

  async deleteGroup(id: string, userId: string) {
    const group = await prisma.group.findUnique({ where: { id } });
    if (!group) throw new Error("Group not found");
    if (group.ownerId !== userId) throw new Error("Unauthorized");

    await prisma.group.delete({ where: { id } });
    return { success: true };
  }
}

export const groupService = new GroupService();
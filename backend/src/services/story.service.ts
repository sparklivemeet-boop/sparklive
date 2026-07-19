import { prisma } from "../prisma";

export class StoryService {
  async createStory(userId: string, mediaUrl: string, mediaType: string = "IMAGE", caption?: string) {
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    const story = await prisma.story.create({
      data: {
        userId,
        mediaUrl,
        mediaType,
        caption,
        expiresAt,
      },
      include: {
        user: { select: { id: true, username: true, avatar: true } },
      },
    });

    return story;
  }

  async getActiveStories(currentUserId?: string) {
    const now = new Date();
    const stories = await prisma.story.findMany({
      where: { expiresAt: { gt: now } },
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, username: true, avatar: true, verified: true } },
        viewedBy: {
          where: currentUserId ? { userId: currentUserId } : undefined,
          select: { id: true },
        },
        _count: { select: { viewedBy: true } },
      },
    });

    // Group by user for Instagram-style display
    const grouped = new Map<string, any>();
    for (const story of stories) {
      if (!grouped.has(story.userId)) {
        grouped.set(story.userId, {
          user: story.user,
          stories: [],
          hasUnviewed: false,
        });
      }
      const group = grouped.get(story.userId);
      group.stories.push(story);
      if (story.viewedBy.length === 0) {
        group.hasUnviewed = true;
      }
    }

    return Array.from(grouped.values());
  }

  async getStoryById(storyId: string) {
    return prisma.story.findUnique({
      where: { id: storyId },
      include: {
        user: { select: { id: true, username: true, avatar: true } },
        viewedBy: {
          include: { user: { select: { id: true, username: true, avatar: true } } },
        },
      },
    });
  }

  async viewStory(storyId: string, userId: string) {
    const story = await prisma.story.findUnique({ where: { id: storyId } });
    if (!story) throw new Error("Story not found");

    const existing = await prisma.storyView.findUnique({
      where: { storyId_userId: { storyId, userId } },
    });

    if (!existing) {
      await prisma.storyView.create({ data: { storyId, userId } });
    }

    return { success: true };
  }

  async deleteStory(storyId: string, userId: string) {
    const story = await prisma.story.findUnique({ where: { id: storyId } });
    if (!story) throw new Error("Story not found");
    if (story.userId !== userId) throw new Error("Unauthorized");

    await prisma.story.delete({ where: { id: storyId } });
    return { success: true };
  }

  async getStoryViewers(storyId: string) {
    const views = await prisma.storyView.findMany({
      where: { storyId },
      include: { user: { select: { id: true, username: true, avatar: true } } },
      orderBy: { viewedAt: "desc" },
    });
    return views;
  }
}

export const storyService = new StoryService();
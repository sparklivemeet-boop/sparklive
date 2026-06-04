import { prisma } from "../prisma";

export class MatchService {
  async discover(userId: string, limit: number = 10) {
    const users = await prisma.user.findMany({
      where: {
        AND: [
          { id: { not: userId } },
          { status: "ACTIVE" },
          {
            id: {
              notIn: (
                await prisma.follow.findMany({
                  where: { followerId: userId },
                  select: { followingId: true },
                })
              ).map((follow) => follow.followingId),
            },
          },
        ],
      },
      select: {
        id: true,
        username: true,
        fullName: true,
        avatar: true,
        age: true,
        bio: true,
        gender: true,
        city: true,
        photos: true,
        profile: true,
      },
      take: limit,
    });

    return users;
  }

  async swipe(swiperId: string, targetId: string, direction: "like" | "pass") {
    if (swiperId === targetId) {
      throw new Error("Cannot swipe on yourself");
    }

    const existingFollow = await prisma.follow.findUnique({
      where: { followerId_followingId: { followerId: swiperId, followingId: targetId } },
    });

    if (existingFollow) {
      throw new Error("Already swiped on this user");
    }

    if (direction === "like") {
      const follow = await prisma.follow.create({
        data: { followerId: swiperId, followingId: targetId },
      });

      const reciprocal = await prisma.follow.findUnique({
        where: { followerId_followingId: { followerId: targetId, followingId: swiperId } },
      });

      if (reciprocal) {
        return { swipe: follow, match: { id: follow.id, user1Id: swiperId, user2Id: targetId } };
      }

      return { swipe: follow };
    }

    return { swipe: null };
  }

  async getMatches(userId: string) {
    const followers = await prisma.follow.findMany({
      where: { followingId: userId },
      include: {
        follower: {
          select: { id: true, username: true, avatar: true, bio: true },
        },
      },
    });

    const matches = [] as Array<any>;
    for (const follower of followers) {
      const reciprocal = await prisma.follow.findUnique({
        where: { followerId_followingId: { followerId: userId, followingId: follower.followerId } },
      });
      if (reciprocal) {
        matches.push({
          id: follower.id,
          user1: follower.follower,
          user2: { id: userId },
        });
      }
    }

    return matches;
  }

  async deleteMatch(matchId: string, userId: string) {
    const follow = await prisma.follow.findUnique({ where: { id: matchId } });

    if (!follow || (follow.followerId !== userId && follow.followingId !== userId)) {
      throw new Error("Match not found or unauthorized");
    }

    await prisma.follow.delete({ where: { id: matchId } });

    return { message: "Match deleted" };
  }

  async getLikes(userId: string) {
    const likes = await prisma.follow.findMany({
      where: { followingId: userId },
      include: {
        follower: {
          select: { id: true, username: true, avatar: true, bio: true },
        },
      },
    });

    return likes;
  }

  async respondToLike(likeId: string, userId: string, accept: boolean) {
    const follow = await prisma.follow.findUnique({ where: { id: likeId } });

    if (!follow || follow.followingId !== userId) {
      throw new Error("Like not found or unauthorized");
    }

    if (!accept) {
      await prisma.follow.delete({ where: { id: likeId } });
      return { message: "Like rejected" };
    }

    const reciprocal = await prisma.follow.findUnique({
      where: { followerId_followingId: { followerId: userId, followingId: follow.followerId } },
    });

    if (!reciprocal) {
      await prisma.follow.create({
        data: { followerId: userId, followingId: follow.followerId },
      });
    }

    return { message: "Like accepted", response: follow };
  }
}

export const matchService = new MatchService();

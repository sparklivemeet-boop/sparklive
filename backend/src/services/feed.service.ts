import { prisma } from "../prisma";
import { cacheService, CACHE_KEYS, CACHE_TTL } from "./cache.service";
import { dbPerformanceTracker } from "./monitoring.service";

const WITH_AUTHOR = {
  author: { select: { id: true, username: true, fullName: true, avatar: true, verified: true } },
} as const;

export class FeedService {
  async getFeed(userId: string, cursor?: string, limit: number = 20) {
    const cacheKey = CACHE_KEYS.FEED(userId, cursor);
    
    return cacheService.getOrSet(cacheKey, async () => {
      const queryStart = Date.now();
      
      const following = await prisma.follow.findMany({
        where: { followerId: userId },
        select: { followingId: true },
      });

      const followingIds = following.map(f => f.followingId);
      followingIds.push(userId);

      const posts = await prisma.post.findMany({
        where: { authorId: { in: followingIds } },
        orderBy: { createdAt: "desc" },
        take: limit + 1,
        ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
        include: {
          ...WITH_AUTHOR,
          likes: {
            where: { userId },
            select: { id: true },
          },
          _count: { select: { likes: true, comments: true } },
        },
      });

      dbPerformanceTracker.trackQuery('Post', Date.now() - queryStart, 'findMany');

      const nextCursor = posts.length > limit ? posts.pop()?.id : undefined;

      return {
        items: posts.map(post => ({
          ...post,
          isLiked: post.likes.length > 0,
          likes: undefined,
          likesCount: (post as any)._count.likes,
          commentsCount: (post as any)._count.comments,
        })),
        nextCursor,
      };
    }, CACHE_TTL.SHORT);
  }

  async getTrendingFeed(cursor?: string, limit: number = 20) {
    return cacheService.getOrSet(CACHE_KEYS.TRENDING, async () => {
      const queryStart = Date.now();
      
      const posts = await prisma.post.findMany({
        orderBy: [
          { likes: { _count: "desc" } },
          { createdAt: "desc" },
        ],
        take: limit + 1,
        ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
        include: {
          ...WITH_AUTHOR,
          _count: { select: { likes: true, comments: true } },
        },
      });

      dbPerformanceTracker.trackQuery('Post', Date.now() - queryStart, 'findManyTrending');

      const nextCursor = posts.length > limit ? posts.pop()?.id : undefined;
      return { items: posts, nextCursor };
    }, CACHE_TTL.MEDIUM);
  }

  async getExploreFeed(cursor?: string, limit: number = 30) {
    return cacheService.getOrSet(CACHE_KEYS.EXPLORE, async () => {
      const queryStart = Date.now();
      
      const [posts, streams, videos] = await Promise.all([
        prisma.post.findMany({
          orderBy: { createdAt: "desc" },
          take: limit,
          ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
          include: {
            ...WITH_AUTHOR,
            _count: { select: { likes: true, comments: true } },
          },
        }),
        prisma.liveStream.findMany({
          where: { active: true },
          orderBy: { viewerCount: "desc" },
          take: 10,
          include: {
            host: { select: { id: true, username: true, avatar: true } },
            category: { select: { name: true } },
          },
        }),
        prisma.video.findMany({
          orderBy: { views: "desc" },
          take: limit,
          include: {
            creator: { select: { id: true, username: true, avatar: true } },
            _count: { select: { likes: true } },
          },
        }),
      ]);

      dbPerformanceTracker.trackQuery('Explore', Date.now() - queryStart, 'findMany');

      return { posts, streams, videos };
    }, CACHE_TTL.MEDIUM);
  }

  async createPost(authorId: string, content: string, mediaUrl?: string) {
    const post = await prisma.post.create({
      data: { authorId, content, mediaUrl },
      include: WITH_AUTHOR,
    });
    
    // Invalidate feed caches after new post
    await cacheService.delPattern(`feed:${authorId}:*`);
    await cacheService.del(CACHE_KEYS.TRENDING);
    await cacheService.del(CACHE_KEYS.EXPLORE);
    
    return post;
  }

  async deletePost(postId: string, userId: string) {
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new Error("Post not found");
    if (post.authorId !== userId) throw new Error("Unauthorized");

    await prisma.post.delete({ where: { id: postId } });
    
    // Invalidate caches
    await cacheService.delPattern(`feed:${userId}:*`);
    await cacheService.del(CACHE_KEYS.TRENDING);
    await cacheService.del(CACHE_KEYS.EXPLORE);
    
    return { success: true };
  }

  async likePost(postId: string, userId: string) {
    const existing = await prisma.postLike.findUnique({
      where: { userId_postId: { userId, postId } },
    });

    let result;
    if (existing) {
      await prisma.postLike.delete({ where: { id: existing.id } });
      result = { liked: false };
    } else {
      await prisma.postLike.create({ data: { userId, postId } });
      result = { liked: true };
    }

    // Invalidate feed caches as likes changed
    await cacheService.delPattern(`feed:*`);
    await cacheService.del(CACHE_KEYS.TRENDING);
    
    return result;
  }

  async commentOnPost(postId: string, userId: string, content: string) {
    const comment = await prisma.postComment.create({
      data: { postId, userId, content },
      include: {
        user: { select: { id: true, username: true, avatar: true } },
      },
    });
    
    await cacheService.delPattern(`feed:*`);
    
    return comment;
  }

  async getPostComments(postId: string, cursor?: string, limit: number = 20) {
    const comments = await prisma.postComment.findMany({
      where: { postId },
      orderBy: { createdAt: "desc" },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      include: {
        user: { select: { id: true, username: true, avatar: true, verified: true } },
      },
    });

    const nextCursor = comments.length > limit ? comments.pop()?.id : undefined;
    return { items: comments.reverse(), nextCursor };
  }

  async getFollowers(userId: string, cursor?: string, limit: number = 20) {
    const followers = await prisma.follow.findMany({
      where: { followingId: userId },
      orderBy: { createdAt: "desc" },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      include: {
        follower: { select: { id: true, username: true, fullName: true, avatar: true, verified: true, bio: true } },
      },
    });

    const nextCursor = followers.length > limit ? followers.pop()?.id : undefined;
    return {
      items: followers.map(f => f.follower),
      nextCursor,
    };
  }

  async getFollowing(userId: string, cursor?: string, limit: number = 20) {
    const following = await prisma.follow.findMany({
      where: { followerId: userId },
      orderBy: { createdAt: "desc" },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      include: {
        following: { select: { id: true, username: true, fullName: true, avatar: true, verified: true, bio: true } },
      },
    });

    const nextCursor = following.length > limit ? following.pop()?.id : undefined;
    return {
      items: following.map(f => f.following),
      nextCursor,
    };
  }
}

export const feedService = new FeedService();
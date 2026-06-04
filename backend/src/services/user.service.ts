import bcrypt from 'bcryptjs';
import { prisma } from '../prisma';

const ensureValidUrl = (value?: string) => {
  if (!value) return;
  const trimmed = value.trim();
  if (!trimmed) return;
  try {
    new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`);
    return trimmed;
  } catch {
    throw new Error('Invalid URL format');
  }
};

const ensureUsernameSafe = (username?: string) => {
  if (!username) return;
  const trimmed = username.trim().toLowerCase();
  if (trimmed.length < 3) {
    throw new Error('Username must be at least 3 characters long');
  }
  if (!/^[a-z0-9_\.]+$/.test(trimmed)) {
    throw new Error('Username may only contain letters, numbers, underscores, and periods');
  }
  return trimmed;
};

const ensureValidEmail = (email?: string) => {
  if (!email) return;
  const trimmed = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    throw new Error('Invalid email address');
  }
  return trimmed;
};

export class UserService {
  async getUserProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: {
          include: {
            socialLinks: true,
            media: { orderBy: { createdAt: 'desc' }, take: 12 },
          },
        },
        posts: {
          orderBy: { createdAt: 'desc' },
          take: 6,
          include: {
            likes: { select: { id: true } },
            comments: { select: { id: true } },
          },
        },
        _count: {
          select: {
            followers: true,
            following: true,
            posts: true,
          },
        },
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return {
      id: user.id,
      email: user.email || null,
      username: user.username,
      fullName: user.fullName,
      avatarUrl: user.profile?.avatarUrl || user.avatar || null,
      bannerUrl: user.profile?.bannerUrl || null,
      bio: user.profile?.bio || user.bio || null,
      website: user.profile?.website || null,
      country: user.profile?.country || null,
      city: user.profile?.city || null,
      interests: user.profile?.interests || null,
      verified: user.verified,
      premium: user.premium,
      socialLinks: user.profile?.socialLinks || [],
      media: user.profile?.media || [],
      profile: user.profile,
      counts: {
        followers: user._count.followers,
        following: user._count.following,
        posts: user._count.posts,
        media: user.profile?.media.length || 0,
      },
      latestPosts: user.posts.map((post) => ({
        id: post.id,
        content: post.content,
        mediaUrl: post.mediaUrl,
        pinned: post.pinned,
        createdAt: post.createdAt,
        likes: post.likes.length,
        comments: post.comments.length,
      })),
      joinedAt: user.createdAt,
    };
  }

  async getPublicProfileByUsername(username: string, currentUserId?: string) {
    const user = await prisma.user.findUnique({
      where: { username },
      include: {
        profile: { include: { socialLinks: true, media: { orderBy: { createdAt: 'desc' }, take: 12 } } },
        _count: { select: { followers: true, following: true, posts: true } },
      },
    });

    if (!user) {
      throw new Error('Profile not found');
    }

    const isFollowing = currentUserId
      ? Boolean(
          await prisma.follow.findUnique({
            where: {
              followerId_followingId: {
                followerId: currentUserId,
                followingId: user.id,
              },
            },
          }),
        )
      : false;

    return {
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      avatarUrl: user.profile?.avatarUrl || user.avatar || null,
      bannerUrl: user.profile?.bannerUrl || null,
      bio: user.profile?.bio || user.bio || null,
      website: user.profile?.website || null,
      country: user.profile?.country || null,
      city: user.profile?.city || null,
      interests: user.profile?.interests || null,
      verified: user.verified,
      premium: user.premium,
      socialLinks: user.profile?.socialLinks || [],
      media: user.profile?.media || [],
      counts: {
        followers: user._count.followers,
        following: user._count.following,
        posts: user._count.posts,
        media: user.profile?.media.length || 0,
      },
      isFollowing,
      joinedAt: user.createdAt,
    };
  }

  async getUserPosts(userId: string, cursor?: string, limit: number = 10) {
    const query: any = { authorId: userId };
    const posts = await prisma.post.findMany({
      where: query,
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      include: {
        author: { select: { id: true, username: true, avatar: true } },
        likes: { select: { id: true } },
        comments: { select: { id: true } },
      },
    });

    const nextCursor = posts.length > limit ? posts.pop()?.id : undefined;
    return {
      items: posts,
      nextCursor,
    };
  }

  async getProfileMedia(userId: string, cursor?: string, limit: number = 12) {
    const profile = await prisma.profile.findUnique({ where: { userId } });
    if (!profile) {
      throw new Error('Profile not found');
    }
    const media = await prisma.profileMedia.findMany({
      where: { profileId: profile.id },
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });
    const nextCursor = media.length > limit ? media.pop()?.id : undefined;
    return { items: media, nextCursor };
  }

  async getUserReplies(userId: string, cursor?: string, limit: number = 10) {
    const replies = await prisma.postComment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      include: {
        post: {
          select: {
            id: true,
            content: true,
            author: { select: { id: true, username: true, avatar: true } },
          },
        },
      },
    });
    const nextCursor = replies.length > limit ? replies.pop()?.id : undefined;
    return { items: replies, nextCursor };
  }

  async getUserLikes(userId: string, cursor?: string, limit: number = 10) {
    const likes = await prisma.postLike.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      include: {
        post: {
          include: {
            author: { select: { id: true, username: true, avatar: true } },
            likes: { select: { id: true } },
            comments: { select: { id: true } },
          },
        },
      },
    });
    const nextCursor = likes.length > limit ? likes.pop()?.id : undefined;
    return { items: likes, nextCursor };
  }

  async getPublicUserPostsByUsername(username: string, cursor?: string, limit: number = 10) {
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      throw new Error('Profile not found');
    }
    return this.getUserPosts(user.id, cursor, limit);
  }

  async getPublicUserMediaByUsername(username: string, cursor?: string, limit: number = 12) {
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      throw new Error('Profile not found');
    }
    return this.getProfileMedia(user.id, cursor, limit);
  }

  async updateProfile(userId: string, data: any) {
    const updates: any = {};
    const profileUpdates: any = {};

    if (data.fullName !== undefined) updates.fullName = data.fullName?.trim() || null;
    if (data.bio !== undefined) {
      const bio = data.bio.trim();
      if (bio.length > 260) throw new Error('Bio must be 260 characters or less');
      profileUpdates.bio = bio;
    }
    if (data.website !== undefined) {
      profileUpdates.website = ensureValidUrl(data.website);
    }
    if (data.city !== undefined) profileUpdates.city = data.city?.trim() || null;
    if (data.country !== undefined) profileUpdates.country = data.country?.trim() || null;
    if (data.interests !== undefined) profileUpdates.interests = data.interests?.trim() || null;
    if (data.bannerUrl !== undefined) profileUpdates.bannerUrl = data.bannerUrl || null;
    if (data.avatarUrl !== undefined) profileUpdates.avatarUrl = data.avatarUrl || null;

    if (data.username !== undefined) {
      const normalized = ensureUsernameSafe(data.username);
      if (normalized) {
        const existing = await prisma.user.findFirst({
          where: {
            username: normalized,
            NOT: { id: userId },
          },
        });
        if (existing) {
          throw new Error('Username already in use');
        }
        updates.username = normalized;
        profileUpdates.username = normalized;
      }
    }

    const existingUser = await prisma.user.findUnique({ where: { id: userId }, include: { profile: true } });
    if (!existingUser) throw new Error('User not found');

    const profileId = existingUser.profile?.id;
    const profileUsername = updates.username || existingUser.username;
    const profileFullName = updates.fullName ?? existingUser.fullName ?? undefined;

    const socialLinks = Array.isArray(data.socialLinks) ? data.socialLinks : undefined;
    if (socialLinks) {
      const validLinks = socialLinks
        .filter((link: any) => link?.platform && link?.url)
        .map((link: any) => ({ platform: link.platform.trim(), url: ensureValidUrl(link.url) }));
      profileUpdates.socialLinks = {
        deleteMany: {},
        create: validLinks,
      };
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        ...updates,
        bio: profileUpdates.bio ?? existingUser.bio,
      },
    });

    await prisma.profile.upsert({
      where: { userId },
      create: {
        userId,
        username: profileUsername,
        fullName: profileFullName,
        ...profileUpdates,
      },
      update: {
        ...profileUpdates,
        fullName: profileFullName,
      },
    });

    return this.getUserProfile(userId);
  }

  async updateProfileImage(userId: string, imageType: 'avatar' | 'banner', imageUrl: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found');
    }

    await prisma.profile.upsert({
      where: { userId },
      create: {
        userId,
        username: user.username,
        fullName: user.fullName || undefined,
        ...(imageType === 'avatar' ? { avatarUrl: imageUrl } : { bannerUrl: imageUrl }),
      },
      update: imageType === 'avatar' ? { avatarUrl: imageUrl } : { bannerUrl: imageUrl },
    });

    return this.getUserProfile(userId);
  }

  async getUserSettings(userId: string) {
    return prisma.userSettings.upsert({
      where: { userId },
      create: {
        userId,
      },
      update: {},
    });
  }

  async updateUserSettings(userId: string, data: any) {
    const settings: any = {};

    if (data.theme !== undefined) {
      const theme = data.theme.trim().toLowerCase();
      if (!['dark', 'light'].includes(theme)) {
        throw new Error('Theme must be dark or light');
      }
      settings.theme = theme;
    }

    if (data.privacyProfile !== undefined) {
      const value = data.privacyProfile.trim().toLowerCase();
      if (!['public', 'private'].includes(value)) {
        throw new Error('Profile privacy must be public or private');
      }
      settings.privacyProfile = value;
    }

    if (data.privacyMessages !== undefined) {
      const value = data.privacyMessages.trim().toLowerCase();
      if (!['everyone', 'following', 'noone'].includes(value)) {
        throw new Error('Message privacy must be everyone, following, or noone');
      }
      settings.privacyMessages = value;
    }

    if (data.privacyFollows !== undefined) {
      const value = data.privacyFollows.trim().toLowerCase();
      if (!['everyone', 'followers', 'noone'].includes(value)) {
        throw new Error('Follow privacy must be everyone, followers, or noone');
      }
      settings.privacyFollows = value;
    }

    return prisma.userSettings.upsert({
      where: { userId },
      create: {
        userId,
        ...settings,
      },
      update: {
        ...settings,
      },
    });
  }

  async getNotificationPreferences(userId: string) {
    return prisma.notificationPreferences.upsert({
      where: { userId },
      create: {
        userId,
      },
      update: {},
    });
  }

  async updateNotificationPreferences(userId: string, data: any) {
    const updates: any = {};
    if (data.emailAlerts !== undefined) updates.emailAlerts = Boolean(data.emailAlerts);
    if (data.pushAlerts !== undefined) updates.pushAlerts = Boolean(data.pushAlerts);
    if (data.chatAlerts !== undefined) updates.chatAlerts = Boolean(data.chatAlerts);
    if (data.liveAlerts !== undefined) updates.liveAlerts = Boolean(data.liveAlerts);

    return prisma.notificationPreferences.upsert({
      where: { userId },
      create: {
        userId,
        ...updates,
      },
      update: {
        ...updates,
      },
    });
  }

  async updateEmail(userId: string, email: string) {
    const normalized = ensureValidEmail(email);
    const existing = await prisma.user.findFirst({
      where: {
        email: normalized,
        NOT: { id: userId },
      },
    });
    if (existing) {
      throw new Error('Email already in use');
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { email: normalized },
    });

    return { id: user.id, email: user.email };
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found');
    }
    const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error('Current password is incorrect');
    }
    if (newPassword.length < 8) {
      throw new Error('New password must be at least 8 characters long');
    }
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);
    await prisma.user.update({ where: { id: userId }, data: { passwordHash } });
    return { success: true };
  }

  async blockUser(userId: string, targetUsername: string) {
    const target = await prisma.user.findUnique({ where: { username: targetUsername } });
    if (!target) {
      throw new Error('Target user not found');
    }
    if (target.id === userId) {
      throw new Error('Cannot block yourself');
    }
    return prisma.blockedUser.upsert({
      where: {
        userId_targetId: {
          userId,
          targetId: target.id,
        },
      },
      create: {
        userId,
        targetId: target.id,
      },
      update: {},
    });
  }

  async unblockUser(userId: string, targetId: string) {
    await prisma.blockedUser.deleteMany({ where: { userId, targetId } });
    return { success: true };
  }

  async getBlockedUsers(userId: string) {
    return prisma.blockedUser.findMany({
      where: { userId },
      include: { target: { select: { id: true, username: true } } },
    });
  }

  async muteUser(userId: string, targetUsername: string) {
    const target = await prisma.user.findUnique({ where: { username: targetUsername } });
    if (!target) {
      throw new Error('Target user not found');
    }
    if (target.id === userId) {
      throw new Error('Cannot mute yourself');
    }
    return prisma.mutedUser.upsert({
      where: {
        userId_targetId: {
          userId,
          targetId: target.id,
        },
      },
      create: {
        userId,
        targetId: target.id,
      },
      update: {},
    });
  }

  async unmuteUser(userId: string, targetId: string) {
    await prisma.mutedUser.deleteMany({ where: { userId, targetId } });
    return { success: true };
  }

  async getMutedUsers(userId: string) {
    return prisma.mutedUser.findMany({
      where: { userId },
      include: { target: { select: { id: true, username: true } } },
    });
  }

  async getSecurityLogs(userId: string) {
    return prisma.securityLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
  }

  async addProfileMedia(userId: string, url: string, type: string, title?: string) {
    let profile = await prisma.profile.findUnique({ where: { userId } });
    if (!profile) {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        throw new Error('User not found');
      }
      profile = await prisma.profile.create({
        data: {
          userId,
          username: user.username,
          fullName: user.fullName || undefined,
        },
      });
    }
    return prisma.profileMedia.create({
      data: {
        profileId: profile.id,
        url,
        type,
        title: title?.trim() || null,
      },
    });
  }

  async followUser(currentUserId: string, username: string) {
    const target = await prisma.user.findUnique({ where: { username } });
    if (!target) {
      throw new Error('Target user not found');
    }
    if (target.id === currentUserId) {
      throw new Error('Cannot follow yourself');
    }

    const existing = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUserId,
          followingId: target.id,
        },
      },
    });
    if (existing) {
      return existing;
    }

    return prisma.follow.create({
      data: {
        followerId: currentUserId,
        followingId: target.id,
      },
    });
  }

  async unfollowUser(currentUserId: string, username: string) {
    const target = await prisma.user.findUnique({ where: { username } });
    if (!target) {
      throw new Error('Target user not found');
    }
    if (target.id === currentUserId) {
      throw new Error('Cannot unfollow yourself');
    }

    await prisma.follow.deleteMany({
      where: {
        followerId: currentUserId,
        followingId: target.id,
      },
    });
    return { success: true };
  }

  async uploadPhoto(userId: string, photoUrl: string) {
    const photo = await prisma.photo.create({
      data: {
        userId,
        url: photoUrl,
      },
    });
    return photo;
  }

  async deletePhoto(photoId: string, userId: string) {
    const photo = await prisma.photo.findUnique({ where: { id: photoId } });
    if (!photo || photo.userId !== userId) {
      throw new Error('Photo not found or unauthorized');
    }
    await prisma.photo.delete({ where: { id: photoId } });
    return { message: 'Photo deleted' };
  }

  async getPhotos(userId: string) {
    const photos = await prisma.photo.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return photos;
  }

  async searchUsers(query: string, limit: number = 20) {
    const users = await prisma.user.findMany({
      where: {
        OR: [{ username: { contains: query } }, { fullName: { contains: query } }],
        status: 'ACTIVE',
      },
      select: {
        id: true,
        username: true,
        fullName: true,
        avatar: true,
        bio: true,
        age: true,
        city: true,
        photos: true,
      },
      take: limit,
    });
    return users;
  }

  async getUserById(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        fullName: true,
        avatar: true,
        bio: true,
        age: true,
        gender: true,
        country: true,
        city: true,
        verified: true,
        premium: true,
        photos: true,
      },
    });
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  async getOnlineUsers(limit: number = 50) {
    const users = await prisma.user.findMany({
      where: { status: 'ACTIVE' },
      select: {
        id: true,
        username: true,
        avatar: true,
        status: true,
      },
      take: limit,
    });
    return users;
  }

  async updateOnlineStatus(userId: string, isOnline: boolean) {
    const profile = await prisma.profile.update({
      where: { userId },
      data: { isOnline },
    });
    return profile;
  }

  async deleteAccount(userId: string) {
    const user = await prisma.user.update({ where: { id: userId }, data: { status: 'DELETED' } });
    await prisma.user.update({
      where: { id: userId },
      data: { email: null, phone: null, passwordHash: '' },
    });
    return { message: 'Account deleted successfully' };
  }

  async getUserStats(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found');
    }
    const [conversations, followers, photos, earnings] = await Promise.all([
      prisma.conversation.count({ where: { participants: { some: { userId } }, isGroup: false } }),
      prisma.follow.count({ where: { followingId: userId } }),
      prisma.photo.count({ where: { userId } }),
      prisma.giftTransaction.aggregate({ where: { receiverId: userId }, _sum: { amount: true } }),
    ]);
    return {
      matches: conversations,
      pendingLikes: followers,
      photoCount: photos,
      totalEarnings: earnings._sum.amount || 0,
      premium: user.premium,
      verified: user.verified,
      joinedAt: user.createdAt,
    };
  }
}

export const userService = new UserService();

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding SparkLive database...');

  // Hash passwords
  const passwordHash = bcrypt.hashSync('password123', 10);

  // Clean existing data just in case
  await prisma.$executeRawUnsafe('DELETE FROM "Subscription"');
  await prisma.$executeRawUnsafe('DELETE FROM "Report"');
  await prisma.$executeRawUnsafe('DELETE FROM "Withdrawal"');
  await prisma.$executeRawUnsafe('DELETE FROM "WalletTransaction"');
  await prisma.$executeRawUnsafe('DELETE FROM "Notification"');
  await prisma.$executeRawUnsafe('DELETE FROM "GiftTransaction"');
  await prisma.$executeRawUnsafe('DELETE FROM "Gift"');
  await prisma.$executeRawUnsafe('DELETE FROM "Session"');
  await prisma.$executeRawUnsafe('DELETE FROM "SecurityLog"');
  await prisma.$executeRawUnsafe('DELETE FROM "NotificationPreferences"');
  await prisma.$executeRawUnsafe('DELETE FROM "UserSettings"');
  await prisma.$executeRawUnsafe('DELETE FROM "StreamFollower"');
  await prisma.$executeRawUnsafe('DELETE FROM "StreamViewer"');
  await prisma.$executeRawUnsafe('DELETE FROM "LiveChatMessage"');
  await prisma.$executeRawUnsafe('DELETE FROM "LiveStream"');
  await prisma.$executeRawUnsafe('DELETE FROM "StreamCategory"');
  await prisma.$executeRawUnsafe('DELETE FROM "UserPresence"');
  await prisma.$executeRawUnsafe('DELETE FROM "Attachment"');
  await prisma.$executeRawUnsafe('DELETE FROM "MessageReaction"');
  await prisma.$executeRawUnsafe('DELETE FROM "MessageRead"');
  await prisma.$executeRawUnsafe('DELETE FROM "Message"');
  await prisma.$executeRawUnsafe('DELETE FROM "Participant"');
  await prisma.$executeRawUnsafe('DELETE FROM "Conversation"');
  await prisma.$executeRawUnsafe('DELETE FROM "PostComment"');
  await prisma.$executeRawUnsafe('DELETE FROM "PostLike"');
  await prisma.$executeRawUnsafe('DELETE FROM "Post"');
  await prisma.$executeRawUnsafe('DELETE FROM "WatchHistory"');
  await prisma.$executeRawUnsafe('DELETE FROM "VideoSave"');
  await prisma.$executeRawUnsafe('DELETE FROM "VideoComment"');
  await prisma.$executeRawUnsafe('DELETE FROM "VideoLike"');
  await prisma.$executeRawUnsafe('DELETE FROM "Video"');
  await prisma.$executeRawUnsafe('DELETE FROM "Follow"');
  await prisma.$executeRawUnsafe('DELETE FROM "Photo"');
  await prisma.$executeRawUnsafe('DELETE FROM "Wallet"');
  await prisma.$executeRawUnsafe('DELETE FROM "Profile"');
  await prisma.$executeRawUnsafe('DELETE FROM "User"');

  // 1. Create stream categories
  console.log('Seeding stream categories...');
  const catGaming = await prisma.streamCategory.create({
    data: { name: 'Gaming', description: 'Streamers playing live games' },
  });
  const catMusic = await prisma.streamCategory.create({
    data: { name: 'Music', description: 'Singers, DJs, and live performances' },
  });
  const catChatting = await prisma.streamCategory.create({
    data: { name: 'Just Chatting', description: 'Chill chat, Q&A, and conversations' },
  });
  const catVIP = await prisma.streamCategory.create({
    data: { name: 'VIP Lounge', description: 'Exclusive premium private streams' },
  });

  // 2. Create gifts
  console.log('Seeding gifts...');
  const giftRose = await prisma.gift.create({
    data: { name: 'Rose', price: 5, icon: '🌹', description: 'A cute red rose' },
  });
  const giftHearts = await prisma.gift.create({
    data: { name: 'Hearts', price: 15, icon: '💖', description: 'Sparkly heart explosion' },
  });
  const giftCrown = await prisma.gift.create({
    data: { name: 'Crown', price: 100, icon: '👑', description: 'Fit for royalty!' },
  });
  const giftRocket = await prisma.gift.create({
    data: { name: 'Rocket', price: 500, icon: '🚀', description: 'Boost to the moon!' },
  });

  // 3. Create test users
  console.log('Seeding users and profiles...');
  const usersData = [
    {
      username: 'ella_glow',
      fullName: 'Ella Glow',
      email: 'ella@sparklive.com',
      bio: 'Travel addict, night streaming enthusiast. Let’s talk vibes and beats!',
      gender: 'Female',
      age: 24,
      city: 'London',
      country: 'UK',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80',
      banner: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1000&auto=format&fit=crop&q=80',
      premium: true,
      verified: true,
      coins: 500,
    },
    {
      username: 'noah_sound',
      fullName: 'Noah Sound',
      email: 'noah@sparklive.com',
      bio: 'DJ & Sound producer. Live mixing Chill Lo-fi beats every single night.',
      gender: 'Male',
      age: 27,
      city: 'Berlin',
      country: 'Germany',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=80',
      banner: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=1000&auto=format&fit=crop&q=80',
      premium: false,
      verified: true,
      coins: 200,
    },
    {
      username: 'zara_style',
      fullName: 'Zara Style',
      email: 'zara@sparklive.com',
      bio: 'Fashion designer, makeup artist. Streaming fits and tutorials. Join the style squad!',
      gender: 'Female',
      age: 23,
      city: 'Paris',
      country: 'France',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&auto=format&fit=crop&q=80',
      banner: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1000&auto=format&fit=crop&q=80',
      premium: true,
      verified: false,
      coins: 1200,
    },
    {
      username: 'luna_play',
      fullName: 'Luna Play',
      email: 'luna@sparklive.com',
      bio: 'FPS gamer. Streaming Apex, Valorant and retro classics. Hardcore play only!',
      gender: 'Female',
      age: 22,
      city: 'Tokyo',
      country: 'Japan',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500&auto=format&fit=crop&q=80',
      banner: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=1000&auto=format&fit=crop&q=80',
      premium: false,
      verified: false,
      coins: 50,
    },
    {
      username: 'eli_talk',
      fullName: 'Eli Talk',
      email: 'eli@sparklive.com',
      bio: 'Late night talk show, philosophy, deep chats and Q&As. Let’s converse.',
      gender: 'Male',
      age: 29,
      city: 'New York',
      country: 'USA',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&auto=format&fit=crop&q=80',
      banner: 'https://images.unsplash.com/photo-1502239608882-93b729c6af43?w=1000&auto=format&fit=crop&q=80',
      premium: true,
      verified: true,
      coins: 1000,
    },
  ];

  const users: any[] = [];
  for (const u of usersData) {
    const user = await prisma.user.create({
      data: {
        email: u.email,
        username: u.username,
        fullName: u.fullName,
        bio: u.bio,
        gender: u.gender,
        age: u.age,
        city: u.city,
        country: u.country,
        avatar: u.avatar,
        passwordHash,
        verified: u.verified,
        premium: u.premium,
        coins: u.coins,
        earnings: u.username === 'ella_glow' ? 450.0 : 0.0,
      },
    });

    await prisma.profile.create({
      data: {
        userId: user.id,
        username: u.username,
        fullName: u.fullName,
        bio: u.bio,
        avatarUrl: u.avatar,
        bannerUrl: u.banner,
        gender: u.gender,
        age: u.age,
        city: u.city,
        country: u.country,
        isOnline: Math.random() > 0.4,
        interests: 'Music, Gaming, Travel',
        profileImages: u.avatar,
      },
    });

    await prisma.wallet.create({
      data: {
        userId: user.id,
        coinBalance: u.coins,
        earningsBalance: u.username === 'ella_glow' ? 450 : 0,
      },
    });

    await prisma.userSettings.create({
      data: {
        userId: user.id,
        theme: 'dark',
        privacyProfile: 'public',
      },
    });

    await prisma.notificationPreferences.create({
      data: {
        userId: user.id,
        emailAlerts: true,
        pushAlerts: true,
        chatAlerts: true,
        liveAlerts: true,
      },
    });

    await prisma.userPresence.create({
      data: {
        userId: user.id,
        isOnline: true,
        lastActive: new Date(),
      },
    });

    users.push(user);
  }

  // 4. Create standard follows (Ella follows Noah, Noah follows Ella, etc.)
  console.log('Seeding user follows...');
  await prisma.follow.createMany({
    data: [
      { followerId: users[0].id, followingId: users[1].id }, // ella follows noah
      { followerId: users[0].id, followingId: users[2].id }, // ella follows zara
      { followerId: users[1].id, followingId: users[0].id }, // noah follows ella
      { followerId: users[2].id, followingId: users[0].id }, // zara follows ella
      { followerId: users[3].id, followingId: users[0].id }, // luna follows ella
      { followerId: users[4].id, followingId: users[0].id }, // eli follows ella
      { followerId: users[4].id, followingId: users[1].id }, // eli follows noah
    ],
  });

  // 5. Create TikTok-Style Vertical Videos
  console.log('Seeding vertical videos...');
  const videosData = [
    {
      title: 'Late night vibes in neon 🌌',
      description: 'Chilling in my room watching the rain. Aesthetic vibes only. #neon #rain #lofi',
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-girl-in-neon-lit-room-watching-the-rain-31267-large.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400&q=80',
      duration: 15.0,
      creatorId: users[0].id, // Ella
      views: 14200,
    },
    {
      title: 'Dancing under the neon lights! 🕺',
      description: 'Feeling the beat and dancing in front of my neon setup. DJ set coming tonight! #dance #dj #neon',
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-dancing-in-front-of-a-neon-sign-short-40344-large.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&q=80',
      duration: 10.5,
      creatorId: users[1].id, // Noah
      views: 8900,
    },
    {
      title: 'Checking my stream analytics 📱',
      description: 'The support lately has been absolutely insane. Love you guys! SparkLive is the best. #analytics #tech #creators',
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-holding-a-smartphone-with-a-neon-glow-short-40342-large.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&q=80',
      duration: 12.0,
      creatorId: users[2].id, // Zara
      views: 22100,
    },
    {
      title: 'Unwinding after an intense match 🍷',
      description: 'Tough session on Apex Legends but we got that win. Cheers to the squad! #gaming #apex #relax',
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-vertical-shot-of-a-happy-woman-holding-a-glass-of-wine-41005-large.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1543362906-acfc16c67564?w=400&q=80',
      duration: 18.0,
      creatorId: users[3].id, // Luna
      views: 5400,
    },
  ];

  for (const v of videosData) {
    const video = await prisma.video.create({
      data: {
        title: v.title,
        description: v.description,
        videoUrl: v.videoUrl,
        thumbnailUrl: v.thumbnailUrl,
        duration: v.duration,
        views: v.views,
        creatorId: v.creatorId,
      },
    });

    // Add some random likes/comments for the video
    await prisma.videoLike.create({
      data: { userId: users[4].id, videoId: video.id }, // Eli likes it
    });
    if (video.creatorId !== users[0].id) {
      await prisma.videoLike.create({
        data: { userId: users[0].id, videoId: video.id }, // Ella likes it
      });
    }

    await prisma.videoComment.createMany({
      data: [
        { userId: users[4].id, videoId: video.id, content: 'This is incredible! Keep going! 🔥' },
        { userId: users[1].id, videoId: video.id, content: 'Love the aesthetic here.' },
      ],
    });
  }

  // 6. Create Twitter/X-Style Posts
  console.log('Seeding timeline posts...');
  const postsData = [
    {
      content: 'Just launched my SparkLive creator account! Super excited to go live tonight and showcase my new tracks. Lofi beats incoming! 🎧✨',
      authorId: users[1].id, // Noah
    },
    {
      content: 'Is anyone else experiencing high latency on Valorant today? Hard to stream when ping is 150ms... 😭🎮',
      authorId: users[3].id, // Luna
    },
    {
      content: 'Just finished coding up the new layout for my live stream overlays. Neon pink or Cyberpunk blue? Comment below! 👇',
      authorId: users[0].id, // Ella
      pinned: true,
    },
    {
      content: 'Fashion drop coming tomorrow! Get ready for the exclusive VIP tutorial stream. Coin entry applies. 👗👑',
      authorId: users[2].id, // Zara
    },
    {
      content: 'Deep late-night thoughts: is technology bringing us closer together, or just highlighting our distances? Let’s discuss in my live stream tonight at 10 PM. 💬🤔',
      authorId: users[4].id, // Eli
    },
  ];

  for (const p of postsData) {
    const post = await prisma.post.create({
      data: {
        content: p.content,
        authorId: p.authorId,
        pinned: p.pinned || false,
      },
    });

    // Add some likes and comments to posts
    await prisma.postLike.create({
      data: { userId: users[0].id, postId: post.id },
    });
    if (post.authorId !== users[1].id) {
      await prisma.postLike.create({
        data: { userId: users[1].id, postId: post.id },
      });
    }

    await prisma.postComment.create({
      data: {
        userId: users[0].id,
        postId: post.id,
        content: 'This sounds fantastic, definitely looking forward to it!',
      },
    });
  }

  // 7. Create Twitch/TikTok-Style Livestreams
  console.log('Seeding active livestreams...');
  const stream1 = await prisma.liveStream.create({
    data: {
      hostId: users[0].id, // Ella
      title: 'Chill beats, rain chat, and live Q&A ☕☔',
      description: 'Hanging out on a rainy night. Grab a coffee, let’s chat and listen to Noah’s beats.',
      active: true,
      categoryName: 'Just Chatting',
      thumbnailUrl: 'https://images.unsplash.com/photo-1511765224389-37f0e77cf0eb?auto=format&fit=crop&w=500&q=80',
      streamKey: 'live_ella_glow_key_xyz123',
    },
  });

  const stream2 = await prisma.liveStream.create({
    data: {
      hostId: users[1].id, // Noah
      title: 'LIVE DJ SET - Sunset chillout sessions 🎚️💿',
      description: 'Mixing deep lofi beats and synthwave. Grab your headphones!',
      active: true,
      categoryName: 'Music',
      thumbnailUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=500&q=80',
      streamKey: 'live_noah_sound_key_abc456',
    },
  });

  // Seed live stream viewers
  await prisma.streamViewer.createMany({
    data: [
      { streamId: stream1.id, userId: users[2].id }, // Zara watching Ella
      { streamId: stream1.id, userId: users[3].id }, // Luna watching Ella
      { streamId: stream1.id, userId: users[4].id }, // Eli watching Ella
      { streamId: stream2.id, userId: users[0].id }, // Ella watching Noah
    ],
  });

  // Seed live stream comments
  await prisma.liveChatMessage.createMany({
    data: [
      { streamId: stream1.id, userId: users[2].id, message: 'Your hair looks so cool today Ella!' },
      { streamId: stream1.id, userId: users[4].id, message: 'Hello everyone! Happy Sunday vibes.' },
      { streamId: stream1.id, userId: users[3].id, message: 'Ella, please stream some gaming soon!' },
      { streamId: stream2.id, userId: users[0].id, message: 'This track is absolutely fire Noah!' },
    ],
  });

  // 8. Create Chat Conversations and Messages
  console.log('Seeding direct messenger chats...');
  // Conversation between Ella and Noah
  const conv1 = await prisma.conversation.create({
    data: {
      isGroup: false,
    },
  });

  await prisma.participant.createMany({
    data: [
      { conversationId: conv1.id, userId: users[0].id },
      { conversationId: conv1.id, userId: users[1].id },
    ],
  });

  // Add messages
  const msg1 = await prisma.message.create({
    data: {
      conversationId: conv1.id,
      senderId: users[1].id, // Noah
      content: 'Hey Ella! I loved the stream yesterday. Did you use that Lo-fi beat I sent you?',
    },
  });

  const msg2 = await prisma.message.create({
    data: {
      conversationId: conv1.id,
      senderId: users[0].id, // Ella
      content: 'Hey Noah! Yes I did! Everyone in chat was asking about it. You are incredibly talented.',
    },
  });

  const msg3 = await prisma.message.create({
    data: {
      conversationId: conv1.id,
      senderId: users[1].id, // Noah
      content: 'That is awesome! Let me know if you need more custom loops for the next one.',
    },
  });

  // Mark messages as read
  await prisma.messageRead.createMany({
    data: [
      { messageId: msg1.id, userId: users[0].id },
      { messageId: msg2.id, userId: users[1].id },
      { messageId: msg3.id, userId: users[0].id },
    ],
  });

  // Conversation between Ella and Zara
  const conv2 = await prisma.conversation.create({
    data: {
      isGroup: false,
    },
  });

  await prisma.participant.createMany({
    data: [
      { conversationId: conv2.id, userId: users[0].id },
      { conversationId: conv2.id, userId: users[2].id },
    ],
  });

  const msg4 = await prisma.message.create({
    data: {
      conversationId: conv2.id,
      senderId: users[2].id, // Zara
      content: 'Ella! We need to plan our collab stream. I can do a styling session and you can host.',
    },
  });

  await prisma.messageRead.create({
    data: { messageId: msg4.id, userId: users[0].id },
  });

  console.log('SparkLive database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

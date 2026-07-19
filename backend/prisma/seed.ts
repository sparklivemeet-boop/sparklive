import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding SparkLive monetization data...');

  // 1. Create SparkCoin Packages
  const packages = [
    { name: 'Starter Pack', coins: 100, price: 0.99, bonusCoins: 0, isPopular: false, sortOrder: 1 },
    { name: 'Popular Pack', coins: 550, price: 4.99, bonusCoins: 50, isPopular: true, sortOrder: 2 },
    { name: 'Premium Pack', coins: 1200, price: 9.99, bonusCoins: 100, isPopular: true, sortOrder: 3 },
    { name: 'Elite Pack', coins: 2500, price: 19.99, bonusCoins: 300, isPopular: false, sortOrder: 4 },
    { name: 'Ultra Pack', coins: 6500, price: 49.99, bonusCoins: 1000, isPopular: false, sortOrder: 5 },
    { name: 'Legendary Pack', coins: 14000, price: 99.99, bonusCoins: 3000, isPopular: false, sortOrder: 6 },
  ];

  for (const pkg of packages) {
    await prisma.sparkCoinPackage.upsert({
      where: { id: `pkg_${pkg.name.toLowerCase().replace(/\s+/g, '_')}` },
      update: pkg,
      create: { id: `pkg_${pkg.name.toLowerCase().replace(/\s+/g, '_')}`, ...pkg },
    });
  }
  console.log('✅ SparkCoin packages created');

  // 2. Create Gifts
  const everydayGifts = [
    { name: 'Heart', price: 10, emoji: '❤️', category: 'everyday', glowColor: '#ff3366', particleColor: '#ff3366', sortOrder: 1, description: 'Show someone you care', animationUrl: '/animations/gifts/heart.json', soundEffect: 'gift-heart.mp3', animationDuration: 2 },
    { name: 'Rose', price: 25, emoji: '🌹', category: 'everyday', glowColor: '#ff0000', particleColor: '#ff0000', sortOrder: 2, description: 'A classic romantic gesture', animationUrl: '/animations/gifts/rose.json', soundEffect: 'gift-rose.mp3', animationDuration: 2 },
    { name: 'Teddy Bear', price: 50, emoji: '🧸', category: 'everyday', glowColor: '#8B4513', particleColor: '#8B4513', sortOrder: 3, description: 'Cute and cuddly', animationUrl: '/animations/gifts/teddy.json', animationDuration: 2 },
    { name: 'Diamond', price: 100, emoji: '💎', category: 'everyday', glowColor: '#00d8ff', particleColor: '#00d8ff', sortOrder: 4, description: 'Shine bright', animationUrl: '/animations/gifts/diamond.json', soundEffect: 'gift-diamond.mp3', animationDuration: 3 },
    { name: 'Crown', price: 200, emoji: '👑', category: 'everyday', glowColor: '#FFD700', particleColor: '#FFD700', sortOrder: 5, description: 'Royal treatment', animationUrl: '/animations/gifts/crown.json', animationDuration: 3 },
    { name: 'Yacht', price: 500, emoji: '🛥️', category: 'everyday', glowColor: '#00BFFF', particleColor: '#00BFFF', sortOrder: 6, description: 'Sail away in style', animationUrl: '/animations/gifts/yacht.json', soundEffect: 'gift-yacht.mp3', animationDuration: 3 },
  ];

  const premiumGifts = [
    { name: 'Spark', price: 150, emoji: '✨', category: 'premium', glowColor: '#FFD700', particleColor: '#FFD700', sortOrder: 10, description: 'Ignite the stream', animationUrl: '/animations/gifts/spark.json', soundEffect: 'gift-spark.mp3', animationDuration: 3 },
    { name: 'Butterfly Swarm', price: 300, emoji: '🦋', category: 'premium', glowColor: '#FF69B4', particleColor: '#FF69B4', sortOrder: 11, description: 'A magical flutter', animationUrl: '/animations/gifts/butterfly.json', animationDuration: 4 },
    { name: 'Shooting Star', price: 400, emoji: '⭐', category: 'premium', glowColor: '#00d8ff', particleColor: '#ffffff', sortOrder: 12, description: 'Make a wish', animationUrl: '/animations/gifts/star.json', soundEffect: 'gift-star.mp3', animationDuration: 3 },
    { name: 'Rainbow', price: 500, emoji: '🌈', category: 'premium', glowColor: '#FF0000', particleColor: '#FF0000', sortOrder: 13, description: 'Color their world', animationUrl: '/animations/gifts/rainbow.json', animationDuration: 4 },
    { name: 'Gift Box', price: 600, emoji: '🎁', category: 'premium', glowColor: '#FF1493', particleColor: '#FF1493', sortOrder: 14, description: 'A surprise awaits', animationUrl: '/animations/gifts/giftbox.json', soundEffect: 'gift-open.mp3', animationDuration: 3 },
    { name: 'Birthday Cake', price: 700, emoji: '🎂', category: 'premium', glowColor: '#FF69B4', particleColor: '#FF69B4', sortOrder: 15, description: 'Celebrate together', animationUrl: '/animations/gifts/cake.json', animationDuration: 3 },
    { name: 'Balloons', price: 800, emoji: '🎈', category: 'premium', glowColor: '#FF4500', particleColor: '#FF4500', sortOrder: 16, description: 'Party time', animationUrl: '/animations/gifts/balloons.json', animationDuration: 3 },
    { name: 'Fireworks', price: 1000, emoji: '🎆', category: 'premium', glowColor: '#FF0000', particleColor: '#FFD700', sortOrder: 17, description: 'Light up the sky', animationUrl: '/animations/gifts/fireworks.json', soundEffect: 'gift-fireworks.mp3', animationDuration: 4 },
    { name: 'Trophy', price: 1200, emoji: '🏆', category: 'premium', glowColor: '#FFD700', particleColor: '#FFD700', sortOrder: 18, description: 'Winner winner', animationUrl: '/animations/gifts/trophy.json', animationDuration: 3 },
    { name: 'Rocket', price: 1500, emoji: '🚀', category: 'premium', glowColor: '#FF4500', particleColor: '#FF6347', sortOrder: 19, description: 'To the moon', animationUrl: '/animations/gifts/rocket.json', soundEffect: 'gift-rocket.mp3', animationDuration: 4 },
    { name: 'Diamond Ring', price: 2000, emoji: '💍', category: 'premium', glowColor: '#00d8ff', particleColor: '#00d8ff', sortOrder: 20, description: 'A heartfelt proposal', animationUrl: '/animations/gifts/ring.json', animationDuration: 4 },
    { name: 'Golden Lion', price: 2500, emoji: '🦁', category: 'premium', glowColor: '#FFD700', particleColor: '#FFD700', sortOrder: 21, description: 'King of the jungle', animationUrl: '/animations/gifts/lion.json', animationDuration: 4 },
    { name: 'Dragon', price: 3000, emoji: '🐉', category: 'premium', glowColor: '#FF4500', particleColor: '#FF0000', sortOrder: 22, description: 'Unleash the beast', animationUrl: '/animations/gifts/dragon.json', soundEffect: 'gift-dragon.mp3', animationDuration: 5 },
    { name: 'Private Jet', price: 4000, emoji: '✈️', category: 'premium', glowColor: '#00BFFF', particleColor: '#00BFFF', sortOrder: 23, description: 'Travel in luxury', animationUrl: '/animations/gifts/jet.json', animationDuration: 4 },
    { name: 'Castle', price: 5000, emoji: '🏰', category: 'premium', glowColor: '#9370DB', particleColor: '#9370DB', sortOrder: 24, description: 'Royalty awaits', animationUrl: '/animations/gifts/castle.json', animationDuration: 4 },
    { name: 'Supercar', price: 6000, emoji: '🏎️', category: 'premium', glowColor: '#FF0000', particleColor: '#FF0000', sortOrder: 25, description: 'Speed and style', animationUrl: '/animations/gifts/supercar.json', soundEffect: 'gift-car.mp3', animationDuration: 3 },
    { name: 'UFO', price: 7000, emoji: '🛸', category: 'premium', glowColor: '#00FF00', particleColor: '#00FF00', sortOrder: 26, description: 'Out of this world', animationUrl: '/animations/gifts/ufo.json', animationDuration: 4 },
    { name: 'Planet', price: 8000, emoji: '🌍', category: 'premium', glowColor: '#00BFFF', particleColor: '#00FF00', sortOrder: 27, description: 'The whole world', animationUrl: '/animations/gifts/planet.json', animationDuration: 5 },
    { name: 'Moon', price: 10000, emoji: '🌕', category: 'premium', glowColor: '#FFD700', particleColor: '#FFFACD', sortOrder: 28, description: 'Over the moon', animationUrl: '/animations/gifts/moon.json', soundEffect: 'gift-moon.mp3', animationDuration: 4 },
    { name: 'Sun', price: 12000, emoji: '☀️', category: 'premium', glowColor: '#FFD700', particleColor: '#FFA500', sortOrder: 29, description: 'Blazing glory', animationUrl: '/animations/gifts/sun.json', animationDuration: 5 },
    { name: 'Helicopter', price: 3500, emoji: '🚁', category: 'premium', glowColor: '#2E8B57', particleColor: '#2E8B57', sortOrder: 30, description: 'Rise above', animationUrl: '/animations/gifts/helicopter.json', animationDuration: 3 },
    { name: 'Private Island', price: 15000, emoji: '🏝️', category: 'premium', glowColor: '#00BFFF', particleColor: '#00FF7F', sortOrder: 31, description: 'Paradise found', animationUrl: '/animations/gifts/island.json', animationDuration: 5 },
    { name: 'Palace', price: 20000, emoji: '🏛️', category: 'premium', glowColor: '#FFD700', particleColor: '#FFD700', sortOrder: 32, description: 'Live like royalty', animationUrl: '/animations/gifts/palace.json', animationDuration: 5 },
    { name: 'Cruise Ship', price: 25000, emoji: '🚢', category: 'premium', glowColor: '#00BFFF', particleColor: '#00BFFF', sortOrder: 33, description: 'Set sail', animationUrl: '/animations/gifts/cruise.json', soundEffect: 'gift-cruise.mp3', animationDuration: 5 },
    { name: 'Treasure Chest', price: 30000, emoji: '💰', category: 'premium', glowColor: '#FFD700', particleColor: '#FFA500', sortOrder: 34, description: 'A fortune awaits', animationUrl: '/animations/gifts/chest.json', animationDuration: 4 },
  ];

  const legendaryGifts = [
    { name: 'Spark Storm', price: 50000, emoji: '⚡', category: 'legendary', isLegendary: true, glowColor: '#7B68EE', particleColor: '#00d8ff', animationDuration: 8, sortOrder: 100, description: 'A storm of sparks engulfs the stream', animationUrl: '/animations/legendary/spark-storm.json', soundEffect: 'legendary-storm.mp3' },
    { name: 'Cosmic Supernova', price: 75000, emoji: '🌌', category: 'legendary', isLegendary: true, glowColor: '#8A2BE2', particleColor: '#FF69B4', animationDuration: 10, sortOrder: 101, description: 'An explosive cosmic event', animationUrl: '/animations/legendary/supernova.json', soundEffect: 'legendary-supernova.mp3' },
    { name: 'Galaxy Portal', price: 100000, emoji: '🌀', category: 'legendary', isLegendary: true, glowColor: '#4B0082', particleColor: '#00d8ff', animationDuration: 10, sortOrder: 102, description: 'Open a portal to another galaxy', animationUrl: '/animations/legendary/portal.json', soundEffect: 'legendary-portal.mp3' },
    { name: 'Golden Dragon', price: 125000, emoji: '🐲', category: 'legendary', isLegendary: true, glowColor: '#FFD700', particleColor: '#FF4500', animationDuration: 10, sortOrder: 103, description: 'The legendary golden dragon appears', animationUrl: '/animations/legendary/golden-dragon.json', soundEffect: 'legendary-dragon.mp3' },
    { name: 'Unicorn', price: 150000, emoji: '🦄', category: 'legendary', isLegendary: true, glowColor: '#FF69B4', particleColor: '#DDA0DD', animationDuration: 8, sortOrder: 104, description: 'A magical unicorn gallops through', animationUrl: '/animations/legendary/unicorn.json' },
    { name: "King's Throne", price: 200000, emoji: '👑', category: 'legendary', isLegendary: true, glowColor: '#FFD700', particleColor: '#8B0000', animationDuration: 8, sortOrder: 105, description: 'The king takes their throne', animationUrl: '/animations/legendary/throne.json', soundEffect: 'legendary-throne.mp3' },
    { name: 'Spark Planet', price: 250000, emoji: '🌎', category: 'legendary', isLegendary: true, glowColor: '#00BFFF', particleColor: '#00FF00', animationDuration: 10, sortOrder: 106, description: 'A Spark planet is born', animationUrl: '/animations/legendary/spark-planet.json', soundEffect: 'legendary-planet.mp3' },
    { name: 'Meteor Shower', price: 300000, emoji: '☄️', category: 'legendary', isLegendary: true, glowColor: '#FF4500', particleColor: '#FFD700', animationDuration: 10, sortOrder: 107, description: 'Meteors rain down in spectacular fashion', animationUrl: '/animations/legendary/meteor.json', soundEffect: 'legendary-meteor.mp3' },
    { name: 'Spark Universe', price: 500000, emoji: '🌠', category: 'legendary', isLegendary: true, glowColor: '#8A2BE2', particleColor: '#00d8ff', animationDuration: 10, sortOrder: 108, description: 'The entire universe celebrates', animationUrl: '/animations/legendary/spark-universe.json', soundEffect: 'legendary-universe.mp3' },
  ];

  const allGifts = [...everydayGifts, ...premiumGifts, ...legendaryGifts];

  for (const gift of allGifts) {
    const slug = gift.name.toLowerCase().replace(/\s+/g, '_');
    await prisma.gift.upsert({
      where: { id: `gift_${slug}` },
      update: gift,
      create: { id: `gift_${slug}`, ...gift },
    });
  }
  console.log(`✅ ${allGifts.length} gifts created`);

  // 3. Create Premium Plans
  const premiumPlans = [
    { name: 'Monthly Spark', slug: 'monthly', description: 'Premium monthly membership', price: 9.99, interval: 'MONTHLY', coins: 500, isPopular: false, features: JSON.stringify(['Ad-free experience', 'Animated profile frame', 'Premium badge', 'Exclusive themes', 'Higher upload limits']), sortOrder: 1 },
    { name: 'Yearly Spark', slug: 'yearly', description: 'Premium yearly membership - best value', price: 89.99, interval: 'YEARLY', coins: 6000, isPopular: true, features: JSON.stringify(['All Monthly features', '2 months free', 'Advanced creator analytics', 'Early feature access', 'Premium stickers & emojis', 'Priority support']), sortOrder: 2 },
    { name: 'Lifetime Spark', slug: 'lifetime', description: 'Lifetime premium membership', price: 299.99, interval: 'LIFETIME', coins: 25000, isPopular: false, features: JSON.stringify(['All Yearly features', 'Lifetime premium badge', 'Exclusive Spark Pioneer role', 'VIP community access', 'Custom profile themes', 'Direct line to founders']), sortOrder: 3 },
  ];

  for (const plan of premiumPlans) {
    await prisma.premiumPlan.upsert({
      where: { slug: plan.slug },
      update: plan,
      create: plan,
    });
  }
  console.log('✅ Premium plans created');

  console.log('🎉 SparkLive monetization seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
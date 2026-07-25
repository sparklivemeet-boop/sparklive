const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Emoji to Lucide icon mapping
const EMOJI_MAP = {
  '📅': 'Calendar', '💬': 'MessageCircle', '🏷️': 'Tag', '📢': 'Megaphone',
  '🔍': 'Search', '❤️': 'Heart', '📨': 'Send', '📁': 'Folder',
  '📸': 'Camera', '🎥': 'Video', '🎙️': 'Mic', '🎧': 'Headphones',
  '🔔': 'Bell', '⚙️': 'Settings', '👤': 'User', '👥': 'Users',
  '🛡️': 'Shield', '⭐': 'Star', '🔥': 'Flame', '📈': 'TrendingUp',
  '📉': 'TrendingDown', '💰': 'Wallet', '💳': 'CreditCard', '💎': 'Gem',
  '🎁': 'Gift', '🪙': 'Coins', '📤': 'Upload', '📥': 'Download',
  '📎': 'Paperclip', '✉️': 'Mail', '🌐': 'Globe', '🔒': 'Lock',
  '🔓': 'LockOpen', '🔑': 'Key', '🗑️': 'Trash2', '✏️': 'Pencil',
  '➕': 'Plus', '➖': 'Minus', '✔️': 'Check', '❌': 'X',
  '⚠️': 'TriangleAlert', 'ℹ️': 'Info', '⏳': 'Loader', '🚀': 'Rocket',
  '🎯': 'Target', '📊': 'BarChart3', '📍': 'MapPin', '🕒': 'Clock',
  '📞': 'Phone', '🎉': 'PartyPopper', '🏆': 'Trophy', '🏅': 'Award',
  '🖼️': 'Image', '🔗': 'Link', '📌': 'Pin', '💡': 'Lightbulb',
  '🎮': 'Gamepad2', '🎨': 'Palette', '🎵': 'Music', '🎤': 'Mic',
  '🎬': 'Clapperboard', '📱': 'Smartphone', '💻': 'Laptop', '🖥️': 'Monitor',
  '⌨️': 'Keyboard', '📡': 'Satellite', '🔊': 'Volume2', '🔇': 'VolumeX',
  '📺': 'Tv', '📻': 'Radio', '🔋': 'Battery', '🔌': 'Plug',
  '💸': 'Banknote', '🔧': 'Wrench', '🔨': 'Hammer', '🧲': 'Magnet',
  '🔮': 'CrystalBall', '🔭': 'Telescope', '🔬': 'Microscope', '💉': 'Syringe',
  '💊': 'Pill', '🧠': 'Brain', '💪': 'Muscle', '👁️': 'Eye',
  '👀': 'Eye', '👂': 'Ear', '🦷': 'Tooth', '🦴': 'Bone',
  '🫀': 'Heart', '🫁': 'Lungs', '🫂': 'Users', '📋': 'Clipboard',
  '📝': 'FileText', '📄': 'File', '📑': 'Bookmark', '✂️': 'Scissors',
  '🚗': 'Car', '🚕': 'Taxi', '🚌': 'Bus', '🚓': 'PoliceCar',
  '🚑': 'Ambulance', '🚒': 'FireEngine', '🚚': 'Truck', '🚲': 'Bike',
  '🚨': 'AlertTriangle', '🚧': 'Construction', '⚓': 'Anchor', '⛵': 'Sailboat',
  '🚢': 'Ship', '🌍': 'Globe', '🌎': 'Globe', '🌏': 'Globe',
  '🗺️': 'Map', '🧭': 'Compass', '🏠': 'Home', '🏢': 'Building',
  '🏥': 'Hospital', '🏦': 'Banknote', '🏫': 'School', '🏭': 'Factory',
  '🏰': 'Castle', '🌅': 'Sun', '🌄': 'Sun', '🌇': 'Sun',
  '🌉': 'Bridge', '🎪': 'Theater', '🎭': 'Theater', '🎨': 'Palette',
  '🎰': 'Dice', '🚪': 'Door', '🚫': 'Ban', '🚮': 'Trash2',
  '🚰': 'Droplets', '🚶': 'Footprints', '🚽': 'Toilet', '🚿': 'Shower',
  '🛀': 'Bath', '🛁': 'Bath', '🛂': 'Passport', '🛄': 'Luggage',
  '🛅': 'Luggage', '🛋️': 'Armchair', '🛌': 'Bed', '🛍️': 'ShoppingBag',
  '🛎️': 'Bell', '🛏️': 'Bed', '🛒': 'ShoppingCart', '🛜': 'Wifi',
  '🛟': 'LifeBuoy', '🛢️': 'Droplets', '🛣️': 'Road', '🛤️': 'Train',
  '🛴': 'Bike', '🛵': 'Bike', '🛶': 'Sailboat', '🛷': 'Sled',
  '🛹': 'Skateboard', '🛺': 'Car', '🛻': 'Truck', '🛼': 'Skateboard',
  '🤖': 'Bot', '👾': 'Bot', '👻': 'Ghost', '💀': 'Skull',
  '☠️': 'Skull', '👽': 'Bot', '🧩': 'Puzzle', '🧪': 'Flask',
  '🧫': 'Flask', '🧬': 'Dna', '🧰': 'Toolbox', '🧱': 'Blocks',
  '🧲': 'Magnet', '🧳': 'Luggage', '🧾': 'Receipt', '🩺': 'Stethoscope',
  '🪄': 'Wand', '🪓': 'Axe', '🪐': 'Planet', '🪑': 'Armchair',
  '🪫': 'Battery', '🪂': 'Parachute', '🫅': 'Crown', '🫗': 'Droplets',
  '🫶': 'Heart', '🩷': 'Heart', '🩸': 'Droplets', '🫃': 'User',
  '🫄': 'User', '🌿': 'Sprout', '☘️': 'Sprout', '🍀': 'Sprout',
  '💐': 'Flower2', '🌸': 'Flower2', '🌹': 'Flower2', '🌻': 'Flower2',
  '🌷': 'Flower2', '🌱': 'Sprout', '🌲': 'TreePine', '🌳': 'TreePine',
  '🌴': 'TreePalm', '🍁': 'Circle', '🍂': 'Circle', '🍃': 'Circle',
};

const FRONTEND_DIR = path.join(__dirname, '..', 'frontend', 'src');
const pattern = path.join(FRONTEND_DIR, '**', '*.tsx');

function emojiRegex() {
  const emojis = Object.keys(EMOJI_MAP).map(e => e.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
  return new RegExp(emojis, 'gu');
}

async function processFiles() {
  const files = glob.sync(pattern);
  let totalReplaced = 0;

  for (const filepath of files) {
    let content = fs.readFileSync(filepath, 'utf-8');
    const original = content;
    const usedIcons = new Set();

    // Find and replace emojis
    const re = emojiRegex();
    content = content.replace(re, (match) => {
      const iconName = EMOJI_MAP[match];
      if (iconName) {
        usedIcons.add(iconName);
        return `<${iconName} size={14} className="inline-block" />`;
      }
      return match;
    });

    if (content === original) continue;

    // Add imports
    if (usedIcons.size > 0) {
      const importRegex = /import\s*\{([^}]+)\}\s*from\s*'lucide-react'/;
      const existing = content.match(importRegex);
      
      if (existing) {
        const current = new Set(existing[1].split(',').map(i => i.trim()).filter(Boolean));
        const allIcons = [...new Set([...current, ...usedIcons])].sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
        content = content.replace(existing[0], `import { ${allIcons.join(', ')} } from 'lucide-react'`);
      } else {
        const sortedIcons = [...usedIcons].sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
        const newImport = `import { ${sortedIcons.join(', ')} } from 'lucide-react';\n`;
        const imports = content.match(/^import .+$/gm);
        if (imports && imports.length > 0) {
          const lastImport = imports[imports.length - 1];
          const pos = content.lastIndexOf(lastImport) + lastImport.length;
          content = content.slice(0, pos) + '\n' + newImport + content.slice(pos);
        } else {
          content = newImport + content;
        }
      }
    }

    fs.writeFileSync(filepath, content, 'utf-8');
    const relPath = path.relative(FRONTEND_DIR, filepath);
    console.log(`  ✓ ${relPath} - ${usedIcons.size} icons: ${[...usedIcons].join(', ')}`);
    totalReplaced++;
  }

  console.log(`\nDone! Replaced emojis in ${totalReplaced} files`);
}

processFiles().catch(console.error);
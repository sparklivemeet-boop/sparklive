const fs = require('fs');
const path = require('path');

// Currency & Gift emoji to custom component mapping
const CUSTOM_MAP = {
  '💎': { component: 'SparkCoinIcon', import: '@/components/ui/SparkCoinIcon', size: 16 },
  '🪙': { component: 'SparkCoinIcon', import: '@/components/ui/SparkCoinIcon', size: 16 },
  '💰': { component: 'SparkCoinIcon', import: '@/components/ui/SparkCoinIcon', size: 16 },
  '💵': { component: 'SparkCoinIcon', import: '@/components/ui/SparkCoinIcon', size: 16 },
  '💶': { component: 'SparkCoinIcon', import: '@/components/ui/SparkCoinIcon', size: 16 },
  '💷': { component: 'SparkCoinIcon', import: '@/components/ui/SparkCoinIcon', size: 16 },
  '💸': { component: 'SparkCoinIcon', import: '@/components/ui/SparkCoinIcon', size: 16 },
  '💳': { component: 'SparkCoinIcon', import: '@/components/ui/SparkCoinIcon', size: 16 },
  '🎁': { component: 'GiftIcon', import: '@/components/ui/GiftIcon', size: 16 },
  '🏆': { component: 'Trophy', import: 'lucide-react', size: 16 },
  '🏅': { component: 'Award', import: 'lucide-react', size: 16 },
  '⭐': { component: 'Star', import: 'lucide-react', size: 16 },
  '🔥': { component: 'Flame', import: 'lucide-react', size: 16 },
};

const FRONTEND_DIR = path.join(__dirname, '..', 'frontend', 'src');

function getAllTsxFiles(dir) {
  const results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...getAllTsxFiles(fullPath));
    } else if (entry.name.endsWith('.tsx')) {
      results.push(fullPath);
    }
  }
  return results;
}

function emojiRegex() {
  const emojis = Object.keys(CUSTOM_MAP).map(e => e.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
  return new RegExp(emojis, 'gu');
}

async function processFiles() {
  const files = getAllTsxFiles(FRONTEND_DIR);
  let totalReplaced = 0;

  for (const filepath of files) {
    let content = fs.readFileSync(filepath, 'utf-8');
    const original = content;
    const usedCustomImports = new Map();
    const usedLucideIcons = new Set();

    const re = emojiRegex();
    content = content.replace(re, (match) => {
      const mapping = CUSTOM_MAP[match];
      if (!mapping) return match;

      if (mapping.import === 'lucide-react') {
        usedLucideIcons.add(mapping.component);
        return `<${mapping.component} size={${mapping.size}} className="inline-block" />`;
      } else {
        if (!usedCustomImports.has(mapping.import)) {
          usedCustomImports.set(mapping.import, new Set());
        }
        usedCustomImports.get(mapping.import).add(mapping.component);
        return `<${mapping.component} size={${mapping.size}} className="inline-block" />`;
      }
    });

    if (content === original) continue;

    // Add custom component imports
    for (const [importPath, components] of usedCustomImports) {
      const sortedComponents = [...components].sort();
      const importStatement = `import { ${sortedComponents.join(', ')} } from '${importPath}';\n`;
      const escapedPath = importPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const existingImport = new RegExp(`import\\s*\\{[^}]*\\}\\s*from\\s*'${escapedPath}'`);
      if (!existingImport.test(content)) {
        const imports = content.match(/^import .+$/gm);
        if (imports && imports.length > 0) {
          const lastImport = imports[imports.length - 1];
          const pos = content.lastIndexOf(lastImport) + lastImport.length;
          content = content.slice(0, pos) + '\n' + importStatement + content.slice(pos);
        } else {
          content = importStatement + content;
        }
      }
    }

    // Add lucide-react imports
    if (usedLucideIcons.size > 0) {
      const importRegex = /import\s*\{([^}]+)\}\s*from\s*'lucide-react'/;
      const existing = content.match(importRegex);
      if (existing) {
        const current = new Set(existing[1].split(',').map(i => i.trim()).filter(Boolean));
        const allIcons = [...new Set([...current, ...usedLucideIcons])].sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
        content = content.replace(existing[0], `import { ${allIcons.join(', ')} } from 'lucide-react'`);
      } else {
        const sortedIcons = [...usedLucideIcons].sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
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
    const customCount = [...usedCustomImports.values()].reduce((a, s) => a + s.size, 0);
    console.log(`  ✓ ${relPath} - ${customCount + usedLucideIcons.size} replacements`);
    totalReplaced++;
  }

  console.log(`\nDone! Replaced currency/gift emojis in ${totalReplaced} files`);
}

processFiles().catch(console.error);
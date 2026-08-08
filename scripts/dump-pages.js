import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const OLD_WEB_DIR = path.join(__dirname, '..', 'old-web');

const pages = [
  { slug: 'our-story', file: 'home/our-story/index.html' },
  { slug: 'mission-and-vision', file: 'home/mission-and-vision/index.html' },
  { slug: 'team', file: 'home/team/index.html' },
  { slug: 'advisory-team', file: 'home/team/advisory-team/index.html' },
  { slug: 'canfacs-constitution', file: 'home/canfacs-constitution/index.html' },
  { slug: 'calendar', file: 'home/calendar/index.html' },
  { slug: 'bhetghat', file: 'bhetghat/index.html' },
  { slug: 'programs-highlights', file: 'programs-highlights/index.html' },
  { slug: 'events', file: 'events/index.html' },
  { slug: 'everestday', file: 'events/everestday/index.html' },
  { slug: 'souvenir-2025', file: 'newsletters/souvenir-2025/index.html' },
  { slug: 'newsline-2022', file: 'newsletters/newsline-2022/index.html' },
  { slug: 'newsletter-2020', file: 'newsletters/newsletter-2020/index.html' },
  { slug: 'join-canfacs', file: 'join-canfacs/index.html' }
];

for (const p of pages) {
  const full = path.join(OLD_WEB_DIR, p.file);
  if (fs.existsSync(full)) {
    const raw = fs.readFileSync(full, 'utf-8');
    // Find strings of text inside JSON payloads in Google Sites
    const textBlocks = [];
    const matches = raw.match(/"([^"\\]{20,})"/g) || [];
    for (const m of matches) {
      const s = m.slice(1, -1).trim();
      if (!s.includes('http') && !s.includes('https') && !s.includes('docs-') && !s.includes('atari') && !s.includes('0kLUkpsP') && !s.includes('iSFTCbi') && !s.includes('mHq3jmV')) {
        textBlocks.push(s);
      }
    }
    console.log(`=== ${p.slug} ===`);
    console.log(Array.from(new Set(textBlocks)).join('\n'));
  }
}

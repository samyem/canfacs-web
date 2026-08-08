import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const OLD_WEB_DIR = path.join(__dirname, '..', 'old-web');

function cleanText(text) {
    return text.replace(/\s+/g, ' ').trim();
}

function parseFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // Extract OG Title or Title tag
    const titleMatch = content.match(/<meta\s+property="og:title"\s+content="([^"]+)"/i) || content.match(/<title>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1] : path.basename(path.dirname(filePath));

    // Extract OG Description
    const descMatch = content.match(/<meta\s+property="og:description"\s+content="([^"]+)"/i);
    const description = descMatch ? descMatch[1] : '';

    // Extract text inside paragraph tags or spans with main text content
    // Sites pages often embed text in JSON structures or specific text DOM nodes
    const pMatches = content.match(/<p[^>]*>(.*?)<\/p>/gi) || [];
    const paragraphs = pMatches.map(p => cleanText(p.replace(/<[^>]+>/g, ''))).filter(p => p.length > 10);

    return {
        filePath,
        title,
        description,
        paragraphs
    };
}

function scanDir(dir) {
    const results = [];
    const files = fs.readdirSync(dir, { withFileTypes: true });

    for (const file of files) {
        const fullPath = path.join(dir, file.name);
        if (file.isDirectory()) {
            results.push(...scanDir(fullPath));
        } else if (file.name === 'index.html') {
            results.push(parseFile(fullPath));
        }
    }
    return results;
}

const parsedPages = scanDir(OLD_WEB_DIR);
console.log(JSON.stringify(parsedPages, null, 2));

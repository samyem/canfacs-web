import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'https://www.canfacs.org';
const TARGET_DIR = path.join(__dirname, 'old-web');

const visited = new Set();
const queue = [BASE_URL];

async function ensureDir(dirPath) {
    await fs.promises.mkdir(dirPath, { recursive: true });
}

function normalizeUrl(urlStr) {
    try {
        const parsed = new URL(urlStr, BASE_URL);
        if (parsed.origin !== new URL(BASE_URL).origin) {
            return null;
        }
        // Remove hash fragment
        parsed.hash = '';
        return parsed.toString();
    } catch {
        return null;
    }
}

function urlToFilePath(urlStr) {
    const parsed = new URL(urlStr);
    let pathname = decodeURIComponent(parsed.pathname);

    if (pathname.endsWith('/') || pathname === '') {
        pathname += 'index.html';
    } else if (!path.extname(pathname)) {
        pathname += '/index.html';
    }

    const localPath = path.join(TARGET_DIR, pathname);
    return localPath;
}

function extractLinksAndAssets(html, baseUrl) {
    const urls = new Set();

    // Match href and src attributes
    const regex = /(?:href|src)=["']([^"']+)["']/gi;
    let match;
    while ((match = regex.exec(html)) !== null) {
        const val = match[1].trim();
        if (!val || val.startsWith('data:') || val.startsWith('mailto:') || val.startsWith('tel:') || val.startsWith('javascript:')) {
            continue;
        }
        const normalized = normalizeUrl(val);
        if (normalized) {
            urls.add(normalized);
        }
    }

    // Match url(...) in CSS inline styles or style tags
    const cssUrlRegex = /url\(["']?([^"'\)]+)["']?\)/gi;
    while ((match = cssUrlRegex.exec(html)) !== null) {
        const val = match[1].trim();
        if (!val || val.startsWith('data:')) {
            continue;
        }
        const normalized = normalizeUrl(val);
        if (normalized) {
            urls.add(normalized);
        }
    }

    return Array.from(urls);
}

async function downloadFile(urlStr) {
    const filePath = urlToFilePath(urlStr);
    const dir = path.dirname(filePath);
    await ensureDir(dir);

    console.log(`Downloading: ${urlStr}`);
    try {
        const res = await fetch(urlStr, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });

        if (!res.ok) {
            console.error(`Failed to download ${urlStr}: ${res.status} ${res.statusText}`);
            return null;
        }

        const contentType = res.headers.get('content-type') || '';

        if (contentType.includes('text/html') || contentType.includes('text/css') || urlStr.endsWith('.html') || urlStr.endsWith('.css')) {
            const text = await res.text();
            await fs.promises.writeFile(filePath, text, 'utf-8');
            return { type: 'text', content: text, contentType };
        } else {
            const buffer = Buffer.from(await res.arrayBuffer());
            await fs.promises.writeFile(filePath, buffer);
            return { type: 'binary', contentType };
        }
    } catch (err) {
        console.error(`Error downloading ${urlStr}:`, err.message);
        return null;
    }
}

async function crawl() {
    await ensureDir(TARGET_DIR);
    console.log(`Starting crawl of ${BASE_URL}...`);

    while (queue.length > 0) {
        const currentUrl = queue.shift();
        if (visited.has(currentUrl)) continue;

        visited.add(currentUrl);

        const result = await downloadFile(currentUrl);

        if (result && result.type === 'text') {
            const foundUrls = extractLinksAndAssets(result.content, currentUrl);
            for (const foundUrl of foundUrls) {
                if (!visited.has(foundUrl) && !queue.includes(foundUrl)) {
                    queue.push(foundUrl);
                }
            }
        }
    }

    console.log(`Crawl completed. Downloaded ${visited.size} assets/pages to ${TARGET_DIR}`);
}

crawl();

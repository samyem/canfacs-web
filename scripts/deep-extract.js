import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const OLD_WEB_DIR = path.join(__dirname, '..', 'old-web');

function scanForStrings(dir) {
    const textSnippets = new Set();

    function recurse(currentDir) {
        const files = fs.readdirSync(currentDir, { withFileTypes: true });
        for (const file of files) {
            const fullPath = path.join(currentDir, file.name);
            if (file.isDirectory()) {
                recurse(fullPath);
            } else if (file.name === 'index.html') {
                const content = fs.readFileSync(fullPath, 'utf-8');
                // Regex for quoted strings inside Google Sites WIZ payload
                const matches = content.match(/"([A-Za-z0-9\s\,\.\-\'\–\—\:\(\)\?\!\/\&]{15,})"/g) || [];
                for (const m of matches) {
                    const cleaned = m.slice(1, -1).trim();
                    if (
                        !cleaned.includes('http') &&
                        !cleaned.includes('gstatic') &&
                        !cleaned.includes('google') &&
                        !cleaned.includes('fonts') &&
                        !cleaned.includes('atari') &&
                        !cleaned.includes('WIZ') &&
                        !cleaned.includes('editors')
                    ) {
                        textSnippets.add(`${path.relative(OLD_WEB_DIR, fullPath)}: ${cleaned}`);
                    }
                }
            }
        }
    }

    recurse(dir);
    return Array.from(textSnippets);
}

const snippets = scanForStrings(OLD_WEB_DIR);
console.log(snippets.slice(0, 100).join('\n'));

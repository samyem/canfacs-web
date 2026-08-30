/**
 * db-migrate.js — CANFACS Cloudflare D1 Migration Runner
 *
 * Usage:
 *   npm run db:migrate:local    Apply pending migrations to local wrangler D1 instance
 *   npm run db:migrate:remote   Export prod backup first, then apply migrations to Cloudflare D1
 *
 * Safety guarantees:
 *   - Creates an automated backup in .database_backups before remote execution.
 *   - Remote migration automatically aborts if backup creation fails.
 *   - Keeps recent local SQLite backups for safe rollback.
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const DB_NAME = 'canfacs-db';
const BACKUPS_DIR = path.join(process.cwd(), '.database_backups');
const WRANGLER_D1_DIR = path.join(process.cwd(), '.wrangler', 'state', 'v3', 'd1');
const MAX_LOCAL_BACKUPS = 5;

function findSqliteFiles(dir) {
	let results = [];
	for (const file of fs.readdirSync(dir)) {
		const filePath = path.join(dir, file);
		if (fs.statSync(filePath).isDirectory()) {
			results = results.concat(findSqliteFiles(filePath));
		} else if (filePath.endsWith('.sqlite')) {
			results.push(filePath);
		}
	}
	return results;
}

function ensureBackupsDir() {
	if (!fs.existsSync(BACKUPS_DIR)) {
		fs.mkdirSync(BACKUPS_DIR, { recursive: true });
	}
}

function timestamp() {
	return new Date().toISOString().replace(/[:.]/g, '-');
}

function migrateRemote() {
	console.log('\n📦 Preparing remote Cloudflare D1 migration...');
	ensureBackupsDir();

	const backupPath = path.join(BACKUPS_DIR, `prod-backup-${timestamp()}.sql`);
	console.log(`\n🔒 Step 1/2: Exporting production database backup → ${backupPath}`);

	try {
		execSync(`npx wrangler d1 export ${DB_NAME} --remote --output "${backupPath}"`, {
			stdio: 'inherit'
		});
		console.log(`\x1b[32m✔ Production backup created successfully:\x1b[0m ${backupPath}`);
	} catch (err) {
		console.error(
			'\x1b[31m✘ Production backup failed. Aborting remote migration for database safety.\x1b[0m',
			err.message
		);
		process.exit(1);
	}

	console.log('\n🚀 Step 2/2: Applying pending migrations to remote D1...');
	try {
		execSync(`npx wrangler d1 migrations apply ${DB_NAME} --remote`, { stdio: 'inherit' });
		console.log('\x1b[32m✔ Remote D1 migrations applied successfully!\x1b[0m\n');
	} catch (err) {
		console.error('\x1b[31m✘ Remote migration failed:\x1b[0m', err.message);
		process.exit(1);
	}
}

function migrateLocal() {
	console.log('\n🏠 Preparing local D1 migration...');

	if (fs.existsSync(WRANGLER_D1_DIR)) {
		let sqliteFiles = [];
		try {
			sqliteFiles = findSqliteFiles(WRANGLER_D1_DIR);
		} catch (err) {
			console.warn(`\x1b[33m⚠ Could not scan wrangler directory:\x1b[0m ${err.message}`);
		}

		if (sqliteFiles.length > 0) {
			ensureBackupsDir();

			for (const file of sqliteFiles) {
				const basename = path.basename(file, '.sqlite');
				const backupPath = path.join(BACKUPS_DIR, `${basename}-${timestamp()}.sqlite`);
				try {
					fs.copyFileSync(file, backupPath);
					console.log(`\x1b[32m✔ Local backup created:\x1b[0m ${backupPath}`);
				} catch (err) {
					console.warn(`\x1b[33m⚠ Could not create local backup:\x1b[0m ${err.message}`);
				}
			}

			const allBackups = fs
				.readdirSync(BACKUPS_DIR)
				.filter((f) => f.endsWith('.sqlite'))
				.map((f) => ({ p: path.join(BACKUPS_DIR, f), t: fs.statSync(path.join(BACKUPS_DIR, f)).mtime }))
				.sort((a, b) => b.t - a.t);

			for (const old of allBackups.slice(MAX_LOCAL_BACKUPS)) {
				try {
					fs.unlinkSync(old.p);
					console.log(`🗑 Removed older local backup: ${old.p}`);
				} catch (_) {}
			}
		}
	}

	console.log('\n🚀 Applying pending migrations to local D1...');
	try {
		execSync(`npx wrangler d1 migrations apply ${DB_NAME} --local`, { stdio: 'inherit' });
		console.log('\x1b[32m✔ Local migrations applied successfully!\x1b[0m\n');
	} catch (err) {
		console.error('\x1b[31m✘ Local migration failed:\x1b[0m', err.message);
		process.exit(1);
	}
}

const isRemote = process.argv.includes('--remote');
const isLocal = process.argv.includes('--local');

if (isRemote) {
	migrateRemote();
} else if (isLocal) {
	migrateLocal();
} else {
	console.log('Usage: node scripts/db-migrate.js [--local | --remote]');
	process.exit(1);
}

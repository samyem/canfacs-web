import { hashPassword } from './auth';

export interface MemberRow {
	id: string;
	email: string;
	password_hash: string | null;
	full_name: string;
	phone: string | null;
	profession: string | null;
	city: string | null;
	province: string | null;
	bio: string | null;
	status: 'pending' | 'approved' | 'denied';
	role: 'member' | 'admin';
	created_at: string;
	approved_at: string | null;
}

export interface PostRow {
	id: string;
	author_id: string;
	author_name: string;
	author_profession: string | null;
	content: string;
	image_url: string | null;
	original_post_id: string | null;
	created_at: string;
	like_count: number;
	comment_count: number;
	user_liked?: boolean;
}

export interface CommentRow {
	id: string;
	post_id: string;
	author_id: string;
	author_name: string;
	content: string;
	image_url: string | null;
	created_at: string;
}

// In-memory fallback store for local development when D1 binding is unattached
let localStoreInitialized = false;
let memoryMembers: MemberRow[] = [];
let memoryPosts: PostRow[] = [];
let memoryComments: CommentRow[] = [];
let memoryLikes: { post_id: string; member_id: string }[] = [];

async function ensureLocalDefaultAdmin() {
	if (localStoreInitialized) return;
	localStoreInitialized = true;
	const adminEmail = 'info@canfacs.org';
	const adminHash = await hashPassword('CANFACS2026!2437');
	
	memoryMembers.push({
		id: 'admin-001',
		email: adminEmail,
		password_hash: adminHash,
		full_name: 'CANFACS Executive Admin',
		phone: '604-555-0199',
		profession: 'System Administrator',
		city: 'Vancouver',
		province: 'BC',
		bio: 'Official Administrative Account for Canada-Nepal Friendship and Cultural Society.',
		status: 'approved',
		role: 'admin',
		created_at: new Date().toISOString(),
		approved_at: new Date().toISOString()
	});

	// Seed sample post
	memoryPosts.push({
		id: 'post-seed-1',
		author_id: 'admin-001',
		author_name: 'CANFACS Executive Admin',
		author_profession: 'System Administrator',
		content: 'Welcome to the new CANFACS Member Portal & Community Feed! 🎉 Stay connected, collaborate across provinces, and share updates.',
		image_url: '/canada-nepal-flags-hero.png',
		original_post_id: null,
		created_at: new Date().toISOString(),
		like_count: 5,
		comment_count: 1,
		user_liked: false
	});

	memoryComments.push({
		id: 'comment-seed-1',
		post_id: 'post-seed-1',
		author_id: 'admin-001',
		author_name: 'CANFACS Executive Admin',
		content: 'Feel free to leave comments, attach images, and like posts from fellow members!',
		image_url: null,
		created_at: new Date().toISOString()
	});
}

export function getDb(platform?: App.Platform) {
	const db = platform?.env?.DB;
	return db;
}

// MEMBER QUERIES
export async function createMember(db: any, data: Omit<MemberRow, 'id' | 'created_at' | 'status' | 'role' | 'password_hash' | 'approved_at'>): Promise<MemberRow> {
	await ensureLocalDefaultAdmin();
	const id = 'mem_' + crypto.randomUUID().slice(0, 8);
	const created_at = new Date().toISOString();
	const newMember: MemberRow = {
		id,
		email: data.email.toLowerCase().trim(),
		password_hash: null,
		full_name: data.full_name,
		phone: data.phone || null,
		profession: data.profession || null,
		city: data.city || null,
		province: data.province || null,
		bio: data.bio || null,
		status: 'pending',
		role: 'member',
		created_at,
		approved_at: null
	};

	if (db) {
		await db.prepare(
			`INSERT INTO members (id, email, password_hash, full_name, phone, profession, city, province, bio, status, role, created_at, approved_at)
			 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
		).bind(
			newMember.id, newMember.email, newMember.password_hash, newMember.full_name,
			newMember.phone, newMember.profession, newMember.city, newMember.province,
			newMember.bio, newMember.status, newMember.role, newMember.created_at, newMember.approved_at
		).run();
	} else {
		memoryMembers.push(newMember);
	}
	return newMember;
}

export async function getMemberByEmail(db: any, email: string): Promise<MemberRow | null> {
	await ensureLocalDefaultAdmin();
	const cleanEmail = email.toLowerCase().trim();
	if (db) {
		const res = await db.prepare(`SELECT * FROM members WHERE LOWER(email) = ?`).bind(cleanEmail).first();
		return res as MemberRow | null;
	}
	return memoryMembers.find((m) => m.email.toLowerCase() === cleanEmail) || null;
}

export async function getMemberById(db: any, id: string): Promise<MemberRow | null> {
	await ensureLocalDefaultAdmin();
	if (db) {
		const res = await db.prepare(`SELECT * FROM members WHERE id = ?`).bind(id).first();
		return res as MemberRow | null;
	}
	return memoryMembers.find((m) => m.id === id) || null;
}

export async function getAllMembers(db: any, statusFilter?: 'pending' | 'approved' | 'denied'): Promise<MemberRow[]> {
	await ensureLocalDefaultAdmin();
	if (db) {
		let query = `SELECT * FROM members`;
		if (statusFilter) {
			query += ` WHERE status = '${statusFilter}'`;
		}
		query += ` ORDER BY created_at DESC`;
		const res = await db.prepare(query).all();
		return (res.results || []) as MemberRow[];
	}
	if (statusFilter) {
		return memoryMembers.filter((m) => m.status === statusFilter);
	}
	return [...memoryMembers].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function updateMemberStatus(
	db: any,
	id: string,
	status: 'approved' | 'denied',
	passwordHash?: string
): Promise<void> {
	await ensureLocalDefaultAdmin();
	const approved_at = status === 'approved' ? new Date().toISOString() : null;

	if (db) {
		if (passwordHash) {
			await db.prepare(
				`UPDATE members SET status = ?, password_hash = ?, approved_at = ? WHERE id = ?`
			).bind(status, passwordHash, approved_at, id).run();
		} else {
			await db.prepare(
				`UPDATE members SET status = ?, approved_at = ? WHERE id = ?`
			).bind(status, approved_at, id).run();
		}
	} else {
		const idx = memoryMembers.findIndex((m) => m.id === id);
		if (idx !== -1) {
			memoryMembers[idx].status = status;
			if (passwordHash) memoryMembers[idx].password_hash = passwordHash;
			if (approved_at) memoryMembers[idx].approved_at = approved_at;
		}
	}
}

// POST QUERIES
export async function getPosts(db: any, currentUserId?: string): Promise<PostRow[]> {
	await ensureLocalDefaultAdmin();
	if (db) {
		const res = await db.prepare(`
			SELECT p.*, m.full_name as author_name, m.profession as author_profession,
			(SELECT COUNT(*) FROM post_likes WHERE post_id = p.id) as like_count,
			(SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comment_count,
			(SELECT COUNT(*) FROM post_likes WHERE post_id = p.id AND member_id = ?) as user_liked
			FROM posts p
			JOIN members m ON p.author_id = m.id
			ORDER BY p.created_at DESC
		`).bind(currentUserId || '').all();
		return (res.results || []).map((r: any) => ({
			...r,
			user_liked: Boolean(r.user_liked)
		})) as PostRow[];
	}

	return memoryPosts.map((p) => {
		const author = memoryMembers.find((m) => m.id === p.author_id);
		const likesCount = memoryLikes.filter((l) => l.post_id === p.id).length;
		const commentsCount = memoryComments.filter((c) => c.post_id === p.id).length;
		const userLiked = currentUserId ? memoryLikes.some((l) => l.post_id === p.id && l.member_id === currentUserId) : false;
		return {
			...p,
			author_name: author ? author.full_name : p.author_name,
			author_profession: author ? author.profession : p.author_profession,
			like_count: likesCount || p.like_count,
			comment_count: commentsCount || p.comment_count,
			user_liked: userLiked
		};
	});
}

export async function createPost(
	db: any,
	authorId: string,
	content: string,
	imageUrl?: string,
	originalPostId?: string
): Promise<PostRow> {
	await ensureLocalDefaultAdmin();
	const id = 'post_' + crypto.randomUUID().slice(0, 8);
	const created_at = new Date().toISOString();
	const author = await getMemberById(db, authorId);
	const author_name = author ? author.full_name : 'Member';
	const author_profession = author ? author.profession : '';

	const newPost: PostRow = {
		id,
		author_id: authorId,
		author_name,
		author_profession,
		content,
		image_url: imageUrl || null,
		original_post_id: originalPostId || null,
		created_at,
		like_count: 0,
		comment_count: 0,
		user_liked: false
	};

	if (db) {
		await db.prepare(`
			INSERT INTO posts (id, author_id, content, image_url, original_post_id, created_at)
			VALUES (?, ?, ?, ?, ?, ?)
		`).bind(id, authorId, content, imageUrl || null, originalPostId || null, created_at).run();
	} else {
		memoryPosts.unshift(newPost);
	}
	return newPost;
}

export async function toggleLike(db: any, postId: string, memberId: string): Promise<boolean> {
	await ensureLocalDefaultAdmin();
	if (db) {
		const existing = await db.prepare(`SELECT * FROM post_likes WHERE post_id = ? AND member_id = ?`).bind(postId, memberId).first();
		if (existing) {
			await db.prepare(`DELETE FROM post_likes WHERE post_id = ? AND member_id = ?`).bind(postId, memberId).run();
			return false;
		} else {
			await db.prepare(`INSERT INTO post_likes (post_id, member_id, created_at) VALUES (?, ?, ?)`).bind(postId, memberId, new Date().toISOString()).run();
			return true;
		}
	} else {
		const idx = memoryLikes.findIndex((l) => l.post_id === postId && l.member_id === memberId);
		if (idx !== -1) {
			memoryLikes.splice(idx, 1);
			return false;
		} else {
			memoryLikes.push({ post_id: postId, member_id: memberId });
			return true;
		}
	}
}

// COMMENT QUERIES
export async function getComments(db: any, postId: string): Promise<CommentRow[]> {
	await ensureLocalDefaultAdmin();
	if (db) {
		const res = await db.prepare(`
			SELECT c.*, m.full_name as author_name
			FROM comments c
			JOIN members m ON c.author_id = m.id
			WHERE c.post_id = ?
			ORDER BY c.created_at ASC
		`).bind(postId).all();
		return (res.results || []) as CommentRow[];
	}

	return memoryComments
		.filter((c) => c.post_id === postId)
		.map((c) => {
			const author = memoryMembers.find((m) => m.id === c.author_id);
			return {
				...c,
				author_name: author ? author.full_name : c.author_name
			};
		});
}

export async function createComment(
	db: any,
	postId: string,
	authorId: string,
	content: string,
	imageUrl?: string
): Promise<CommentRow> {
	await ensureLocalDefaultAdmin();
	const id = 'cmt_' + crypto.randomUUID().slice(0, 8);
	const created_at = new Date().toISOString();
	const author = await getMemberById(db, authorId);
	const author_name = author ? author.full_name : 'Member';

	const newComment: CommentRow = {
		id,
		post_id: postId,
		author_id: authorId,
		author_name,
		content,
		image_url: imageUrl || null,
		created_at
	};

	if (db) {
		await db.prepare(`
			INSERT INTO comments (id, post_id, author_id, content, image_url, created_at)
			VALUES (?, ?, ?, ?, ?, ?)
		`).bind(id, postId, authorId, content, imageUrl || null, created_at).run();
	} else {
		memoryComments.push(newComment);
	}
	return newComment;
}

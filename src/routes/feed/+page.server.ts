import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { createComment, createPost, getComments, getDb, getPosts, toggleLike } from '$lib/server/db';

export const load: PageServerLoad = async ({ locals, platform }) => {
	if (!locals.user) {
		throw redirect(303, '/login');
	}

	const db = getDb(platform);
	const rawPosts = await getPosts(db, locals.user.id);

	// Load comments for each post
	const posts = await Promise.all(
		rawPosts.map(async (post) => {
			const comments = await getComments(db, post.id);
			return {
				...post,
				comments
			};
		})
	);

	return {
		user: locals.user,
		posts
	};
};

export const actions: Actions = {
	createPost: async ({ request, locals, platform }) => {
		if (!locals.user) return fail(401, { error: 'Unauthorized' });

		const formData = await request.formData();
		const content = formData.get('content')?.toString().trim();
		const imageUrl = formData.get('imageUrl')?.toString().trim();

		if (!content) {
			return fail(400, { error: 'Post content cannot be empty.' });
		}

		const db = getDb(platform);
		await createPost(db, locals.user.id, content, imageUrl || undefined);

		return { success: true };
	},

	toggleLike: async ({ request, locals, platform }) => {
		if (!locals.user) return fail(401, { error: 'Unauthorized' });

		const formData = await request.formData();
		const postId = formData.get('postId')?.toString();

		if (!postId) return fail(400, { error: 'Missing post ID' });

		const db = getDb(platform);
		const liked = await toggleLike(db, postId, locals.user.id);

		return { success: true, liked };
	},

	addComment: async ({ request, locals, platform }) => {
		if (!locals.user) return fail(401, { error: 'Unauthorized' });

		const formData = await request.formData();
		const postId = formData.get('postId')?.toString();
		const content = formData.get('content')?.toString().trim();
		const imageUrl = formData.get('imageUrl')?.toString().trim();

		if (!postId || !content) {
			return fail(400, { error: 'Comment content cannot be empty.' });
		}

		const db = getDb(platform);
		await createComment(db, postId, locals.user.id, content, imageUrl || undefined);

		return { success: true };
	},

	reshare: async ({ request, locals, platform }) => {
		if (!locals.user) return fail(401, { error: 'Unauthorized' });

		const formData = await request.formData();
		const originalPostId = formData.get('originalPostId')?.toString();
		const commentary = formData.get('commentary')?.toString().trim();

		if (!originalPostId) {
			return fail(400, { error: 'Missing original post ID' });
		}

		const db = getDb(platform);
		const reshareContent = commentary
			? `🔄 Reshared Post:\n"${commentary}"`
			: `🔄 Reshared a post from the CANFACS Community.`;

		await createPost(db, locals.user.id, reshareContent, undefined, originalPostId);

		return { success: true };
	}
};

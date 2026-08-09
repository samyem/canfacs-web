import { json, type RequestHandler } from '@sveltejs/kit';
import { getDb } from '$lib/server/db';
import fs from 'node:fs';
import path from 'node:path';

export const POST: RequestHandler = async ({ request, locals, platform }) => {
	if (!locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const formData = await request.formData();
	const file = formData.get('file') as File | null;

	if (!file || file.size === 0) {
		return json({ error: 'No file provided' }, { status: 400 });
	}

	const ext = file.name.split('.').pop() || 'jpg';
	const key = `img_${crypto.randomUUID().slice(0, 12)}.${ext}`;
	const bucket = platform?.env?.IMAGES_BUCKET;

	const arrayBuffer = await file.arrayBuffer();

	if (bucket) {
		await bucket.put(key, arrayBuffer, {
			httpMetadata: { contentType: file.type || 'image/jpeg' }
		});
		return json({ url: `/api/images/${key}` });
	} else {
		// Local development fallback to static/uploads
		try {
			const uploadsDir = path.join(process.cwd(), 'static', 'uploads');
			if (!fs.existsSync(uploadsDir)) {
				fs.mkdirSync(uploadsDir, { recursive: true });
			}
			const filePath = path.join(uploadsDir, key);
			fs.writeFileSync(filePath, Buffer.from(arrayBuffer));
			return json({ url: `/uploads/${key}` });
		} catch {
			// Fallback placeholder image if disk write fails
			return json({ url: '/bhetghat-festival.png' });
		}
	}
};

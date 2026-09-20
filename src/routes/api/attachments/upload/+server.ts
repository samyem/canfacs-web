import { json, type RequestHandler } from '@sveltejs/kit';
import fs from 'node:fs';
import path from 'node:path';

export const POST: RequestHandler = async ({ request, locals, platform, url }) => {
	if (!locals.user || locals.user.role !== 'admin') {
		return json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });
	}

	const formData = await request.formData();
	const file = formData.get('file') as File | null;

	if (!file || file.size === 0) {
		return json({ error: 'No file provided.' }, { status: 400 });
	}

	// Max 25 MB limit
	if (file.size > 25 * 1024 * 1024) {
		return json({ error: 'File size exceeds 25 MB limit.' }, { status: 400 });
	}

	const originalName = file.name || 'document';
	const ext = originalName.split('.').pop()?.toLowerCase() || 'bin';
	const safeBase = originalName
		.replace(/\.[^/.]+$/, '')
		.replace(/[^a-zA-Z0-9._-]/g, '_')
		.slice(0, 40);
	const key = `att_${crypto.randomUUID().slice(0, 8)}_${safeBase}.${ext}`;

	const bucket = platform?.env?.IMAGES_BUCKET;
	const arrayBuffer = await file.arrayBuffer();

	// Format file size nicely
	const formatBytes = (bytes: number) => {
		if (bytes < 1024) return `${bytes} B`;
		if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
		return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
	};
	const fileSize = formatBytes(file.size);

	// Resolve public absolute origin for external email delivery
	const origin = url.origin && !url.origin.includes('localhost') ? url.origin : 'https://canfacs.org';
	const absoluteUrl = `${origin}/api/attachments/${key}`;
	const relativeUrl = `/api/attachments/${key}`;

	if (bucket) {
		await bucket.put(key, arrayBuffer, {
			httpMetadata: {
				contentType: file.type || 'application/octet-stream'
			},
			customMetadata: {
				originalName,
				sizeBytes: file.size.toString(),
				uploadedAt: new Date().toISOString()
			}
		});
		return json({
			success: true,
			key,
			fileName: originalName,
			fileSize,
			sizeBytes: file.size,
			contentType: file.type || 'application/octet-stream',
			url: absoluteUrl,
			relativeUrl
		});
	} else {
		// Local development fallback to static/uploads/attachments
		try {
			const attachmentsDir = path.join(process.cwd(), 'static', 'uploads', 'attachments');
			if (!fs.existsSync(attachmentsDir)) {
				fs.mkdirSync(attachmentsDir, { recursive: true });
			}
			const filePath = path.join(attachmentsDir, key);
			fs.writeFileSync(filePath, Buffer.from(arrayBuffer));
			return json({
				success: true,
				key,
				fileName: originalName,
				fileSize,
				sizeBytes: file.size,
				contentType: file.type || 'application/octet-stream',
				url: absoluteUrl,
				relativeUrl: `/uploads/attachments/${key}`
			});
		} catch (err: any) {
			return json({ error: `Local file write failed: ${err?.message}` }, { status: 500 });
		}
	}
};

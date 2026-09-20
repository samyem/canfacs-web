import { error, type RequestHandler } from '@sveltejs/kit';
import fs from 'node:fs';
import path from 'node:path';

export const GET: RequestHandler = async ({ params, platform }) => {
	const key = params.key;
	if (!key) {
		throw error(400, 'Missing attachment key');
	}

	const bucket = platform?.env?.IMAGES_BUCKET;

	if (bucket) {
		const object = await bucket.get(key);
		if (!object) {
			throw error(404, 'Attachment not found in storage');
		}

		const headers = new Headers();
		object.writeHttpMetadata(headers);
		headers.set('etag', object.httpEtag);
		headers.set('cache-control', 'public, max-age=31536000, immutable');

		// Extract original name from metadata or key
		const originalName =
			object.customMetadata?.originalName ||
			key.replace(/^att_[a-z0-9]+_/, '') ||
			'attachment';
		headers.set('content-disposition', `inline; filename="${encodeURIComponent(originalName)}"`);

		return new Response(object.body, { headers });
	}

	// Local development fallback
	try {
		const filePath = path.join(process.cwd(), 'static', 'uploads', 'attachments', key);
		if (fs.existsSync(filePath)) {
			const fileBuffer = fs.readFileSync(filePath);
			const ext = key.split('.').pop()?.toLowerCase() || '';
			const mimeTypes: Record<string, string> = {
				pdf: 'application/pdf',
				png: 'image/png',
				jpg: 'image/jpeg',
				jpeg: 'image/jpeg',
				docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
				doc: 'application/msword',
				xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
				xls: 'application/vnd.ms-excel',
				zip: 'application/zip',
				csv: 'text/csv',
				txt: 'text/plain'
			};
			const contentType = mimeTypes[ext] || 'application/octet-stream';
			return new Response(fileBuffer, {
				headers: {
					'content-type': contentType,
					'content-disposition': `inline; filename="${encodeURIComponent(key)}"`,
					'cache-control': 'public, max-age=31536000'
				}
			});
		}
	} catch (e) {}

	throw error(404, 'Attachment not found');
};

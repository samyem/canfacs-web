import { error, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ params, platform }) => {
	const key = params.key;
	const bucket = platform?.env?.IMAGES_BUCKET;

	if (!bucket) {
		throw error(404, 'Storage bucket not available in local environment');
	}

	const object = await bucket.get(key);
	if (!object) {
		throw error(404, 'Image not found');
	}

	const headers = new Headers();
	object.writeHttpMetadata(headers);
	headers.set('etag', object.httpEtag);
	headers.set('cache-control', 'public, max-age=31536000');

	return new Response(object.body, { headers });
};

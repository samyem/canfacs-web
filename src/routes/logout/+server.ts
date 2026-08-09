import { redirect, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ cookies }) => {
	cookies.delete('canfacs_session', { path: '/' });
	throw redirect(303, '/login');
};

export const POST: RequestHandler = async ({ cookies }) => {
	cookies.delete('canfacs_session', { path: '/' });
	throw redirect(303, '/login');
};

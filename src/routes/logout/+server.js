import { redirect } from '@sveltejs/kit';
import { destroySession } from '$lib/server/auth.js';

export async function POST({ cookies }) {
	await destroySession(cookies);
	throw redirect(303, '/login');
}

export async function GET({ cookies }) {
	await destroySession(cookies);
	throw redirect(303, '/login');
}

import { getAgentFromSession } from '$lib/server/auth.js';
import { redirect } from '@sveltejs/kit';

export async function handle({ event, resolve }) {
	event.locals.agent = await getAgentFromSession(event.cookies);

	const protectedRoute = event.url.pathname.startsWith('/dashboard');
	const authRoute = event.url.pathname === '/login' || event.url.pathname === '/signup';

	if (protectedRoute && !event.locals.agent) {
		throw redirect(303, '/login');
	}
	if (authRoute && event.locals.agent) {
		throw redirect(303, '/dashboard');
	}

	return resolve(event);
}

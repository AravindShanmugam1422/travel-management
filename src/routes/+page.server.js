import { redirect } from '@sveltejs/kit';

export function load({ locals }) {
	throw redirect(303, locals.agent ? '/dashboard' : '/login');
}

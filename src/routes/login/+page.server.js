import { fail, redirect } from '@sveltejs/kit';
import bcrypt from 'bcryptjs';
import { pool } from '$lib/server/db.js';
import { createSession } from '$lib/server/auth.js';

export const actions = {
	default: async ({ request, cookies }) => {
		const form = await request.formData();
		const email = form.get('email')?.toString().trim().toLowerCase();
		const password = form.get('password')?.toString();

		if (!email || !password) {
			return fail(400, { error: 'Email and password fill pannunga.' });
		}

		const [rows] = await pool.query('SELECT * FROM agents WHERE email = ?', [email]);
		const agent = rows[0];
		if (!agent) {
			return fail(400, { error: 'Account illa indha email ku. Sign up pannunga.' });
		}

		const valid = await bcrypt.compare(password, agent.password_hash);
		if (!valid) {
			return fail(400, { error: 'Password thappu.' });
		}

		await createSession(agent.id, cookies);
		throw redirect(303, '/dashboard');
	}
};

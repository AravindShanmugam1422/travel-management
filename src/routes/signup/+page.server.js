import { fail, redirect } from '@sveltejs/kit';
import bcrypt from 'bcryptjs';
import { pool } from '$lib/server/db.js';
import { createSession } from '$lib/server/auth.js';

export const actions = {
	default: async ({ request, cookies }) => {
		const form = await request.formData();
		const name = form.get('name')?.toString().trim();
		const email = form.get('email')?.toString().trim().toLowerCase();
		const password = form.get('password')?.toString();

		if (!name || !email || !password) {
			return fail(400, { error: 'Please fill in all fields.' });
		}
		if (password.length < 6) {
			return fail(400, { error: 'Password must be at least 6 characters long.' });
		}

		const [existing] = await pool.query('SELECT id FROM agents WHERE email = ?', [email]);
		if (existing.length > 0) {
			return fail(400, { error: 'This email is already registered. Please login.' });
		}

		const passwordHash = await bcrypt.hash(password, 10);
		const [result] = await pool.query(
			'INSERT INTO agents (name, email, password_hash) VALUES (?, ?, ?)',
			[name, email, passwordHash]
		);

		await createSession(result.insertId, cookies);
		throw redirect(303, '/dashboard');
	}
};

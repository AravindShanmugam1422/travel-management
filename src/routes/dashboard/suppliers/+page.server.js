import { fail } from '@sveltejs/kit';
import { pool } from '$lib/server/db.js';

export async function load() {
	const [suppliers] = await pool.query('SELECT * FROM suppliers ORDER BY created_at DESC');
	return { suppliers };
}

export const actions = {
	default: async ({ request }) => {
		const form = await request.formData();
		const name = form.get('name')?.toString().trim();
		const url = form.get('url')?.toString().trim() || null;
		const contactEmail = form.get('contact_email')?.toString().trim() || null;
		const contactPhone = form.get('contact_phone')?.toString().trim() || null;

		if (!name) return fail(400, { error: 'Supplier name is required.' });

		await pool.query(
			'INSERT INTO suppliers (name, url, contact_email, contact_phone) VALUES (?, ?, ?, ?)',
			[name, url, contactEmail, contactPhone]
		);
		return { success: true };
	}
};

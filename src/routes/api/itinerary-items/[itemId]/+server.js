import { json } from '@sveltejs/kit';
import { getPool } from '$lib/server/db.js';

export async function PUT(event) {
  const itemId = event.params.itemId;
  const { status } = await event.request.json();
  const pool = getPool();
  await pool.query('UPDATE itinerary_items SET status = ? WHERE id = ?', [status, itemId]);
  return json({ id: Number(itemId), status });
}

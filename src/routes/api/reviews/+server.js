import { json } from '@sveltejs/kit';
import { getPool } from '$lib/server/db.js';

function toApi(row) {
  return { id: row.id, name: row.name, rating: row.rating, text: row.text, date: row.review_date, username: row.username };
}

export async function GET() {
  const pool = getPool();
  const [rows] = await pool.query('SELECT * FROM reviews ORDER BY created_at DESC');
  return json(rows.map(toApi));
}

export async function POST(event) {
  const body = await event.request.json();
  const pool = getPool();
  const [existing] = await pool.query('SELECT id FROM reviews WHERE username=?', [body.username]);
  if (existing.length) {
    return json({ error: 'Already reviewed' }, { status: 409 });
  }
  const [res] = await pool.query(
    'INSERT INTO reviews (name, rating, text, review_date, username) VALUES (?,?,?,?,?)',
    [body.name, body.rating, body.text, body.date, body.username]
  );
  return json({ id: res.insertId, ...body });
}

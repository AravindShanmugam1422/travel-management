import { json } from '@sveltejs/kit';
import { getPool } from '$lib/server/db.js';

export async function GET(event) {
  const pool = getPool();
  const url = new URL(event.request.url);
  if (url.searchParams.get('agents') === '1') {
    const [agents] = await pool.query("SELECT id, name, username, role, manager_id AS managerId, email, phone FROM users WHERE role='agent' ORDER BY name");
    return json(agents);
  }
  const [[{ c: headOffice }]] = await pool.query("SELECT COUNT(*) as c FROM users WHERE role='head_office'");
  const [[{ c: manager }]] = await pool.query("SELECT COUNT(*) as c FROM users WHERE role='manager'");
  return json({ headOffice, manager });
}

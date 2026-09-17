import { json } from '@sveltejs/kit';
import { getPool } from '$lib/server/db.js';

export async function GET() {
  const pool = getPool();
  const [[{ c: headOffice }]] = await pool.query("SELECT COUNT(*) as c FROM users WHERE role='head_office'");
  const [[{ c: manager }]] = await pool.query("SELECT COUNT(*) as c FROM users WHERE role='manager'");
  return json({ headOffice, manager });
}

import { json } from '@sveltejs/kit';
import { getPool } from '$lib/server/db.js';

export async function GET(event) {
  const pool = getPool();
  const url = new URL(event.request.url);
  if (url.searchParams.get('manage') === '1' && event.request.headers.get('x-user-role') !== 'head_office') {
    return json({ error: 'Only Head Office can manage users.' }, { status: 403 });
  }
  if (url.searchParams.get('manage') === '1') {
    const [users] = await pool.query("SELECT id, name, username, role, manager_id AS managerId, email, phone, created_at AS createdAt FROM users WHERE role IN ('manager','agent') ORDER BY role, name");
    return json(users);
  }
  if (url.searchParams.get('agents') === '1') {
    let agents;
    try {
      [agents] = await pool.query("SELECT id, name, username, role, manager_id AS managerId, email, phone FROM users WHERE role='agent' ORDER BY name");
    } catch (error) {
      if (!error.message?.includes('Unknown column')) throw error;
      [agents] = await pool.query("SELECT id, name, username, role FROM users WHERE role='agent' ORDER BY name");
    }
    return json(agents);
  }
  const [[{ c: headOffice }]] = await pool.query("SELECT COUNT(*) as c FROM users WHERE role='head_office'");
  const [[{ c: manager }]] = await pool.query("SELECT COUNT(*) as c FROM users WHERE role='manager'");
  return json({ headOffice, manager });
}

import { getPool } from './db.js';

export async function accessScope(event, column = 'assigned_agent_id') {
  const userId = Number(event.request.headers.get('x-user-id'));
  const role = event.request.headers.get('x-user-role');
  if (!userId || !role || role === 'head_office') return { clause: '', params: [] };
  if (role === 'agent') return { clause: ` WHERE ${column} = ?`, params: [userId] };
  if (role === 'manager') {
    return { clause: ` WHERE ${column} IN (SELECT id FROM users WHERE manager_id = ?)`, params: [userId] };
  }
  return { clause: ' WHERE 1 = 0', params: [] };
}
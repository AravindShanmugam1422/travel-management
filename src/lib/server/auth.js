import { pool } from './db.js';

const SESSION_COOKIE = 'session_id';
const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 14; // 14 days

function randomId() {
	return crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '');
}

export async function createSession(agentId, cookies) {
	const id = randomId();
	const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
	await pool.query('INSERT INTO sessions (id, agent_id, expires_at) VALUES (?, ?, ?)', [
		id,
		agentId,
		expiresAt
	]);
	cookies.set(SESSION_COOKIE, id, {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		secure: true,
		expires: expiresAt
	});
	return id;
}

export async function getAgentFromSession(cookies) {
	const id = cookies.get(SESSION_COOKIE);
	if (!id) return null;

	const [rows] = await pool.query(
		`SELECT agents.id, agents.name, agents.email
		 FROM sessions
		 JOIN agents ON agents.id = sessions.agent_id
		 WHERE sessions.id = ? AND sessions.expires_at > NOW()`,
		[id]
	);
	return rows[0] || null;
}

export async function destroySession(cookies) {
	const id = cookies.get(SESSION_COOKIE);
	if (id) {
		await pool.query('DELETE FROM sessions WHERE id = ?', [id]);
	}
	cookies.delete(SESSION_COOKIE, { path: '/' });
}

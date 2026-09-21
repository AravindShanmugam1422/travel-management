const BASE = '/api';

function headers() {
  try {
    const user = JSON.parse(localStorage.getItem('tm_current_user') || 'null');
    return user ? { 'x-user-id': String(user.id), 'x-user-role': user.role } : {};
  } catch (e) { return {}; }
}

async function handle(res) {
  let data = {};
  try { data = await res.json(); } catch (e) { /* no body */ }
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export async function apiGet(path) {
  return handle(await fetch(BASE + path, { headers: headers() }));
}
export async function apiPost(path, body) {
  return handle(await fetch(BASE + path, { method: 'POST', headers: { 'Content-Type': 'application/json', ...headers() }, body: JSON.stringify(body) }));
}
export async function apiPut(path, body) {
  return handle(await fetch(BASE + path, { method: 'PUT', headers: { 'Content-Type': 'application/json', ...headers() }, body: JSON.stringify(body) }));
}
export async function apiDelete(path) {
  return handle(await fetch(BASE + path, { method: 'DELETE', headers: headers() }));
}

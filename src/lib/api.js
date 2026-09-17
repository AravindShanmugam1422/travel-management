const BASE = '/api';

async function handle(res) {
  let data = {};
  try { data = await res.json(); } catch (e) { /* no body */ }
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export async function apiGet(path) {
  return handle(await fetch(BASE + path));
}
export async function apiPost(path, body) {
  return handle(await fetch(BASE + path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }));
}
export async function apiPut(path, body) {
  return handle(await fetch(BASE + path, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }));
}
export async function apiDelete(path) {
  return handle(await fetch(BASE + path, { method: 'DELETE' }));
}

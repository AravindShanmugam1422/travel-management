import { writable } from 'svelte/store';
import { apiGet, apiPost } from './api.js';

function persisted(key, initial) {
  let data = initial;
  if (typeof localStorage !== 'undefined') {
    const stored = localStorage.getItem(key);
    if (stored) { try { data = JSON.parse(stored); } catch (e) { data = initial; } }
  }
  const store = writable(data);
  store.subscribe((val) => {
    if (typeof localStorage !== 'undefined') localStorage.setItem(key, JSON.stringify(val));
  });
  return store;
}

// currentUser only stores {id,name,username,role} - no password client-side
export const currentUser = persisted('tm_current_user', null);

// ---------- navigation ----------
export const currentPage = writable('dashboard');
export const pageHistory = writable([]);

// ---------- mobile sidebar ----------
export const sidebarOpen = writable(false);

export function goTo(page) {
  pageHistory.update((h) => {
    currentPage.subscribe((c) => h.push(c))();
    return h;
  });
  currentPage.set(page);
}
export function goBack() {
  pageHistory.update((h) => {
    const prev = h.pop();
    currentPage.set(prev || 'dashboard');
    return h;
  });
}
export function goHome() {
  pageHistory.set([]);
  currentPage.set('dashboard');
}

// ---------- notifications ----------
export const notifications = writable([]);

export async function loadNotifications() {
  try { notifications.set(await apiGet('/notifications')); } catch (e) { /* ignore */ }
}

export async function notify(text) {
  try {
    const created = await apiPost('/notifications', { text, time: 'Just now' });
    notifications.update((n) => [created, ...n]);
  } catch (e) {
    notifications.update((n) => [{ id: Date.now(), text, time: 'Just now' }, ...n]);
  }
}
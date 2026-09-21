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
export const darkMode = persisted('tm_dark_mode', false);

export const profile = writable(null);

const rolePermissions = {
  agent: ['dashboard', 'clients', 'bookings', 'itinerary', 'expenses', 'service-review'],
  manager: ['dashboard', 'clients', 'trips', 'itinerary', 'calendar', 'suppliers', 'bookings', 'payments', 'expenses', 'service-review'],
  head_office: ['dashboard', 'clients', 'trips', 'itinerary', 'calendar', 'suppliers', 'bookings', 'payments', 'expenses', 'service-review', 'users']
};

export function canAccess(role, page) {
  return rolePermissions[role]?.includes(page) || false;
}

export function roleLabel(role) {
  return role === 'head_office' ? 'Head Office' : role === 'manager' ? 'Manager' : 'Agent';
}

export function toggleDarkMode() {
  darkMode.update((enabled) => !enabled);
}

// ---------- navigation ----------
export const currentPage = writable('dashboard');
export const pageHistory = writable([]);

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
export const toasts = writable([]);

let nextToastId = 1;

function showToast(text) {
  const id = nextToastId++;
  toasts.update((items) => [...items, { id, text }]);
  setTimeout(() => {
    toasts.update((items) => items.filter((item) => item.id !== id));
  }, 3000);
}

export async function loadNotifications(role) {
  try { notifications.set(await apiGet('/notifications')); } catch (e) { /* ignore */ }
}

export async function notify(text) {
  showToast(text);
  try {
    const created = await apiPost('/notifications', { text, time: 'Just now', kind: 'notification' });
    notifications.update((n) => [created, ...n]);
  } catch (e) {
    notifications.update((n) => [{ id: Date.now(), text, time: 'Just now' }, ...n]);
  }
}

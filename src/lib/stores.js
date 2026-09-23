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

export const currentUser = persisted('tm_current_user', null);
export const darkMode = persisted('tm_dark_mode', false);

export const profile = writable(null);

const rolePermissions = {
  agent: ['dashboard', 'clients', 'passengers', 'trips', 'trip-map', 'bookings', 'itinerary', 'payments', 'expenses', 'service-review'],
  manager: ['dashboard', 'clients', 'passengers', 'trips', 'trip-map', 'itinerary', 'calendar', 'suppliers', 'bookings', 'payments', 'expenses', 'service-review'],
  head_office: ['dashboard', 'clients', 'passengers', 'trips', 'trip-map', 'itinerary', 'calendar', 'suppliers', 'bookings', 'payments', 'expenses', 'service-review', 'users']
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

export const currentPage = writable('dashboard');
export const pageHistory = writable([]);
export const navigationContext = writable({});

export function goTo(page, context = {}) {
  pageHistory.update((h) => {
    currentPage.subscribe((c) => h.push(c))();
    return h;
  });
  navigationContext.set(context);
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
  navigationContext.set({});
  currentPage.set('dashboard');
}

export const toasts = writable([]);

export function showToast(text, duration = 3500) {
  const id = Date.now() + Math.random();
  toasts.update((items) => [...items, { id, text }]);
  setTimeout(() => toasts.update((items) => items.filter((item) => item.id !== id)), duration);
}

export const notifications = writable([]);

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

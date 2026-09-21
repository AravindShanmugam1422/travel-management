import { writable } from 'svelte/store';
import { apiGet } from './api.js';
import { get } from 'svelte/store';
import { currentUser } from './stores.js';

export const clients = writable([]);
export const trips = writable([]);
export const bookings = writable([]);
export const suppliers = writable([]);
export const payments = writable([]);
export const expenses = writable([]);
export const itineraries = writable({});
export const reviews = writable([]);
export const agents = writable([]);

export function visibleToUser(rows, user) {
  if (!user || user.role === 'head_office' || user.role === 'manager') return rows;
  return rows.filter((row) => String(row.assignedAgentId || '') === String(user.id) || row.assignedAgentName === user.name);
}

export const destinations = [
  { name: 'Ooty', scope:'state', region:'Tamil Nadu', trips:12, img:'linear-gradient(135deg,#166534,#86efac)' },
  { name: 'Kerala', scope:'state', region:'Kerala', trips:10, img:'linear-gradient(135deg,#0f766e,#99f6e4)' },
  { name: 'Goa', scope:'state', region:'Goa', trips:9, img:'linear-gradient(135deg,#0369a1,#bae6fd)' },
  { name: 'Rajasthan', scope:'state', region:'Rajasthan', trips:8, img:'linear-gradient(135deg,#b45309,#fde68a)' },
  { name: 'Dubai', scope:'country', region:'UAE', trips:10, img:'linear-gradient(135deg,#1d4ed8,#0b2540)' },
  { name: 'Singapore', scope:'country', region:'Singapore', trips:8, img:'linear-gradient(135deg,#7c3aed,#4c1d95)' },
  { name: 'Bali', scope:'country', region:'Indonesia', trips:12, img:'linear-gradient(135deg,#0ea5a0,#0b7c72)' },
  { name: 'Paris', scope:'world', region:'France', trips:7, img:'linear-gradient(135deg,#be123c,#fecdd3)' },
  { name: 'London', scope:'world', region:'UK', trips:6, img:'linear-gradient(135deg,#334155,#cbd5e1)' },
  { name: 'New York', scope:'world', region:'USA', trips:5, img:'linear-gradient(135deg,#4338ca,#a5b4fc)' }
];

export async function loadAllData() {
  const [c, t, b, s, p, e, i, r, a] = await Promise.all([
    apiGet('/clients'), apiGet('/trips'), apiGet('/bookings'), apiGet('/suppliers'),
    apiGet('/payments'), apiGet('/expenses'), apiGet('/itineraries'), apiGet('/reviews'), apiGet('/users?agents=1')
  ]);
  const user = get(currentUser);
  agents.set(a);
  const visible = (rows) => user?.role !== 'manager' ? visibleToUser(rows, user) : rows.filter((row) => !row.assignedAgentId || a.some((agent) => String(agent.id) === String(row.assignedAgentId) && String(agent.managerId || '') === String(user.id)));
  const visibleTrips = visible(t);
  clients.set(visible(c)); trips.set(visibleTrips); bookings.set(visible(b)); suppliers.set(s);
  payments.set(p); expenses.set(e);
  itineraries.set(Object.fromEntries(Object.entries(i).filter(([tripId]) => visibleTrips.some((trip) => String(trip.id) === String(tripId)))));
  reviews.set(r);
}

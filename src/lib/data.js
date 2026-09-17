import { writable } from 'svelte/store';
import { apiGet } from './api.js';

export const clients = writable([]);
export const trips = writable([]);
export const bookings = writable([]);
export const suppliers = writable([]);
export const payments = writable([]);
export const expenses = writable([]);
export const itineraries = writable({});
export const reviews = writable([]);

export const destinations = [
  { name: 'Bali', trips: 12, img: 'linear-gradient(135deg,#0ea5a0,#0b7c72)' },
  { name: 'Dubai', trips: 10, img: 'linear-gradient(135deg,#1d4ed8,#0b2540)' },
  { name: 'Singapore', trips: 8, img: 'linear-gradient(135deg,#7c3aed,#4c1d95)' }
];

export async function loadAllData() {
  const [c, t, b, s, p, e, i, r] = await Promise.all([
    apiGet('/clients'), apiGet('/trips'), apiGet('/bookings'), apiGet('/suppliers'),
    apiGet('/payments'), apiGet('/expenses'), apiGet('/itineraries'), apiGet('/reviews')
  ]);
  clients.set(c); trips.set(t); bookings.set(b); suppliers.set(s);
  payments.set(p); expenses.set(e); itineraries.set(i); reviews.set(r);
}

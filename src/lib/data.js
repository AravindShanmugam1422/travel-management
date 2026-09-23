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


export const destinationSpots = {
  Ooty: [
    { name: 'Government Botanical Garden', wiki: 'Government Botanical Garden, Ooty', img: 'https://picsum.photos/seed/ootygarden/640/480' },
    { name: 'Ooty Lake', wiki: 'Ooty Lake', img: 'https://picsum.photos/seed/ootylake/640/480' },
    { name: 'Doddabetta Peak', wiki: 'Doddabetta', img: 'https://picsum.photos/seed/doddabetta/640/480' },
    { name: 'Rose Garden', wiki: 'Government Rose Garden, Ooty', img: 'https://picsum.photos/seed/ootyrose/640/480' },
    { name: 'Nilgiri Mountain Railway', wiki: 'Nilgiri Mountain Railway', img: 'https://picsum.photos/seed/nilgirirail/640/480' }
  ],
  Kerala: [
    { name: 'Munnar Tea Gardens', wiki: 'Munnar', img: 'https://picsum.photos/seed/munnartea/640/480' },
    { name: 'Alleppey Backwaters', wiki: 'Alappuzha', img: 'https://picsum.photos/seed/alleppey/640/480' },
    { name: 'Fort Kochi', wiki: 'Fort Kochi', img: 'https://picsum.photos/seed/fortkochi/640/480' },
    { name: 'Varkala Cliff', wiki: 'Varkala', img: 'https://picsum.photos/seed/varkala/640/480' },
    { name: 'Thekkady', wiki: 'Thekkady', img: 'https://picsum.photos/seed/thekkady/640/480' }
  ],
  Goa: [
    { name: 'Baga Beach', wiki: 'Baga, Goa', img: 'https://picsum.photos/seed/bagabeach/640/480' },
    { name: 'Basilica of Bom Jesus', wiki: 'Basilica of Bom Jesus', img: 'https://picsum.photos/seed/bomjesus/640/480' },
    { name: 'Dudhsagar Falls', wiki: 'Dudhsagar Falls', img: 'https://picsum.photos/seed/dudhsagar/640/480' },
    { name: 'Chapora Fort', wiki: 'Chapora Fort', img: 'https://picsum.photos/seed/chapora/640/480' },
    { name: 'Calangute Beach', wiki: 'Calangute', img: 'https://picsum.photos/seed/calangute/640/480' }
  ],
  Rajasthan: [
    { name: 'Hawa Mahal', wiki: 'Hawa Mahal', img: 'https://picsum.photos/seed/hawamahal/640/480' },
    { name: 'Lake Pichola, Udaipur', wiki: 'Lake Pichola', img: 'https://picsum.photos/seed/pichola/640/480' },
    { name: 'Jaisalmer Fort', wiki: 'Jaisalmer Fort', img: 'https://picsum.photos/seed/jaisalmer/640/480' },
    { name: 'Mehrangarh Fort', wiki: 'Mehrangarh', img: 'https://picsum.photos/seed/mehrangarh/640/480' },
    { name: 'Mount Abu', wiki: 'Mount Abu', img: 'https://picsum.photos/seed/mountabu/640/480' }
  ],
  Dubai: [
    { name: 'Burj Khalifa', wiki: 'Burj Khalifa', img: 'https://picsum.photos/seed/burjkhalifa/640/480' },
    { name: 'Palm Jumeirah', wiki: 'Palm Jumeirah', img: 'https://picsum.photos/seed/palmjumeirah/640/480' },
    { name: 'Dubai Marina', wiki: 'Dubai Marina', img: 'https://picsum.photos/seed/dubaimarina/640/480' },
    { name: 'Burj Al Arab', wiki: 'Burj Al Arab', img: 'https://picsum.photos/seed/burjalarab/640/480' },
    { name: 'Desert Safari', wiki: 'Desert safari', img: 'https://picsum.photos/seed/desertsafari/640/480' }
  ],
  Singapore: [
    { name: 'Gardens by the Bay', wiki: 'Gardens by the Bay', img: 'https://picsum.photos/seed/gardensbay/640/480' },
    { name: 'Marina Bay Sands', wiki: 'Marina Bay Sands', img: 'https://picsum.photos/seed/marinabay/640/480' },
    { name: 'Merlion Park', wiki: 'Merlion', img: 'https://picsum.photos/seed/merlion/640/480' },
    { name: 'Universal Studios', wiki: 'Universal Studios Singapore', img: 'https://picsum.photos/seed/universalsg/640/480' },
    { name: 'Sentosa Island', wiki: 'Sentosa', img: 'https://picsum.photos/seed/sentosa/640/480' }
  ],
  Bali: [
    { name: 'Tanah Lot Temple', wiki: 'Tanah Lot', img: 'https://picsum.photos/seed/tanahlot/640/480' },
    { name: 'Uluwatu Temple', wiki: 'Uluwatu Temple', img: 'https://picsum.photos/seed/uluwatu/640/480' },
    { name: 'Tegallalang Rice Terrace', wiki: 'Tegallalang', img: 'https://picsum.photos/seed/tegallalang/640/480' },
    { name: 'Mount Batur', wiki: 'Mount Batur', img: 'https://picsum.photos/seed/mountbatur/640/480' },
    { name: 'Ubud Monkey Forest', wiki: 'Sacred Monkey Forest Sanctuary', img: 'https://picsum.photos/seed/ubudmonkey/640/480' }
  ],
  Paris: [
    { name: 'Eiffel Tower', wiki: 'Eiffel Tower', img: 'https://picsum.photos/seed/eiffel/640/480' },
    { name: 'Louvre Museum', wiki: 'Louvre', img: 'https://picsum.photos/seed/louvre/640/480' },
    { name: 'Notre-Dame Cathedral', wiki: 'Notre-Dame de Paris', img: 'https://picsum.photos/seed/notredame/640/480' },
    { name: 'Arc de Triomphe', wiki: 'Arc de Triomphe', img: 'https://picsum.photos/seed/arcdetriomphe/640/480' },
    { name: 'Sacré-Cœur', wiki: 'Sacré-Cœur de Montmartre', img: 'https://picsum.photos/seed/sacrecoeur/640/480' }
  ],
  London: [
    { name: 'Big Ben', wiki: 'Big Ben', img: 'https://picsum.photos/seed/bigben/640/480' },
    { name: 'London Eye', wiki: 'London Eye', img: 'https://picsum.photos/seed/londoneye/640/480' },
    { name: 'Tower Bridge', wiki: 'Tower Bridge', img: 'https://picsum.photos/seed/towerbridge/640/480' },
    { name: 'Buckingham Palace', wiki: 'Buckingham Palace', img: 'https://picsum.photos/seed/buckingham/640/480' },
    { name: 'Hyde Park', wiki: 'Hyde Park, London', img: 'https://picsum.photos/seed/hydepark/640/480' }
  ],
  'New York': [
    { name: 'Statue of Liberty', wiki: 'Statue of Liberty', img: 'https://picsum.photos/seed/liberty/640/480' },
    { name: 'Times Square', wiki: 'Times Square', img: 'https://picsum.photos/seed/timessquare/640/480' },
    { name: 'Central Park', wiki: 'Central Park', img: 'https://picsum.photos/seed/centralpark/640/480' },
    { name: 'Brooklyn Bridge', wiki: 'Brooklyn Bridge', img: 'https://picsum.photos/seed/brooklynbridge/640/480' },
    { name: 'Empire State Building', wiki: 'Empire State Building', img: 'https://picsum.photos/seed/empirestate/640/480' }
  ]
};

export async function loadAllData() {
  const [c, t, b, s, p, e, i, r, agentResponse] = await Promise.all([
    apiGet('/clients'), apiGet('/trips'), apiGet('/bookings'), apiGet('/suppliers'),
    apiGet('/payments'), apiGet('/expenses'), apiGet('/itineraries'), apiGet('/reviews'), apiGet('/users?agents=1')
  ]);
  const user = get(currentUser);
  const a = Array.isArray(agentResponse) ? agentResponse : [];
  agents.set(a);
  const visible = (rows) => user?.role !== 'manager' ? visibleToUser(rows, user) : rows.filter((row) => !row.assignedAgentId || a.some((agent) => String(agent.id) === String(row.assignedAgentId) && String(agent.managerId || '') === String(user.id)));
  const visibleTrips = visible(t);
  clients.set(visible(c)); trips.set(visibleTrips); bookings.set(visible(b)); suppliers.set(s);
  payments.set(p); expenses.set(e);
  itineraries.set(Object.fromEntries(Object.entries(i).filter(([tripId]) => visibleTrips.some((trip) => String(trip.id) === String(tripId)))));
  reviews.set(r);
}

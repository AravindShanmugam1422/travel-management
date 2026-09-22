<script>
  import { trips, itineraries } from '../data.js';
  import { goBack, goTo } from '../stores.js';
  import { statusClass } from '../badge.js';

  function routeUrl(trip) { return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(trip.destination || trip.name)}`; }
  function dayItems(trip) { return $itineraries[trip.id]?.days?.flatMap((day) => day.items.map((item) => ({ ...item, day: day.label }))) || []; }
</script>

<div class="page">
  <div class="crumbs"><button on:click={goBack}>← Back</button><span>/</span><button on:click={() => goTo('dashboard')}>Home</button></div>
  <div class="page-header"><div><h1 class="page-title">Trip Map</h1><div class="page-sub">Complete trip flow from departure to return for every trip</div></div></div>

  <div class="map-note card">Each route shows the planned journey: start date → destination and itinerary activities → end date. Add itinerary days to make the route more detailed.</div>
  <div class="trip-grid">
    {#each $trips as trip}
      <article class="card trip-route">
        <div class="route-head"><div><h2>{trip.name}</h2><span class="badge {statusClass(trip.status)}">{trip.status}</span></div><a class="btn btn-outline" href={routeUrl(trip)} target="_blank" rel="noreferrer">Open map ↗</a></div>
        <div class="flow">
          <div class="stop"><span class="marker start">1</span><div><small>START</small><b>{trip.startDate || 'Start date not set'}</b><p>Trip departure</p></div></div>
          <div class="line"></div>
          <div class="stop"><span class="marker destination">2</span><div><small>DESTINATION</small><b>{trip.destination || 'Destination not set'}</b><p>{trip.name}</p></div></div>
          {#each dayItems(trip) as item, index}<div class="line"></div><div class="stop"><span class="marker activity">{index + 3}</span><div><small>{item.day}{item.time ? ` · ${item.time}` : ''}</small><b>{item.text}</b><p>Itinerary activity</p></div></div>{/each}
          <div class="line"></div><div class="stop"><span class="marker end">✓</span><div><small>END</small><b>{trip.endDate || 'End date not set'}</b><p>Return / trip completion</p></div></div>
        </div>
        <div class="route-actions"><button class="btn btn-outline" on:click={() => goTo('trips', { viewTripId: trip.id })}>Trip details</button><button class="btn btn-primary" on:click={() => goTo('itinerary', { tripId: trip.id })}>Manage itinerary</button></div>
      </article>
    {:else}<div class="card empty-state">No trips available to map yet.</div>{/each}
  </div>
</div>

<style>
.map-note{margin-bottom:18px;background:linear-gradient(120deg,#ecfeff,#f0fdf4);color:var(--teal-dark);font-size:13px;}.trip-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(360px,1fr));gap:18px;}.route-head{display:flex;justify-content:space-between;gap:10px;align-items:flex-start;}.route-head h2{font-size:17px;margin:0 0 7px;}.flow{margin:22px 0 15px;}.stop{display:flex;gap:11px;align-items:flex-start;}.marker{width:28px;height:28px;flex:0 0 28px;border-radius:50%;display:grid;place-items:center;color:#fff;font-size:12px;font-weight:800;}.start{background:#2563eb;}.destination{background:#0d9488;}.activity{background:#7c3aed;}.end{background:#16a34a;}.line{width:2px;height:18px;background:var(--border);margin:0 0 0 13px;}.stop small{display:block;color:var(--text-dim);font-size:10px;font-weight:800;}.stop b{font-size:13px;display:block;margin-top:2px;}.stop p{font-size:11px;margin:2px 0 0;color:var(--text-dim);}.route-actions{display:flex;justify-content:flex-end;gap:8px;border-top:1px solid var(--border);padding-top:14px;}@media(max-width:640px){.trip-grid{grid-template-columns:1fr;}.route-head{flex-direction:column;}}
</style>

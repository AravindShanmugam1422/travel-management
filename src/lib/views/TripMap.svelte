<script>
  import { trips, itineraries } from '../data.js';
  import { goBack, goTo } from '../stores.js';
  import { statusClass } from '../badge.js';
  import { apiPut } from '../api.js';
  import Modal from '../Modal.svelte';

  let activeItem = null;
  let activeTripId = null;
  let saving = false;

  function routeUrl(trip) { return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(trip.destination || trip.name)}`; }

  $: itemsByTrip = Object.fromEntries(
    $trips.map((trip) => [
      trip.id,
      $itineraries[trip.id]?.days?.flatMap((day) => day.items.map((item) => ({ ...item, day: day.label }))) || []
    ])
  );
  $: pendingByTrip = Object.fromEntries($trips.map((trip) => [trip.id, (itemsByTrip[trip.id] || []).some((item) => item.status === 'Pending')]));

  let copiedTripId = null;
  async function copyShareLink(trip) {
    const url = `${window.location.origin}/trip-summary/${trip.id}`;
    try {
      await navigator.clipboard.writeText(url);
      copiedTripId = trip.id;
      setTimeout(() => { if (copiedTripId === trip.id) copiedTripId = null; }, 2000);
    } catch (e) {
      prompt('Copy this link:', url);
    }
  }

  function openStatusPicker(trip, item) {
    activeTripId = trip.id;
    activeItem = item;
  }

  function closeStatusPicker() {
    activeItem = null;
    activeTripId = null;
  }

  async function setStatus(status) {
    if (!activeItem || saving) return;
    saving = true;
    const itemId = activeItem.id;
    const tripId = activeTripId;
    try {
      await apiPut(`/itinerary-items/${itemId}`, { status });
      itineraries.update((all) => {
        const trip = all[tripId];
        if (!trip) return all;
        trip.days = trip.days.map((day) => ({
          ...day,
          items: day.items.map((it) => (it.id === itemId ? { ...it, status } : it))
        }));
        return { ...all };
      });
      closeStatusPicker();
    } catch (e) {
      alert(e.message);
    } finally {
      saving = false;
    }
  }
</script>

<div class="page">
  <div class="crumbs"><button on:click={goBack}>← Back</button><span>/</span><button on:click={() => goTo('dashboard')}>Home</button></div>
  <div class="page-header"><div><h1 class="page-title">Trip Map</h1><div class="page-sub">Complete trip flow from departure to return for every trip</div></div></div>

  <div class="map-note card">Each route shows the planned journey: start date → destination and itinerary activities → end date. Click an activity to mark it Confirmed or Pending.</div>
  <div class="trip-grid">
    {#each $trips as trip}
      <article class="card trip-route">
        <div class="route-head"><div><h2>{trip.name}</h2>{#if pendingByTrip[trip.id]}<span class="badge badge-amber">⏳ Pending</span>{:else}<span class="badge {statusClass(trip.status)}">{trip.status}</span>{/if}</div><div class="route-head-actions"><button class="btn btn-outline" on:click={() => copyShareLink(trip)}>{copiedTripId === trip.id ? '✓ Copied' : '🔗 Copy'}</button><a class="btn btn-outline" href={routeUrl(trip)} target="_blank" rel="noreferrer">Open map ↗</a></div></div>
        <div class="flow">
          <div class="stop"><span class="marker start">1</span><div><small>START</small><b>{trip.startDate || 'Start date not set'}</b><p>Trip departure</p></div></div>
          <div class="line"></div>
          <div class="stop"><span class="marker destination">2</span><div><small>DESTINATION</small><b>{trip.destination || 'Destination not set'}</b><p>{trip.name}</p></div></div>
          {#each itemsByTrip[trip.id] || [] as item, index}
            <div class="line"></div>
            <button type="button" class="stop stop-clickable" on:click={() => openStatusPicker(trip, item)}>
              <span class="marker activity" class:pending={item.status === 'Pending'}>{index + 3}</span>
              <div>
                <small>{item.day}{item.time ? ` · ${item.time}` : ''}</small>
                <b>{item.text}</b>
                <p>
                  Itinerary activity
                  <span class="status-chip" class:pending={item.status === 'Pending'} class:confirmed={item.status !== 'Pending'}>
                    {item.status === 'Pending' ? '⏳ Pending' : '✅ Confirmed'}
                  </span>
                </p>
              </div>
            </button>
          {/each}
          <div class="line"></div><div class="stop"><span class="marker end">✓</span><div><small>END</small><b>{trip.endDate || 'End date not set'}</b><p>Return / trip completion</p></div></div>
        </div>
        {#if pendingByTrip[trip.id]}
          <div class="pending-summary">
            <b>⏳ Pending activities</b>
            <ul>
              {#each (itemsByTrip[trip.id] || []).filter((item) => item.status === 'Pending') as item}
                <li>{item.text}{item.time ? ` · ${item.time}` : ''}</li>
              {/each}
            </ul>
          </div>
        {/if}
        <div class="route-actions"><button class="btn btn-outline" on:click={() => goTo('trips', { viewTripId: trip.id })}>Trip details</button><button class="btn btn-primary" on:click={() => goTo('itinerary', { tripId: trip.id })}>Manage itinerary</button></div>
      </article>
    {:else}<div class="card empty-state">No trips available to map yet.</div>{/each}
  </div>
</div>

{#if activeItem}
  <Modal title={`Set status — ${activeItem.text}`} on:close={closeStatusPicker}>
    <p class="status-modal-sub">Choose the current status for this itinerary activity.</p>
    <div class="status-options">
      <button class="btn btn-outline status-option" class:selected={activeItem.status !== 'Pending'} disabled={saving} on:click={() => setStatus('Confirmed')}>✅ Confirmed</button>
      <button class="btn btn-outline status-option" class:selected={activeItem.status === 'Pending'} disabled={saving} on:click={() => setStatus('Pending')}>⏳ Pending</button>
    </div>
    <div class="form-actions">
      <button class="btn btn-outline" on:click={closeStatusPicker}>Close</button>
    </div>
  </Modal>
{/if}

<style>
.map-note{margin-bottom:18px;background:linear-gradient(120deg,#ecfeff,#f0fdf4);color:var(--teal-dark);font-size:13px;}
.trip-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(360px,1fr));gap:18px;align-items:start;}
.trip-route{display:flex;flex-direction:column;height:560px;}
.route-head{display:flex;justify-content:space-between;gap:10px;align-items:flex-start;}
.route-head-actions{display:flex;gap:8px;flex-wrap:wrap;}
.trip-pending-flag{margin-left:8px;}
.pending-summary{margin:0 0 14px;padding:10px 12px;background:#fef3c7;border:1px solid #fde68a;border-radius:10px;font-size:12.5px;color:#92400e;}
.pending-summary b{display:block;margin-bottom:4px;font-size:12.5px;}
.pending-summary ul{margin:0;padding-left:18px;}
.pending-summary li{margin:2px 0;}
.route-head h2{font-size:17px;margin:0 0 7px;}
.flow{margin:22px 0 15px;flex:1;overflow-y:auto;padding-right:4px;}
.stop{display:flex;gap:11px;align-items:flex-start;}
.stop-clickable{width:100%;background:none;border:none;padding:0;text-align:left;font:inherit;cursor:pointer;border-radius:8px;}
.stop-clickable:hover{background:var(--bg);}
.marker{width:28px;height:28px;flex:0 0 28px;border-radius:50%;display:grid;place-items:center;color:#fff;font-size:12px;font-weight:800;}
.start{background:#2563eb;}
.destination{background:#0d9488;}
.activity{background:#7c3aed;}
.activity.pending{background:#d97706;}
.end{background:#16a34a;}
.line{width:2px;height:18px;background:var(--border);margin:0 0 0 13px;}
.stop small{display:block;color:var(--text-dim);font-size:10px;font-weight:800;}
.stop b{font-size:13px;display:block;margin-top:2px;}
.stop p{font-size:11px;margin:2px 0 0;color:var(--text-dim);display:flex;align-items:center;gap:6px;flex-wrap:wrap;}
.status-chip{padding:2px 8px;border-radius:20px;font-size:10px;font-weight:700;}
.status-chip.confirmed{background:#dcfce7;color:#15803d;}
.status-chip.pending{background:#fef3c7;color:#b45309;}
.route-actions{display:flex;justify-content:flex-end;gap:8px;border-top:1px solid var(--border);padding-top:14px;}
.status-modal-sub{color:var(--text-dim);font-size:13px;margin:-4px 0 14px;}
.status-options{display:flex;gap:10px;margin-bottom:6px;}
.status-option{flex:1;justify-content:center;}
.status-option.selected{background:var(--teal);color:#fff;border-color:var(--teal);}
@media(max-width:640px){.trip-grid{grid-template-columns:1fr;}.route-head{flex-direction:column;}}
</style>

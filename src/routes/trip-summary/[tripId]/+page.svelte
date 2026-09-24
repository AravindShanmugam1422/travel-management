<script>
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import '../../../app.css';

  let trip = null;
  let dayItems = [];
  let loading = true;
  let notFound = false;

  $: tripId = $page.params.tripId;

  onMount(async () => {
    try {
      const [tripsRes, itinsRes] = await Promise.all([
        fetch('/api/trips').then((r) => r.json()),
        fetch('/api/itineraries').then((r) => r.json())
      ]);
      const found = (tripsRes || []).find((t) => String(t.id) === String(tripId));
      if (!found) {
        notFound = true;
      } else {
        trip = found;
        const itin = itinsRes?.[tripId];
        dayItems = itin?.days?.flatMap((day) => day.items.map((item) => ({ ...item, day: day.label }))) || [];
      }
    } catch (e) {
      notFound = true;
    } finally {
      loading = false;
    }
  });

  function routeUrl(t) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(t.destination || t.name)}`;
  }
</script>

<svelte:head>
  <title>{trip ? `${trip.name} — Trip Summary` : 'Trip Summary'}</title>
</svelte:head>

<div class="summary-shell">
  <header class="summary-header">
    <div class="brand">
      <div class="brand-icon">✈️</div>
      <div>
        <div class="brand-name">Travel Management</div>
        <div class="brand-sub">Trip Summary</div>
      </div>
    </div>
  </header>

  <div class="summary-body">
    {#if loading}
      <div class="card empty-state">Loading trip summary...</div>
    {:else if notFound}
      <div class="card empty-state">This trip summary link is invalid or the trip no longer exists.</div>
    {:else}
      <article class="card trip-route">
        <div class="route-head">
          <div>
            <h2>{trip.name}</h2>
            <span class="badge badge-{trip.status === 'Confirmed' ? 'green' : trip.status === 'Completed' ? 'blue' : trip.status === 'Cancelled' ? 'red' : 'amber'}">{trip.status}</span>
          </div>
          <a class="btn btn-outline" href={routeUrl(trip)} target="_blank" rel="noreferrer">Open map ↗</a>
        </div>
        <div class="flow">
          <div class="stop"><span class="marker start">1</span><div><small>START</small><b>{trip.startDate || 'Start date not set'}</b><p>Trip departure</p></div></div>
          <div class="line"></div>
          <div class="stop"><span class="marker destination">2</span><div><small>DESTINATION</small><b>{trip.destination || 'Destination not set'}</b><p>{trip.name}</p></div></div>
          {#each dayItems as item, index}
            <div class="line"></div>
            <div class="stop">
              <span class="marker activity" class:pending={item.status === 'Pending'}>{index + 3}</span>
              <div>
                <small>{item.day}{item.time ? ` · ${item.time}` : ''}</small>
                <b>{item.text}</b>
                <p>
                  <span class="status-chip" class:pending={item.status === 'Pending'} class:confirmed={item.status !== 'Pending'}>
                    {item.status === 'Pending' ? '⏳ Pending' : '✅ Confirmed'}
                  </span>
                </p>
              </div>
            </div>
          {/each}
          <div class="line"></div>
          <div class="stop"><span class="marker end">✓</span><div><small>END</small><b>{trip.endDate || 'End date not set'}</b><p>Return / trip completion</p></div></div>
        </div>
      </article>
    {/if}
  </div>
</div>

<style>
.summary-shell{min-height:100vh;background:var(--bg);}
.summary-header{padding:18px 24px;background:var(--navy);display:flex;align-items:center;}
.brand{display:flex;align-items:center;gap:10px;}
.brand-icon{width:34px;height:34px;background:var(--teal);border-radius:9px;display:flex;align-items:center;justify-content:center;font-size:16px;}
.brand-name{font-weight:700;font-size:15px;color:#fff;}
.brand-sub{font-size:11px;color:#94a3b8;}
.summary-body{max-width:600px;margin:0 auto;padding:24px 16px;}
.route-head{display:flex;justify-content:space-between;gap:10px;align-items:flex-start;}
.route-head h2{font-size:19px;margin:0 0 7px;}
.flow{margin:22px 0 6px;}
.stop{display:flex;gap:11px;align-items:flex-start;}
.marker{width:28px;height:28px;flex:0 0 28px;border-radius:50%;display:grid;place-items:center;color:#fff;font-size:12px;font-weight:800;}
.start{background:#2563eb;}
.destination{background:#0d9488;}
.activity{background:#7c3aed;}
.activity.pending{background:#d97706;}
.end{background:#16a34a;}
.line{width:2px;height:18px;background:var(--border);margin:0 0 0 13px;}
.stop small{display:block;color:var(--text-dim);font-size:10px;font-weight:800;}
.stop b{font-size:13px;display:block;margin-top:2px;}
.stop p{font-size:11px;margin:2px 0 0;color:var(--text-dim);}
.status-chip{padding:2px 8px;border-radius:20px;font-size:10px;font-weight:700;}
.status-chip.confirmed{background:#dcfce7;color:#15803d;}
.status-chip.pending{background:#fef3c7;color:#b45309;}
</style>

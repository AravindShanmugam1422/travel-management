<script>
  import { trips, itineraries } from '../data.js';
  import { goBack, goTo, notify } from '../stores.js';
  import { apiPost, apiDelete } from '../api.js';
  import { printPdf } from '../export.js';

  let selectedTrip = $trips[0]?.id || '';
  let showAddDay = false;
  let dayLabel = '';
  let showAddItem = null; // day index
  let itemTime = '', itemText = '';

  $: itin = $itineraries[selectedTrip];

  async function createItinerary() {
    const tripName = $trips.find(t=>t.id===selectedTrip)?.name || '';
    try {
      await apiPost('/itineraries', { tripId: selectedTrip, tripName });
      itineraries.update((all) => ({ ...all, [selectedTrip]: { tripName, days: [] } }));
      notify('New itinerary created');
    } catch (e) { alert(e.message); }
  }

  async function addDay() {
    if (!dayLabel) return;
    try {
      const created = await apiPost(`/itineraries/${selectedTrip}/days`, { label: dayLabel });
      itineraries.update((all) => {
        const cur = all[selectedTrip];
        cur.days = [...cur.days, created];
        return { ...all, [selectedTrip]: cur };
      });
      dayLabel = '';
      showAddDay = false;
    } catch (e) { alert(e.message); }
  }

  async function addItem(dayIdx) {
    if (!itemText) return;
    const day = itin.days[dayIdx];
    try {
      const created = await apiPost(`/itineraries/${selectedTrip}/days/${day.id}/items`, { time: itemTime, text: itemText });
      itineraries.update((all) => {
        const cur = { ...all[selectedTrip] };
        cur.days = cur.days.map((d, i) => i === dayIdx ? { ...d, items: [...d.items, created] } : d);
        return { ...all, [selectedTrip]: cur };
      });
      itemTime = ''; itemText = ''; showAddItem = null;
    } catch (e) { alert(e.message); }
  }

  async function deleteDay(idx) {
    const day = itin.days[idx];
    try {
      await apiDelete(`/itineraries/${selectedTrip}/days/${day.id}`);
      itineraries.update((all) => {
        const cur = { ...all[selectedTrip] };
        cur.days = cur.days.filter((_, i) => i !== idx);
        return { ...all, [selectedTrip]: cur };
      });
    } catch (e) { alert(e.message); }
  }
</script>

<div class="page">
  <div class="crumbs"><button on:click={goBack}>← Back</button><span>/</span><button on:click={() => goTo('dashboard')}>Home</button></div>
  <div class="page-header">
    <div><h1 class="page-title">Itinerary</h1><div class="page-sub">Create and manage day-by-day itineraries for a trip</div></div>
  </div>

  <div class="card" style="margin-bottom:18px;">
    <div class="form-row" style="max-width:340px;margin-bottom:0;">
      <label>Select Trip</label>
      <select bind:value={selectedTrip}>
        {#each $trips as t}<option value={t.id}>{t.id} - {t.name}</option>{/each}
      </select>
    </div>
  </div>

  {#if !itin}
    <div class="card empty-state">
      No itinerary yet for this trip.
      <div style="margin-top:14px;"><button class="btn btn-primary" on:click={createItinerary}>+ Create Itinerary</button></div>
    </div>
  {:else}
    <div class="card">
      <div class="card-head">
        <h3 style="margin:0;">{itin.tripName} &mdash; Itinerary</h3>
        <div class="header-actions"><button class="btn btn-outline" on:click={() => printPdf(`${itin.tripName} Itinerary`)}>🖨 PDF</button><button class="btn btn-primary" on:click={() => (showAddDay = true)}>+ New Day</button></div>
      </div>

      {#if showAddDay}
        <div class="add-day-row">
          <input placeholder="e.g. Day 3 - 27 Sep 2026 (Mon)" bind:value={dayLabel} />
          <button class="btn btn-primary" on:click={addDay}>Add</button>
          <button class="btn btn-outline" on:click={() => (showAddDay=false)}>Cancel</button>
        </div>
      {/if}

      {#each itin.days as day, idx}
        <div class="day-block">
          <div class="day-head">
            <b>{day.label}</b>
            <div>
              <button class="btn-icon" on:click={() => (showAddItem = showAddItem===idx ? null : idx)}>+ Item</button>
              <button class="btn-icon" on:click={() => deleteDay(idx)}>🗑️</button>
            </div>
          </div>
          {#each day.items as item}
            <div class="item-row"><span class="item-time">{item.time}</span><span>{item.text}</span></div>
          {:else}
            <div class="item-row empty">No items yet.</div>
          {/each}
          {#if showAddItem === idx}
            <div class="add-item-row">
              <input placeholder="Time e.g. 10:00 AM" bind:value={itemTime} style="max-width:130px;" />
              <input placeholder="Activity" bind:value={itemText} />
              <button class="btn btn-primary" on:click={() => addItem(idx)}>Add</button>
            </div>
          {/if}
        </div>
      {:else}
        <div class="empty-state">No days added yet. Click "New Day" to start.</div>
      {/each}
    </div>
  {/if}
</div>

<style>
.card-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;}
.add-day-row{display:flex;gap:8px;margin-bottom:16px;}
.add-day-row input{flex:1;padding:9px 12px;border:1px solid var(--border);border-radius:8px;}
.day-block{border-left:3px solid var(--teal);padding:12px 16px;margin-bottom:14px;background:#f8fafc;border-radius:0 10px 10px 0;}
.day-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;font-size:14.5px;}
.item-row{display:flex;gap:12px;font-size:13.5px;padding:6px 0;color:var(--text);}
.item-row.empty{color:var(--text-dim);}
.item-time{min-width:80px;font-weight:600;color:var(--teal-dark);}
.add-item-row{display:flex;gap:8px;margin-top:8px;}
.add-item-row input{padding:8px 10px;border:1px solid var(--border);border-radius:7px;flex:1;}
</style>

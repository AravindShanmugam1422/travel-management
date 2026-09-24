<script>
  import { onMount } from 'svelte';
  import { clients, trips, bookings, expenses, destinations, destinationSpots, agents, itineraries } from '../data.js';
  import { notifications, currentUser, goTo } from '../stores.js';
  import StatCard from '../StatCard.svelte';
  import Modal from '../Modal.svelte';
  import Donut from '../Donut.svelte';
  import { statusClass } from '../badge.js';

  let currentHour = new Date().getHours();
  let placeScope = 'state';
  let galleryPlace = null;
  let spotImages = {};
  let loadedSpots = {};

  // Offline-safe placeholder so a tile is never left blank.
  function spotPlaceholder(name) {
    const label = String(name).replace(/[<>&"']/g, '');
    const svg =
      `<svg xmlns='http://www.w3.org/2000/svg' width='640' height='480' viewBox='0 0 640 480'>` +
      `<defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='#0f766e'/><stop offset='1' stop-color='#5eead4'/></linearGradient></defs>` +
      `<rect width='640' height='480' fill='url(#g)'/>` +
      `<text x='320' y='225' font-size='64' text-anchor='middle'>📍</text>` +
      `<text x='320' y='305' font-family='Segoe UI, Arial, sans-serif' font-size='32' font-weight='700' fill='#ffffff' text-anchor='middle'>${label}</text>` +
      `</svg>`;
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  }

  // Fallback chain: wiki photo -> picsum image -> inline SVG (never a blank tile).
  function handleSpotError(spot, event) {
    const img = event.currentTarget;
    const current = spotImages[spot.name] || spot.img;
    loadedSpots = { ...loadedSpots, [spot.name]: false };
    if (current !== spot.img) {
      spotImages = { ...spotImages, [spot.name]: spot.img };
    } else if (!img.src.startsWith('data:')) {
      spotImages = { ...spotImages, [spot.name]: spotPlaceholder(spot.name) };
    }
  }

  async function loadSpotImages(place) {
    const spots = destinationSpots[place.name] || [];
    loadedSpots = {};
    spotImages = Object.fromEntries(spots.map((spot) => [spot.name, spot.img]));
    spots.forEach(async (spot) => {
      try {
        const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(spot.wiki)}`);
        if (!res.ok) return;
        const data = await res.json();
        const thumb = data.thumbnail?.source;
        const url = thumb ? thumb.replace(/\/\d+px-/, '/800px-') : data.originalimage?.source;
        if (url && galleryPlace?.name === place.name) {
          spotImages = { ...spotImages, [spot.name]: url };
        }
      } catch (e) {
        /* keep fallback image */
      }
    });
  }

  function openGallery(destination) {
    galleryPlace = destination;
    loadedSpots = {};
    loadSpotImages(destination);
  }

  $: galleryMapsUrl = galleryPlace
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(galleryPlace.name + ', ' + galleryPlace.region)}`
    : '';

  onMount(() => {
    const clock = setInterval(() => {
      currentHour = new Date().getHours();
    }, 60000);

    return () => clearInterval(clock);
  });

  $: greeting = currentHour < 12 ? 'Good Morning' : currentHour < 18 ? 'Good Afternoon' : 'Good Evening';
  $: roleTitle = $currentUser?.role === 'head_office' ? 'Admin' : $currentUser?.role === 'manager' ? 'Manager' : 'Agent';
  $: greetingName = $currentUser ? `${roleTitle} Mr ${$currentUser.name}` : '';

  $: totalRevenue = $bookings.reduce((s, b) => s + Number(b.amount || 0), 0);
  $: confirmedBookings = $bookings.filter((b) => b.status === 'Confirmed' || b.status === 'Paid').length;
  $: pendingPaymentAmount = $bookings
    .filter((b) => b.status === 'Pending Payment' || b.status === 'Partial')
    .reduce((s, b) => s + Number(b.amount || 0), 0);
  $: upcomingBookings = $bookings.filter((b) => b.travelDate && new Date(b.travelDate) >= new Date()).length;
  $: completionRate = $bookings.length ? Math.round((confirmedBookings / $bookings.length) * 100) : 0;
  $: completedTripNames = new Set($trips.filter((trip) => trip.status === 'Completed').map((trip) => trip.name));
  $: completedRevenue = $bookings
    .filter((booking) => completedTripNames.has(booking.tripName))
    .reduce((sum, booking) => sum + Number(booking.amount || 0), 0);
  $: commissionRate = 0.05;
  $: completedCommission = completedRevenue * commissionRate;
  $: isAgent = $currentUser?.role === 'agent';
  $: totalExpenses = $expenses
    .filter((expense) => expense.status === 'Paid')
    .reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
  $: netRevenue = totalRevenue - totalExpenses;

  $: clientSegs = [
    { label: 'Active', value: $clients.filter(c=>c.status==='Active').length, color: '#16a34a' },
    { label: 'Inactive', value: $clients.filter(c=>c.status==='Inactive').length, color: '#d97706' },
    { label: 'New', value: $clients.filter(c=>c.type==='New').length, color: '#2563eb' },
    { label: 'VIP', value: $clients.filter(c=>c.type==='VIP').length, color: '#7c3aed' },
    { label: 'Regular', value: $clients.filter(c=>c.type==='Regular').length, color: '#94a3b8' }
  ];

  $: tripSegs = [
    { label: 'Confirmed', value: $trips.filter(t=>t.status==='Confirmed').length, color: '#16a34a' },
    { label: 'Pending', value: $trips.filter(t=>t.status==='Pending').length, color: '#d97706' },
    { label: 'Completed', value: $trips.filter(t=>t.status==='Completed').length, color: '#2563eb' },
    { label: 'Cancelled', value: $trips.filter(t=>t.status==='Cancelled').length, color: '#dc2626' }
  ];
  $: visibleDestinations = destinations.filter((destination) => destination.scope === placeScope);
  $: agentSummary = $agents.map((agent) => ({
    ...agent,
    clients: $clients.filter((item) => String(item.assignedAgentId || '') === String(agent.id)).length,
    trips: $trips.filter((item) => String(item.assignedAgentId || '') === String(agent.id)).length,
    bookings: $bookings.filter((item) => String(item.assignedAgentId || '') === String(agent.id)).length,
    itineraries: $trips.filter((item) => String(item.assignedAgentId || '') === String(agent.id) && $itineraries[item.id]).length
  }));
</script>

<div class="page dash-bg">
  <div class="hero card">
    <div>
      <h1>{greeting}, {greetingName} 👋</h1>
      <p>Here's what's happening with your travel business today.</p>
    </div>
  </div>

  <div class="places-band card">
    <div><h2>Places &amp; Plans 🌿</h2><p>Explore popular destinations and open them in Maps.</p></div>
    <select bind:value={placeScope} aria-label="Destination scope"><option value="state">State</option><option value="country">Country</option><option value="world">World</option></select>
    <div class="places-grid">
      {#each visibleDestinations as d}
        <button type="button" class="place-tile" on:click={() => openGallery(d)}>
          <span class="place-photo" style={`background:${d.img}`}></span><b>{d.name}</b><small>{d.region} · {d.trips} plans · {destinationSpots[d.name]?.length || 0} places 📷</small>
        </button>
      {/each}
    </div>
  </div>

  <div class="stat-row" style="margin-top:20px;">
    <StatCard label="Total Clients" value={$clients.length} icon="👥" color="#2563eb" bg="#dbeafe" page="clients" />
    <StatCard label="Total Trips" value={$trips.length} icon="✈️" color="#16a34a" bg="#dcfce7" page="trips" />
    <StatCard label="Total Bookings" value={$bookings.length} icon="📅" color="#7c3aed" bg="#f3e8ff" page="bookings" />
    <StatCard label="Total Revenue" value={'₹' + totalRevenue.toLocaleString('en-IN')} icon="💰" color="#d97706" bg="#fef3c7" page="payments" />
  </div>

  <div class="stat-row">
    <StatCard label="Confirmed Bookings" value={confirmedBookings} icon="✅" color="#15803d" bg="#dcfce7" page="bookings" />
    <StatCard label="Pending Payment" value={'₹' + pendingPaymentAmount.toLocaleString('en-IN')} icon="⏳" color="#b45309" bg="#fef3c7" page="payments" />
    <StatCard label="Upcoming Bookings" value={upcomingBookings} icon="🗓️" color="#1d4ed8" bg="#dbeafe" page="bookings" />
    <StatCard label="Booking Success" value={completionRate + '%'} icon="📈" color="#0f766e" bg="#ccfbf1" page="bookings" />
  </div>

  {#if isAgent}
    <div class="card agent-commission-card">
      <div>
        <div class="stat-label">My Commission</div>
        <div class="agent-commission-value">₹{Math.round(completedCommission).toLocaleString('en-IN')}</div>
        <div class="commission-note">Based on completed trips · {commissionRate * 100}% commission</div>
      </div>
      <div class="commission-icon">💰</div>
    </div>
  {/if}

  <div class="two-col" style="margin-bottom:20px;">
    <div class="card">
      <div class="card-head"><h3>Client Overview</h3><button class="link" on:click={() => goTo('clients')}>View All →</button></div>
      <Donut segments={clientSegs} centerValue={$clients.length} centerLabel="Total Clients" />
    </div>
    <div class="card">
      <div class="card-head"><h3>Trip Status</h3><button class="link" on:click={() => goTo('trips')}>View All →</button></div>
      <Donut segments={tripSegs} centerValue={$trips.length} centerLabel="Total Trips" />
    </div>
  </div>

  <div class="two-col">
    <div class="card">
      <div class="card-head"><h3>Recent Bookings</h3><button class="link" on:click={() => goTo('bookings')}>View All →</button></div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Booking ID</th><th>Client</th><th>Trip</th><th>Date</th><th>Status</th><th>Amount</th></tr></thead>
          <tbody>
            {#each $bookings.slice(0,5) as b}
              <tr>
                <td>{b.id}</td><td>{b.clientName}</td><td>{b.tripName}</td><td>{b.travelDate}</td>
                <td><span class="badge {statusClass(b.status)}">{b.status}</span></td>
                <td>₹{Number(b.amount).toLocaleString('en-IN')}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>

    <div style="display:flex;flex-direction:column;gap:20px;">
      <div class="card">
        <h3 style="margin-top:0;">Upcoming Reminders</h3>
        {#each $notifications.filter((item) => item.kind === 'reminder').slice(0,4) as n}
          <div class="reminder-item">
            <div class="reminder-dot"></div>
            <div><div>{n.text}</div><small>{n.time}</small></div>
          </div>
        {/each}
      </div>
      <div class="card">
        <h3 style="margin-top:0;">Popular Destinations</h3>
        <div class="dest-list">
          {#each destinations as d}
            <div class="dest-item">
              <div class="dest-img" style="background:{d.img};"></div>
              <div class="dest-name">{d.name}</div>
              <small>{d.trips} Trips</small>
            </div>
          {/each}
        </div>
      </div>

      {#if $currentUser && ($currentUser.role === 'manager' || $currentUser.role === 'head_office')}
        <div class="card">
          <h3 style="margin-top:0;">Business Reports</h3>
          <div class="report-row"><span>Monthly Revenue</span><b>₹{totalRevenue.toLocaleString('en-IN')}</b></div>
          <div class="report-row"><span>Paid Expenses</span><b>− ₹{totalExpenses.toLocaleString('en-IN')}</b></div>
          <div class="report-row net-row"><span>Net Revenue</span><b>₹{netRevenue.toLocaleString('en-IN')}</b></div>
          <div class="report-row"><span>Profit Margin (est.)</span><b>18%</b></div>
        </div>
        <div class="card commission-card">
          <h3 style="margin-top:0;">Completed Trip Commission</h3>
          <p class="report-help">Commission is calculated only after a trip is marked Completed.</p>
          <div class="report-row"><span>Completed Trip Revenue</span><b>₹{completedRevenue.toLocaleString('en-IN')}</b></div>
          <div class="report-row"><span>Commission Rate</span><b>{commissionRate * 100}%</b></div>
          <div class="report-row net-row"><span>Agent Commission</span><b>₹{Math.round(completedCommission).toLocaleString('en-IN')}</b></div>
        </div>
      {/if}
    </div>
  </div>

  {#if galleryPlace}
    <Modal title={`📍 ${galleryPlace.name} — Famous Tourist Places`} on:close={() => (galleryPlace = null)}>
      <p class="spot-sub">{galleryPlace.region} · top {destinationSpots[galleryPlace.name]?.length || 0} places to visit</p>
      <div class="spot-grid">
        {#each destinationSpots[galleryPlace.name] || [] as spot}
          <figure class="spot-tile">
            <div class="spot-img" class:loaded={!!loadedSpots[spot.name]} style={`background:${galleryPlace.img}`}>
              <img
                src={spotImages[spot.name] || spot.img}
                alt={spot.name}
                loading="lazy"
                on:load={() => (loadedSpots = { ...loadedSpots, [spot.name]: true })}
                on:error={(e) => handleSpotError(spot, e)}
              />
            </div>
            <figcaption>{spot.name}</figcaption>
          </figure>
        {/each}
      </div>
      <div class="form-actions">
        <a class="btn btn-outline" href={galleryMapsUrl} target="_blank" rel="noreferrer">Open in Maps ↗</a>
        <button class="btn btn-primary" on:click={() => (galleryPlace = null)}>Close</button>
      </div>
    </Modal>
  {/if}

  {#if $currentUser?.role === 'manager' || $currentUser?.role === 'head_office'}
    <div class="card agent-summary">
      <div class="card-head"><h3>Agent-wise Workspace</h3><span class="summary-note">Clients · Trips · Bookings · Itinerary</span></div>
      <div class="agent-grid">
        {#each agentSummary as agent}
          <div class="agent-panel"><div class="agent-panel-title"><span class="agent-avatar">{agent.name.charAt(0)}</span><div><b>{agent.name}</b><small>{agent.username}</small></div></div><div class="agent-metrics"><span>👥 {agent.clients} Clients</span><span>✈️ {agent.trips} Trips</span><span>📅 {agent.bookings} Bookings</span><span>🗓️ {agent.itineraries} Itinerary</span></div></div>
        {:else}<div class="empty-state compact">No agents created yet.</div>{/each}
      </div>
    </div>
  {/if}
</div>

<style>
.dash-bg{
  min-height:calc(100vh - 67px);
  background:var(--bg);
}
.hero{
  position:relative;
  min-height:130px;
  display:flex;
  align-items:center;
  padding:26px 28px;
  background:linear-gradient(120deg,var(--navy),var(--teal-dark));
  border-radius:14px;
}
.hero h1{margin:0 0 4px;font-size:22px;color:#fff;}
.hero p{margin:0;color:rgba(255,255,255,0.92);font-size:14px;}
.card-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;}
.card-head h3{margin:0;font-size:15px;}
.link{background:none;border:none;color:var(--teal);font-weight:600;font-size:12.5px;}
.reminder-item{display:flex;gap:10px;padding:9px 0;border-bottom:1px solid var(--border);font-size:13px;}
.reminder-item:last-child{border-bottom:none;}
.reminder-dot{width:8px;height:8px;border-radius:50%;background:var(--teal);margin-top:5px;flex-shrink:0;}
.reminder-item small{color:var(--text-dim);}
.dest-list{display:flex;gap:10px;}
.dest-item{flex:1;text-align:center;}
.dest-img{height:60px;border-radius:10px;margin-bottom:6px;}
.dest-name{font-size:12.5px;font-weight:700;}
.dest-item small{color:var(--text-dim);font-size:11px;}
.report-row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border);font-size:13.5px;}
.report-row:last-child{border-bottom:none;}
.net-row{color:var(--teal-dark);font-size:14px;}
.commission-card{border-color:#99f6e4;}
.report-help{color:var(--text-dim);font-size:12px;margin:-4px 0 10px;}
.agent-commission-card{display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;background:linear-gradient(120deg,#ecfdf5,#f0fdfa);border-color:#99f6e4;}
.agent-commission-value{font-size:28px;font-weight:800;color:var(--teal-dark);margin-top:4px;}
.commission-note{color:var(--text-dim);font-size:12px;margin-top:3px;}
.commission-icon{width:48px;height:48px;border-radius:14px;background:#ccfbf1;display:flex;align-items:center;justify-content:center;font-size:24px;}
.places-band{margin:20px 0;position:relative;overflow:hidden;background:linear-gradient(135deg,#f0fdf4,#ecfeff);}
.places-band h2{margin:0 0 4px;font-size:19px;}.places-band p{margin:0;color:var(--text-dim);font-size:13px;}.places-band select{position:absolute;right:20px;top:20px;padding:9px 12px;border:1px solid var(--border);border-radius:8px;background:var(--card);color:var(--text);}
.places-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:10px;margin-top:18px;}.place-tile{display:flex;flex-direction:column;gap:4px;min-width:0;padding:0;border:none;background:none;font:inherit;text-align:left;cursor:pointer;}.place-photo{height:72px;border-radius:10px;display:block;transition:transform .15s;}.place-tile:hover .place-photo{transform:scale(1.03);}.place-tile b{font-size:12px;}.place-tile small{font-size:10px;color:var(--text-dim);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.spot-sub{margin:-6px 0 12px;color:var(--text-dim);font-size:12.5px;}
.spot-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px;}
.spot-tile{margin:0;min-width:0;}
.spot-img{position:relative;height:120px;border-radius:10px;overflow:hidden;background-size:cover;background-position:center;}
.spot-img::after{content:'';position:absolute;inset:0;background:linear-gradient(100deg,rgba(255,255,255,0) 25%,rgba(255,255,255,0.45) 50%,rgba(255,255,255,0) 75%);background-size:200% 100%;animation:spot-shimmer 1.3s linear infinite;opacity:1;transition:opacity .3s ease;pointer-events:none;}
.spot-img.loaded::after{opacity:0;}
@keyframes spot-shimmer{from{background-position:150% 0;}to{background-position:-50% 0;}}
.spot-img img{width:100%;height:100%;object-fit:cover;display:block;opacity:0;transition:opacity .35s ease;}
.spot-img.loaded img{opacity:1;}
.spot-tile figcaption{font-size:12.5px;font-weight:700;margin-top:6px;}
@media (max-width:640px){.spot-grid{grid-template-columns:1fr;}}
.agent-summary{margin-top:20px;}.summary-note{font-size:11px;color:var(--text-dim);}.agent-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:12px;}.agent-panel{border:1px solid var(--border);border-radius:10px;padding:13px;background:var(--bg);}.agent-panel-title{display:flex;align-items:center;gap:9px;}.agent-panel-title small{display:block;color:var(--text-dim);font-size:11px;margin-top:2px;}.agent-avatar{width:32px;height:32px;border-radius:50%;background:var(--teal);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;}.agent-metrics{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-top:12px;color:var(--text-dim);font-size:11px;}
@media (max-width:800px){.places-grid{grid-template-columns:repeat(2,1fr);}.places-band select{position:static;margin-top:12px;}.places-grid{margin-top:14px;}}
</style>
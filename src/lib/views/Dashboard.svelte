<script>
  import { onMount } from 'svelte';
  import { clients, trips, bookings, expenses, destinations } from '../data.js';
  import { notifications, currentUser, goTo } from '../stores.js';
  import StatCard from '../StatCard.svelte';
  import Donut from '../Donut.svelte';
  import { statusClass } from '../badge.js';

  let currentHour = new Date().getHours();

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
</script>

<div class="page">
  <div class="hero card">
    <div>
      <h1>{greeting}, {greetingName} 👋</h1>
      <p>Here's what's happening with your travel business today.</p>
    </div>
  </div>

  <div class="stat-row" style="margin-top:20px;">
    <StatCard label="Total Clients" value={$clients.length} icon="👥" color="#2563eb" bg="#dbeafe" />
    <StatCard label="Total Trips" value={$trips.length} icon="✈️" color="#16a34a" bg="#dcfce7" />
    <StatCard label="Total Bookings" value={$bookings.length} icon="📅" color="#7c3aed" bg="#f3e8ff" />
    <StatCard label="Total Revenue" value={'₹' + totalRevenue.toLocaleString('en-IN')} icon="💰" color="#d97706" bg="#fef3c7" />
  </div>

  <div class="stat-row">
    <StatCard label="Confirmed Bookings" value={confirmedBookings} icon="✅" color="#15803d" bg="#dcfce7" />
    <StatCard label="Pending Payment" value={'₹' + pendingPaymentAmount.toLocaleString('en-IN')} icon="⏳" color="#b45309" bg="#fef3c7" />
    <StatCard label="Upcoming Bookings" value={upcomingBookings} icon="🗓️" color="#1d4ed8" bg="#dbeafe" />
    <StatCard label="Booking Success" value={completionRate + '%'} icon="📈" color="#0f766e" bg="#ccfbf1" />
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
        {#each $notifications.slice(0,4) as n}
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
</div>

<style>
.hero{background:linear-gradient(120deg,#e0f2fe,#f0fdfa);}
.hero h1{margin:0 0 4px;font-size:22px;}
.hero p{margin:0;color:var(--text-dim);font-size:14px;}
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
</style>

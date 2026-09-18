<script>
  import { bookings, trips } from '../data.js';
  import { goBack, goTo } from '../stores.js';

  let viewDate = new Date();

  $: monthLabel = viewDate.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
  $: calendarDays = buildCalendar(viewDate);
  $: monthEvents = [
    ...$trips.filter((trip) => trip.start_date).map((trip) => ({ date: trip.start_date, label: trip.name, kind: 'trip' })),
    ...$bookings.filter((booking) => booking.travelDate).map((booking) => ({ date: booking.travelDate, label: booking.clientName, kind: 'booking' }))
  ];

  function buildCalendar(date) {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    return [...Array(firstDay).fill(null), ...Array.from({ length: totalDays }, (_, index) => index + 1)];
  }

  function dateKey(day) {
    return `${viewDate.getFullYear()}-${String(viewDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  function eventsFor(day) {
    return monthEvents.filter((event) => String(event.date).slice(0, 10) === dateKey(day));
  }

  function changeMonth(offset) {
    viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth() + offset, 1);
  }

  function today() {
    viewDate = new Date();
  }
</script>

<div class="page">
  <div class="crumbs"><button on:click={goBack}>← Back</button><span>/</span><button on:click={() => goTo('dashboard')}>Home</button></div>
  <div class="page-header">
    <div><h1 class="page-title">Travel Calendar</h1><div class="page-sub">Trips and booking dates in one view</div></div>
    <div class="calendar-actions"><button class="btn btn-outline" on:click={today}>Today</button><button class="btn btn-outline" on:click={() => changeMonth(-1)}>←</button><button class="btn btn-outline" on:click={() => changeMonth(1)}>→</button></div>
  </div>

  <div class="card calendar-card">
    <div class="calendar-title">{monthLabel}</div>
    <div class="week-row">{#each ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'] as day}<div>{day}</div>{/each}</div>
    <div class="calendar-grid">
      {#each calendarDays as day}
        <div class:empty-day={!day} class="calendar-day">
          {#if day}
            <div class="day-number">{day}</div>
            {#each eventsFor(day).slice(0, 3) as event}
              <div class="event" class:booking-event={event.kind === 'booking'} title={event.label}>{event.kind === 'trip' ? '✈ ' : '📅 '}{event.label}</div>
            {/each}
          {/if}
        </div>
      {/each}
    </div>
    <div class="legend"><span><i class="trip-dot"></i> Trip start</span><span><i class="booking-dot"></i> Booking date</span></div>
  </div>
</div>

<style>
.calendar-actions{display:flex;gap:8px;}
.calendar-card{overflow:hidden;}
.calendar-title{font-size:18px;font-weight:700;text-align:center;margin-bottom:16px;}
.week-row,.calendar-grid{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));}
.week-row{color:var(--text-dim);font-size:12px;font-weight:700;text-align:center;margin-bottom:6px;}
.calendar-day{min-height:105px;border:1px solid var(--border);padding:8px;min-width:0;}
.empty-day{background:rgba(148,163,184,.06);}
.day-number{font-size:13px;font-weight:700;margin-bottom:6px;}
.event{background:#dbeafe;color:#1d4ed8;border-radius:5px;padding:4px 5px;font-size:11px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-bottom:4px;}
.booking-event{background:#dcfce7;color:#15803d;}
.legend{display:flex;gap:16px;margin-top:14px;color:var(--text-dim);font-size:12px;}
.legend i{display:inline-block;width:8px;height:8px;border-radius:50%;margin-right:4px;background:#2563eb;}
.legend .booking-dot{background:#16a34a;}
@media (max-width:640px){
  .calendar-day{min-height:78px;padding:5px;}
  .week-row{font-size:10px;}
  .event{font-size:9px;padding:3px;}
  .calendar-actions .btn{padding:7px 9px;}
}
</style>

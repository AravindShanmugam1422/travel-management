<script>
  import { currentPage, goTo, currentUser, sidebarOpen } from './stores.js';

  const items = [
    { key: 'dashboard', label: 'Dashboard', icon: '📊' },
    { key: 'clients', label: 'Clients', icon: '👥' },
    { key: 'trips', label: 'Trips', icon: '✈️' },
    { key: 'itinerary', label: 'Itinerary', icon: '🗓️' },
    { key: 'suppliers', label: 'Suppliers', icon: '🏢' },
    { key: 'bookings', label: 'Bookings', icon: '📅' },
    { key: 'payments', label: 'Payments', icon: '💳' },
    { key: 'expenses', label: 'Expenses', icon: '🧾' },
    { key: 'service-review', label: 'Service Review', icon: '⭐' }
  ];

  function roleLabel(r) {
    if (r === 'head_office') return 'Head Office';
    if (r === 'manager') return 'Manager';
    return 'Agent';
  }

  function select(key) {
    goTo(key);
    sidebarOpen.set(false);
  }
</script>

{#if $sidebarOpen}
  <div class="sidebar-backdrop" on:click={() => sidebarOpen.set(false)}></div>
{/if}

<aside class="sidebar" class:open={$sidebarOpen}>
  <div class="brand">
    <div class="brand-icon">✈️</div>
    <div>
      <div class="brand-name">Travel Management</div>
      <div class="brand-sub">Plan &middot; Book &middot; Explore</div>
    </div>
    <button class="sidebar-close" on:click={() => sidebarOpen.set(false)}>✕</button>
  </div>

  <nav class="nav">
    {#each items as it}
      <button
        class="nav-item"
        class:active={$currentPage === it.key}
        on:click={() => select(it.key)}
      >
        <span class="nav-icon">{it.icon}</span>
        <span>{it.label}</span>
      </button>
    {/each}
  </nav>

  {#if $currentUser}
    <div class="user-box">
      <div class="avatar">{$currentUser.name.charAt(0)}</div>
      <div>
        <div class="user-name">{$currentUser.name}</div>
        <div class="user-role">{roleLabel($currentUser.role)}</div>
      </div>
    </div>
  {/if}
</aside>

<style>
.sidebar{
  width:250px;min-width:250px;height:100vh;background:var(--navy);
  display:flex;flex-direction:column;color:#fff;position:sticky;top:0;
}
.brand{display:flex;align-items:center;gap:10px;padding:20px 18px;border-bottom:1px solid rgba(255,255,255,.08);position:relative;}
.sidebar-close{display:none;position:absolute;top:14px;right:14px;background:none;border:none;color:#fff;font-size:18px;padding:6px;}
.sidebar-backdrop{display:none;}
.brand-icon{width:34px;height:34px;background:var(--teal);border-radius:9px;display:flex;align-items:center;justify-content:center;font-size:16px;}
.brand-name{font-weight:700;font-size:15px;}
.brand-sub{font-size:11px;color:#94a3b8;}
.nav{flex:1;padding:14px 12px;display:flex;flex-direction:column;gap:3px;overflow-y:auto;}
.nav-item{
  display:flex;align-items:center;gap:11px;padding:10px 12px;border-radius:9px;
  background:transparent;border:none;color:#cbd5e1;font-size:14px;font-weight:500;text-align:left;
}
.nav-item:hover{background:rgba(255,255,255,.06);color:#fff;}
.nav-item.active{background:var(--teal);color:#fff;font-weight:700;}
.nav-icon{font-size:16px;width:20px;text-align:center;}
.user-box{display:flex;align-items:center;gap:10px;padding:14px 18px;border-top:1px solid rgba(255,255,255,.08);}
.avatar{width:34px;height:34px;border-radius:50%;background:var(--teal);display:flex;align-items:center;justify-content:center;font-weight:700;}
.user-name{font-size:13px;font-weight:600;}
.user-role{font-size:11px;color:#94a3b8;}

@media (max-width: 860px){
  .sidebar{
    position:fixed;top:0;left:0;z-index:200;
    transform:translateX(-100%);transition:transform .2s ease;
    box-shadow:0 0 30px rgba(0,0,0,.25);
  }
  .sidebar.open{transform:translateX(0);}
  .sidebar-close{display:block;}
  .sidebar-backdrop{
    display:block;position:fixed;inset:0;background:rgba(15,23,42,.45);
    z-index:190;
  }
}
</style>
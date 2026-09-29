<script>
  import { currentPage, goTo, currentUser, canAccess } from './stores.js';

  const items = [
    { key: 'dashboard', label: 'Dashboard', icon: '📊' },
    { key: 'clients', label: 'Clients', icon: '👥' },
    { key: 'passengers', label: 'Passengers', icon: '🧑‍✈️' },
    { key: 'trips', label: 'Trips', icon: '✈️' },
    { key: 'itinerary', label: 'Itinerary', icon: '🗓️' },
    { key: 'calendar', label: 'Calendar', icon: '📅' },
    { key: 'suppliers', label: 'Suppliers', icon: '🏢' },
    { key: 'bookings', label: 'Bookings', icon: '📋' },
    { key: 'payments', label: 'Payments', icon: '💳' },
    { key: 'expenses', label: 'Expenses', icon: '🧾' },
    { key: 'service-review', label: 'Service Review', icon: '⭐' },
    { key: 'trip-map', label: 'Trip Map', icon: '🗺️' },
    { key: 'users', label: 'Users', icon: '🔐' }
  ];

  function roleLabel(r) {
    if (r === 'head_office') return 'Head Office';
    if (r === 'manager') return 'Manager';
    return 'Agent';
  }
</script>

<aside class="sidebar">
  <div class="brand">
    <div class="brand-icon">✈️</div>
    <div>
      <div class="brand-name">Travel Management</div>
      <div class="brand-sub">Plan &middot; Book &middot; Explore</div>
    </div>
  </div>

  <nav class="nav">
    {#each items.filter((item) => canAccess($currentUser?.role, item.key)) as it}
      <button
        class="nav-item"
        class:active={$currentPage === it.key}
        on:click={() => goTo(it.key)}
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
  width:250px;min-width:250px;height:100vh;background:linear-gradient(180deg, var(--navy) 0%, #0a1b2e 100%);
  display:flex;flex-direction:column;color:#fff;position:sticky;top:0;
  border-right:1px solid rgba(255,255,255,0.06);
}
.brand{display:flex;align-items:center;gap:12px;padding:22px 20px;border-bottom:1px solid rgba(255,255,255,.07);}
.brand-icon{
  width:38px;height:38px;background:linear-gradient(135deg, #0d9488 0%, #0b7c72 100%);
  border-radius:11px;display:flex;align-items:center;justify-content:center;font-size:18px;
  box-shadow:0 4px 14px rgba(13, 148, 136, 0.4);
}
.brand-name{font-weight:800;font-size:15px;letter-spacing:-0.02em;}
.brand-sub{font-size:11px;color:#94a3b8;margin-top:2px;letter-spacing:0.02em;}
.nav{flex:1;padding:16px 12px;display:flex;flex-direction:column;gap:4px;overflow-y:auto;}
.nav-item{
  display:flex;align-items:center;gap:12px;padding:11px 14px;border-radius:11px;
  background:transparent;border:none;color:#cbd5e1;font-size:13.5px;font-weight:500;
  text-align:left;transition:all .18s cubic-bezier(0.16, 1, 0.3, 1);
}
.nav-item:hover{background:rgba(255,255,255,.07);color:#fff;transform:translateX(2px);}
.nav-item.active{
  background:linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
  color:#fff;font-weight:700;
  box-shadow:0 4px 16px rgba(13, 148, 136, 0.35);
}
.nav-icon{font-size:16px;width:22px;text-align:center;}
.user-box{
  display:flex;align-items:center;gap:12px;padding:16px 20px;
  border-top:1px solid rgba(255,255,255,.07);background:rgba(0,0,0,0.15);
}
.avatar{
  width:36px;height:36px;border-radius:50%;
  background:linear-gradient(135deg, #0d9488, #2563eb);
  display:flex;align-items:center;justify-content:center;
  font-weight:800;font-size:13px;border:2px solid rgba(255,255,255,0.15);
}
.user-name{font-size:13px;font-weight:700;color:#f8fafc;}
.user-role{font-size:11px;color:#94a3b8;margin-top:2px;}

@media (max-width:640px){
  .sidebar{width:64px;min-width:64px;}
  .brand{justify-content:center;padding:16px 8px;}
  .brand > div:last-child,.nav-item > span:last-child,.user-box > div:last-child{display:none;}
  .nav{padding:12px 8px;}
  .nav-item{justify-content:center;padding:11px 8px;}
  .nav-icon{width:auto;font-size:18px;}
  .user-box{justify-content:center;padding:12px 8px;}
}
</style>
<script>
  export let label = '';
  export let value = '';
  export let icon = '📊';
  export let color = '#0d9488';
  export let bg = '#ccfbf1';
  export let page = '';
  import { goTo } from './stores.js';
</script>

<button class="card stat-card" class:clickable={page} on:click={() => page && goTo(page)} aria-label={page ? `Open ${label}` : label}>
  <div class="stat-top">
    <div class="stat-icon" style="background:{bg};color:{color};">{icon}</div>
    <div class="stat-label">{label}</div>
  </div>
  <div class="stat-value">{value}</div>
</button>

<style>
.stat-card{
  width:100%;text-align:left;border:1px solid var(--border);
  border-radius:var(--radius-lg);padding:20px 22px;
  background:var(--card);box-shadow:var(--shadow-sm);
  transition:all .22s cubic-bezier(0.16, 1, 0.3, 1);
}
.clickable{cursor:pointer;}
.clickable:hover{
  transform:translateY(-3px);
  box-shadow:var(--shadow-md);
  border-color:var(--teal);
}
</style>

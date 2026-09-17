<script>
  export let label = '';
  export let value = '';
  export let icon = '📊';
  export let color = '#0d9488';
  export let bg = '#ccfbf1';
</script>

<div class="card stat-card">
  <div class="stat-top">
    <div class="stat-icon" style="background:{bg};color:{color};">{icon}</div>
    <div class="stat-label">{label}</div>
  </div>
  <div class="stat-value">{value}</div>
</div>

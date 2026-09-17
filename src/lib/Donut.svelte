<script>
  // segments: [{label, value, color}]
  export let segments = [];
  export let centerLabel = '';
  export let centerValue = '';

  $: total = segments.reduce((s, x) => s + x.value, 0) || 1;

  function buildGradient(segs) {
    let acc = 0;
    const parts = [];
    segs.forEach((s) => {
      const start = (acc / total) * 360;
      acc += s.value;
      const end = (acc / total) * 360;
      parts.push(`${s.color} ${start}deg ${end}deg`);
    });
    return `conic-gradient(${parts.join(',')})`;
  }
  $: gradient = buildGradient(segments);
</script>

<div class="donut-wrap">
  <div class="donut" style="background:{gradient};">
    <div class="donut-hole">
      <div class="donut-value">{centerValue}</div>
      <div class="donut-label">{centerLabel}</div>
    </div>
  </div>
  <div class="donut-legend">
    {#each segments as s}
      <div class="legend-item">
        <span class="legend-left"><span class="dot" style="background:{s.color};"></span>{s.label}</span>
        <span><b>{s.value}</b> &nbsp;<span style="color:var(--text-dim)">{total ? Math.round((s.value/total)*100) : 0}%</span></span>
      </div>
    {/each}
  </div>
</div>

<style>
.donut-wrap{display:flex;align-items:center;gap:22px;flex-wrap:wrap;}
.donut{width:140px;height:140px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.donut-hole{width:88px;height:88px;background:#fff;border-radius:50%;display:flex;flex-direction:column;align-items:center;justify-content:center;}
.donut-value{font-size:20px;font-weight:800;}
.donut-label{font-size:10.5px;color:var(--text-dim);text-align:center;}
.donut-legend{flex:1;min-width:160px;}
</style>

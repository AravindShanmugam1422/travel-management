export function statusClass(status) {
  const s = (status || '').toLowerCase();
  if (['active','confirmed','paid','received','completed'].includes(s)) return 'badge-green';
  if (['pending','partial','partially paid'].includes(s)) return 'badge-amber';
  if (['new'].includes(s)) return 'badge-blue';
  if (['vip'].includes(s)) return 'badge-purple';
  if (['inactive','cancelled','overdue','unpaid','pending payment','outstanding'].includes(s)) return 'badge-red';
  return 'badge-gray';
}

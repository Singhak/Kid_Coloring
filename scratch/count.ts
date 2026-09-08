import { STATIC_TEMPLATES, CATEGORIES } from '../src/constants';

const counts: Record<string, { total: number; free: number; vip: number; names: string[] }> = {};

for (const cat of CATEGORIES) {
  counts[cat.id] = { total: 0, free: 0, vip: 0, names: [] };
}

for (const t of STATIC_TEMPLATES) {
  if (!counts[t.category]) {
    counts[t.category] = { total: 0, free: 0, vip: 0, names: [] };
  }
  counts[t.category].total++;
  if (t.isVip) {
    counts[t.category].vip++;
  } else {
    counts[t.category].free++;
  }
  counts[t.category].names.push(t.name + (t.isVip ? ' [VIP]' : ''));
}

console.log(JSON.stringify(counts, null, 2));

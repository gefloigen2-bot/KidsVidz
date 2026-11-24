// Generates src/data/parsha-calendar.json: Shabbos date -> parsha name(s), diaspora schedule.
// Run: node scripts/parsha-calendar.mjs
import { HDate, Sedra } from '@hebcal/core';
import { writeFileSync } from 'node:fs';

const out = {};
const start = new Date(Date.UTC(2025, 0, 4)); // a Saturday
const end = new Date(Date.UTC(2030, 0, 1));
const sedras = {};
for (let d = new Date(start); d < end; d.setUTCDate(d.getUTCDate() + 7)) {
  const hd = new HDate(new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const yr = hd.getFullYear();
  sedras[yr] ??= new Sedra(yr, false); // false = diaspora
  const r = sedras[yr].lookup(hd);
  if (!r.chag) out[d.toISOString().slice(0, 10)] = r.parsha;
}
writeFileSync('src/data/parsha-calendar.json', JSON.stringify(out));
console.log(Object.keys(out).length, 'Shabbosim; e.g.', Object.entries(out).filter(([k]) => k >= '2026-11-14').slice(0, 4));

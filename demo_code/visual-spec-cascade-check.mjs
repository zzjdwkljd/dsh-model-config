// Verify the 2026-10-02 visual-spec override block landed last in the built artifact.
import { readFileSync } from 'node:fs';

const s = readFileSync('client.js', 'utf8');
const probes = [
  ['OLD accent-as-text rule', '.mcf-popRow[aria-current="true"]{background:var(--mcf-accent-soft);border-color:var(--mcf-tag-line);font-weight:600;color:var(--mcf-accent)}'],
  ['OLD badgeOn rule', '.mcf-badgeOn{border-color:var(--mcf-accent);color:var(--mcf-accent)}'],
  ['OLD light text #263249', '--mcf-text:#263249'],
  ['OLD warn #b18243', '--mcf-warn:#b18243'],
  ['NEW spec block header', '\u89c6\u89c9\u89c4\u8303\u843d\u5730 2026-10-02'],
  ['NEW light text #1f2b3d', '--mcf-text:#1f2b3d'],
  ['NEW warn #8a5f1f', '--mcf-warn:#8a5f1f'],
  ['NEW accent-text light', '--mcf-accent-text:#574FE8'],
  ['NEW accent-text dark', '--mcf-accent-text:#a89bff'],
  ['NEW popRow override', '.mcf-popRow[aria-current="true"]{color:var(--mcf-accent-text)}'],
  ['NEW badgeOn override', '.mcf-badgeOn{border-color:var(--mcf-accent);color:var(--mcf-accent-text)}'],
];

let ok = true;
const at = {};
for (const [label, needle] of probes) {
  const i = s.indexOf(needle);
  at[label] = i;
  console.log(String(i).padStart(8) + '  ' + label);
  if (i < 0) { console.log('         MISSING'); ok = false; }
}

// Every NEW override must sit strictly after the OLD rule it replaces.
const pairs = [
  ['NEW popRow override', 'OLD accent-as-text rule'],
  ['NEW badgeOn override', 'OLD badgeOn rule'],
  ['NEW light text #1f2b3d', 'OLD light text #263249'],
  ['NEW warn #8a5f1f', 'OLD warn #b18243'],
];
for (const [newer, older] of pairs) {
  const good = at[newer] > at[older] && at[older] >= 0;
  console.log((good ? 'PASS ' : 'FAIL ') + newer + ' after ' + older);
  if (!good) ok = false;
}

// The block must live inside the single combo statement, not create a second one.
const stmtCount = (s.match(/window\.__ModuleLoader__\.load\(/g) ?? []).length;
console.log((stmtCount === 1 ? 'PASS ' : 'FAIL ') + 'exactly one loader call (got ' + stmtCount + ')');
if (stmtCount !== 1) ok = false;

console.log(ok ? 'ALL CASCADE ORDER CHECKS PASSED' : 'CASCADE ORDER CHECKS FAILED');
process.exit(ok ? 0 : 1);

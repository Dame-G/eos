// Checks every alias in src/icons/aliases.ts against the live icon sets served by Iconify.
// Needs the network and Node 22.18+ (it loads the TypeScript table directly). Not part of CI.
//   node scripts/validate-icon-aliases.mjs
// Tabler and Heroicons component libraries use the same icon names as the Iconify `tabler` and `heroicons` sets.
import { iconifyAliases, iconifyBoldSuffix } from "../src/icons/aliases.ts";

let failed = 0;
for (const [prefix, table] of Object.entries(iconifyAliases)) {
  const wanted = new Map(Object.entries(table).map(([eos, name]) => [name, eos]));
  const names = [...wanted.keys()];
  const bold = iconifyBoldSuffix[prefix];
  if (bold) names.push(...names.map((n) => n + bold));
  const res = await fetch(`https://api.iconify.design/${prefix}.json?icons=${names.join(",")}`);
  if (!res.ok) {
    console.log(`${prefix}: request failed (${res.status})`);
    failed++;
    continue;
  }
  const data = await res.json();
  // Iconify lists the names it cannot find in `not_found`.
  const missing = (data.not_found ?? []).map((n) => (wanted.has(n) ? `${n} (for "${wanted.get(n)}")` : n));
  if (missing.length) {
    failed++;
    console.log(`${prefix}: ${missing.length} not found: ${missing.join(", ")}`);
  } else {
    console.log(`${prefix}: all ${names.length} names exist`);
  }
}
process.exit(failed ? 1 : 0);

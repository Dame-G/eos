// Checks every Iconify alias in src/icons/aliases.ts against the Iconify API, so a renamed icon upstream is caught.
// Needs the network, so pull requests do not run it: the nightly CI run does (the icon-aliases job). Run it by hand
// after changing the aliases:
//   pnpm --filter @eos-ui/vue check:icon-aliases

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
  const missing = (data.not_found ?? []).map((n) => (wanted.has(n) ? `${n} (for "${wanted.get(n)}")` : n));
  if (missing.length) {
    failed++;
    console.log(`${prefix}: ${missing.length} not found: ${missing.join(", ")}`);
  } else {
    console.log(`${prefix}: all ${names.length} names exist`);
  }
}
process.exit(failed ? 1 : 0);

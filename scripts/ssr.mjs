// Renders every exported component on the server, in plain Node, from the built package (packages/vue/dist).
// Each one must render with the plugin and without it, give the same HTML twice (stable ids), and log no Vue warning.
// Needs a build.   node scripts/ssr.mjs   (or `pnpm ssr`; `pnpm check:built` and `pnpm smoke` run it)
import { createRequire } from "node:module";
import { existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const pkg = join(root, "packages", "vue");
const entry = join(pkg, "dist", "index.js");
if (!existsSync(entry)) {
  console.error("packages/vue/dist is missing. Run `pnpm build` first.");
  process.exit(1);
}
// Vue as the package resolves it, so the components and the renderer share one copy.
const fromPkg = createRequire(join(pkg, "package.json"));
const toUrl = (p) => pathToFileURL(p).href;
const { createSSRApp, h } = await import(toUrl(fromPkg.resolve("vue")));
const { renderToString } = await import(toUrl(fromPkg.resolve("vue/server-renderer")));
const eos = await import(toUrl(entry));

const warnings = [];
const origWarn = console.warn;
console.warn = (...a) => warnings.push(a.map(String).join(" "));

const results = [];
const note = (name, ok, detail = "") => results.push({ name, ok, detail });

const items = [
  { id: "a", label: "Alpha", href: "#a" },
  { id: "b", label: "Beta", href: "#b" },
];
const options = ["Visa", "Bank"];

// Props for the components that need them. Everything else renders with none and a default slot.
const props = {
  EAvatar: { name: "Ada Lovelace", presence: "online" },
  EAvatarGroup: { items: [{ name: "Ada Lovelace" }, { name: "Alan Turing" }], label: "Team" },
  EBreadcrumb: { items: [{ label: "Home", href: "/" }, { label: "Bills" }] },
  ECalendar: { month: new Date(2026, 9, 1) },
  ECheckbox: { label: "Agree" },
  ECheckboxGroup: { label: "Days", options },
  ECodeBlock: { code: "pnpm add @eos-ui/vue", lang: "sh" },
  EColorField: { label: "Brand" },
  ECombobox: { label: "Country", options },
  ECommandPalette: { label: "Commands", items: [{ id: "a", label: "Open" }] },
  ECopyButton: { text: "copied" },
  ECurrencyField: { label: "Amount" },
  EDataGrid: { caption: "Rows", columns: [{ key: "n", label: "Name" }], rows: [{ id: 1, n: "one" }] },
  EDatePicker: { label: "Due" },
  EDefinition: { label: "Annual percentage rate" },
  EDescriptionList: { items: [{ label: "Name", text: "Ada", stamp: "New" }] },
  EDialog: { title: "Confirm", open: true },
  EDrawer: { title: "Details", open: true },
  EDisclosure: { summary: "More" },
  EExpandableRow: { title: "Row" },
  EField: { label: "Name" },
  EFieldset: { legend: "Address" },
  EHeading: { level: 2 },
  EHighlight: { text: "Pay the bill", query: "bill" },
  EIcon: { name: "lock" },
  EIconButton: { icon: "menu", label: "Menu" },
  EMenu: { items: [{ id: "a", label: "Edit" }], label: "Actions" },
  EMetric: { label: "Balance", value: "$162.40" },
  ENavList: { items, label: "Site" },
  ENotice: { title: "Saved" },
  ENumberField: { label: "Count" },
  EOtpField: { label: "Code" },
  EPageHeader: { title: "Bills" },
  EPagination: { pageCount: 5 },
  EPasswordField: { label: "Password" },
  EPhoneField: { label: "Phone" },
  EProgress: { label: "Upload", value: 40 },
  ERadioGroup: { label: "Plan", options },
  ERangePicker: { label: "Dates" },
  ESearchBar: { label: "Search" },
  ESearchResults: { items: [{ id: "a", label: "Result", href: "#a" }], label: "Results" },
  ESegmented: { options, label: "View" },
  ESelect: { label: "Pay with", options },
  ESignatureField: { label: "Signature" },
  ESignaturePad: { label: "Signature" },
  ESlider: { label: "Volume" },
  EStamp: { status: "paid" },
  EStepper: {
    steps: [
      { id: "a", label: "One" },
      { id: "b", label: "Two" },
    ],
  },
  ELinkCard: { title: "EButton", href: "#button" },
  ESwitch: { label: "Wi-Fi" },
  ETable: { caption: "Rows" },
  ETabs: {
    items: [
      { id: "a", label: "A" },
      { id: "b", label: "B" },
    ],
    label: "Sections",
  },
  ETag: { label: "New" },
  ETextField: { label: "Email", error: "Enter an email" },
  ETextarea: { label: "Notes" },
  EToast: { tone: "info", title: "Saved" },
  ETooltip: { label: "More" },
  EUpload: { label: "Files" },
  ELink: { href: "#x" },
  ESkipLink: { href: "#main" },
  EAppHeader: { brand: "eos", brandHref: "/" },
  EConfigProvider: { locale: "ar", theme: { brand: "#8a2be2" } },
  EEmptyState: { title: "Nothing here" },
};
// Components whose default slot must be markup rather than text.
const slots = {
  ETable: () => h("tbody", [h("tr", [h("td", "one")])]),
};
// A modal draws nothing on the server: it opens in the browser, after hydration.
const empty = new Set(["EDialog", "EDrawer", "ECommandPalette", "EToastProvider"]);

const components = Object.entries(eos)
  .filter(([name, value]) => /^E[A-Z]/.test(name) && value && typeof value === "object")
  .sort(([a], [b]) => a.localeCompare(b));

async function render(vnode, withPlugin, options = {}) {
  const app = createSSRApp({ render: vnode });
  if (withPlugin) app.use(eos.createEos({ locale: "fr-CA", currency: "CAD", ...options }));
  return renderToString(app);
}

note(
  "The package loads in plain Node (no CSS imports in the JavaScript)",
  typeof eos.createEos === "function",
  `${Object.keys(eos).length} exports`,
);

for (const [name, component] of components) {
  const vnode = () =>
    h(component, props[name] ?? {}, { default: slots[name] ?? (() => "Text"), trigger: () => h("button", "Open") });
  const before = warnings.length;
  try {
    const a = await render(vnode, true);
    const b = await render(vnode, true);
    const plain = await render(vnode, false);
    const ok = empty.has(name) || (a.length > 0 && a !== "<!---->");
    note(`${name} renders on the server`, ok, `${a.length} characters`);
    note(`${name} gives the same HTML twice (stable ids)`, a === b);
    note(`${name} renders without the plugin`, empty.has(name) || plain.length > 0);
  } catch (e) {
    note(`${name} renders on the server`, false, String(e?.message ?? e).split("\n")[0]);
  }
  const vue = warnings.slice(before).filter((w) => w.includes("[Vue warn]"));
  note(`${name} renders with no Vue warning`, vue.length === 0, vue[0]?.split("\n")[0]);
}
note("every exported component was rendered", components.length >= 79, `${components.length} components`);

const cal = await render(() => h(eos.ECalendar, props.ECalendar), true);
note(
  "The locale reaches the server HTML (French month name)",
  /octobre/i.test(cal),
  (cal.match(/octobre|October/i) ?? ["none"])[0],
);

const css = eos.defineTheme({ brand: "#8a2be2" }).css({ header: true });
note(
  "defineTheme().css() gives a stylesheet for <head>",
  css.includes("--e-primary") && css.includes("@layer"),
  `${css.length} characters`,
);
note("themeCss() works without a document", eos.themeCss({ brand: "#8a2be2" }).includes("--e-primary"));

const modal = await render(() => h(eos.EDialog, { open: true, title: "Confirm" }, () => "Body"), true);
note(
  "A modal dialog that starts open leaves nothing in the server HTML",
  !modal.includes("Body"),
  `${modal.length} characters`,
);

console.warn = origWarn;
const failed = results.filter((r) => !r.ok);
for (const r of process.argv.includes("--verbose") ? results : failed)
  console.log(`${r.ok ? "PASS" : "FAIL"}  ${r.name}${r.detail ? "  (" + r.detail + ")" : ""}`);
console.log(
  `server render: ${results.length - failed.length} of ${results.length} checks pass, ${components.length} components`,
);
process.exit(failed.length ? 1 : 0);

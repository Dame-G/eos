// What each component needs to render on its own: the one copy. The hydration test uses it on both sides (the server
// half in Node, test/ssr/command.ts, and the browser half, test/ssr.test.ts), and so does the server render of the
// built package (scripts/ssr.mjs). Node loads this file there with its built-in type stripping, so keep it to erasable
// TypeScript (no enums, no parameter properties) and import nothing but "vue". A component that renders with no props
// and text in its default slot needs no entry; `pnpm new:component` adds an empty one to fill in when it does.
import { h, type Component, type VNode } from "vue";

const items = [
  { id: "a", label: "Alpha", href: "#a" },
  { id: "b", label: "Beta", href: "#b" },
];
const options = ["Visa", "Bank"];

const PROPS: Record<string, Record<string, unknown>> = {
  EAvatar: { name: "Ada Lovelace", presence: "online" },
  EAvatarGroup: { items: [{ name: "Ada Lovelace" }, { name: "Alan Turing" }], label: "Team" },
  EBreadcrumb: { items: [{ label: "Home", href: "/" }, { label: "Bills" }] },
  ECalendar: { month: new Date(2026, 9, 1), modelValue: new Date(2026, 9, 22, 12) },
  ECheckbox: { label: "Agree" },
  ECheckboxGroup: { label: "Days", options },
  ECodeBlock: { code: "pnpm add @eos-ui/vue", lang: "sh" },
  EColorField: { label: "Brand" },
  ECombobox: { label: "Country", options, clearable: true },
  ECommandPalette: { items: [{ id: "a", label: "Open" }], label: "Commands" },
  ECopyButton: { text: "copied" },
  ECurrencyField: { label: "Amount" },
  EDataGrid: { caption: "Rows", columns: [{ key: "n", label: "Name" }], rows: [{ id: 1, n: "one" }] },
  EDatePicker: { label: "Due", modelValue: new Date(2026, 9, 22, 12) },
  EDefinition: { label: "Annual percentage rate" },
  EDescriptionList: { items: [{ label: "Name", text: "Ada", stamp: "New" }] },
  EDialog: { title: "Confirm", open: true },
  EDrawer: { title: "Details", open: true },
  EDisclosure: { summary: "More" },
  EEmptyState: { title: "Nothing yet" },
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
  EPagination: { pageCount: 5, modelValue: 2 },
  EPasswordField: { label: "Password" },
  EPhoneField: { label: "Phone" },
  EProgress: { label: "Upload", value: 40 },
  ERadioGroup: { label: "Plan", options },
  ERangePicker: { label: "Dates" },
  ESearchBar: { label: "Search", clearable: true },
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
  ETable: { caption: "Rows", columns: [{ key: "n", label: "Name" }], rows: [{ id: 1, n: "one" }] },
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
  EToggletip: { label: "Annual percentage rate" },
  ETooltip: { label: "More" },
  EUpload: { label: "Files" },
  ELink: { href: "#x" },
  ESkipLink: { href: "#main" },
  EAppHeader: { brand: "eos", brandHref: "/" },
  EConfigProvider: { locale: "ar", theme: { brand: "#8a2be2" } },
  // new:component adds entries above this line
};

/** Slots that differ from the default: what a component takes in place of text. */
const SLOTS: Record<string, Record<string, () => unknown>> = {
  // A table holds rows; text straight inside <table> is moved out of it by the HTML parser.
  ETable: { default: () => h("tbody", [h("tr", [h("td", "one")])]) },
  // The term is already inside the button that opens the explanation.
  EToggletip: { default: () => "The yearly cost of a loan.", trigger: () => "APR" },
  EDefinition: { default: () => "The yearly cost of a loan.", trigger: () => "APR" },
};

/** The components that open after hydration and so draw nothing on the server, left open on purpose. */
export const OPEN_AFTER_HYDRATION = new Set(["EDialog", "EDrawer", "ECommandPalette"]);

/** The exported components of a library module, by name. */
export function componentsOf(lib: Record<string, unknown>): [string, Component][] {
  return Object.entries(lib)
    .filter(([name, value]) => /^E[A-Z]/.test(name) && value && typeof value === "object")
    .sort(([a], [b]) => a.localeCompare(b)) as [string, Component][];
}

/** The floating parts, also rendered open from the start: the server draws no portal, the browser opens it after. */
const OPEN = ["ESelect", "ECombobox", "EMenu", "ETooltip", "EToggletip", "EDatePicker", "ERangePicker"];

export interface Case {
  id: string;
  name: string;
  component: Component;
  props: Record<string, unknown>;
}

/** Every exported component with its fixture, and the floating ones open as well. */
export function casesOf(lib: Record<string, unknown>): Case[] {
  const all = componentsOf(lib).map(([name, component]) => ({ id: name, name, component, props: PROPS[name] ?? {} }));
  const open = all
    .filter((c) => OPEN.includes(c.name))
    .map((c) => ({ ...c, id: `${c.name} open`, props: { ...c.props, open: true } }));
  return [...all, ...open];
}

/** The tree both sides render for one case: its props, and text in the default slot. */
export function tree({ component, name, props }: Case): () => VNode {
  const slots = () => SLOTS[name] ?? { default: () => "Text", trigger: () => h("button", { type: "button" }, "Open") };
  // Two of a kind: generated ids must come out the same on both sides, in order. The app shell is one per page.
  const copies = name === "EAppShell" ? 1 : 2;
  return () =>
    h(
      "div",
      { id: "ssr-root-child" },
      Array.from({ length: copies }, () => h(component, props, slots())),
    );
}

/** The plugin options a run uses: the default, or a right-to-left locale, which useDir reads. */
export const RUNS = {
  ltr: { locale: "en-US" },
  rtl: { locale: "ar", dir: "rtl" as const },
};
export type Run = keyof typeof RUNS;

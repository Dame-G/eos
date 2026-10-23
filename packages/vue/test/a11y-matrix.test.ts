import { afterEach, describe, expect, test } from "vitest";
import { h, type Component } from "vue";
import { cdp } from "vitest/browser";
import { render } from "vitest-browser-vue";
import { defineTheme } from "@eos-ui/tokens";
import { createEos } from "../src/plugin.js";
import EButton from "../src/components/Button/EButton.vue";
import ETextField from "../src/components/TextField/ETextField.vue";
import EField from "../src/components/Field/EField.vue";
import ESelect from "../src/components/Select/ESelect.vue";
import ECheckbox from "../src/components/Checkbox/ECheckbox.vue";
import ESwitch from "../src/components/Switch/ESwitch.vue";
import ENotice from "../src/components/Notice/ENotice.vue";
import ETabs from "../src/components/Tabs/ETabs.vue";
import ETable from "../src/components/Table/ETable.vue";
import EDialog from "../src/components/Dialog/EDialog.vue";
import EMenu from "../src/components/Menu/EMenu.vue";
import EPagination from "../src/components/Pagination/EPagination.vue";
import ECalendar from "../src/components/Calendar/ECalendar.vue";
import ETag from "../src/components/Tag/ETag.vue";
import EStamp from "../src/components/Stamp/EStamp.vue";
import EText from "../src/components/Text/EText.vue";
import EMetric from "../src/components/Metric/EMetric.vue";
import EHighlight from "../src/components/Highlight/EHighlight.vue";
import EKbd from "../src/components/Kbd/EKbd.vue";
import { expectNoViolations } from "./axe.js";
import { settled } from "./frames.js";

const themes = {
  light: () => defineTheme({ name: "light" }),
  dark: () => defineTheme({ name: "dark", surface: "#10151a" }),
  "contrast high": () => defineTheme({ name: "high", contrast: "high" }),
};
const directions = { ltr: "en-US", rtl: "ar" } as const;

const items = [
  { id: "a", label: "One" },
  { id: "b", label: "Two" },
];

interface Case {
  name: string;
  component: Component;
  props?: Record<string, unknown>;
  slots?: Record<string, (...args: never[]) => unknown>;
  /** Floating parts render in the portal, so axe looks at the whole page. */
  overlay?: () => boolean;
}

const cases: Case[] = [
  { name: "Button", component: EButton, slots: { default: () => "Save" } },
  { name: "TextField", component: ETextField, props: { label: "Name", hint: "As on your card" } },
  {
    name: "Field with an error",
    component: EField,
    props: { label: "Email", error: "Enter an email address" },
    slots: {
      default: (p: { id: string; ariaInvalid?: "true"; ariaDescribedby?: string }) =>
        h("input", {
          id: p.id,
          class: "e-input",
          "aria-invalid": p.ariaInvalid,
          "aria-describedby": p.ariaDescribedby,
        }),
    },
  },
  { name: "Checkbox", component: ECheckbox, props: { label: "Agree", modelValue: true } },
  { name: "Switch", component: ESwitch, props: { label: "Reminders", modelValue: true } },
  {
    name: "Notice",
    component: ENotice,
    props: { title: "Heads up", tone: "warning", closable: true, headingLevel: 2 },
    slots: { default: () => "Something to know." },
  },
  {
    name: "Tabs",
    component: ETabs,
    props: { items, label: "Sections" },
    slots: { "panel-a": () => "Panel A", "panel-b": () => "Panel B" },
  },
  {
    name: "Table",
    component: ETable,
    props: { caption: "Plans" },
    slots: {
      default: () => [
        h("thead", [h("tr", [h("th", { scope: "col" }, "Plan"), h("th", { scope: "col", class: "e-num" }, "Visits")])]),
        h("tbody", [h("tr", [h("th", { scope: "row" }, "Basic"), h("td", { class: "e-num" }, "4")])]),
      ],
    },
  },
  { name: "Pagination", component: EPagination, props: { modelValue: 3, pageCount: 8, "aria-label": "Results" } },
  { name: "Calendar", component: ECalendar, props: { modelValue: new Date(2026, 9, 22) } },
  {
    name: "Select open",
    component: ESelect,
    props: { label: "Pay with", options: ["Visa", "Bank", "Cash"], open: true },
    overlay: () => !!document.querySelector("[role=listbox]"),
  },
  {
    name: "Menu open",
    component: EMenu,
    props: { label: "More", items: [{ label: "Edit" }, { label: "Duplicate" }], open: true },
    overlay: () => !!document.querySelector("[role=menu]"),
  },
  {
    name: "Dialog open",
    component: EDialog,
    props: { title: "Cancel this appointment?", open: true },
    slots: { default: () => "Body text", actions: () => h(EButton, { variant: "outline" }, () => "Keep it") },
    overlay: () => !!document.querySelector(".e-dialog"),
  },
];

// Every tone of the components that colour text, so a tone that fails contrast in one theme or direction is caught.
const TONES = ["neutral", "info", "success", "warning", "danger"] as const;
cases.push(
  ...TONES.map((tone) => ({ name: `Tag ${tone}`, component: ETag, props: { label: "Urgent", tone, removable: true } })),
  ...TONES.map((tone) => ({
    name: `Stamp ${tone}`,
    component: EStamp,
    props: { label: "Review", tone, detail: "12 days" },
  })),
  { name: "Stamp final", component: EStamp, props: { label: "Paid", final: true } },
  ...TONES.map((tone) => ({
    name: `Text ${tone}`,
    component: EText,
    props: { tone },
    slots: { default: () => "Receipts are kept." },
  })),
  ...(["success", "danger", "neutral"] as const).map((tone) => ({
    name: `Metric ${tone}`,
    component: EMetric,
    props: { label: "Balance", value: 1620.4, delta: "+4.2%", trend: "up", tone, help: "Since October" },
  })),
  { name: "Highlight", component: EHighlight, slots: { default: () => "the due date" } },
  {
    name: "Highlight code",
    component: EHighlight,
    props: { code: true, swatch: "#2c95b4" },
    slots: { default: () => "#2c95b4" },
  },
  { name: "Kbd", component: EKbd, slots: { default: () => "Esc" } },
  { name: "Kbd sm", component: EKbd, props: { size: "sm" }, slots: { default: () => "/" } },
);

function setPage(theme: keyof typeof themes, dir: keyof typeof directions) {
  const root = document.documentElement;
  themes[theme]().apply(root);
  root.setAttribute("dir", dir);
  root.setAttribute("lang", directions[dir]);
  document.body.classList.add("e-root");
  document.body.style.background = "var(--e-background)";
}

async function show(c: Case, locale: string) {
  const { container } = await render(c.component, {
    props: c.props,
    slots: c.slots,
    global: { plugins: [createEos({ locale, themeTarget: null, warnOnContrast: false })] },
  });
  if (c.overlay) {
    await expect.poll(c.overlay).toBe(true);
    await settled();
  }
  return c.overlay ? document.body : container;
}

afterEach(() => {
  const root = document.documentElement;
  for (const a of ["style", "dir", "lang", "data-e-theme"]) root.removeAttribute(a);
  document.body.classList.remove("e-root");
  document.body.removeAttribute("style");
});

describe.each(Object.keys(themes) as (keyof typeof themes)[])("axe matrix: %s", (theme) => {
  describe.each(Object.keys(directions) as (keyof typeof directions)[])("%s", (dir) => {
    test.each(cases)("$name", async (c) => {
      setPage(theme, dir);
      await expectNoViolations(await show(c, directions[dir]));
    });
  });
});

const media = async (features: { name: string; value: string }[]) => {
  await cdp().send("Emulation.setEmulatedMedia", { features });
};

describe("axe under emulated media", () => {
  afterEach(() => media([]));

  const smoke = cases.filter((c) => ["Button", "TextField", "Tabs", "Dialog open"].includes(c.name));

  test.each(smoke)("forced colors: $name", async (c) => {
    await media([{ name: "forced-colors", value: "active" }]);
    expect(matchMedia("(forced-colors: active)").matches).toBe(true);
    setPage("light", "ltr");
    await expectNoViolations(await show(c, "en-US"));
  });

  test.each(smoke)("reduced motion: $name", async (c) => {
    await media([{ name: "prefers-reduced-motion", value: "reduce" }]);
    expect(matchMedia("(prefers-reduced-motion: reduce)").matches).toBe(true);
    setPage("light", "ltr");
    await expectNoViolations(await show(c, "en-US"));
  });
});

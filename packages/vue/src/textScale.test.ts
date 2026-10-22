import { describe, expect, test } from "vitest";
import type { Component } from "vue";
import { render } from "vitest-browser-vue";
import { createEos } from "./plugin.js";
import EText from "./components/Text/EText.vue";
import ENotice from "./components/Notice/ENotice.vue";
import EStamp from "./components/Stamp/EStamp.vue";
import ETabs from "./components/Tabs/ETabs.vue";
import EBreadcrumb from "./components/Breadcrumb/EBreadcrumb.vue";
import ECheckbox from "./components/Checkbox/ECheckbox.vue";

interface Case {
  name: string;
  component: Component;
  props: Record<string, unknown>;
  slots?: Record<string, string>;
  selector: string;
  /** Line height in px at the default text scale. */
  lineHeight: number;
}

const CASES: Case[] = [
  { name: "EText", component: EText, props: {}, slots: { default: "Body" }, selector: ".e-text", lineHeight: 24 },
  {
    name: "EText large",
    component: EText,
    props: { large: true },
    slots: { default: "Body" },
    selector: ".e-text",
    lineHeight: 26,
  },
  {
    name: "EText small",
    component: EText,
    props: { small: true },
    slots: { default: "Body" },
    selector: ".e-text",
    lineHeight: 20,
  },
  {
    name: "ENotice title",
    component: ENotice,
    props: { title: "Form due" },
    selector: ".e-notice-title",
    lineHeight: 24,
  },
  { name: "EStamp word", component: EStamp, props: { status: "success" }, selector: ".e-stamp-word", lineHeight: 16 },
  {
    name: "ETabs count",
    component: ETabs,
    props: { items: [{ id: "a", label: "Open", count: 3 }] },
    selector: ".e-tab-count",
    lineHeight: 20,
  },
  {
    name: "EBreadcrumb",
    component: EBreadcrumb,
    props: { items: [{ label: "Home", href: "#" }, { label: "Forms" }] },
    selector: ".e-crumbs li",
    lineHeight: 20,
  },
  {
    name: "ECheckbox label",
    component: ECheckbox,
    props: { label: "Agree" },
    selector: ".e-choice-text",
    lineHeight: 24,
  },
];

async function measure(c: Case, textScale?: number) {
  const box = document.createElement("div");
  box.className = "e-root";
  document.body.append(box);
  if (textScale) createEos({ theme: { textScale } }).theme.apply(box);
  const { container } = await render(c.component, { container: box, props: c.props, slots: c.slots } as never);
  const style = getComputedStyle(container.querySelector(c.selector)!);
  const result = { lineHeight: parseFloat(style.lineHeight), fontSize: parseFloat(style.fontSize) };
  box.remove();
  return result;
}

describe("text scale", () => {
  for (const c of CASES) {
    test(`${c.name} keeps its line height at the default scale`, async () => {
      const { lineHeight } = await measure(c);
      expect(lineHeight).toBeCloseTo(c.lineHeight, 3);
    });

    test(`${c.name} line height follows the font size at text scale 2`, async () => {
      const base = await measure(c);
      const scaled = await measure(c, 2);
      expect(scaled.fontSize).toBeCloseTo(base.fontSize * 2, 1);
      expect(scaled.lineHeight).toBeGreaterThanOrEqual(scaled.fontSize);
      expect(scaled.lineHeight / scaled.fontSize).toBeGreaterThanOrEqual(1.2);
      expect(scaled.lineHeight).toBeCloseTo(base.lineHeight * 2, 1);
    });
  }
});

// What axe cannot see: under forced colours (Windows High Contrast) a focused control still draws its ring and the
// choice controls keep an edge, since the browser drops box-shadows and backgrounds; under reduced motion nothing
// animates. The media are emulated in the real browser through the DevTools protocol.
import { afterEach, describe, expect, test } from "vitest";
import { h, type Component } from "vue";
import { cdp, userEvent } from "vitest/browser";
import { render } from "vitest-browser-vue";
import { defineTheme } from "@eos-ui/tokens";
import { createEos } from "../src/plugin.js";
import EButton from "../src/components/Button/EButton.vue";
import ETextField from "../src/components/TextField/ETextField.vue";
import ECheckbox from "../src/components/Checkbox/ECheckbox.vue";
import ESwitch from "../src/components/Switch/ESwitch.vue";
import ESegmented from "../src/components/Segmented/ESegmented.vue";
import ESlider from "../src/components/Slider/ESlider.vue";
import EDialog from "../src/components/Dialog/EDialog.vue";
import EDrawer from "../src/components/Drawer/EDrawer.vue";
import EProgress from "../src/components/Progress/EProgress.vue";
import ESkeleton from "../src/components/Skeleton/ESkeleton.vue";

const media = (features: { name: string; value: string }[]) => cdp().send("Emulation.setEmulatedMedia", { features });
const global = { plugins: [createEos({ themeTarget: null, warnOnContrast: false })] };

function themed() {
  defineTheme({ name: "light" }).apply(document.documentElement);
  document.body.classList.add("e-root");
}

afterEach(async () => {
  await media([]);
  document.documentElement.removeAttribute("style");
  document.documentElement.removeAttribute("data-e-theme");
  document.body.classList.remove("e-root");
});

interface Control {
  name: string;
  component: Component;
  props?: Record<string, unknown>;
  slots?: Record<string, () => unknown>;
  /** The element that draws the focus ring, from the focused element. */
  ring: (focused: Element) => Element;
  /** The parts that must keep a visible edge: a box, a track, a thumb. */
  edges?: (root: Element) => Element[];
}

const self = (el: Element) => el;
const next = (el: Element) => el.nextElementSibling!;

const controls: Control[] = [
  { name: "Button", component: EButton, slots: { default: () => "Save" }, ring: self },
  { name: "TextField", component: ETextField, props: { label: "Name" }, ring: self },
  {
    name: "Checkbox",
    component: ECheckbox,
    props: { label: "Agree" },
    ring: self,
    edges: (root) => [root.querySelector(".e-check")!],
  },
  {
    name: "Switch",
    component: ESwitch,
    props: { label: "Autopay" },
    ring: next,
    edges: (root) => [root.querySelector(".e-switch-track")!],
  },
  {
    name: "Segmented",
    component: ESegmented,
    props: { label: "View", options: ["Day", "Week"], modelValue: "Day" },
    ring: next,
    edges: (root) => [root.querySelector(".e-seg")!],
  },
  {
    name: "Slider",
    component: ESlider,
    props: { label: "Volume", modelValue: 40 },
    ring: self,
    edges: (root) => [root.querySelector(".e-slider-track")!, root.querySelector(".e-slider-thumb")!],
  },
];

/** The ring is visible when its outline has a style and a width. */
const ringOf = (el: Element) => {
  const css = getComputedStyle(el);
  return { style: css.outlineStyle, width: parseFloat(css.outlineWidth) };
};
/** An edge is a border on some side, or an outline. */
const hasEdge = (el: Element) => {
  const css = getComputedStyle(el);
  const sides = ["Top", "Right", "Bottom", "Left"] as const;
  const border = sides.some(
    (s) => css.getPropertyValue(`border-${s.toLowerCase()}-style`) !== "none" && parseFloat(css[`border${s}Width`]) > 0,
  );
  return border || (css.outlineStyle !== "none" && parseFloat(css.outlineWidth) > 0);
};

describe("forced colors", () => {
  test.each(controls)("$name: the focused control draws its ring", async (c) => {
    await media([{ name: "forced-colors", value: "active" }]);
    expect(matchMedia("(forced-colors: active)").matches).toBe(true);
    themed();
    await render(c.component, { props: c.props, slots: c.slots, global });
    await userEvent.tab();
    const ring = c.ring(document.activeElement!);
    const { style, width } = ringOf(ring);
    expect(style, `${c.name} outline-style`).not.toBe("none");
    expect(width, `${c.name} outline-width`).toBeGreaterThan(0);
  });

  test.each(controls.filter((c) => c.edges))("$name: keeps a visible edge", async (c) => {
    await media([{ name: "forced-colors", value: "active" }]);
    themed();
    const { container } = await render(c.component, { props: c.props, slots: c.slots, global });
    for (const el of c.edges!(container)) expect(hasEdge(el), `${c.name} ${el.className}`).toBe(true);
  });
});

/** The longest transition or animation on an element, in ms. A running animation named none does not count. */
const longest = (el: Element) => {
  const css = getComputedStyle(el);
  const ms = (list: string) =>
    list.split(",").map((t) => (t.trim().endsWith("ms") ? parseFloat(t) : parseFloat(t) * 1000));
  const animated = css.animationName.split(",").some((n) => n.trim() !== "none");
  return Math.max(...ms(css.transitionDuration), ...(animated ? ms(css.animationDuration) : [0]));
};

describe("reduced motion", () => {
  const moving: { name: string; mount: () => Promise<unknown>; parts: () => Element[] }[] = [
    {
      name: "Dialog",
      mount: () =>
        render(EDialog, { props: { title: "Confirm", open: true }, slots: { default: () => "Body" }, global }),
      parts: () => [...document.querySelectorAll(".e-dialog, .e-dialog-overlay")],
    },
    {
      name: "Drawer",
      mount: () =>
        render(EDrawer, { props: { title: "Details", open: true }, slots: { default: () => "Body" }, global }),
      parts: () => [...document.querySelectorAll(".e-drawer, .e-dialog-overlay")],
    },
    {
      name: "Progress",
      mount: () =>
        render({
          render: () => [h(EProgress, { label: "Upload", value: 40 }), h(EProgress, { label: "Waiting" })],
        }),
      parts: () => [...document.querySelectorAll(".e-progress-track, .e-progress-fill")],
    },
    {
      name: "Skeleton",
      mount: () => render(ESkeleton, { global }),
      parts: () => [...document.querySelectorAll(".e-skel, .e-skeleton")],
    },
  ];

  test.each(moving)("$name does not move", async (c) => {
    await media([{ name: "prefers-reduced-motion", value: "reduce" }]);
    expect(matchMedia("(prefers-reduced-motion: reduce)").matches).toBe(true);
    themed();
    await c.mount();
    await expect.poll(() => c.parts().length).toBeGreaterThan(0);
    for (const el of c.parts()) expect(longest(el), `${c.name} ${el.className}`).toBeLessThanOrEqual(1);
  });

  test.each(moving)("$name moves without the preference, so the check above can fail", async (c) => {
    themed();
    await c.mount();
    await expect.poll(() => c.parts().length).toBeGreaterThan(0);
    expect(Math.max(...c.parts().map(longest)), c.name).toBeGreaterThan(1);
  });
});

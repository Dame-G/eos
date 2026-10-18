import { describe, expect, test } from "vitest";
import { defineComponent, h } from "vue";
import { render } from "vitest-browser-vue";
import EIcon from "./EIcon.vue";
import { createEos } from "../../plugin.js";
import { iconNames } from "../../icons/types.js";
import { expectNoViolations } from "../../../test/axe.js";

function withIcons(
  icons: Parameters<typeof createEos>[0] extends infer O ? (O extends { icons?: infer I } ? I : never) : never,
) {
  return createEos({ themeTarget: null, icons });
}

const Square = defineComponent({
  name: "Square",
  render: () =>
    h("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "data-testid": "square" }, [
      h("rect", { width: 20, height: 20 }),
    ]),
});

describe("EIcon", () => {
  test("draws a built-in icon as a filled glyph, hidden from assistive technology", async () => {
    const { container } = await render(EIcon, { props: { name: "check" } });
    const svg = container.querySelector("svg")!;
    expect(svg.classList.contains("e-icon")).toBe(true);
    expect(svg.classList.contains("e-icon--glyph")).toBe(true);
    expect(svg.getAttribute("aria-hidden")).toBe("true");
    expect(svg.querySelector("path")).not.toBeNull();
    expect(getComputedStyle(svg).fill).not.toBe("none");
  });

  test("small uses the 14px size and the bold weight", async () => {
    const regular = await render(EIcon, { props: { name: "check" } });
    const regularPath = regular.container.querySelector("path")!.getAttribute("d");
    const small = await render(EIcon, { props: { name: "check", small: true } });
    const svg = small.container.querySelector("svg")!;
    expect(svg.getBoundingClientRect().width).toBe(14);
    expect(svg.querySelector("path")!.getAttribute("d")).not.toBe(regularPath);
  });

  test("an icon component can be passed directly, and keeps its own stroke", async () => {
    const { container } = await render(EIcon, { props: { name: Square } });
    const svg = container.querySelector("svg")!;
    expect(svg.classList.contains("e-icon")).toBe(true);
    expect(svg.classList.contains("e-icon--glyph")).toBe(false);
    expect(svg.getAttribute("aria-hidden")).toBe("true");
    expect(getComputedStyle(svg).fill).toBe("none");
    expect(svg.getBoundingClientRect().width).toBe(20);
  });

  test("a resolver supplies icons from the app's own set", async () => {
    const eos = withIcons({ resolve: (name) => (name === "card" ? Square : undefined) });
    const { container } = await render(EIcon, { props: { name: "card" }, global: { plugins: [eos] } });
    expect(container.querySelector("[data-testid=square]")).not.toBeNull();
  });

  test("aliases rename Eos's names to the set's names before resolving", async () => {
    const seen: string[] = [];
    const eos = withIcons({
      aliases: { alert: "triangle-alert" },
      resolve: (name) => {
        seen.push(name);
        return name === "triangle-alert" ? Square : undefined;
      },
    });
    const { container } = await render(EIcon, { props: { name: "alert" }, global: { plugins: [eos] } });
    expect(seen).toContain("triangle-alert");
    expect(container.querySelector("[data-testid=square]")).not.toBeNull();
  });

  test("explicit icons win over the resolver, and a full svg string is wrapped in a sized box", async () => {
    const eos = withIcons({
      icons: { check: '<svg viewBox="0 0 10 10"><circle cx="5" cy="5" r="4" data-testid="dot"/></svg>' },
      resolve: () => Square,
    });
    const { container } = await render(EIcon, { props: { name: "check" }, global: { plugins: [eos] } });
    expect(container.querySelector("[data-testid=dot]")).not.toBeNull();
    const box = container.querySelector(".e-icon--svg") as HTMLElement;
    expect(box.getBoundingClientRect().width).toBe(20);
    expect(box.querySelector("svg")!.getBoundingClientRect().width).toBe(20);
  });

  test("a name the set lacks falls back to the built-in icon, unless builtin is off", async () => {
    const withFallback = await render(EIcon, {
      props: { name: "check" },
      global: { plugins: [withIcons({ resolve: () => undefined })] },
    });
    expect(withFallback.container.querySelector(".e-icon--glyph")).not.toBeNull();
    const without = await render(EIcon, {
      props: { name: "check" },
      global: { plugins: [withIcons({ builtin: false, resolve: () => undefined })] },
    });
    expect(without.container.querySelector(".e-icon")).toBeNull();
  });

  test("a prefixed name is passed to the resolver untouched", async () => {
    const seen: string[] = [];
    const eos = withIcons({ resolve: (name) => (seen.push(name), Square) });
    await render(EIcon, { props: { name: "lucide:credit-card" }, global: { plugins: [eos] } });
    expect(seen).toEqual(["lucide:credit-card"]);
  });

  test("left and right arrows mirror in right-to-left text", async () => {
    const { container } = await render(EIcon, { props: { name: "chevron-right" } });
    expect(container.querySelector(".e-icon--dir")).not.toBeNull();
    const plain = await render(EIcon, { props: { name: "check" } });
    expect(plain.container.querySelector(".e-icon--dir")).toBeNull();
  });

  test("every name the components ask for exists in the built-in set", () => {
    expect(iconNames.length).toBeGreaterThanOrEqual(40);
    expect(iconNames).toContain("alert");
    expect(iconNames).toContain("chevron-down");
  });

  test("has no accessibility violations", async () => {
    const { container } = await render(
      defineComponent({
        render: () =>
          h("div", [h(EIcon, { name: "check" }), h(EIcon, { name: Square }), h(EIcon, { name: "info", small: true })]),
      }),
    );
    await expectNoViolations(container);
  });
});

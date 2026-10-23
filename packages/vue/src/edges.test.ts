import { afterEach, describe, expect, test, vi } from "vitest";
import { render } from "vitest-browser-vue";
import EButton from "./components/Button/EButton.vue";
import ETextField from "./components/TextField/ETextField.vue";
import ESwitch from "./components/Switch/ESwitch.vue";
import ECheckbox from "./components/Checkbox/ECheckbox.vue";
import ENotice from "./components/Notice/ENotice.vue";
import EIcon from "./components/Icon/EIcon.vue";
import { defineTheme } from "@eos-ui/tokens";

/**
 * A fill under an inset-shadow edge shows through the antialiased pixels of a rounded corner as a fringe of the fill
 * colour, outside the curve. Controls draw their edge as a border and stop the fill inside it, so the outermost pixels
 * carry the edge colour alone.
 */
function expectBorderEdge(el: Element) {
  const cs = getComputedStyle(el);
  expect(parseFloat(cs.borderTopWidth)).toBeGreaterThan(0);
  expect(cs.backgroundClip).toBe("padding-box");
  expect(cs.boxShadow.match(/inset 0px 0px 0px [1-9]/g) ?? []).toEqual([]);
}

describe("edges", () => {
  test("a button's raised edge is its own border, thicker at the bottom, with no shadow", async () => {
    const { container } = await render(EButton, { slots: { default: () => "Pay" } });
    const cs = getComputedStyle(container.querySelector(".e-btn")!);
    expect(parseFloat(cs.borderBottomWidth)).toBeGreaterThan(parseFloat(cs.borderTopWidth));
    expect(cs.boxShadow).toBe("none");
    // A solid face is the colour of its edge, so it runs under the border; an outline face stops inside it.
    expect(cs.backgroundClip).toBe("border-box");
  });

  test("an outline button stops its fill inside the border", async () => {
    const { container } = await render(EButton, { props: { variant: "outline" }, slots: { default: () => "Cancel" } });
    expectBorderEdge(container.querySelector(".e-btn")!);
  });

  test.each([
    ["a text field", () => render(ETextField, { props: { label: "Email" } }), ".e-input"],
    ["a switch", () => render(ESwitch, { props: { label: "Reminders" } }), ".e-switch-track"],
    ["a checkbox", () => render(ECheckbox, { props: { label: "Agree" } }), ".e-check"],
    [
      "a notice",
      () => render(ENotice, { props: { title: "Heads up" }, slots: { default: () => "Body" } }),
      ".e-notice",
    ],
  ])("%s draws its edge as a border with the fill stopped inside it", async (_name, mount, selector) => {
    const { container } = await mount();
    expectBorderEdge(container.querySelector(selector)!);
  });
});

/** Every rule inside an at-rule whose condition contains `condition`, flattened through layers and nesting. */
function rulesUnder(condition: string): CSSStyleRule[] {
  const out: CSSStyleRule[] = [];
  const walk = (rules: CSSRuleList, inside: boolean) => {
    for (const rule of Array.from(rules)) {
      const here = inside || (rule instanceof CSSMediaRule && rule.conditionText.includes(condition));
      if (rule instanceof CSSStyleRule && inside) out.push(rule);
      if ("cssRules" in rule) walk((rule as CSSGroupingRule).cssRules, here);
    }
  };
  for (const sheet of Array.from(document.styleSheets)) {
    try {
      walk(sheet.cssRules, false);
    } catch {
      // a cross-origin sheet cannot be read
    }
  }
  return out;
}

describe("forced colors", () => {
  test("a button, a field and a switch draw their edge in system colours", async () => {
    await render(EButton, { slots: { default: () => "Pay" } });
    await render(ETextField, { props: { label: "Email" } });
    await render(ESwitch, { props: { label: "Reminders" } });
    const rules = rulesUnder("forced-colors: active");
    const drawn = (selector: string, pattern: RegExp) =>
      rules.some((r) => r.selectorText.split(",").some((s) => s.trim() === selector) && pattern.test(r.cssText));
    expect(drawn(".e-btn", /ButtonText/i)).toBe(true);
    expect(drawn(".e-input", /ButtonText/i)).toBe(true);
    expect(drawn(".e-switch-track", /ButtonText/i)).toBe(true);
    expect(drawn(".e-btn[disabled]", /GrayText/i)).toBe(true);
  });
});

describe("scheme: auto", () => {
  afterEach(() => vi.unstubAllGlobals());

  const stub = (matching: string[]) =>
    vi.stubGlobal("matchMedia", (media: string) => ({
      media,
      matches: matching.includes(media),
      addEventListener: () => {},
      removeEventListener: () => {},
    }));

  test("apply paints the dark tokens and color-scheme only while the dark query matches", () => {
    const theme = defineTheme({ scheme: "auto" });
    const el = document.createElement("div");
    stub([]);
    theme.apply(el);
    expect(el.style.getPropertyValue("--e-surface")).toBe("#ffffff");
    expect(el.style.colorScheme).toBe("light");
    stub(["(prefers-color-scheme: dark)"]);
    theme.apply(el);
    expect(el.style.getPropertyValue("--e-surface")).toBe("#10151a");
    expect(el.style.colorScheme).toBe("dark");
    stub([]);
    theme.apply(el);
    expect(el.style.getPropertyValue("--e-surface")).toBe("#ffffff");
  });

  test("the high-contrast query wins over the standard tokens", () => {
    const theme = defineTheme({ contrast: "auto" });
    const el = document.createElement("div");
    stub(["(prefers-contrast: more)"]);
    theme.apply(el);
    expect(el.style.getPropertyValue("--e-border")).toBe(theme.tokens["ink"]);
  });
});

describe("icons follow the text scale", () => {
  test("an icon, and a small one, grow with textScale", async () => {
    const measure = async (textScale?: number) => {
      const box = document.createElement("div");
      box.className = "e-root";
      document.body.append(box);
      if (textScale) defineTheme({ textScale }).apply(box);
      const { container } = await render(EIcon, { container: box, props: { name: "check" } } as never);
      const small = await render(EIcon, { container: box, props: { name: "check", small: true } } as never);
      const sizes = [
        container.querySelector(".e-icon")!.getBoundingClientRect().width,
        small.container.querySelector(".e-icon--s")!.getBoundingClientRect().width,
      ];
      box.remove();
      return sizes;
    };
    const [base, baseSmall] = await measure();
    const [scaled, scaledSmall] = await measure(2);
    expect(base).toBe(20);
    expect(baseSmall).toBe(14);
    expect(scaled).toBe(40);
    expect(scaledSmall).toBe(28);
  });
});

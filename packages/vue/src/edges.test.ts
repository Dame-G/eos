import { afterEach, describe, expect, test, vi } from "vitest";
import { render } from "vitest-browser-vue";
import { commands, userEvent } from "vitest/browser";
import "./styles/controls/panel.css";
import EButton from "./components/Button/EButton.vue";
import ESegmented from "./components/Segmented/ESegmented.vue";
import ETabs from "./components/Tabs/ETabs.vue";
import ETooltip from "./components/Tooltip/ETooltip.vue";
import EDialog from "./components/Dialog/EDialog.vue";
import ETextField from "./components/TextField/ETextField.vue";
import ESwitch from "./components/Switch/ESwitch.vue";
import ECheckbox from "./components/Checkbox/ECheckbox.vue";
import ENotice from "./components/Notice/ENotice.vue";
import EIcon from "./components/Icon/EIcon.vue";
import EStamp from "./components/Stamp/EStamp.vue";
import EToast from "./components/Toast/EToast.vue";
import ECalendar from "./components/Calendar/ECalendar.vue";
import EPagination from "./components/Pagination/EPagination.vue";
import ETag from "./components/Tag/ETag.vue";
import EKbd from "./components/Kbd/EKbd.vue";
import EAvatar from "./components/Avatar/EAvatar.vue";
import ESlider from "./components/Slider/ESlider.vue";
import EExpandableRow from "./components/ExpandableRow/EExpandableRow.vue";
import ESurface from "./components/Surface/ESurface.vue";
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

  test("a notice, a stamp and a toast draw one tone edge: stroke-edge plus slab-bold on the inline-start side", async () => {
    const widths: number[] = [];
    for (const [mount, selector] of [
      [() => render(ENotice, { props: { title: "Heads up", tone: "warning" } }), ".e-notice"],
      [() => render(EStamp, { props: { status: "overdue" } }), ".e-stamp"],
      [() => render(EToast, { props: { title: "Saved", tone: "success" } }), ".e-toast"],
    ] as const) {
      const { container } = await mount();
      widths.push(parseFloat(getComputedStyle(container.querySelector(selector)!).borderInlineStartWidth));
    }
    const probe = document.createElement("div");
    probe.className = "e-root";
    probe.style.width = "calc(var(--e-stroke-edge) + var(--e-slab-bold))";
    document.body.append(probe);
    const expected = probe.getBoundingClientRect().width;
    probe.remove();
    expect(widths).toEqual([expected, expected, expected]);
  });

  test("the selected day stands on the standard slab: an edge on every side, the bottom one thicker by depth", async () => {
    const { container } = await render(ECalendar, { props: { modelValue: new Date(2026, 9, 22, 12) } });
    const cs = getComputedStyle(container.querySelector(".e-day--sel")!);
    const top = parseFloat(cs.borderTopWidth);
    expect(top).toBeGreaterThan(0);
    expect(cs.borderTopColor).toBe(cs.borderBottomColor);
    expect(parseFloat(cs.borderInlineStartWidth)).toBe(top);
    expect(parseFloat(cs.borderBottomWidth)).toBe(top + 2);
  });
});

/** The corner radii of a computed `border-*-radius` value: horizontal, then vertical (the same when only one is given). */
const radii = (value: string): [number, number] => {
  const [h, v] = value.split(" ").map(parseFloat);
  return [h ?? 0, v ?? h ?? 0];
};

/**
 * Every raised face in `root` keeps a round inside at its thick edge. A slab makes the bottom border thicker than the
 * top, and a corner whose borders differ has an elliptical inside unless the radius grows by the difference on that
 * axis: the bottom corners' vertical radius is the horizontal one plus the extra width. A tone edge is the same turned
 * on its side: the start corners' horizontal radius grows. A square corner or a circle (50%) is left alone.
 */
function slabFaults(root: ParentNode, pseudo?: string): string[] {
  const faults: string[] = [];
  for (const el of [root as Element, ...root.querySelectorAll("*")]) {
    if (!(el instanceof Element)) continue;
    const cs = getComputedStyle(el, pseudo);
    if (cs.display === "none" || cs.borderBottomStyle === "none") continue;
    const top = parseFloat(cs.borderTopWidth);
    const bottom = parseFloat(cs.borderBottomWidth);
    const start = parseFloat(cs.borderInlineStartWidth);
    const name = `${el.className || el.tagName}${pseudo ?? ""}`;
    if (top > 0 && bottom > top) {
      for (const corner of ["borderBottomLeftRadius", "borderBottomRightRadius"] as const) {
        if (cs[corner].includes("%")) continue;
        const [h, v] = radii(cs[corner]);
        if (h > 0 && Math.abs(v - h - (bottom - top)) > 0.1) faults.push(`${name}: ${corner} ${cs[corner]}`);
      }
    }
    if (top > 0 && start > top) {
      for (const corner of ["borderStartStartRadius", "borderEndStartRadius"] as const) {
        if (cs[corner].includes("%")) continue;
        const [h, v] = radii(cs[corner]);
        if (v > 0 && Math.abs(h - v - (start - top)) > 0.1) faults.push(`${name}: ${corner} ${cs[corner]}`);
      }
    }
  }
  return faults;
}

describe("the material", () => {
  test("every raised face and tone edge keeps a round inside at its thick edge", async () => {
    const box = document.createElement("div");
    box.className = "e-root";
    document.body.append(box);
    const at = { container: box };
    const mounts: (() => Promise<unknown>)[] = [
      () => render(EButton, { ...at, slots: { default: () => "Pay" } }),
      () => render(EButton, { ...at, props: { variant: "outline" }, slots: { default: () => "Cancel" } }),
      () => render(ECheckbox, { ...at, props: { label: "Agree", modelValue: true } }),
      () => render(ESwitch, { ...at, props: { label: "On", modelValue: true } }),
      () => render(ESegmented, { ...at, props: { label: "View", options: ["Day", "Week"], modelValue: "Day" } }),
      () => render(ESegmented, { ...at, props: { label: "View", options: ["Day", "Week"], modelValue: "Week" } }),
      () => render(EPagination, { ...at, props: { pageCount: 3, modelValue: 1 } }),
      () => render(ECalendar, { ...at, props: { modelValue: new Date(2026, 9, 22, 12) } }),
      () => render(ETag, { ...at, props: { label: "Cardiology" } }),
      () => render(EKbd, { ...at, slots: { default: () => "K" } }),
      () => render(EAvatar, { ...at, props: { name: "Ada Lovelace", interactive: true } }),
      () => render(EAvatar, { ...at, props: { name: "Ada Lovelace", interactive: true, size: "sm" } }),
      () => render(ESlider, { ...at, props: { label: "Volume", modelValue: 40 } }),
      () => render(EExpandableRow, { ...at, props: { title: "Statement" }, slots: { default: () => "Body" } }),
      () => render(ENotice, { ...at, props: { title: "Heads up", tone: "warning" } }),
      () => render(EStamp, { ...at, props: { status: "overdue" } }),
      () => render(EToast, { ...at, props: { title: "Saved", tone: "success" } }),
    ];
    for (const mount of mounts) await mount();
    expect([...slabFaults(box), ...slabFaults(box, "::after")]).toEqual([]);
    // The guard sees a face without the recipe.
    const plain = document.createElement("span");
    plain.style.cssText = "display:block;border:1px solid;border-bottom-width:3px;border-radius:8px";
    box.append(plain);
    expect(slabFaults(box)).toHaveLength(2);
    box.remove();
  });

  test("a raised face's slab follows its height: thin up to chip height, depth up to control height", async () => {
    const probe = document.createElement("div");
    probe.className = "e-root";
    document.body.append(probe);
    const px = (value: string) => {
      probe.style.width = value;
      return probe.getBoundingClientRect().width;
    };
    const thin = px("var(--e-slab-thin)");
    const depth = px("var(--e-depth)");
    const lift = (el: Element) => {
      const cs = getComputedStyle(el);
      return parseFloat(cs.borderBottomWidth) - parseFloat(cs.borderTopWidth);
    };
    const check = await render(ECheckbox, { props: { label: "Agree", modelValue: true } });
    const sw = await render(ESwitch, { props: { label: "On", modelValue: true } });
    const tag = await render(ETag, { props: { label: "Tag" } });
    const button = await render(EButton, { slots: { default: () => "Pay" } });
    expect(lift(check.container.querySelector(".e-check")!)).toBe(thin);
    expect(lift(sw.container.querySelector(".e-switch-track")!)).toBe(thin);
    expect(lift(tag.container.querySelector(".e-tag")!)).toBe(thin);
    expect(lift(button.container.querySelector(".e-btn")!)).toBe(depth);
    probe.remove();
  });

  test("a flush surface is one flat ring and a floating one stands on a slab", async () => {
    const shadows = (el: Element) =>
      getComputedStyle(el)
        .boxShadow.split(/,(?![^(]*\))/)
        .map((s) => s.trim());
    // Flush: a card lies on the page inside one ring with no blur, never a drop shadow.
    const card = await render(ESurface, { slots: { default: () => "Card" } });
    const flush = shadows(card.container.querySelector(".e-surface")!);
    expect(flush).toHaveLength(1);
    expect(flush[0]).toMatch(/0px 0px 0px 1px/);
    // Raised off the page: the ring, a hard edge with no blur below it, and one soft drop.
    const raised = await render(ESurface, { props: { variant: "raised" }, slots: { default: () => "Toast" } });
    const float = shadows(raised.container.querySelector(".e-surface")!);
    expect(float).toHaveLength(3);
    expect(float[1]).toMatch(/0px [1-9][\d.]*px 0px [1-9]/);
  });

  test("a disabled control's dashed edge survives a page that resets outlines", async () => {
    const reset = document.createElement("style");
    reset.textContent = "* { outline: none }";
    document.head.append(reset);
    const { container } = await render(EButton, { props: { disabled: true }, slots: { default: () => "Pay" } });
    expect(getComputedStyle(container.querySelector(".e-btn")!, "::before").borderTopStyle).toBe("dashed");
    reset.remove();
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

  describe("emulated", () => {
    afterEach(() => commands.forcedColors(false));

    /** The computed value of a system colour while forced colours are on. */
    const system = (name: string) => {
      const probe = document.createElement("i");
      probe.style.color = name;
      document.body.append(probe);
      const value = getComputedStyle(probe).color;
      probe.remove();
      return value;
    };
    const style = (el: Element | null, pseudo?: string) => getComputedStyle(el!, pseudo);
    /** Turns forced colours on and waits for the colour transitions it starts to end. */
    const forced = async () => {
      await commands.forcedColors(true);
      await expect.poll(() => matchMedia("(forced-colors: active)").matches).toBe(true);
      // A style and layout pass starts the colour transitions the change sets off, so getAnimations sees them all.
      document.documentElement.getBoundingClientRect();
      const transitions = document.getAnimations().filter((a) => a instanceof CSSTransition);
      await Promise.all(transitions.map((a) => a.finished.catch(() => {})));
    };

    test("controls keep a system-colour edge; invalid is heavier, disabled is GrayText", async () => {
      const { container } = await render({
        components: { ETextField, ECheckbox, ESegmented },
        template: `<div>
          <ETextField label="Email" class="ok" />
          <ETextField label="Card" error="Check the number" class="bad" />
          <ECheckbox label="Agree" disabled />
          <ESegmented label="View" :options="[{ value: 'a', label: 'List' }]" />
        </div>`,
      });
      await forced();
      const edge = style(container.querySelector(".ok .e-input"));
      expect(edge.borderTopColor).toBe(system("ButtonText"));
      expect(parseFloat(style(container.querySelector(".bad .e-input")).borderTopWidth)).toBe(
        2 * parseFloat(edge.borderTopWidth),
      );
      expect(style(container.querySelector(".e-check")).borderTopColor).toBe(system("GrayText"));
      // The segmented track's edge is a shadow, so it draws a border instead.
      expect(style(container.querySelector(".e-seg")).borderTopStyle).toBe("solid");
    });

    test("a switch that is on is Highlight with a HighlightText thumb, hovered too", async () => {
      const { container } = await render(ESwitch, { props: { label: "Reminders", modelValue: true } });
      await userEvent.hover(container.querySelector(".e-switch")!);
      await forced();
      const track = container.querySelector(".e-switch-track");
      expect(style(track).backgroundColor).toBe(system("Highlight"));
      expect(style(track).borderTopColor).toBe(system("Highlight"));
      expect(style(track, "::after").backgroundColor).toBe(system("HighlightText"));
    });

    test("the selected tab is Highlight to its edge, and its count is forced again", async () => {
      const { container } = await render(ETabs, {
        props: {
          items: [
            { id: "a", label: "Open", count: 3 },
            { id: "b", label: "Closed" },
          ],
        },
      });
      await forced();
      expect(parseFloat(style(container.querySelector(".e-tablist")).borderBottomWidth)).toBeGreaterThan(0);
      const tab = container.querySelector('.e-tab[aria-selected="true"]');
      expect(style(tab).borderTopColor).toBe(system("Highlight"));
      const count = style(container.querySelector(".e-count"));
      expect(count.forcedColorAdjust).toBe("auto");
      expect(count.borderTopColor).toBe(system("CanvasText"));
    });

    test("panels whose edge is a shadow draw an outline", async () => {
      void [ETooltip, EDialog];
      const { container } = await render({
        template: `<div><div class="e-dialog">d</div><div class="e-popover">p</div><div class="e-tip-bubble">t</div></div>`,
      });
      await forced();
      for (const el of container.querySelectorAll(".e-dialog, .e-popover, .e-tip-bubble")) {
        expect(style(el).outlineStyle).toBe("solid");
        expect(style(el).outlineColor).toBe(system("CanvasText"));
      }
    });

    test("a focused checkbox rings in Highlight", async () => {
      const { container } = await render(ECheckbox, { props: { label: "Agree" } });
      await forced();
      await userEvent.keyboard("{Tab}");
      const box = container.querySelector(".e-check")!;
      expect(document.activeElement).toBe(box);
      expect(style(box).outlineColor).toBe(system("Highlight"));
    });
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
    expect(el.style.getPropertyValue("--e-surface")).toBe("#15121b");
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
      const small = await render(EIcon, { container: box, props: { name: "check", size: "sm" } } as never);
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

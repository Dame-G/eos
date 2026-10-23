import { describe, expect, test } from "vitest";
import { defineComponent, h, nextTick, ref, type Component } from "vue";
import { userEvent } from "vitest/browser";
import { render } from "vitest-browser-vue";
import ESelect from "./ESelect.vue";
import { createEos } from "../../plugin.js";
import { expectNoViolations } from "../../../test/axe.js";

const panel = () => document.querySelector<HTMLElement>("[role=listbox]");
const trigger = (c: Element) => c.querySelector<HTMLElement>("button.e-sel-trigger")!;
const openIt = async (c: Element) => {
  await userEvent.click(trigger(c));
};

async function bound(initial: boolean, extra: Record<string, unknown> = {}) {
  const state = ref(initial);
  const seen: boolean[] = [];
  const result = await render(
    defineComponent({
      render: () =>
        h(ESelect as Component, {
          ...{ label: "Pay with", options: ["Visa", "Bank", "Cash"] },
          ...extra,
          open: state.value,
          "onUpdate:open": (v: boolean) => {
            seen.push(v);
            state.value = v;
          },
        }),
    }),
    { global: { plugins: [createEos({ themeTarget: null })] } },
  );
  return { state, seen, ...result };
}

describe("ESelect open", () => {
  test("open from the first render: the panel is in the portal target with e-root, and no focus moves", async () => {
    const before = document.activeElement;
    const { container } = await bound(true);
    await expect.poll(() => panel()).not.toBeNull();
    const el = panel()!;
    expect(container.contains(el)).toBe(false);
    expect(el.classList.contains("e-root") || !!el.closest(".e-root")).toBe(true);
    await new Promise((r) => setTimeout(r, 300));
    expect(document.activeElement).toBe(before);
    expect(el.contains(document.activeElement)).toBe(false);
  });

  test("closed at first when open is false", async () => {
    await bound(false);
    expect(panel()).toBeNull();
  });

  test("the consumer opens and closes it, without moving focus", async () => {
    const { state } = await bound(false);
    const before = document.activeElement;
    state.value = true;
    await expect.poll(() => panel()).not.toBeNull();
    await new Promise((r) => setTimeout(r, 300));
    expect(document.activeElement).toBe(before);
    state.value = false;
    await expect.poll(() => panel()).toBeNull();
    await nextTick();
    expect(document.activeElement).toBe(before);
  });

  test("the person opening it and closing it with Escape update the model", async () => {
    const { state, seen, container } = await bound(false);
    await openIt(container);
    await expect.poll(() => panel()).not.toBeNull();
    expect(state.value).toBe(true);
    expect(seen).toContain(true);
    await userEvent.keyboard("{Escape}");
    await expect.poll(() => panel()).toBeNull();
    expect(state.value).toBe(false);
    expect(seen[seen.length - 1]).toBe(false);
  });

  test("works uncontrolled: it opens and closes on its own without an open prop", async () => {
    const { container } = await render(ESelect as Component, {
      props: { label: "Pay with", options: ["Visa", "Bank", "Cash"] },
      global: { plugins: [createEos({ themeTarget: null })] },
    });
    await openIt(container);
    await expect.poll(() => panel()).not.toBeNull();
    await userEvent.keyboard("{Escape}");
    await expect.poll(() => panel()).toBeNull();
  });

  test("disabled stays closed, even with open set", async () => {
    await bound(true, { disabled: true });
    await new Promise((r) => setTimeout(r, 300));
    expect(panel()).toBeNull();
  });

  test("axe: open", async () => {
    await bound(true);
    await expect.poll(() => panel()).not.toBeNull();
    await new Promise((r) => setTimeout(r, 300));
    await expectNoViolations(document.body);
  });
});

describe("ESelect corners", () => {
  test.each(["", "2px", "14px"])("an option's corner is the panel's less its padding (md %s)", async (md) => {
    const { container } = await render(ESelect, { props: { label: "Pay with", options: ["Visa", "Bank", "Cash"] } });
    await openIt(container);
    await expect.poll(() => panel()).not.toBeNull();
    const p = panel()!;
    if (md) p.style.setProperty("--e-radius-md", md);
    const css = getComputedStyle(p);
    const outer = parseFloat(css.borderTopLeftRadius);
    const inset = parseFloat(css.paddingTop) / 2 + parseFloat(css.borderTopWidth); /* pad-inset is half the padding */
    const inner = parseFloat(getComputedStyle(p.querySelector(".e-opt")!).borderTopLeftRadius);
    expect(Math.abs(inner - Math.max(0, outer - inset))).toBeLessThan(0.5);
  });
});

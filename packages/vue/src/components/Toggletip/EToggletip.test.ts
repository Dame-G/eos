import { describe, expect, test, vi } from "vitest";
import { defineComponent, h, nextTick, ref } from "vue";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-vue";
import EToggletip from "./EToggletip.vue";
import EDefinition from "./EDefinition.js";
import EButton from "../Button/EButton.vue";
import { createEos } from "../../plugin.js";
import { expectNoViolations } from "../../../test/axe.js";

const panel = () => document.querySelector<HTMLElement>(".e-popover");
const triggerOf = (c: Element) => c.querySelector<HTMLButtonElement>("button.e-toggletip-term")!;

function mount(props: Record<string, unknown> = {}, extra: Record<string, unknown> = {}) {
  return render(EToggletip, {
    props: { label: "About payment plans", ...props },
    slots: {
      trigger: () => "What is a payment plan?",
      default: () => "Split your balance into equal monthly payments.",
      ...extra,
    },
  });
}

describe("EToggletip", () => {
  test("inline sets the term in its sentence: no icon, the sentence's font, on its baseline, and it still opens", async () => {
    const { container } = await render(
      defineComponent({
        render: () =>
          h("p", { style: "font: 18px/1.5 serif" }, [
            "Licensed under ",
            h(
              EToggletip,
              { label: "About the licence", inline: true },
              { trigger: () => "MIT", default: () => "Use it for anything." },
            ),
            ".",
          ]),
      }),
    );
    const term = triggerOf(container);
    expect(term.querySelector(".e-icon")).toBeNull();
    const style = getComputedStyle(term);
    expect(style.fontSize).toBe("18px");
    expect(style.fontFamily).toBe(getComputedStyle(container.querySelector("p")!).fontFamily);
    expect(style.verticalAlign).toBe("baseline");
    expect(term.getBoundingClientRect().height).toBeLessThanOrEqual(27);
    await userEvent.click(term);
    await expect.element(page.getByRole("dialog", { name: "About the licence" })).toBeVisible();
    await userEvent.keyboard("{Escape}");
  });

  test("the default term keeps its info icon", async () => {
    const { container } = await mount();
    expect(triggerOf(container).querySelector(".e-icon")).not.toBeNull();
  });

  test("is a dotted-underline term button with an info glyph; the panel is not in the page until it opens", async () => {
    const { container } = await mount();
    const trigger = triggerOf(container);
    expect(trigger.textContent).toContain("What is a payment plan?");
    expect(trigger.querySelector(".e-icon")).not.toBeNull();
    expect(getComputedStyle(trigger).textDecorationStyle).toBe("dotted");
    expect(getComputedStyle(trigger).cursor).toBe("help");
    expect(trigger.getAttribute("aria-haspopup")).toBe("dialog");
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(panel()).toBeNull();
  });

  test("its accessible name starts with the visible term and then says what it is about", async () => {
    await mount();
    await expect.element(page.getByRole("button", { name: /^What is a payment plan\?/ })).toBeVisible();
    await expect.element(page.getByRole("button", { name: /About payment plans/ })).toBeVisible();
  });

  test("a click opens a dialog named by the label; the panel sits under the term, 8px away", async () => {
    const { container } = await mount();
    const trigger = triggerOf(container);
    await trigger.click();
    await expect.poll(() => panel()).not.toBeNull();
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    const dialog = page.getByRole("dialog", { name: "About payment plans" });
    await expect.element(dialog).toBeVisible();
    expect(panel()!.getAttribute("role")).toBe("dialog");
    expect(panel()!.querySelector(".e-pop-body")!.textContent).toContain("equal monthly payments");
    expect(panel()!.querySelector(".e-pop-head")).toBeNull();
    const t = trigger.getBoundingClientRect();
    await expect.poll(() => Math.round(panel()!.getBoundingClientRect().top - t.bottom)).toBe(8);
    expect(Math.round(panel()!.getBoundingClientRect().left)).toBeGreaterThanOrEqual(16);
  });

  test("Enter and Space on the term open it; Escape closes it and returns focus to the term", async () => {
    const { container } = await mount();
    const trigger = triggerOf(container);
    await userEvent.tab();
    expect(document.activeElement).toBe(trigger);
    await userEvent.keyboard("{Enter}");
    await expect.poll(() => panel()).not.toBeNull();
    await userEvent.keyboard("{Escape}");
    await expect.poll(() => panel()).toBeNull();
    await expect.poll(() => document.activeElement).toBe(trigger);
    await userEvent.keyboard(" ");
    await expect.poll(() => panel()).not.toBeNull();
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
  });

  test("an outside press closes it", async () => {
    const { container } = await render(
      defineComponent({
        render: () =>
          h("div", [
            h(EToggletip, { label: "About" }, { trigger: () => "Term", default: () => "Body" }),
            h("button", { type: "button" }, "Elsewhere"),
          ]),
      }),
    );
    await triggerOf(container).click();
    await expect.poll(() => panel()).not.toBeNull();
    await page.getByRole("button", { name: "Elsewhere" }).click();
    await expect.poll(() => panel()).toBeNull();
  });

  test("a title adds a header with a heading and a Close button that closes and returns focus", async () => {
    const { container } = await mount({ title: "Payment plan" });
    const trigger = triggerOf(container);
    await trigger.click();
    await expect.poll(() => panel()).not.toBeNull();
    const heading = panel()!.querySelector(".e-pop-title")!;
    expect(heading.tagName).toBe("H3");
    expect(heading.textContent).toBe("Payment plan");
    await expect.element(page.getByRole("dialog", { name: "Payment plan" })).toBeVisible();
    await page.getByRole("button", { name: "Close" }).click();
    await expect.poll(() => panel()).toBeNull();
    await expect.poll(() => document.activeElement).toBe(trigger);
  });

  test("headingLevel sets the heading", async () => {
    const { container } = await mount({ title: "Payment plan", headingLevel: 2 });
    await triggerOf(container).click();
    await expect.poll(() => panel()?.querySelector(".e-pop-title")?.tagName).toBe("H2");
  });

  test("actions sit in a tinted footer bar, left-aligned, in order", async () => {
    const { container } = await mount(
      { title: "Payment plan" },
      {
        actions: () => [
          h(EButton, { variant: "outline" }, () => "Set up a plan"),
          h(EButton, { variant: "quiet" }, () => "Not now"),
        ],
      },
    );
    await triggerOf(container).click();
    await expect.poll(() => panel()).not.toBeNull();
    const bar = panel()!.querySelector<HTMLElement>(".e-actions--bar")!;
    expect(bar).not.toBeNull();
    expect(Array.from(bar.querySelectorAll("button")).map((b) => b.textContent?.trim())).toEqual([
      "Set up a plan",
      "Not now",
    ]);
    expect(bar.previousElementSibling!.classList.contains("e-pop-body")).toBe(true);
    const first = bar.querySelector("button")!.getBoundingClientRect();
    expect(Math.round(first.left - bar.getBoundingClientRect().left)).toBe(16);
  });

  test("v-model: false at first, true when opened, and setting it opens and closes the panel", async () => {
    const open = ref(false);
    const seen: boolean[] = [];
    const { container } = await render(
      defineComponent({
        render: () =>
          h(
            EToggletip,
            {
              label: "About",
              modelValue: open.value,
              "onUpdate:modelValue": (v: boolean) => {
                seen.push(v);
                open.value = v;
              },
            },
            { trigger: () => "Term", default: () => "Body" },
          ),
      }),
    );
    expect(panel()).toBeNull();
    await triggerOf(container).click();
    await expect.poll(() => panel()).not.toBeNull();
    expect(seen).toEqual([true]);
    open.value = false;
    await nextTick();
    await expect.poll(() => panel()).toBeNull();
    open.value = true;
    await nextTick();
    await expect.poll(() => panel()).not.toBeNull();
  });

  test("class, style and attributes land on the term button", async () => {
    const { container } = await render(EToggletip, {
      props: { label: "About" },
      attrs: { class: "mine", "data-test": "x" },
      slots: { trigger: () => "Term", default: () => "Body" },
    });
    const trigger = triggerOf(container);
    expect(trigger.classList.contains("mine")).toBe(true);
    expect(trigger.classList.contains("e-toggletip-term")).toBe(true);
    expect(trigger.dataset["test"]).toBe("x");
  });

  test("the panel renders in the configured portal target and is an e-root; Close is reworded by useMessages", async () => {
    const target = document.createElement("div");
    target.id = "themed-pop";
    document.body.appendChild(target);
    const { container } = await render(EToggletip, {
      props: { label: "About", title: "Titre" },
      slots: { trigger: () => "Term", default: () => "Body" },
      global: { plugins: [createEos({ portalTarget: "#themed-pop", messages: { close: "Fermer" } })] },
    });
    await triggerOf(container).click();
    await expect.poll(() => panel()).not.toBeNull();
    expect(target.contains(panel())).toBe(true);
    expect(panel()!.classList.contains("e-root")).toBe(true);
    await expect.element(page.getByRole("button", { name: "Fermer" })).toBeVisible();
    await userEvent.keyboard("{Escape}");
    target.remove();
  });

  test("axe: closed, open without a header, open with title and actions", async () => {
    const a = await mount();
    await expectNoViolations(a.container);
    await triggerOf(a.container).click();
    await expect.poll(() => panel()).not.toBeNull();
    await expectNoViolations(document.body);
    await userEvent.keyboard("{Escape}");
    await expect.poll(() => panel()).toBeNull();
    a.unmount();
    const b = await mount(
      { title: "Payment plan" },
      { actions: () => h(EButton, { variant: "outline" }, () => "Set up a plan") },
    );
    await triggerOf(b.container).click();
    await expect.poll(() => panel()).not.toBeNull();
    await expectNoViolations(document.body);
  });

  test("the title row is not a banner landmark and the panel keeps its name", async () => {
    const { container } = await mount({ title: "Payment plan" });
    await triggerOf(container).click();
    await expect.poll(() => panel()).not.toBeNull();
    expect(panel()!.querySelector("header")).toBeNull();
    expect(panel()!.querySelector(".e-pop-head")!.tagName).toBe("DIV");
    expect(page.getByRole("banner").elements()).toHaveLength(0);
    await expect.element(page.getByRole("dialog", { name: "Payment plan" })).toBeVisible();
  });

  test("EDefinition, the old name, renders the same toggletip and warns once", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const slots = { trigger: () => "APR", default: () => "The yearly cost of a loan." };
    const a = await render(EDefinition, { props: { label: "About APR" }, slots });
    const b = await render(EDefinition, { props: { label: "About APR" }, slots });
    expect(triggerOf(a.container).textContent).toContain("APR");
    expect(triggerOf(b.container)).not.toBeNull();
    expect(warn.mock.calls.filter(([m]) => String(m).includes("EToggletip"))).toHaveLength(1);
    warn.mockRestore();
  });
});

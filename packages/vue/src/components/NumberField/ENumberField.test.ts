import { describe, expect, test, vi } from "vitest";
import { defineComponent, h, nextTick, ref, type Component } from "vue";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-vue";
import ENumberField from "./ENumberField.vue";
import { createEos } from "../../plugin.js";
import { expectNoViolations } from "../../../test/axe.js";
import { expectPostingContract } from "../../../test/formPosting.js";

async function bound(props: Record<string, unknown>, initial: number | null, global = {}) {
  const model = ref<number | null>(initial);
  const got: (number | null)[] = [];
  const result = await render(
    defineComponent({
      render: () =>
        h(ENumberField as Component, {
          ...props,
          modelValue: model.value,
          "onUpdate:modelValue": (v: number | null) => {
            got.push(v);
            model.value = v;
          },
        }),
    }),
    { global },
  );
  return { model, got, ...result };
}

/** The top-left corner radius in px. */
const corner = (el: Element) => parseFloat(getComputedStyle(el).borderTopLeftRadius);

describe("ENumberField", () => {
  test("is a spinbutton named by its label, between a decrease and an increase button", async () => {
    const { container } = await render(ENumberField, { props: { label: "Visits" } });
    await expect.element(page.getByRole("spinbutton", { name: "Visits" })).toBeVisible();
    await expect.element(page.getByRole("button", { name: "Decrease" })).toBeVisible();
    await expect.element(page.getByRole("button", { name: "Increase" })).toBeVisible();
    const wrap = container.querySelector(".e-input-wrap")!;
    expect(wrap.className).toBe("e-input-wrap e-numfield");
    expect(wrap.firstElementChild!.classList.contains("e-numbtn")).toBe(true);
    expect(wrap.lastElementChild!.classList.contains("e-numbtn")).toBe(true);
  });

  test("arrows step, the range clamps, and the model gets numbers", async () => {
    const { got } = await bound({ label: "Visits", min: 0, max: 10 }, 9);
    const box = page.getByRole("spinbutton", { name: "Visits" });
    await expect.element(box).toHaveValue("9");
    await box.click();
    await userEvent.keyboard("{ArrowUp}{ArrowUp}");
    expect(got.at(-1)).toBe(10);
    expect(typeof got[0]).toBe("number");
    await expect.element(box).toHaveValue("10");
    await userEvent.keyboard("{ArrowDown}");
    expect(got.at(-1)).toBe(9);
  });

  test("Shift steps by ten", async () => {
    const { got } = await bound({ label: "Visits", min: 0, max: 100 }, 5);
    await page.getByRole("spinbutton", { name: "Visits" }).click();
    await userEvent.keyboard("{Shift>}{ArrowUp}{/Shift}");
    expect(got.at(-1)).toBe(15);
  });

  test("the buttons step and go aria-disabled at the limits, keeping focus", async () => {
    const { got } = await bound({ label: "Visits", min: 0, max: 2 }, 1);
    const inc = page.getByRole("button", { name: "Increase" });
    await inc.click();
    expect(got.at(-1)).toBe(2);
    await expect.element(inc).toHaveAttribute("aria-disabled", "true");
    expect((inc.element() as HTMLButtonElement).disabled).toBe(false);
    (inc.element() as HTMLButtonElement).click();
    expect(got.length).toBe(1);
    await page.getByRole("button", { name: "Decrease" }).click();
    await page.getByRole("button", { name: "Decrease" }).click();
    expect(got.at(-1)).toBe(0);
    await expect.element(page.getByRole("button", { name: "Decrease" })).toHaveAttribute("aria-disabled", "true");
    await expect.element(inc).not.toHaveAttribute("aria-disabled");
  });

  test("the focused button keeps focus when it reaches the limit", async () => {
    await bound({ label: "Visits", min: 0, max: 1 }, 0);
    const inc = page.getByRole("button", { name: "Increase" }).element() as HTMLButtonElement;
    inc.focus();
    await userEvent.keyboard("{Enter}");
    expect(document.activeElement).toBe(inc);
  });

  test("the model updates as soon as the text reads as a number", async () => {
    const { got } = await bound({ label: "Visits", min: 0, max: 100 }, null);
    const box = page.getByRole("spinbutton", { name: "Visits" });
    await box.click();
    await userEvent.keyboard("4");
    expect(got.at(-1)).toBe(4);
    await userEvent.keyboard("2.");
    expect(got.at(-1)).toBe(42);
    await expect.element(box).toHaveValue("42.");
    await userEvent.keyboard("{Backspace}{Backspace}{Backspace}");
    expect(got.at(-1)).toBeNull();
  });

  test("out-of-range text is committed as typed, then clamped on blur", async () => {
    const { got } = await bound({ label: "Visits", min: 0, max: 100 }, 5);
    const box = page.getByRole("spinbutton", { name: "Visits" });
    await box.fill("500");
    expect(got.at(-1)).toBe(500);
    await userEvent.tab();
    expect(got.at(-1)).toBe(100);
    await expect.element(box).toHaveValue("100");
  });

  test("Enter in a form posts the clamped value, not the stale one", async () => {
    let posted: string | null = null;
    const { container } = await render(
      defineComponent({
        render: () =>
          h(
            "form",
            {
              onSubmit: (e: Event) => (
                e.preventDefault(),
                (posted = String(new FormData(e.target as HTMLFormElement).get("visits")))
              ),
            },
            [h(ENumberField, { label: "Visits", name: "visits", min: 0, max: 100, modelValue: 5 }), h("button", "Go")],
          ),
      }),
    );
    expect(container.querySelector("form")).not.toBeNull();
    await page.getByRole("spinbutton", { name: "Visits" }).fill("500");
    await userEvent.keyboard("{Enter}");
    expect(posted).toBe("100");
  });

  test("a named field posts its number, nothing while disabled, and joins a form it is outside of", async () => {
    await expectPostingContract(ENumberField, { label: "Visits", modelValue: 7 }, "visits");
  });

  test("size sm and lg change the height of the box and the buttons", async () => {
    const sm = await render(ENumberField, { props: { label: "S", size: "sm" } });
    sm.container.classList.add("e-root");
    const small = sm.container.querySelector(".e-input-wrap")!.getBoundingClientRect().height;
    const lg = await render(ENumberField, { props: { label: "L", size: "lg" } });
    lg.container.classList.add("e-root");
    const large = lg.container.querySelector(".e-input-wrap")!.getBoundingClientRect().height;
    expect(small).toBeLessThan(48);
    expect(large).toBeGreaterThan(48);
    const btn = lg.container.querySelector(".e-numbtn")!.getBoundingClientRect();
    expect(Math.round(btn.width)).toBe(Math.round(large));
  });

  test("a prefix or suffix is part of the value text for screen readers", async () => {
    await render(ENumberField, { props: { label: "Hours", suffix: "h", modelValue: 2, step: 0.5 } });
    await expect.element(page.getByRole("spinbutton", { name: "Hours" })).toHaveAttribute("aria-valuetext", "2.0 h");
  });

  test("holding a button repeats the step", async () => {
    const { got } = await bound({ label: "Visits" }, 0);
    const inc = page.getByRole("button", { name: "Increase" }).element() as HTMLButtonElement;
    vi.useFakeTimers();
    try {
      inc.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, button: 0 }));
      await vi.advanceTimersByTimeAsync(449);
      expect(got).toEqual([]);
      // After the pause, one step every 70ms while the button is held.
      await vi.advanceTimersByTimeAsync(1 + 3 * 70);
      expect(got).toEqual([1, 2, 3]);
      inc.dispatchEvent(new PointerEvent("pointerup", { bubbles: true, button: 0 }));
      // The click that ends a hold is not one more step, and nothing repeats after letting go.
      inc.click();
      await vi.advanceTimersByTimeAsync(1000);
      expect(got).toEqual([1, 2, 3]);
      // The next plain click steps again.
      inc.click();
      expect(got).toEqual([1, 2, 3, 4]);
    } finally {
      vi.useRealTimers();
    }
  });

  test("a value with more decimals than the step is shown whole, and thousands are grouped", async () => {
    const { container } = await render(ENumberField, { props: { label: "Weight", modelValue: 1234.5 } });
    expect(container.querySelector<HTMLInputElement>(".e-numinput")!.value).toBe("1,234.5");
  });

  test("locale overrides the configured one for writing and reading the number", async () => {
    const { container, got } = await bound({ label: "Menge", locale: "de-DE", step: 0.5 }, 1234.5);
    const input = container.querySelector<HTMLInputElement>(".e-numinput")!;
    expect(input.value).toBe("1.234,5");
    await userEvent.clear(input);
    await userEvent.type(input, "2,5");
    expect(got.at(-1)).toBe(2.5);
  });

  test("the buttons are reachable by keyboard", async () => {
    const { got } = await bound({ label: "Visits" }, 1);
    await userEvent.tab();
    expect(document.activeElement).toBe(page.getByRole("button", { name: "Decrease" }).element());
    await userEvent.tab();
    await userEvent.tab();
    expect(document.activeElement).toBe(page.getByRole("button", { name: "Increase" }).element());
    await userEvent.keyboard("{Enter}");
    expect(got.at(-1)).toBe(2);
  });

  test("an empty field starts at the minimum, or zero", async () => {
    const withMin = await bound({ label: "A", min: 3 }, null);
    await withMin.container.querySelector<HTMLElement>("button[aria-label=Increase]")!.click();
    expect(withMin.got.at(-1)).toBe(3);
    const none = await bound({ label: "B" }, null);
    await none.container.querySelector<HTMLElement>("button[aria-label=Increase]")!.click();
    expect(none.got.at(-1)).toBe(1);
  });

  test("typed text commits on blur: it clamps, and commas are ignored", async () => {
    const { got } = await bound({ label: "Visits", min: 0, max: 100 }, 1);
    const box = page.getByRole("spinbutton", { name: "Visits" });
    await box.fill("1,500");
    await userEvent.tab();
    expect(got.at(-1)).toBe(100);
    await expect.element(box).toHaveValue("100");
  });

  test("Enter commits typed text", async () => {
    const { got } = await bound({ label: "Visits" }, null);
    const box = page.getByRole("spinbutton", { name: "Visits" });
    await box.fill("42");
    await userEvent.keyboard("{Enter}");
    expect(got.at(-1)).toBe(42);
  });

  test("clearing the text gives null; unreadable text goes back to the last number", async () => {
    const { got } = await bound({ label: "Visits" }, 7);
    const box = page.getByRole("spinbutton", { name: "Visits" });
    await box.fill("abc");
    await userEvent.tab();
    await expect.element(box).toHaveValue("7");
    await box.fill("");
    await userEvent.tab();
    expect(got.at(-1)).toBeNull();
    await expect.element(box).toHaveValue("");
  });

  test("decimals follow the step", async () => {
    const { got } = await bound({ label: "Hours", step: 0.25 }, 1);
    const box = page.getByRole("spinbutton", { name: "Hours" });
    await expect.element(box).toHaveValue("1.00");
    await box.click();
    await userEvent.keyboard("{ArrowUp}");
    expect(got.at(-1)).toBe(1.25);
    await expect.element(box).toHaveValue("1.25");
  });

  test("a new model value shows in the input", async () => {
    const { model } = await bound({ label: "Visits" }, 1);
    model.value = 12;
    await nextTick();
    await expect.element(page.getByRole("spinbutton", { name: "Visits" })).toHaveValue("12");
  });

  test("without v-model it keeps its own number", async () => {
    await render(ENumberField, { props: { label: "Visits", min: 0 } });
    await page.getByRole("button", { name: "Increase" }).click();
    await page.getByRole("button", { name: "Increase" }).click();
    await expect.element(page.getByRole("spinbutton", { name: "Visits" })).toHaveValue("1");
  });

  test("the spinbutton carries the value and the range", async () => {
    const { container } = await bound({ label: "Visits", min: 0, max: 10 }, 4);
    const input = container.querySelector("input")!;
    expect(input.getAttribute("aria-valuenow")).toBe("4");
    expect(input.getAttribute("aria-valuemin")).toBe("0");
    expect(input.getAttribute("aria-valuemax")).toBe("10");
    expect(input.getAttribute("inputmode")).toBe("decimal");
  });

  test("name submits the number in a hidden input", async () => {
    const { container } = await bound({ label: "Visits", name: "visits" }, 3);
    const hidden = container.querySelector<HTMLInputElement>("input[type=hidden]")!;
    expect(hidden.name).toBe("visits");
    expect(hidden.value).toBe("3");
    expect(container.querySelector(".e-numbtn:last-child")).not.toBeNull();
  });

  test("a prefix or suffix sits beside the value, and a click on it focuses the input", async () => {
    const { container } = await render(ENumberField, {
      props: { label: "Amount", prefix: "$", modelValue: 100, step: 0.01 },
    });
    container.classList.add("e-root");
    const wrap = container.querySelector(".e-input-wrap")!;
    expect(wrap.classList.contains("e-numfield--affix")).toBe(true);
    const affix = container.querySelector<HTMLElement>(".e-affix--pre")!;
    const input = container.querySelector<HTMLInputElement>(".e-numinput")!;
    expect(input.getBoundingClientRect().left - affix.getBoundingClientRect().right).toBeLessThan(8);
    affix.click();
    expect(document.activeElement).toBe(input);
  });

  test("in a narrow column a suffixed value is still fully visible", async () => {
    const { container } = await render(ENumberField, {
      props: { label: "Spacing", suffix: "%", modelValue: 100 },
    });
    container.classList.add("e-root");
    container.style.width = "9rem";
    const input = container.querySelector<HTMLInputElement>(".e-numinput")!;
    await nextTick();
    expect(input.scrollWidth).toBeLessThanOrEqual(input.clientWidth);
  });

  test("the wrap is 48px tall and the buttons are square", async () => {
    const { container } = await render(ENumberField, { props: { label: "Visits" } });
    container.classList.add("e-root");
    expect(Math.round(container.querySelector(".e-input-wrap")!.getBoundingClientRect().height)).toBe(48);
    const btn = container.querySelector(".e-numbtn")!.getBoundingClientRect();
    expect(btn.width).toBe(48);
  });

  test("attributes land on the input; the consumer's listeners join the component's", async () => {
    const events: string[] = [];
    const { container } = await render(ENumberField, {
      props: { label: "Visits", hint: "How many" },
      attrs: {
        autocomplete: "transaction-amount",
        "data-x": "1",
        class: "mine",
        onBlur: () => events.push("blur"),
        onKeydown: () => events.push("key"),
      },
    });
    const input = container.querySelector("input")!;
    expect(input.getAttribute("autocomplete")).toBe("transaction-amount");
    expect(input.dataset["x"]).toBe("1");
    expect(input.getAttribute("aria-describedby")).toBe(container.querySelector(".e-field-hint")!.id);
    expect(container.firstElementChild!.className).toBe("e-field mine");
    input.focus();
    await userEvent.keyboard("{ArrowUp}");
    input.blur();
    expect(events).toEqual(["key", "blur"]);
    expect(input.value).toBe("1");
  });

  test("an error marks the field invalid and is announced; required and optional show their word", async () => {
    const bad = await render(ENumberField, { props: { label: "Visits", error: "Too many", required: true } });
    expect(bad.container.querySelector("input")!.getAttribute("aria-invalid")).toBe("true");
    expect(bad.container.querySelector(".e-input-wrap")!.hasAttribute("data-invalid")).toBe(true);
    expect(bad.container.querySelector(".e-field-error")!.getAttribute("role")).toBe("alert");
    expect(bad.container.querySelector(".e-field-flag")!.textContent).toBe("Required");
    const opt = await render(ENumberField, { props: { label: "Visits", optional: true } });
    expect(opt.container.querySelector(".e-field-flag")!.textContent).toBe("Optional");
  });

  test("disabled disables the input and both buttons", async () => {
    const { container } = await render(ENumberField, { props: { label: "Visits", disabled: true } });
    expect(container.querySelector("input")!.disabled).toBe(true);
    expect([...container.querySelectorAll("button")].every((b) => b.disabled)).toBe(true);
    expect(container.querySelector(".e-input-wrap")!.hasAttribute("data-disabled")).toBe(true);
  });

  test("has no accessibility violations in any state", async () => {
    const { container } = await render(
      defineComponent({
        render: () =>
          h("div", [
            h(ENumberField, { label: "Plain" }),
            h(ENumberField, { label: "Ranged", min: 0, max: 10, modelValue: 10, hint: "A hint", required: true }),
            h(ENumberField, { label: "Invalid", error: "Too many", modelValue: 3 }),
            h(ENumberField, { label: "Disabled", disabled: true, optional: true }),
            h(ENumberField, { label: "Affixed", prefix: "$", suffix: "USD", modelValue: 5, step: 0.01 }),
            h(ENumberField, { label: "Named", name: "n", hideLabel: true }),
            h(ENumberField, { label: "Readonly", readonly: true, modelValue: 3 }),
          ]),
      }),
    );
    await expectNoViolations(container);
  });

  describe("locale", () => {
    const eos = (locale: string) => ({ plugins: [createEos({ themeTarget: null, locale })] });

    test("fr-FR shows a decimal comma and reads one back", async () => {
      const { got } = await bound({ label: "Poids", step: 0.1 }, 1.5, eos("fr-FR"));
      const box = page.getByRole("spinbutton", { name: "Poids" });
      await expect.element(box).toHaveValue("1,5");
      await box.fill("12,34");
      await userEvent.keyboard("{Enter}");
      expect(got.at(-1)).toBe(12.34);
      await box.fill("2.5");
      await userEvent.keyboard("{Enter}");
      expect(got.at(-1)).toBe(2.5);
    });

    test("de-DE reads a comma as the decimal and a dot as grouping", async () => {
      const { got } = await bound({ label: "Gewicht", step: 0.1 }, null, eos("de-DE"));
      const box = page.getByRole("spinbutton", { name: "Gewicht" });
      await box.fill("1,5");
      await userEvent.keyboard("{Enter}");
      expect(got.at(-1)).toBe(1.5);
      await expect.element(box).toHaveValue("1,5");
      await box.fill("1.234,5");
      await userEvent.keyboard("{Enter}");
      expect(got.at(-1)).toBe(1234.5);
    });

    test("en-US still drops a typed group comma", async () => {
      const { got } = await bound({ label: "Visits" }, null);
      await page.getByRole("spinbutton", { name: "Visits" }).fill("1,200");
      await userEvent.keyboard("{Enter}");
      expect(got.at(-1)).toBe(1200);
    });

    test("the hidden input submits a plain number", async () => {
      const { container } = await bound({ label: "Poids", step: 0.1, name: "w" }, 1.5, eos("fr-FR"));
      expect(container.querySelector<HTMLInputElement>("input[name=w]")!.value).toBe("1.5");
    });
  });

  test("Home and End go to min and max, PageUp and PageDown step by ten", async () => {
    const { got } = await bound({ label: "Visits", min: 0, max: 100 }, 50);
    await page.getByRole("spinbutton", { name: "Visits" }).click();
    await userEvent.keyboard("{PageUp}");
    expect(got.at(-1)).toBe(60);
    await userEvent.keyboard("{PageDown}{PageDown}");
    expect(got.at(-1)).toBe(40);
    await userEvent.keyboard("{Home}");
    expect(got.at(-1)).toBe(0);
    await userEvent.keyboard("{End}");
    expect(got.at(-1)).toBe(100);
  });

  test("Home and End do nothing without min and max", async () => {
    const { got } = await bound({ label: "Visits" }, 5);
    await page.getByRole("spinbutton", { name: "Visits" }).click();
    await userEvent.keyboard("{Home}{End}");
    expect(got).toEqual([]);
  });

  test("readonly blocks the buttons and keys but stays focusable", async () => {
    const { got, container } = await bound({ label: "Visits", min: 0, max: 10, readonly: true }, 5);
    const box = page.getByRole("spinbutton", { name: "Visits" });
    expect(container.querySelector(".e-input-wrap")!.hasAttribute("data-readonly")).toBe(true);
    expect(container.querySelector<HTMLInputElement>(".e-numinput")!.readOnly).toBe(true);
    await expect.element(page.getByRole("button", { name: "Increase" })).toBeDisabled();
    await expect.element(page.getByRole("button", { name: "Decrease" })).toBeDisabled();
    await box.click();
    expect(document.activeElement).toBe(container.querySelector(".e-numinput"));
    await userEvent.keyboard("{ArrowUp}{PageUp}{Home}{End}7{Enter}");
    expect(got).toEqual([]);
    await expect.element(box).toHaveValue("5");
  });

  test("corners are concentric: the steppers' outer corners are the field's inner radius at any theme", async () => {
    const { container } = await render(ENumberField, { props: { label: "Qty", modelValue: 1 } });
    const root = container as HTMLElement;
    root.classList.add("e-root");
    const wrap = root.querySelector(".e-input-wrap")!;
    const first = wrap.querySelector(".e-numbtn:first-of-type")!;

    for (const md of [null, "14px", "2px"]) {
      if (md) root.style.setProperty("--e-radius-md", md);
      expect(corner(first)).toBeCloseTo(Math.max(0, corner(wrap) - 1), 0);
    }
  });
});

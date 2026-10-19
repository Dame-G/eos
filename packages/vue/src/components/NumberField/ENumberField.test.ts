import { describe, expect, test } from "vitest";
import { defineComponent, h, nextTick, ref, type Component } from "vue";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-vue";
import ENumberField from "./ENumberField.vue";
import { expectNoViolations } from "../../../test/axe.js";

async function bound(props: Record<string, unknown>, initial: number | null) {
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
  );
  return { model, got, ...result };
}

describe("ENumberField", () => {
  test("is a spinbutton named by its label, between a decrease and an increase button", async () => {
    const { container } = await render(ENumberField, { props: { label: "Visits" } });
    await expect.element(page.getByRole("spinbutton", { name: "Visits" })).toBeVisible();
    await expect.element(page.getByRole("button", { name: "Decrease" })).toBeVisible();
    await expect.element(page.getByRole("button", { name: "Increase" })).toBeVisible();
    const wrap = container.querySelector(".e-input-wrap")!;
    expect(wrap.className).toBe("e-input-wrap e-numfield");
    expect(wrap.firstElementChild!.className).toBe("e-numbtn");
    expect(wrap.lastElementChild!.className).toBe("e-numbtn");
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

  test("the buttons step and disable at the limits", async () => {
    const { got } = await bound({ label: "Visits", min: 0, max: 2 }, 1);
    await page.getByRole("button", { name: "Increase" }).click();
    expect(got.at(-1)).toBe(2);
    await expect.element(page.getByRole("button", { name: "Increase" })).toBeDisabled();
    await page.getByRole("button", { name: "Decrease" }).click();
    await page.getByRole("button", { name: "Decrease" }).click();
    expect(got.at(-1)).toBe(0);
    await expect.element(page.getByRole("button", { name: "Decrease" })).toBeDisabled();
    await expect.element(page.getByRole("button", { name: "Increase" })).toBeEnabled();
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
          ]),
      }),
    );
    await expectNoViolations(container);
  });
});

import { describe, expect, test } from "vitest";
import { defineComponent, h, nextTick, ref } from "vue";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-vue";
import AeCurrencyField from "./AeCurrencyField.vue";
import { expectNoViolations } from "../../../test/axe.js";

describe("AeCurrencyField", () => {
  test("shows the symbol and two decimals (the reference test)", async () => {
    const { container } = await render(AeCurrencyField, { props: { label: "Amount", modelValue: 162.4 } });
    expect(container.querySelector(".ae-affix--pre")!.textContent).toBe("$");
    expect(container.querySelector("input")!.value).toBe("162.40");
  });

  test("is a spinbutton named by its label; the symbol is hidden from screen readers", async () => {
    const { container } = await render(AeCurrencyField, { props: { label: "Amount" } });
    await expect.element(page.getByRole("spinbutton", { name: "Amount" })).toBeVisible();
    expect(container.querySelector(".ae-affix--pre")!.getAttribute("aria-hidden")).toBe("true");
  });

  test("the symbol sits next to the value and a click on it focuses the input (the reference test)", async () => {
    const { container } = await render(AeCurrencyField, { props: { label: "Amount", modelValue: 100 } });
    const symbol = container.querySelector<HTMLElement>(".ae-affix--pre")!;
    const input = container.querySelector<HTMLInputElement>(".ae-numinput")!;
    expect(input.getBoundingClientRect().left - symbol.getBoundingClientRect().right).toBeLessThan(8);
    symbol.click();
    await nextTick();
    expect(document.activeElement).toBe(input);
  });

  test("currency and locale choose the symbol; the configured ones are the default", async () => {
    const eur = await render(AeCurrencyField, { props: { label: "A", currency: "EUR" } });
    expect(eur.container.querySelector(".ae-affix--pre")!.textContent).toBe("€");
    const gbp = await render(AeCurrencyField, { props: { label: "B", currency: "GBP", locale: "en-GB" } });
    expect(gbp.container.querySelector(".ae-affix--pre")!.textContent).toBe("£");
    const bad = await render(AeCurrencyField, { props: { label: "C", currency: "nope" } });
    expect(bad.container.querySelector(".ae-affix--pre")!.textContent).toBe("$");
  });

  test("prefix replaces the symbol", async () => {
    const { container } = await render(AeCurrencyField, { props: { label: "A", prefix: "USD" } });
    expect(container.querySelector(".ae-affix--pre")!.textContent).toBe("USD");
  });

  test("no negatives: the minimum is 0 and the value clamps to it", async () => {
    const model = ref<number | null>(0.5);
    await render(
      defineComponent({
        render: () =>
          h(AeCurrencyField, {
            label: "Amount",
            modelValue: model.value,
            "onUpdate:modelValue": (v: number | null) => (model.value = v),
          }),
      }),
    );
    const input = page.getByRole("spinbutton", { name: "Amount" });
    await input.fill("-5");
    await userEvent.keyboard("{Enter}");
    expect(model.value).toBe(0);
    await expect.element(page.getByRole("button", { name: "Decrease" })).toBeDisabled();
  });

  test("steps by a cent and v-model carries the number", async () => {
    const model = ref<number | null>(1);
    await render(
      defineComponent({
        render: () =>
          h(AeCurrencyField, {
            label: "Amount",
            modelValue: model.value,
            "onUpdate:modelValue": (v: number | null) => (model.value = v),
          }),
      }),
    );
    await page.getByRole("button", { name: "Increase" }).click();
    expect(model.value).toBe(1.01);
    await expect.element(page.getByRole("spinbutton", { name: "Amount" })).toHaveValue("1.01");
    model.value = 20;
    await nextTick();
    await expect.element(page.getByRole("spinbutton", { name: "Amount" })).toHaveValue("20.00");
  });

  test("min, max and step can be overridden", async () => {
    const { container } = await render(AeCurrencyField, {
      props: { label: "Tip", modelValue: 5, min: 1, max: 10, step: 1 },
    });
    const input = container.querySelector("input")!;
    expect(input.getAttribute("aria-valuemin")).toBe("1");
    expect(input.getAttribute("aria-valuemax")).toBe("10");
    expect(input.value).toBe("5");
  });

  test("name submits the number in a hidden field; other attributes reach the input", async () => {
    const { container } = await render(AeCurrencyField, {
      props: { label: "Amount", modelValue: 12.5, name: "amount" },
      attrs: { "data-test": "x", class: "mine" },
    });
    expect(container.querySelector<HTMLInputElement>("input[type=hidden]")!.value).toBe("12.5");
    expect(container.querySelector<HTMLInputElement>(".ae-numinput")!.dataset["test"]).toBe("x");
    expect((container.firstElementChild as HTMLElement).className).toContain("mine");
  });

  test("hint, error, required and disabled behave like a number field", async () => {
    const hinted = await render(AeCurrencyField, { props: { label: "A", hint: "Per visit", required: true } });
    expect(hinted.container.querySelector(".ae-field-hint")!.textContent).toBe("Per visit");
    expect(hinted.container.querySelector("input")!.required).toBe(true);
    const bad = await render(AeCurrencyField, { props: { label: "B", error: "Enter an amount" } });
    expect(bad.container.querySelector("input")!.getAttribute("aria-invalid")).toBe("true");
    const off = await render(AeCurrencyField, { props: { label: "C", disabled: true } });
    expect(off.container.querySelector("input")!.disabled).toBe(true);
  });

  test("has no accessibility violations: default, hinted, invalid, disabled", async () => {
    const { container } = await render(
      defineComponent({
        render: () =>
          h("div", [
            h(AeCurrencyField, { label: "Default", modelValue: 162.4 }),
            h(AeCurrencyField, { label: "Hinted", hint: "Per visit" }),
            h(AeCurrencyField, { label: "Invalid", error: "Enter an amount" }),
            h(AeCurrencyField, { label: "Disabled", disabled: true }),
          ]),
      }),
    );
    await expectNoViolations(container);
  });
});

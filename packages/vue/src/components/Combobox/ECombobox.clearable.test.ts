import { describe, expect, test } from "vitest";
import { userEvent } from "vitest/browser";
import { render } from "vitest-browser-vue";
import ECombobox from "./ECombobox.vue";

const clearButton = (c: Element) => c.querySelector<HTMLButtonElement>("button[aria-label='Clear']");

describe("ECombobox clearable and clear event", () => {
  test("is off by default, as in every field, and `clearable` shows the button while there is a value", async () => {
    const plain = await render(ECombobox, { props: { label: "City", options: ["Lyon"], modelValue: "Lyon" } });
    expect(clearButton(plain.container)).toBeNull();
    const on = await render(ECombobox, {
      props: { label: "Town", options: ["Nice"], modelValue: "Nice", clearable: true },
    });
    expect(clearButton(on.container)).not.toBeNull();
  });

  test("clearing with the button or Escape emits clear", async () => {
    let cleared = 0;
    const { container } = await render(ECombobox, {
      props: { label: "City", options: ["Lyon"], modelValue: "Lyon", clearable: true, onClear: () => cleared++ },
    });
    await userEvent.click(clearButton(container)!);
    expect(cleared).toBe(1);
    const input = container.querySelector("input")!;
    input.focus();
    await userEvent.type(input, "Ly");
    await userEvent.keyboard("{Escape}");
    await userEvent.keyboard("{Escape}");
    expect(cleared).toBe(2);
  });
});

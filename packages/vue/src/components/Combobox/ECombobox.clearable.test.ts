// In a file of its own: the deprecation warning is said once per page, so no other render may come first.
import { describe, expect, test, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { render } from "vitest-browser-vue";
import ECombobox from "./ECombobox.vue";

const clearButton = (c: Element) => c.querySelector<HTMLButtonElement>("button[aria-label='Clear']");

describe("ECombobox clearable default and clear event", () => {
  test("left out, the clear button still shows and a warning says once that the default becomes false", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    try {
      const said = () =>
        warn.mock.calls.filter(([m]) => String(m).includes("ECombobox will not show its clear button"));
      const first = await render(ECombobox, { props: { label: "City", options: ["Lyon"], modelValue: "Lyon" } });
      expect(clearButton(first.container)).not.toBeNull();
      await render(ECombobox, { props: { label: "Town", options: ["Nice"], modelValue: "Nice" } });
      expect(said()).toHaveLength(1);
      warn.mockClear();
      await render(ECombobox, { props: { label: "Port", options: ["Brest"], clearable: true } });
      expect(warn).not.toHaveBeenCalled();
    } finally {
      warn.mockRestore();
    }
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

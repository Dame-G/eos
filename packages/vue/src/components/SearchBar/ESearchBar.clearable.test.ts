// In a file of its own: the deprecation warning is said once per page, so no other render may come first.
import { describe, expect, test, vi } from "vitest";
import { render } from "vitest-browser-vue";
import ESearchBar from "./ESearchBar.vue";

describe("ESearchBar clearable default", () => {
  test("left out, the clear button still shows and a warning says once that the default becomes false", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    try {
      const said = () =>
        warn.mock.calls.filter(([m]) => String(m).includes("ESearchBar will not show its clear button"));
      const first = await render(ESearchBar, { props: { modelValue: "shoes" } });
      expect(first.container.querySelector(".e-input-btn, button[aria-label='Clear']")).not.toBeNull();
      await render(ESearchBar, { props: { modelValue: "hats" } });
      expect(said()).toHaveLength(1);
      warn.mockClear();
      const off = await render(ESearchBar, { props: { modelValue: "x", clearable: false } });
      expect(off.container.querySelector("button[aria-label='Clear']")).toBeNull();
      await render(ESearchBar, { props: { modelValue: "x", clearable: true } });
      expect(warn).not.toHaveBeenCalled();
    } finally {
      warn.mockRestore();
    }
  });
});

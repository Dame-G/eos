import { describe, expect, test } from "vitest";
import { render } from "vitest-browser-vue";
import ESearchBar from "./ESearchBar.vue";

describe("ESearchBar clearable", () => {
  test("is off by default, as in every field, and `clearable` shows the button while there is text", async () => {
    const plain = await render(ESearchBar, { props: { modelValue: "shoes" } });
    expect(plain.container.querySelector("button[aria-label='Clear']")).toBeNull();
    const on = await render(ESearchBar, { props: { modelValue: "hats", clearable: true } });
    expect(on.container.querySelector("button[aria-label='Clear']")).not.toBeNull();
  });
});

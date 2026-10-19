import { describe, expect, test } from "vitest";
import { defineComponent, h } from "vue";
import { page } from "vitest/browser";
import { render } from "vitest-browser-vue";
import EKbd from "./EKbd.vue";
import { expectNoViolations } from "../../../test/axe.js";

describe("EKbd", () => {
  test("is a kbd element with the key as its text", async () => {
    const { container } = await render(EKbd, { slots: { default: "Esc" } });
    const kbd = container.querySelector("kbd")!;
    expect(kbd.className).toBe("e-kbd");
    await expect.element(page.getByText("Esc")).toBeVisible();
  });

  test("is a bordered mono keycap, and small is smaller", async () => {
    const normal = await render(EKbd, { slots: { default: "/" } });
    const small = await render(EKbd, { props: { small: true }, slots: { default: "/" } });
    const a = getComputedStyle(normal.container.querySelector("kbd")!);
    const b = getComputedStyle(small.container.querySelector("kbd")!);
    expect(parseFloat(a.borderTopWidth)).toBeGreaterThan(0);
    expect(a.fontFamily).toBe(b.fontFamily);
    expect(parseFloat(b.fontSize)).toBeLessThan(parseFloat(a.fontSize));
    expect(small.container.querySelector("kbd")!.classList.contains("e-kbd--s")).toBe(true);
  });

  test("attributes fall through to the element", async () => {
    const { container } = await render(EKbd, {
      attrs: { "aria-hidden": "true", "data-testid": "k", class: "mine" },
      slots: { default: "/" },
    });
    const kbd = container.querySelector("kbd")!;
    expect(kbd.getAttribute("aria-hidden")).toBe("true");
    expect(kbd.getAttribute("data-testid")).toBe("k");
    expect(kbd.className).toBe("e-kbd mine");
  });

  test("has no accessibility violations", async () => {
    const { container } = await render(
      defineComponent({
        render: () =>
          h("p", ["Press ", h(EKbd, null, () => "/"), " to search, ", h(EKbd, { small: true }, () => "Esc")]),
      }),
    );
    await expectNoViolations(container);
  });
});

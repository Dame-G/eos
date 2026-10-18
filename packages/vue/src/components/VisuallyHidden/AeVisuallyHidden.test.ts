import { describe, expect, test } from "vitest";
import { defineComponent, h } from "vue";
import { page } from "vitest/browser";
import { render } from "vitest-browser-vue";
import AeVisuallyHidden from "./AeVisuallyHidden.vue";
import AeButton from "../Button/AeButton.vue";
import { expectNoViolations } from "../../../test/axe.js";

describe("AeVisuallyHidden", () => {
  test("is a span with the screen-reader-only class", async () => {
    const { container } = await render(AeVisuallyHidden, { slots: { default: "receipt 8842" } });
    expect(container.querySelector("span")!.className).toBe("ae-sr");
  });

  test("takes no visible space but its text is in the accessible name", async () => {
    const { container } = await render(
      defineComponent({
        render: () => h(AeButton, null, () => ["Download", h(AeVisuallyHidden, null, () => " receipt 8842")]),
      }),
    );
    const sr = container.querySelector(".ae-sr")!;
    const box = sr.getBoundingClientRect();
    expect(box.width).toBeLessThanOrEqual(1);
    expect(box.height).toBeLessThanOrEqual(1);
    await expect.element(page.getByRole("button", { name: "Download receipt 8842" })).toBeInTheDocument();
  });

  test("as changes the element", async () => {
    const { container } = await render(AeVisuallyHidden, { props: { as: "div" }, slots: { default: "Hidden" } });
    expect(container.querySelector("div.ae-sr")).not.toBeNull();
  });

  test("attributes fall through to the element", async () => {
    const { container } = await render(AeVisuallyHidden, {
      attrs: { id: "v1", "data-testid": "v" },
      slots: { default: "Hidden" },
    });
    const el = container.querySelector(".ae-sr")!;
    expect(el.id).toBe("v1");
    expect(el.getAttribute("data-testid")).toBe("v");
  });

  test("has no accessibility violations", async () => {
    const { container } = await render(
      defineComponent({
        render: () => h("p", ["Step 1", h(AeVisuallyHidden, null, () => " (done)")]),
      }),
    );
    await expectNoViolations(container);
  });
});

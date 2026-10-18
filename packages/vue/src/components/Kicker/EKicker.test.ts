import { describe, expect, test } from "vitest";
import { defineComponent, h } from "vue";
import { page } from "vitest/browser";
import { render } from "vitest-browser-vue";
import EKicker from "./EKicker.vue";
import { expectNoViolations } from "../../../test/axe.js";

describe("EKicker", () => {
  test("is a paragraph with the kicker class", async () => {
    const { container } = await render(EKicker, { slots: { default: "Balance" } });
    const p = container.querySelector("p")!;
    expect(p.className).toBe("e-kicker");
    await expect.element(page.getByText("Balance")).toBeVisible();
  });

  test("is small uppercase mono text, and is not a heading", async () => {
    const { container } = await render(EKicker, { slots: { default: "Balance" } });
    const style = getComputedStyle(container.querySelector("p")!);
    expect(style.textTransform).toBe("uppercase");
    expect(style.fontWeight).toBe("600");
    expect(page.getByRole("heading").elements().length).toBe(0);
  });

  test("as changes the element", async () => {
    const { container } = await render(EKicker, { props: { as: "span" }, slots: { default: "Balance" } });
    expect(container.querySelector("span.e-kicker")).not.toBeNull();
    expect(container.querySelector("p")).toBeNull();
  });

  test("attributes fall through to the element", async () => {
    const { container } = await render(EKicker, {
      attrs: { id: "k1", "data-testid": "k", class: "mine" },
      slots: { default: "Balance" },
    });
    const p = container.querySelector("p")!;
    expect(p.id).toBe("k1");
    expect(p.getAttribute("data-testid")).toBe("k");
    expect(p.className).toBe("e-kicker mine");
  });

  test("has no accessibility violations", async () => {
    const { container } = await render(
      defineComponent({
        render: () => h("div", [h(EKicker, null, () => "Balance"), h(EKicker, { as: "span" }, () => "Due")]),
      }),
    );
    await expectNoViolations(container);
  });
});

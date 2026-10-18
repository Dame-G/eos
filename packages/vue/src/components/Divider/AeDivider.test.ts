import { describe, expect, test } from "vitest";
import { defineComponent, h } from "vue";
import { page } from "vitest/browser";
import { render } from "vitest-browser-vue";
import AeDivider from "./AeDivider.vue";
import { expectNoViolations } from "../../../test/axe.js";

describe("AeDivider", () => {
  test("is a horizontal rule by default", async () => {
    const { container } = await render(AeDivider);
    const hr = container.querySelector("hr")!;
    expect(hr.className).toBe("ae-divider");
    await expect.element(page.getByRole("separator")).toBeInTheDocument();
  });

  test("is a one pixel hairline", async () => {
    const { container } = await render(AeDivider);
    const style = getComputedStyle(container.querySelector("hr")!);
    expect(style.borderTopStyle).toBe("solid");
    expect(style.borderTopWidth).toBe("1px");
    expect(container.querySelector("hr")!.getBoundingClientRect().height).toBe(1);
  });

  test("a label sits in a kicker between two rules", async () => {
    const { container } = await render(AeDivider, { props: { label: "Or" } });
    const el = container.querySelector(".ae-divider-label")!;
    expect(el.getAttribute("role")).toBe("separator");
    expect(el.querySelector(".ae-kicker")!.textContent).toBe("Or");
    expect(container.querySelector("hr")).toBeNull();
    expect(getComputedStyle(el, "::before").content).toBe('""');
    expect(getComputedStyle(el, "::after").content).toBe('""');
    expect(getComputedStyle(el).display).toBe("flex");
  });

  test("attributes fall through to the root, in both forms", async () => {
    const plain = await render(AeDivider, { attrs: { "data-testid": "d" } });
    expect(plain.container.querySelector("hr")!.getAttribute("data-testid")).toBe("d");
    const labelled = await render(AeDivider, { props: { label: "Or" }, attrs: { "data-testid": "l" } });
    expect(labelled.container.querySelector(".ae-divider-label")!.getAttribute("data-testid")).toBe("l");
  });

  test("has no accessibility violations in either form", async () => {
    const { container } = await render(
      defineComponent({
        render: () => h("div", [h(AeDivider), h(AeDivider, { label: "Or" })]),
      }),
    );
    await expectNoViolations(container);
  });
});

import { describe, expect, test } from "vitest";
import { defineComponent, h } from "vue";
import { page } from "vitest/browser";
import { render } from "vitest-browser-vue";
import EDivider from "./EDivider.vue";
import { expectNoViolations } from "../../../test/axe.js";

describe("EDivider", () => {
  test("is a horizontal rule by default", async () => {
    const { container } = await render(EDivider);
    const hr = container.querySelector("hr")!;
    expect(hr.className).toBe("e-divider");
    await expect.element(page.getByRole("separator")).toBeInTheDocument();
  });

  test("is a one pixel hairline", async () => {
    const { container } = await render(EDivider);
    const style = getComputedStyle(container.querySelector("hr")!);
    expect(style.borderTopStyle).toBe("solid");
    expect(style.borderTopWidth).toBe("1px");
    expect(container.querySelector("hr")!.getBoundingClientRect().height).toBe(1);
  });

  test("a label sits in a kicker between two rules", async () => {
    const { container } = await render(EDivider, { props: { label: "Or" } });
    const el = container.querySelector(".e-divider-label")!;
    expect(el.getAttribute("role")).toBe("separator");
    expect(el.querySelector(".e-kicker")!.textContent).toBe("Or");
    expect(container.querySelector("hr")).toBeNull();
    expect(getComputedStyle(el, "::before").content).toBe('""');
    expect(getComputedStyle(el, "::after").content).toBe('""');
    expect(getComputedStyle(el).display).toBe("flex");
  });

  test("a labelled divider is a separator named by its label", async () => {
    await render(EDivider, { props: { label: "Or" } });
    await expect.element(page.getByRole("separator", { name: "Or" })).toBeInTheDocument();
  });

  test("vertical is a vertical separator that stretches across a row", async () => {
    const { container } = await render(
      defineComponent({
        render: () =>
          h("div", { style: { display: "flex", height: "60px" } }, [
            h("span", "a"),
            h(EDivider, { vertical: true }),
            h("span", "b"),
          ]),
      }),
    );
    const hr = container.querySelector("hr")!;
    expect(hr.getAttribute("aria-orientation")).toBe("vertical");
    expect(hr.getBoundingClientRect().height).toBe(60);
    expect(hr.getBoundingClientRect().width).toBeLessThanOrEqual(1);
    expect(getComputedStyle(hr).borderInlineStartStyle).toBe("solid");
  });

  test("attributes fall through to the root, in both forms", async () => {
    const plain = await render(EDivider, { attrs: { "data-testid": "d" } });
    expect(plain.container.querySelector("hr")!.getAttribute("data-testid")).toBe("d");
    const labelled = await render(EDivider, { props: { label: "Or" }, attrs: { "data-testid": "l" } });
    expect(labelled.container.querySelector(".e-divider-label")!.getAttribute("data-testid")).toBe("l");
  });

  test("has no accessibility violations in either form", async () => {
    const { container } = await render(
      defineComponent({
        render: () => h("div", [h(EDivider), h(EDivider, { label: "Or" })]),
      }),
    );
    await expectNoViolations(container);
  });
});

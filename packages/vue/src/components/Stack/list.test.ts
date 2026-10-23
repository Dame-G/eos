import { describe, expect, test } from "vitest";
import { h, type Component } from "vue";
import { render } from "vitest-browser-vue";
import EStack from "./EStack.vue";
import EInline from "../Inline/EInline.vue";
import EGrid from "../Grid/EGrid.vue";
import { expectNoViolations } from "../../../test/axe.js";

const items = () => [h("li", "One"), h("li", "Two")];
const layouts: [string, Component][] = [
  ["EStack", EStack],
  ["EInline", EInline],
  ["EGrid", EGrid],
];

// Safari drops the list role of a list without bullets, so every layout that removes them gives the role back.
describe.each(layouts)("%s as a list", (_, Layout) => {
  test.each(["ul", "ol"])("as=%s loses the bullets and padding and keeps the list role", async (as) => {
    const { container } = await render(Layout, { props: { as }, slots: { default: items } });
    const list = container.firstElementChild as HTMLElement;
    expect(list.tagName.toLowerCase()).toBe(as);
    expect(list.getAttribute("role")).toBe("list");
    const style = getComputedStyle(list);
    expect(style.listStyleType).toBe("none");
    expect(style.paddingInlineStart).toBe("0px");
    expect(style.marginBlockStart).toBe("0px");
    await expectNoViolations(container);
  });

  test("any other element gets no role", async () => {
    const { container } = await render(Layout, { props: { as: "section" }, slots: { default: () => "x" } });
    expect(container.firstElementChild!.hasAttribute("role")).toBe(false);
  });
});

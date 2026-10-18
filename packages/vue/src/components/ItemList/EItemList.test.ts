import { describe, expect, test } from "vitest";
import { defineComponent, h } from "vue";
import { page } from "vitest/browser";
import { render } from "vitest-browser-vue";
import EItemList from "./EItemList.vue";
import EItemRow from "../ItemRow/EItemRow.vue";
import EButton from "../Button/EButton.vue";
import { expectNoViolations } from "../../../test/axe.js";

const rows = () => [
  h(EItemRow, { title: "Intake form", status: "action" }, { action: () => h(EButton, null, () => "Sign") }),
  h(EItemRow, { title: "Receipt", status: "paid" }),
  h(EItemRow, { title: "Consent", status: "signed" }),
];
const list = (width = 720) =>
  render(defineComponent({ render: () => h("div", { style: { width: `${width}px` } }, [h(EItemList, null, rows)]) }));

describe("EItemList", () => {
  test("is a list of rows: role list, one listitem per row", async () => {
    const { container } = await list();
    const grid = container.querySelector(".e-items > .e-items-grid")!;
    expect(grid.getAttribute("role")).toBe("list");
    expect(page.getByRole("list").elements()).toHaveLength(1);
    expect(page.getByRole("listitem").elements()).toHaveLength(3);
    expect(grid.querySelectorAll(":scope > .e-item")).toHaveLength(3);
  });

  test("lists are decided by their own width: four columns wide, three narrow", async () => {
    const wide = await list(720);
    const cols = (c: Element) =>
      getComputedStyle(c.querySelector(".e-items-grid")!).gridTemplateColumns.split(" ").length;
    expect(cols(wide.container)).toBe(4);
    const narrow = await list(320);
    expect(cols(narrow.container)).toBe(3);
  });

  test("is a size container, so the screen width does not matter", async () => {
    const { container } = await list();
    expect(getComputedStyle(container.querySelector(".e-items")!).containerType).toBe("inline-size");
  });

  test("rows are separated by hairlines, none above the first", async () => {
    const { container } = await list();
    const items = [...container.querySelectorAll<HTMLElement>(".e-item")];
    expect(getComputedStyle(items[0]!).borderTopWidth).toBe("0px");
    expect(parseFloat(getComputedStyle(items[1]!).borderTopWidth)).toBeGreaterThan(0);
  });

  test("class and data attributes fall through to the list", async () => {
    const { container } = await render(EItemList, {
      attrs: { class: "mine", "data-x": "1" },
      slots: { default: rows },
    });
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toBe("e-items mine");
    expect(root.dataset.x).toBe("1");
  });

  test("axe", async () => {
    const { container } = await list();
    await expectNoViolations(container);
  });
});

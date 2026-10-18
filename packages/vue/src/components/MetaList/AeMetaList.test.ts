import { describe, expect, test } from "vitest";
import { defineComponent, h } from "vue";
import { page } from "vitest/browser";
import { render } from "vitest-browser-vue";
import AeMetaList from "./AeMetaList.vue";
import { expectNoViolations } from "../../../test/axe.js";

const items = [
  { icon: "calendar", text: "Thursday, October 22 at 9:30 am" },
  { icon: "map-pin", text: "Main office" },
  { text: "No icon here" },
];

describe("AeMetaList", () => {
  test("is a list with one item per fact, each with its icon and text in a span", async () => {
    const { container } = await render(AeMetaList, { props: { items } });
    const lis = container.querySelectorAll("ul.ae-meta > li");
    expect(lis.length).toBe(3);
    expect(lis[0]!.querySelector("svg.ae-icon")).not.toBeNull();
    expect(lis[0]!.querySelector("span")!.textContent).toBe("Thursday, October 22 at 9:30 am");
    expect(lis[2]!.querySelector("svg")).toBeNull();
    await expect.element(page.getByRole("list")).toBeVisible();
    expect(page.getByRole("listitem").elements().length).toBe(3);
  });

  test("null items are skipped", async () => {
    const { container } = await render(AeMetaList, { props: { items: [null, { text: "One" }, undefined] } });
    expect(container.querySelectorAll("li").length).toBe(1);
  });

  test("the icon is decoration, so the item's accessible text is its words only", async () => {
    await render(AeMetaList, { props: { items: [{ icon: "phone", text: "Call 555 0100" }] } });
    await expect.element(page.getByRole("listitem")).toHaveTextContent("Call 555 0100");
  });

  test("text can be a rendered node", async () => {
    const { container } = await render(AeMetaList, {
      props: { items: [{ text: h("a", { href: "#x" }, "Directions") }] },
    });
    expect(container.querySelector("li span a")!.textContent).toBe("Directions");
  });

  test("class, style and attributes fall through to the list", async () => {
    const { container } = await render(AeMetaList, {
      props: { items },
      attrs: { class: "mine", style: "margin-top: 4px", "aria-label": "Visit details" },
    });
    const el = container.querySelector("ul")!;
    expect(el.classList.contains("mine")).toBe(true);
    expect(el.style.marginTop).toBe("4px");
    await expect.element(page.getByRole("list", { name: "Visit details" })).toBeVisible();
  });

  test("has no accessibility violations", async () => {
    const { container } = await render(
      defineComponent({
        render: () => h("div", [h(AeMetaList, { items }), h(AeMetaList, { items: [] })]),
      }),
    );
    await expectNoViolations(container);
  });
});

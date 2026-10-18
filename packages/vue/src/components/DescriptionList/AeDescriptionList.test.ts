import { describe, expect, test } from "vitest";
import { defineComponent, h } from "vue";
import { page } from "vitest/browser";
import { render } from "vitest-browser-vue";
import AeDescriptionList from "./AeDescriptionList.vue";
import { expectNoViolations } from "../../../test/axe.js";

const items = [
  { label: "Covers", text: "Visit on September 12" },
  { label: "Due", text: "October 31" },
];

describe("AeDescriptionList", () => {
  test("renders a real description list with a term and a description per row", async () => {
    const { container } = await render(AeDescriptionList, { props: { items } });
    const dl = container.querySelector("dl.ae-facts")!;
    const rows = dl.querySelectorAll(":scope > .ae-fact");
    expect(rows.length).toBe(2);
    expect(rows[0]!.querySelector("dt.ae-kicker")!.textContent).toBe("Covers");
    expect(rows[0]!.querySelector("dd.ae-fact-text")!.textContent).toBe("Visit on September 12");
  });

  test("text can be a rendered node", async () => {
    const { container } = await render(AeDescriptionList, {
      props: { items: [{ label: "Pay", text: h("a", { href: "#pay" }, "Online") }] },
    });
    expect(container.querySelector("dd a")!.textContent).toBe("Online");
  });

  test("the label sits beside the text when wide and stacks above it below 26rem", async () => {
    const wide = await render(
      defineComponent({ render: () => h("div", { style: { width: "500px" } }, [h(AeDescriptionList, { items })]) }),
    );
    const dt = wide.container.querySelector("dt")!.getBoundingClientRect();
    const dd = wide.container.querySelector("dd")!.getBoundingClientRect();
    expect(dd.left).toBeGreaterThan(dt.right - 1);

    await page.viewport(375, 700);
    try {
      const narrow = await render(AeDescriptionList, { props: { items: [{ label: "Covers", text: "Visit" }] } });
      const dt2 = narrow.container.querySelector("dt")!.getBoundingClientRect();
      const dd2 = narrow.container.querySelector("dd")!.getBoundingClientRect();
      expect(dd2.top).toBeGreaterThan(dt2.bottom - 1);
    } finally {
      await page.viewport(1024, 768);
    }
  });

  test("class, style and attributes fall through to the list", async () => {
    const { container } = await render(AeDescriptionList, {
      props: { items },
      attrs: { class: "mine", style: "margin-top: 4px", "data-x": "1" },
    });
    const dl = container.querySelector("dl")!;
    expect(dl.classList.contains("mine")).toBe(true);
    expect(dl.classList.contains("ae-facts")).toBe(true);
    expect(dl.style.marginTop).toBe("4px");
    expect(dl.dataset.x).toBe("1");
  });

  test("has no accessibility violations", async () => {
    const { container } = await render(
      defineComponent({
        render: () => h("div", [h(AeDescriptionList, { items }), h(AeDescriptionList, { items: [] })]),
      }),
    );
    await expectNoViolations(container);
  });
});

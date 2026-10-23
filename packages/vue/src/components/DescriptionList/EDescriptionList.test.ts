import { describe, expect, test, vi } from "vitest";
import { defineComponent, h } from "vue";
import { page } from "vitest/browser";
import { render } from "vitest-browser-vue";
import EDescriptionList from "./EDescriptionList.vue";
import { expectNoViolations } from "../../../test/axe.js";

const items = [
  { label: "Covers", text: "Visit on September 12" },
  { label: "Due", text: "October 31" },
];

describe("EDescriptionList", () => {
  test("renders a real description list with a term and a description per row", async () => {
    const { container } = await render(EDescriptionList, { props: { items } });
    const dl = container.querySelector("dl.e-facts")!;
    const rows = dl.querySelectorAll(":scope > .e-fact");
    expect(rows.length).toBe(2);
    expect(rows[0]!.querySelector("dt.e-kicker")!.textContent).toBe("Covers");
    expect(rows[0]!.querySelector("dd.e-fact-text")!.textContent).toBe("Visit on September 12");
  });

  test("text can be a rendered node", async () => {
    const { container } = await render(EDescriptionList, {
      props: { items: [{ label: "Pay", text: h("a", { href: "#pay" }, "Online") }] },
    });
    expect(container.querySelector("dd a")!.textContent).toBe("Online");
  });

  test("the label sits beside the text when wide and stacks above it below 26rem", async () => {
    const wide = await render(
      defineComponent({ render: () => h("div", { style: { width: "500px" } }, [h(EDescriptionList, { items })]) }),
    );
    const dt = wide.container.querySelector("dt")!.getBoundingClientRect();
    const dd = wide.container.querySelector("dd")!.getBoundingClientRect();
    expect(dd.left).toBeGreaterThan(dt.right - 1);

    await page.viewport(375, 700);
    try {
      const narrow = await render(EDescriptionList, { props: { items: [{ label: "Covers", text: "Visit" }] } });
      const dt2 = narrow.container.querySelector("dt")!.getBoundingClientRect();
      const dd2 = narrow.container.querySelector("dd")!.getBoundingClientRect();
      expect(dd2.top).toBeGreaterThan(dt2.bottom - 1);
    } finally {
      await page.viewport(1024, 768);
    }
  });

  test("icon, stamp and Edit button sit on the row; Edit emits the item", async () => {
    const seen: string[] = [];
    const { container } = await render(EDescriptionList, {
      props: {
        items: [
          { label: "Email", text: "a@b.co", icon: "mail", stamp: "Verified", stampTone: "success", editable: true },
        ],
        onEdit: (item: { label?: string }) => seen.push(item.label ?? ""),
      },
    });
    expect(container.querySelector("dt .e-icon")).not.toBeNull();
    expect(container.querySelector("dd .e-stamp")!.textContent).toBe("Verified");
    await page.getByRole("button", { name: "Edit Email" }).click();
    expect(seen).toEqual(["Email"]);
  });

  test("the older badge and badgeTone still give the stamp, and warn that they are deprecated", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    try {
      const stamp = await render(EDescriptionList, {
        props: { items: [{ label: "Email", text: "a@b.co", stamp: "Verified", stampTone: "success" }] },
      });
      const badge = await render(EDescriptionList, {
        props: { items: [{ label: "Email", text: "a@b.co", badge: "Verified", badgeTone: "success" }] },
      });
      expect(badge.container.querySelector("dd .e-stamp")!.outerHTML).toBe(
        stamp.container.querySelector("dd .e-stamp")!.outerHTML,
      );
      expect(warn).toHaveBeenCalledWith(
        "[eos] EDescriptionList item `badge` and `badgeTone` are deprecated. Use `stamp` and `stampTone`.",
      );
    } finally {
      warn.mockRestore();
    }
  });

  test("the action slot renders at the end of every row", async () => {
    const { container } = await render(EDescriptionList, {
      props: { items },
      slots: {
        action: ({ item }: { item: { label?: string } }) => h("button", { type: "button" }, `Go ${item.label}`),
      },
    });
    expect(container.querySelectorAll("dd button").length).toBe(2);
  });

  test("with no labels it is a plain list of facts", async () => {
    const { container } = await render(EDescriptionList, {
      props: { items: [{ text: "One", icon: "mail" }, null, { text: "Two" }] },
    });
    expect(container.querySelectorAll("ul.e-facts > li").length).toBe(2);
    expect(container.querySelector("dl")).toBeNull();
  });

  test("class, style and attributes fall through to the list", async () => {
    const { container } = await render(EDescriptionList, {
      props: { items },
      attrs: { class: "mine", style: "margin-top: 4px", "data-x": "1" },
    });
    const dl = container.querySelector("dl")!;
    expect(dl.classList.contains("mine")).toBe(true);
    expect(dl.classList.contains("e-facts")).toBe(true);
    expect(dl.style.marginTop).toBe("4px");
    expect(dl.dataset.x).toBe("1");
  });

  test("has no accessibility violations", async () => {
    const { container } = await render(
      defineComponent({
        render: () => h("div", [h(EDescriptionList, { items }), h(EDescriptionList, { items: [] })]),
      }),
    );
    await expectNoViolations(container);
  });
});

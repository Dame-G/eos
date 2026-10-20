import { describe, expect, test } from "vitest";
import { defineComponent, h } from "vue";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-vue";
import EExpandableRow from "./EExpandableRow.vue";
import EButton from "../Button/EButton.vue";
import { expectNoViolations } from "../../../test/axe.js";

const text = (el: Element | null) => (el?.textContent ?? "").trim();
const slots = {
  leading: () => h("span", { class: "lead" }, "L"),
  trailing: () => "$5.00",
  default: () => h("p", { class: "inside" }, "Body text"),
  actions: () => h(EButton, null, () => "Download"),
};

describe("EExpandableRow", () => {
  test("is a native details whose summary holds leading, title, subtitle and trailing", async () => {
    const { container } = await render(EExpandableRow, { props: { title: "Row", subtitle: "Sub" }, slots });
    const row = container.querySelector<HTMLDetailsElement>("details.e-xrow")!;
    expect(row.open).toBe(false);
    const summary = row.querySelector("summary")!;
    expect(summary.querySelector(".e-xrow-lead .lead")).not.toBeNull();
    expect(text(summary.querySelector(".e-xrow-title"))).toBe("Row");
    expect(text(summary.querySelector(".e-xrow-sub"))).toBe("Sub");
    expect(text(summary.querySelector(".e-xrow-trail"))).toBe("$5.00");
  });

  test("the body is hidden until opened", async () => {
    const { container } = await render(EExpandableRow, { props: { title: "Row" }, slots });
    const body = page.getByText("Body text");
    await expect.element(body).not.toBeVisible();
    container.querySelector("summary")!.click();
    await expect.poll(() => container.querySelector<HTMLDetailsElement>("details")!.open).toBe(true);
    await expect.element(body).toBeVisible();
  });

  test("keyboard: Tab focuses the summary; Enter and Space toggle it", async () => {
    const { container } = await render(EExpandableRow, { props: { title: "Row" }, slots });
    const row = container.querySelector<HTMLDetailsElement>("details")!;
    await userEvent.tab();
    expect(document.activeElement).toBe(row.querySelector("summary"));
    await userEvent.keyboard("{Enter}");
    await expect.poll(() => row.open).toBe(true);
    await userEvent.keyboard(" ");
    await expect.poll(() => row.open).toBe(false);
  });

  test("optional parts are left out when not given", async () => {
    const { container } = await render(EExpandableRow, { props: { title: "Bare" }, attrs: { open: true } });
    expect(container.querySelector(".e-xrow-lead")).toBeNull();
    expect(container.querySelector(".e-xrow-sub")).toBeNull();
    expect(container.querySelector(".e-xrow-trail")).toBeNull();
    expect(container.querySelector(".e-xrow-content")).toBeNull();
    expect(container.querySelector(".e-actions")).toBeNull();
  });

  test("the actions bar closes the row at its foot, with the rounded corners", async () => {
    const { container } = await render(EExpandableRow, { props: { title: "Row" }, slots, attrs: { open: true } });
    const bar = container.querySelector<HTMLElement>(".e-xrow-body > .e-actions--bar")!;
    expect(Math.round(bar.getBoundingClientRect().bottom)).toBe(
      Math.round(container.querySelector(".e-xrow")!.getBoundingClientRect().bottom),
    );
    expect(parseFloat(getComputedStyle(bar).borderEndStartRadius)).toBeGreaterThan(0);
  });

  test("class, id, data attributes, open and name fall through to the details", async () => {
    const { container } = await render(EExpandableRow, {
      props: { title: "Row" },
      attrs: { class: "mine", id: "r1", "data-x": "1", open: true, name: "grp" },
    });
    const row = container.querySelector<HTMLDetailsElement>("details")!;
    expect(row.className).toBe("e-xrow mine");
    expect(row.id).toBe("r1");
    expect(row.dataset.x).toBe("1");
    expect(row.open).toBe(true);
    expect(row.name).toBe("grp");
  });

  test("rows in a list share their title and trailing columns when the lead width is set", async () => {
    const { container } = await render(
      defineComponent({
        render: () =>
          h("div", { style: { width: "720px", "--e-xrow-lead": "8rem" } }, [
            h(EExpandableRow, { title: "A" }, { leading: () => "x", trailing: () => "5" }),
            h(EExpandableRow, { title: "B longer title" }, { leading: () => "xxxxxx", trailing: () => "12345.67" }),
          ]),
      }),
    );
    const titles = [...container.querySelectorAll(".e-xrow-title")].map((s) =>
      Math.round(s.getBoundingClientRect().left),
    );
    expect(new Set(titles).size).toBe(1);
    const trails = [...container.querySelectorAll(".e-xrow-trail")].map((s) =>
      Math.round(s.getBoundingClientRect().right),
    );
    expect(new Set(trails).size).toBe(1);
  });

  test("axe: closed and open", async () => {
    const { container } = await render(EExpandableRow, { props: { title: "Row", subtitle: "Sub" }, slots });
    await expectNoViolations(container);
    container.querySelector<HTMLDetailsElement>("details")!.open = true;
    await expectNoViolations(container);
  });
});

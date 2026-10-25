import { describe, expect, test } from "vitest";
import { defineComponent, h, ref } from "vue";
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
  test("a chevron after the value shows whether it is open, and turns when it opens", async () => {
    const { container } = await render(EExpandableRow, { props: { title: "Lab work" }, slots });
    const chevron = container.querySelector(".e-xrow-end > .e-details-chevron")!;
    expect(chevron.classList.contains("e-icon")).toBe(true);
    expect(chevron.previousElementSibling?.classList.contains("e-xrow-trail")).toBe(true);
    const closed = getComputedStyle(chevron).transform;
    await page.getByText("Lab work").click();
    await expect.poll(() => getComputedStyle(chevron).transform).not.toBe(closed);
  });

  test("the summary is the same height open and closed", async () => {
    const { container } = await render(EExpandableRow, { props: { title: "Visit" }, slots });
    container.classList.add("e-root");
    const details = container.querySelector("details")!;
    const summary = details.querySelector("summary")!;
    const closed = summary.getBoundingClientRect().height;
    details.open = true;
    await new Promise((resolve) => setTimeout(resolve, 400));
    expect(summary.getBoundingClientRect().height).toBe(closed);
  });

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
    const row = container.querySelector(".e-xrow")!;
    // The row is a bordered box: the bar fills it down to the border.
    expect(Math.round(bar.getBoundingClientRect().bottom + parseFloat(getComputedStyle(row).borderBottomWidth))).toBe(
      Math.round(row.getBoundingClientRect().bottom),
    );
    expect(parseFloat(getComputedStyle(bar).borderEndStartRadius)).toBeGreaterThan(0);
  });

  test("class, id and data attributes fall through to the details; open and group are props", async () => {
    const { container } = await render(EExpandableRow, {
      props: { title: "Row", open: true, group: "grp" },
      attrs: { class: "mine", id: "r1", "data-x": "1" },
    });
    const row = container.querySelector<HTMLDetailsElement>("details")!;
    expect(row.className).toBe("e-xrow mine");
    expect(row.id).toBe("r1");
    expect(row.dataset.x).toBe("1");
    expect(row.open).toBe(true);
    expect(row.name).toBe("grp");
  });

  test("v-model:open follows the row both ways", async () => {
    const open = ref(false);
    const { container } = await render(
      defineComponent({
        render: () =>
          h(
            EExpandableRow,
            { title: "Row", open: open.value, "onUpdate:open": (v?: boolean) => (open.value = !!v) },
            slots,
          ),
      }),
    );
    const row = container.querySelector<HTMLDetailsElement>("details")!;
    await page.getByText("Row").click();
    await expect.poll(() => open.value).toBe(true);
    open.value = false;
    await expect.poll(() => row.open).toBe(false);
  });

  test("rows with the same group open one at a time", async () => {
    const { container } = await render(
      defineComponent({
        render: () =>
          h("div", [
            h(EExpandableRow, { title: "One", group: "g" }, slots),
            h(EExpandableRow, { title: "Two", group: "g" }, slots),
          ]),
      }),
    );
    const rows = [...container.querySelectorAll<HTMLDetailsElement>("details")];
    rows[0]!.open = true;
    await expect.poll(() => rows[0]!.open).toBe(true);
    rows[1]!.open = true;
    await expect.poll(() => rows[0]!.open).toBe(false);
  });

  test("the summary holds phrasing content only", async () => {
    const { container } = await render(EExpandableRow, { props: { title: "Row", subtitle: "Sub" }, slots });
    expect(container.querySelector("summary div, summary p")).toBeNull();
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

  test("disabled keeps the row as it is and ignores the click and the keys", async () => {
    const { container } = await render(EExpandableRow, { props: { title: "Row", disabled: true }, slots });
    container.classList.add("e-root");
    const row = container.querySelector<HTMLDetailsElement>("details")!;
    const summary = container.querySelector("summary")!;
    expect(summary.getAttribute("aria-disabled")).toBe("true");
    expect(getComputedStyle(summary).cursor).toBe("not-allowed");
    await userEvent.click(summary);
    await userEvent.keyboard("{Enter}");
    expect(row.open).toBe(false);
  });

  test("the row has an even border all round and the slab under it, flat when open", async () => {
    const { container } = await render(EExpandableRow, { props: { title: "Row" }, slots });
    container.classList.add("e-root");
    const row = container.querySelector<HTMLDetailsElement>("details")!;
    const closed = getComputedStyle(row);
    expect(closed.borderTopWidth).toBe(closed.borderLeftWidth);
    expect(parseFloat(closed.borderBottomWidth)).toBeGreaterThan(parseFloat(closed.borderTopWidth));
    expect(closed.backgroundImage).toBe("none");
    row.open = true;
    await expect.poll(() => getComputedStyle(row).borderBottomWidth).toBe(getComputedStyle(row).borderTopWidth);
  });
});

describe("EExpandableRow corners", () => {
  test.each(["", "2px", "14px"])("summary and body corners are the row's less its border (md %s)", async (md) => {
    const { container } = await render(EExpandableRow, { props: { title: "Visit" }, slots });
    container.classList.add("e-root");
    if (md) container.style.setProperty("--e-radius-md", md);
    const details = container.querySelector("details")!;
    const r = (el: Element, c: string) => parseFloat((getComputedStyle(el) as unknown as Record<string, string>)[c]!);
    const row = getComputedStyle(details);
    const outer = parseFloat(row.borderTopLeftRadius);
    const edge = parseFloat(row.borderTopWidth);
    const lift = parseFloat(row.borderBottomWidth) - edge;
    const close = (a: number, b: number) => expect(Math.abs(a - Math.max(0, b))).toBeLessThan(0.5);
    const summary = details.querySelector("summary")!;
    close(r(summary, "borderTopLeftRadius"), outer - edge);
    close(r(summary, "borderBottomLeftRadius"), outer - edge - lift);
    details.open = true;
    await new Promise((resolve) => setTimeout(resolve, 400));
    close(r(details.querySelector(".e-xrow-body")!, "borderBottomLeftRadius"), outer - edge);
  });
});

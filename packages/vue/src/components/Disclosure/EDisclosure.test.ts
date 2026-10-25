import { describe, expect, test } from "vitest";
import { defineComponent, h, nextTick, ref } from "vue";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-vue";
import EDisclosure from "./EDisclosure.vue";
import { expectNoViolations } from "../../../test/axe.js";

describe("EDisclosure", () => {
  test("is a native details with a summary, closed by default", async () => {
    const { container } = await render(EDisclosure, { props: { title: "History" }, slots: { default: "Body" } });
    const details = container.querySelector("details")!;
    expect(details.className).toBe("e-disclosure e-details");
    expect(details.open).toBe(false);
    expect(details.querySelector("summary")!.textContent).toBe("History");
    expect(details.querySelector(".e-details-body")!.textContent).toBe("Body");
  });

  test("pressing the summary does not select text (a double click on it selects nothing)", async () => {
    const { container } = await render(EDisclosure, { props: { title: "History" }, slots: { default: "Body" } });
    container.classList.add("e-root");
    expect(getComputedStyle(container.querySelector("summary")!).userSelect).toBe("none");
  });

  test("its only border is a straight line along the top, with square ends", async () => {
    const { container } = await render(EDisclosure, { props: { title: "History" }, slots: { default: "Body" } });
    container.classList.add("e-root");
    const style = getComputedStyle(container.querySelector("summary")!);
    expect(style.borderTopWidth).not.toBe("0px");
    expect(style.borderBottomWidth).toBe("0px");
    expect(style.borderLeftWidth).toBe("0px");
    expect(parseFloat(style.borderTopLeftRadius)).toBe(0);
    expect(parseFloat(style.borderTopRightRadius)).toBe(0);
  });

  test("the title sits in the middle of its summary, closed and open, so its focus ring is even", async () => {
    const { container } = await render(EDisclosure, { props: { title: "History" }, slots: { default: "Body" } });
    container.classList.add("e-root");
    const details = container.querySelector("details")!;
    const summary = details.querySelector("summary")!;
    const gaps = () => {
      const range = document.createRange();
      range.selectNodeContents(
        [...summary.childNodes].find((n) => n.nodeType === Node.TEXT_NODE && n.textContent!.trim())!,
      );
      const text = range.getBoundingClientRect();
      const box = summary.getBoundingClientRect();
      return { above: text.top - box.top, below: box.bottom - text.bottom };
    };
    const heights: number[] = [];
    for (const open of [false, true]) {
      details.open = open;
      await new Promise((resolve) => setTimeout(resolve, 400));
      const { above, below } = gaps();
      expect(Math.abs(above - below), `open: ${open}`).toBeLessThanOrEqual(1.5);
      expect(above).toBeGreaterThan(4);
      heights.push(summary.getBoundingClientRect().height);
    }
    // The summary is the same size open and closed: opening only adds the content below it.
    expect(heights[0]).toBe(heights[1]);
  });

  test("clicking the summary opens and closes it", async () => {
    const { container } = await render(EDisclosure, { props: { title: "History" }, slots: { default: "Body" } });
    const details = container.querySelector("details")!;
    await page.getByText("History").click();
    expect(details.open).toBe(true);
    await expect.element(page.getByText("Body")).toBeVisible();
    await page.getByText("History").click();
    expect(details.open).toBe(false);
  });

  test("Enter and Space on the summary toggle it", async () => {
    const { container } = await render(EDisclosure, { props: { title: "History" }, slots: { default: "Body" } });
    const details = container.querySelector("details")!;
    await userEvent.tab();
    expect(document.activeElement!.tagName).toBe("SUMMARY");
    await userEvent.keyboard("{Enter}");
    expect(details.open).toBe(true);
    await userEvent.keyboard(" ");
    expect(details.open).toBe(false);
  });

  test("the title slot replaces the title prop", async () => {
    const { container } = await render(EDisclosure, { slots: { title: "<b>Rich</b> title", default: "Body" } });
    expect(container.querySelector("summary b")!.textContent).toBe("Rich");
  });

  test("v-model:open round trip", async () => {
    const open = ref(true);
    const { container } = await render(
      defineComponent({
        render: () =>
          h(
            EDisclosure,
            { title: "History", open: open.value, "onUpdate:open": (v?: boolean) => (open.value = !!v) },
            () => "Body",
          ),
      }),
    );
    const details = container.querySelector("details")!;
    expect(details.open).toBe(true);
    await page.getByText("History").click();
    expect(open.value).toBe(false);
    open.value = true;
    await nextTick();
    expect(details.open).toBe(true);
  });

  test("rows that share a group open one at a time", async () => {
    const { container } = await render(
      defineComponent({
        render: () => [
          h(EDisclosure, { title: "One", group: "g" }, () => "A"),
          h(EDisclosure, { title: "Two", group: "g" }, () => "B"),
        ],
      }),
    );
    const [a, b] = [...container.querySelectorAll("details")] as [HTMLDetailsElement, HTMLDetailsElement];
    expect(a.getAttribute("name")).toBe("g");
    await page.getByText("One").click();
    expect(a.open).toBe(true);
    await page.getByText("Two").click();
    await expect.poll(() => a.open).toBe(false);
    expect(b.open).toBe(true);
  });

  test("the library's chevron icon marks the state and turns when open", async () => {
    const { container } = await render(EDisclosure, { props: { title: "History" }, slots: { default: "Body" } });
    container.classList.add("e-root");
    const chevron = container.querySelector("summary > .e-details-chevron")!;
    expect(chevron.classList.contains("e-icon")).toBe(true);
    expect(chevron.getAttribute("aria-hidden")).toBe("true");
    const closed = getComputedStyle(chevron).transform;
    await page.getByText("History").click();
    await expect.poll(() => getComputedStyle(chevron).transform).not.toBe(closed);
  });

  test("the summary's focus ring is drawn inside it, so a clipping parent cannot cut it", async () => {
    const { container } = await render(EDisclosure, { props: { title: "History" } });
    container.classList.add("e-root");
    await userEvent.tab();
    const style = getComputedStyle(container.querySelector("summary")!);
    expect(style.outlineStyle).toBe("solid");
    expect(parseFloat(style.outlineOffset)).toBeLessThan(0);
  });

  test("class and data attributes fall through to the details", async () => {
    const { container } = await render(EDisclosure, {
      props: { title: "x" },
      attrs: { class: "mine", "data-x": "1" },
    });
    const el = container.querySelector("details")!;
    expect(el.classList.contains("mine")).toBe(true);
    expect(el.dataset.x).toBe("1");
  });

  test("axe finds nothing, open or closed", async () => {
    const { container } = await render(EDisclosure, { props: { title: "History" }, slots: { default: "Body" } });
    container.classList.add("e-root");
    await expectNoViolations(container);
    await page.getByText("History").last().click();
    await expectNoViolations(container);
  });

  test("disabled keeps it as it is: marked, dimmed and ignoring the click and the keys", async () => {
    const { container } = await render(EDisclosure, {
      props: { title: "History", disabled: true },
      slots: { default: "Body" },
    });
    container.classList.add("e-root");
    const details = container.querySelector("details")!;
    const summary = container.querySelector("summary")!;
    expect(summary.getAttribute("aria-disabled")).toBe("true");
    expect(getComputedStyle(summary).cursor).toBe("not-allowed");
    await userEvent.click(summary);
    await userEvent.keyboard("{Enter}");
    await userEvent.keyboard(" ");
    expect(details.open).toBe(false);
  });

  test("hover washes the summary line, with no colour change, underline or ring", async () => {
    const { container } = await render(EDisclosure, { props: { title: "History" }, slots: { default: "Body" } });
    container.classList.add("e-root");
    const summary = container.querySelector("summary")!;
    const rest = getComputedStyle(summary);
    const restColour = rest.color;
    const restFill = rest.backgroundColor;
    await userEvent.hover(summary);
    await expect.poll(() => getComputedStyle(summary).backgroundColor).not.toBe(restFill);
    const hovered = getComputedStyle(summary);
    expect(hovered.color).toBe(restColour);
    expect(hovered.textDecorationLine).toBe("none");
    expect(hovered.boxShadow).toBe("none");
  });

  test("the content is clipped at the moving edge while it slides, and given room for a focus ring only once open", async () => {
    const { container } = await render(EDisclosure, {
      props: { title: "History" },
      slots: { default: "Body" },
      attrs: { style: "--e-duration-move: 400ms" },
    });
    const details = container.querySelector("details")!;
    const margin = () => getComputedStyle(details, "::details-content").overflowClipMargin;
    const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
    margin(); // a starting style, so the change below is a transition
    await wait(50);
    details.open = true;
    await wait(150);
    expect(margin()).toBe("0px");
    await expect.poll(margin, { timeout: 2000 }).not.toBe("0px");
    details.open = false;
    await wait(50);
    expect(margin()).toBe("0px");
  });
});

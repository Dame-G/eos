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

  test("the chevron turns when open", async () => {
    const { container } = await render(EDisclosure, { props: { title: "History" }, slots: { default: "Body" } });
    container.classList.add("e-root");
    const summary = container.querySelector("summary")!;
    const closed = getComputedStyle(summary, "::after").transform;
    await page.getByText("History").click();
    await expect.poll(() => getComputedStyle(summary, "::after").transform).not.toBe(closed);
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

  test("hover washes the summary", async () => {
    const { container } = await render(EDisclosure, { props: { title: "History" }, slots: { default: "Body" } });
    container.classList.add("e-root");
    const summary = container.querySelector("summary")!;
    const rest = getComputedStyle(summary).backgroundColor;
    await userEvent.hover(summary);
    await expect.poll(() => getComputedStyle(summary).backgroundColor).not.toBe(rest);
  });
});

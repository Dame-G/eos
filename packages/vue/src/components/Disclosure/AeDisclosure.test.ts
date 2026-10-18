import { describe, expect, test } from "vitest";
import { defineComponent, h, nextTick, ref } from "vue";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-vue";
import AeDisclosure from "./AeDisclosure.vue";
import { expectNoViolations } from "../../../test/axe.js";

describe("AeDisclosure", () => {
  test("is a native details with a summary, closed by default", async () => {
    const { container } = await render(AeDisclosure, { props: { title: "History" }, slots: { default: "Body" } });
    const details = container.querySelector("details")!;
    expect(details.className).toBe("ae-disclosure ae-details");
    expect(details.open).toBe(false);
    expect(details.querySelector("summary")!.textContent).toBe("History");
    expect(details.querySelector(".ae-details-body")!.textContent).toBe("Body");
  });

  test("the card variant has a title, a meta note and a roomy body", async () => {
    const { container } = await render(AeDisclosure, {
      props: { title: "Billing", variant: "card", meta: "3 items" },
      slots: { default: "Body" },
    });
    const details = container.querySelector("details")!;
    expect(details.className).toBe("ae-disclosure ae-acc");
    expect(details.querySelector(".ae-acc-title")!.textContent).toBe("Billing");
    expect(details.querySelector(".ae-acc-meta")!.textContent).toBe("3 items");
    expect(details.querySelector(".ae-acc-body")!.textContent).toBe("Body");
  });

  test("meta is not shown by the row variant", async () => {
    const { container } = await render(AeDisclosure, { props: { title: "History", meta: "x" } });
    expect(container.querySelector(".ae-acc-meta")).toBeNull();
  });

  test("clicking the summary opens and closes it", async () => {
    const { container } = await render(AeDisclosure, { props: { title: "History" }, slots: { default: "Body" } });
    const details = container.querySelector("details")!;
    await page.getByText("History").click();
    expect(details.open).toBe(true);
    await expect.element(page.getByText("Body")).toBeVisible();
    await page.getByText("History").click();
    expect(details.open).toBe(false);
  });

  test("Enter and Space on the summary toggle it", async () => {
    const { container } = await render(AeDisclosure, { props: { title: "History" }, slots: { default: "Body" } });
    const details = container.querySelector("details")!;
    await userEvent.tab();
    expect(document.activeElement!.tagName).toBe("SUMMARY");
    await userEvent.keyboard("{Enter}");
    expect(details.open).toBe(true);
    await userEvent.keyboard(" ");
    expect(details.open).toBe(false);
  });

  test("v-model:open round trip", async () => {
    const open = ref(true);
    const { container } = await render(
      defineComponent({
        render: () =>
          h(
            AeDisclosure,
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
          h(AeDisclosure, { title: "One", group: "g" }, () => "A"),
          h(AeDisclosure, { title: "Two", group: "g" }, () => "B"),
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
    const { container } = await render(AeDisclosure, { props: { title: "History" }, slots: { default: "Body" } });
    container.classList.add("ae-root");
    const summary = container.querySelector("summary")!;
    const closed = getComputedStyle(summary, "::after").transform;
    await page.getByText("History").click();
    await expect.poll(() => getComputedStyle(summary, "::after").transform).not.toBe(closed);
  });

  test("class and data attributes fall through to the details", async () => {
    const { container } = await render(AeDisclosure, {
      props: { title: "x" },
      attrs: { class: "mine", "data-x": "1" },
    });
    const el = container.querySelector("details")!;
    expect(el.classList.contains("mine")).toBe(true);
    expect(el.dataset.x).toBe("1");
  });

  test("axe finds nothing, open or closed, in both variants", async () => {
    for (const variant of ["row", "card"] as const) {
      const { container } = await render(AeDisclosure, {
        props: { title: "History", variant, meta: variant === "card" ? "2" : undefined },
        slots: { default: "Body" },
      });
      container.classList.add("ae-root");
      await expectNoViolations(container);
      await page.getByText("History").last().click();
      await expectNoViolations(container);
    }
  });
});

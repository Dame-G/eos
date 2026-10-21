import { describe, expect, test } from "vitest";
import { defineComponent, h, ref } from "vue";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-vue";
import EPagination from "./EPagination.vue";
import { expectNoViolations } from "../../../test/axe.js";

function shape(container: Element): string[] {
  return [...container.querySelectorAll(".e-pages li")].map((li) => li.textContent!.trim());
}

describe("EPagination", () => {
  test("is a navigation named Pagination with Previous, the pages and Next", async () => {
    const { container } = await render(EPagination, { props: { modelValue: 2, pageCount: 5 } });
    await expect.element(page.getByRole("navigation", { name: "Pagination" })).toBeVisible();
    await expect.element(page.getByRole("button", { name: "Previous" })).toBeVisible();
    await expect.element(page.getByRole("button", { name: "Next" })).toBeVisible();
    expect(container.querySelectorAll("button.e-btn").length).toBe(2);
    await expect.element(page.getByRole("button", { name: "Page 3" })).toBeVisible();
  });

  test("the current page is marked with aria-current", async () => {
    const { container } = await render(EPagination, { props: { modelValue: 2, pageCount: 5 } });
    const current = container.querySelectorAll(".e-page[aria-current=page]");
    expect(current.length).toBe(1);
    expect(current[0]!.textContent!.trim()).toBe("2");
  });

  test("Next gives the next page, Previous the one before", async () => {
    const model = ref(2);
    const got: number[] = [];
    const { container } = await render(
      defineComponent({
        render: () =>
          h(EPagination, {
            modelValue: model.value,
            pageCount: 5,
            "onUpdate:modelValue": (p: number) => {
              got.push(p);
              model.value = p;
            },
          }),
      }),
    );
    (container.querySelectorAll(".e-btn")[1] as HTMLButtonElement).click();
    await expect.poll(() => got).toEqual([3]);
    await page.getByRole("button", { name: "Previous" }).click();
    await expect.poll(() => got).toEqual([3, 2]);
  });

  test("clicking a page number chooses it", async () => {
    const model = ref(1);
    await render(
      defineComponent({
        render: () =>
          h(EPagination, {
            modelValue: model.value,
            pageCount: 4,
            "onUpdate:modelValue": (p: number) => (model.value = p),
          }),
      }),
    );
    await page.getByRole("button", { name: "Page 4" }).click();
    expect(model.value).toBe(4);
    await expect.element(page.getByRole("button", { name: "Page 4" })).toHaveAttribute("aria-current", "page");
  });

  test("without v-model it keeps its own page, starting at 1", async () => {
    const { container } = await render(EPagination, { props: { pageCount: 3 } });
    await expect.element(page.getByRole("button", { name: "Previous" })).toBeDisabled();
    await page.getByRole("button", { name: "Next" }).click();
    expect(container.querySelector(".e-page[aria-current=page]")!.textContent!.trim()).toBe("2");
  });

  test("Previous is disabled on the first page and Next on the last", async () => {
    await render(EPagination, { props: { modelValue: 1, pageCount: 3 } });
    await expect.element(page.getByRole("button", { name: "Previous" })).toBeDisabled();
    await expect.element(page.getByRole("button", { name: "Next" })).not.toBeDisabled();
    await render(EPagination, { props: { modelValue: 3, pageCount: 3 } });
    await expect.element(page.getByRole("button", { name: "Next" }).last()).toBeDisabled();
  });

  test("shows the first, last and neighbouring pages with gaps", async () => {
    const mid = await render(EPagination, { props: { modelValue: 5, pageCount: 10 } });
    expect(shape(mid.container)).toEqual(["1", "…", "4", "5", "6", "…", "10"]);
    const start = await render(EPagination, { props: { modelValue: 1, pageCount: 10 } });
    expect(shape(start.container)).toEqual(["1", "2", "…", "10"]);
  });

  test("a gap that would hide a single page shows that page instead", async () => {
    const { container } = await render(EPagination, { props: { modelValue: 1, pageCount: 4 } });
    expect(shape(container)).toEqual(["1", "2", "3", "4"]);
  });

  test("gaps are hidden from screen readers", async () => {
    const { container } = await render(EPagination, { props: { modelValue: 5, pageCount: 10 } });
    for (const gap of container.querySelectorAll(".e-page-gap")) expect(gap.getAttribute("aria-hidden")).toBe("true");
  });

  test("the keyboard walks Previous, the pages, then Next, and Enter chooses", async () => {
    const model = ref(1);
    await render(
      defineComponent({
        render: () =>
          h(EPagination, {
            modelValue: model.value,
            pageCount: 3,
            "onUpdate:modelValue": (p: number) => (model.value = p),
          }),
      }),
    );
    await userEvent.tab();
    await expect.element(page.getByRole("button", { name: "Page 1" })).toHaveFocus();
    await userEvent.tab();
    await expect.element(page.getByRole("button", { name: "Page 2" })).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    expect(model.value).toBe(2);
  });

  test("class and attributes land on the nav", async () => {
    const { container } = await render(EPagination, {
      props: { pageCount: 3 },
      attrs: { class: "mine", "data-x": "1" },
    });
    const nav = container.querySelector("nav")!;
    expect(nav.className).toBe("e-pager mine");
    expect(nav.getAttribute("data-x")).toBe("1");
  });

  test("has no accessibility violations: first, middle, last, many pages", async () => {
    const { container } = await render(
      defineComponent({
        render: () =>
          h("div", [
            h(EPagination, { modelValue: 1, pageCount: 8, "aria-label": "Results one" }),
            h(EPagination, { modelValue: 4, pageCount: 8, "aria-label": "Results two" }),
            h(EPagination, { modelValue: 8, pageCount: 8, "aria-label": "Results three" }),
          ]),
      }),
    );
    await expectNoViolations(container);
  });
});

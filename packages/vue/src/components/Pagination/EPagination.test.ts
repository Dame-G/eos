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

  test("an empty label falls back to Pagination, so the landmark is never nameless", async () => {
    const { container } = await render(EPagination, { props: { modelValue: 1, pageCount: 3, label: "" } });
    expect(container.querySelector("nav")!.getAttribute("aria-label")).toBe("Pagination");
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
    await expect.element(page.getByRole("button", { name: "Previous" })).toHaveAttribute("aria-disabled", "true");
    await page.getByRole("button", { name: "Next" }).click();
    expect(container.querySelector(".e-page[aria-current=page]")!.textContent!.trim()).toBe("2");
  });

  test("Previous is aria-disabled on the first page and Next on the last", async () => {
    await render(EPagination, { props: { modelValue: 1, pageCount: 3 } });
    await expect.element(page.getByRole("button", { name: "Previous" })).toHaveAttribute("aria-disabled", "true");
    await expect.element(page.getByRole("button", { name: "Next" })).not.toHaveAttribute("aria-disabled");
    await render(EPagination, { props: { modelValue: 3, pageCount: 3 } });
    await expect.element(page.getByRole("button", { name: "Next" }).last()).toHaveAttribute("aria-disabled", "true");
  });

  test("pressing Next on the way to the last page keeps focus on Next", async () => {
    const { container } = await render(EPagination, { props: { pageCount: 2 } });
    const next = container.querySelectorAll<HTMLButtonElement>(".e-btn")[1]!;
    next.focus();
    await userEvent.keyboard("{Enter}");
    expect(container.querySelector(".e-page[aria-current=page]")!.textContent!.trim()).toBe("2");
    expect(next.getAttribute("aria-disabled")).toBe("true");
    expect(document.activeElement).toBe(next);
    await userEvent.keyboard("{Enter}");
    expect(container.querySelector(".e-page[aria-current=page]")!.textContent!.trim()).toBe("2");
  });

  test("a page outside the range is moved to the nearest page", async () => {
    const model = ref(99);
    const { container } = await render(
      defineComponent({
        render: () =>
          h(EPagination, {
            modelValue: model.value,
            pageCount: 5,
            "onUpdate:modelValue": (p: number) => (model.value = p),
          }),
      }),
    );
    expect(model.value).toBe(5);
    model.value = -3;
    await expect.poll(() => model.value).toBe(1);
    expect(container.querySelector(".e-page[aria-current=page]")!.textContent!.trim()).toBe("1");
  });

  test("with no pages both steps dim and there is no page list", async () => {
    const { container } = await render(EPagination, { props: { pageCount: 0 } });
    expect(container.querySelectorAll(".e-pages li").length).toBe(0);
    expect(container.querySelector(".e-pager-status")).toBeNull();
    for (const b of container.querySelectorAll(".e-btn")) expect(b.getAttribute("aria-disabled")).toBe("true");
  });

  test("a narrow pager shows Page X of N instead of the page list", async () => {
    const { container } = await render(EPagination, { props: { modelValue: 3, pageCount: 12 } });
    container.classList.add("e-root");
    container.style.width = "20rem";
    const status = container.querySelector<HTMLElement>(".e-pager-status")!;
    expect(status.textContent).toBe("Page 3 of 12");
    expect(getComputedStyle(status).display).not.toBe("none");
    expect(getComputedStyle(container.querySelector(".e-pages")!).display).toBe("none");
    container.style.width = "40rem";
    expect(getComputedStyle(status).display).toBe("none");
    expect(getComputedStyle(container.querySelector(".e-pages")!).display).toBe("flex");
  });

  test("a page change is announced", async () => {
    await render(EPagination, { props: { pageCount: 5 } });
    await page.getByRole("button", { name: "Page 2" }).click();
    const live = document.querySelector("[data-e-announcer=polite]")!;
    await expect.poll(() => live.textContent).toContain("Page 2 of 5");
  });

  test("a page set from outside is not announced: only a person's choice is", async () => {
    const model = ref(1);
    await render(
      defineComponent({
        render: () => h(EPagination, { modelValue: model.value, pageCount: 5, "onUpdate:modelValue": () => {} }),
      }),
    );
    const live = document.querySelector("[data-e-announcer=polite]");
    const before = live?.textContent ?? "";
    model.value = 3;
    await new Promise((r) => setTimeout(r, 150));
    expect(document.querySelector("[data-e-announcer=polite]")?.textContent ?? "").toBe(before);
    expect(before).not.toContain("Page 3 of 5");
  });

  test("a page restored before the count arrives is kept: with no pages the clamp is not written back", async () => {
    const model = ref(7);
    const count = ref(0);
    const writes: number[] = [];
    const { container } = await render(
      defineComponent({
        render: () =>
          h(EPagination, {
            modelValue: model.value,
            pageCount: count.value,
            "onUpdate:modelValue": (v: number) => {
              writes.push(v);
              model.value = v;
            },
          }),
      }),
    );
    expect(writes).toEqual([]);
    count.value = 10;
    await expect.poll(() => container.querySelector(".e-page[aria-current=page]")?.textContent?.trim()).toBe("7");
    expect(writes).toEqual([]);
    expect(model.value).toBe(7);
    count.value = 4;
    await expect.poll(() => model.value).toBe(4);
  });

  test("href makes the pages and steps links", async () => {
    const { container } = await render(EPagination, {
      props: { modelValue: 2, pageCount: 3, href: (n: number) => `/list?page=${n}` },
    });
    expect(container.querySelector<HTMLAnchorElement>("a.e-page")!.getAttribute("href")).toBe("/list?page=1");
    const links = [...container.querySelectorAll("a.e-btn")].map((a) => a.getAttribute("href"));
    expect(links).toEqual(["/list?page=1", "/list?page=3"]);
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
    await expect.element(page.getByRole("button", { name: "Previous" })).toHaveFocus();
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

  test("the current page is a slab drawn with the border, as tall as the other pages", async () => {
    const { container } = await render(EPagination, { props: { pageCount: 5, modelValue: 2 } });
    container.classList.add("e-root");
    const current = container.querySelector<HTMLElement>(".e-page[aria-current=page]")!;
    const other = container.querySelector<HTMLElement>(".e-page:not([aria-current])")!;
    const cs = getComputedStyle(current);
    expect(cs.boxShadow).toBe("none");
    expect(parseFloat(cs.borderBottomWidth)).toBeGreaterThan(parseFloat(cs.borderTopWidth));
    expect(current.getBoundingClientRect().height).toBe(other.getBoundingClientRect().height);
  });

  test("Next has its chevron after the label", async () => {
    const { container } = await render(EPagination, { props: { pageCount: 5 } });
    const next = [...container.querySelectorAll<HTMLElement>(".e-btn")].at(-1)!;
    expect(next.lastElementChild!.matches("svg.e-icon")).toBe(true);
    expect(next.innerHTML.indexOf("Next")).toBeLessThan(next.innerHTML.indexOf("<svg"));
  });
});

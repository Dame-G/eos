import { describe, expect, test } from "vitest";
import { h } from "vue";
import { page } from "vitest/browser";
import { render } from "vitest-browser-vue";
import EPageHeader from "./EPageHeader.vue";
import EBreadcrumb from "../Breadcrumb/EBreadcrumb.vue";
import EStamp from "../Stamp/EStamp.vue";
import EButton from "../Button/EButton.vue";
import { expectNoViolations } from "../../../test/axe.js";

const slots = {
  breadcrumb: () =>
    h(EBreadcrumb, {
      items: [{ label: "Home", href: "/" }, { label: "Statements", href: "/statements" }, { label: "Visit on Oct 2" }],
    }),
  status: () => h(EStamp, { status: "due" }),
  actions: () => [h(EButton, null, () => "Pay $162.40"), h(EButton, { variant: "outline" }, () => "Download")],
};

describe("EPageHeader", () => {
  test("the title is the page's one h1, with the description under it", async () => {
    const { container } = await render(EPageHeader, {
      props: { title: "Visit on Oct 2", description: "Statement 4471 · Main office" },
    });
    await expect.element(page.getByRole("heading", { level: 1, name: "Visit on Oct 2" })).toBeVisible();
    expect(container.querySelectorAll("h1").length).toBe(1);
    expect(container.querySelector("h1")!.className).toBe("e-pagehead-title");
    expect(container.querySelector("p.e-pagehead-desc")!.textContent).toBe("Statement 4471 · Main office");
  });

  test("headingLevel changes the heading element", async () => {
    const { container } = await render(EPageHeader, { props: { title: "Settings", headingLevel: 2 } });
    expect(container.querySelector("h1")).toBeNull();
    await expect.element(page.getByRole("heading", { level: 2, name: "Settings" })).toBeVisible();
  });

  test("no description, no paragraph", async () => {
    const { container } = await render(EPageHeader, { props: { title: "Settings" } });
    expect(container.querySelector(".e-pagehead-desc")).toBeNull();
    expect(container.querySelector(".e-pagehead-actions")).toBeNull();
  });

  test("breadcrumb comes first, the status sits beside the title, the actions are an EActions group", async () => {
    const { container } = await render(EPageHeader, { props: { title: "Visit on Oct 2" }, slots });
    const root = container.firstElementChild!;
    expect(root.firstElementChild!.tagName).toBe("NAV");
    const titleRow = container.querySelector(".e-pagehead-titlerow")!;
    expect([...titleRow.children].map((c) => c.tagName)).toEqual(["H1", "SPAN"]);
    expect(titleRow.children[1]!.classList.contains("e-stamp")).toBe(true);
    const actions = container.querySelector(".e-pagehead-actions")!;
    expect(actions.classList.contains("e-actions")).toBe(true);
    expect(actions.querySelectorAll(".e-btn").length).toBe(2);
    await expect.element(page.getByRole("button", { name: "Pay $162.40" })).toBeVisible();
  });

  test("the title is large on a desktop and smaller on a phone", async () => {
    await page.viewport(1024, 768);
    try {
      const { container } = await render(EPageHeader, { props: { title: "Visit" } });
      const title = container.querySelector<HTMLElement>("h1")!;
      const big = parseFloat(getComputedStyle(title).fontSize);
      await page.viewport(375, 700);
      expect(parseFloat(getComputedStyle(title).fontSize)).toBeLessThan(big);
    } finally {
      await page.viewport(1024, 768);
    }
  });

  test("the actions drop under the text when the row is narrow", async () => {
    await page.viewport(375, 700);
    try {
      const { container } = await render(EPageHeader, { props: { title: "Visit on Oct 2" }, slots });
      const text = container.querySelector(".e-pagehead-text")!.getBoundingClientRect();
      const actions = container.querySelector(".e-pagehead-actions")!.getBoundingClientRect();
      expect(actions.top).toBeGreaterThanOrEqual(text.bottom - 1);
    } finally {
      await page.viewport(1024, 768);
    }
  });

  test("class, style and attributes fall through to the root", async () => {
    const { container } = await render(EPageHeader, {
      props: { title: "Visit" },
      attrs: { class: "mine", "data-x": "1" },
    });
    const root = container.firstElementChild!;
    expect(root.classList.contains("mine")).toBe(true);
    expect(root.classList.contains("e-pagehead")).toBe(true);
    expect(root.getAttribute("data-x")).toBe("1");
  });

  test("has no accessibility violations", async () => {
    const { container } = await render(EPageHeader, {
      props: { title: "Visit on Oct 2", description: "Main office" },
      slots,
    });
    await expectNoViolations(container);
  });

  test("has no accessibility violations at another heading level", async () => {
    const { container } = await render(EPageHeader, { props: { title: "Plain", headingLevel: 3 } });
    await expectNoViolations(container, { disable: ["heading-order"] });
  });
});

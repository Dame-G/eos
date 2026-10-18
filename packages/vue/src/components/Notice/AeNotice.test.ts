import { describe, expect, test } from "vitest";
import { h } from "vue";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-vue";
import AeNotice from "./AeNotice.vue";
import AeButton from "../Button/AeButton.vue";
import { expectNoViolations } from "../../../test/axe.js";

/** Renders a notice in a box of a given width, since the layout follows the notice's own width. */
async function inBox(width: number, props: Record<string, unknown> = {}, slots: Record<string, () => unknown> = {}) {
  const box = document.createElement("div");
  box.className = "ae-root";
  box.style.width = `${width}px`;
  document.body.append(box);
  const result = await render(AeNotice, { container: box, props, slots } as never);
  return { ...result, box };
}

const actions = () => h(AeButton, { variant: "outline" }, () => "Sign");

describe("AeNotice", () => {
  test("shows the title, the detail and the icon of its tone", async () => {
    const { container } = await render(AeNotice, {
      props: { title: "Form due" },
      slots: { default: "Please sign before Oct 22." },
    });
    expect(container.querySelector(".ae-notice-title")!.textContent).toBe("Form due");
    expect(container.querySelector(".ae-notice-text")!.textContent).toBe("Please sign before Oct 22.");
    expect(container.querySelector(".ae-notice-icon svg")).not.toBeNull();
    expect(container.querySelector(".ae-notice")!.className).toBe("ae-notice");
  });

  test("without detail there is no text element", async () => {
    const { container } = await render(AeNotice, { props: { title: "Saved" } });
    expect(container.querySelector(".ae-notice-text")).toBeNull();
  });

  test("tone adds its modifier; info adds none", async () => {
    for (const tone of ["success", "warning", "danger"] as const) {
      const { container } = await render(AeNotice, { props: { title: "x", tone } });
      expect(container.querySelector(`.ae-notice--${tone}`)).not.toBeNull();
    }
    const { container } = await render(AeNotice, { props: { title: "x", tone: "info" } });
    expect(container.querySelector("[class*=ae-notice--]")).toBeNull();
  });

  test("danger is an alert, the others a status", async () => {
    const a = await render(AeNotice, { props: { title: "Failed", tone: "danger" } });
    await expect.element(page.getByRole("alert")).toBeVisible();
    expect(a.container.querySelector(".ae-notice")!.getAttribute("role")).toBe("alert");
    for (const tone of ["success", "warning", "info"] as const) {
      const { container } = await render(AeNotice, { props: { title: "x", tone } });
      expect(container.querySelector(".ae-notice")!.getAttribute("role")).toBe("status");
    }
  });

  test("role overrides the default, and false removes it", async () => {
    const a = await render(AeNotice, { props: { title: "x", role: "region" } });
    expect(a.container.querySelector(".ae-notice")!.getAttribute("role")).toBe("region");
    const b = await render(AeNotice, { props: { title: "x", tone: "danger", role: false } });
    expect(b.container.querySelector(".ae-notice")!.hasAttribute("role")).toBe(false);
  });

  test("headingLevel renders the title as a heading with the given id", async () => {
    const { container } = await render(AeNotice, { props: { title: "Closure", headingLevel: 3, titleId: "closure" } });
    const h3 = container.querySelector("h3")!;
    expect(h3.id).toBe("closure");
    expect(h3.className).toBe("ae-notice-title");
    await expect.element(page.getByRole("heading", { level: 3, name: "Closure" })).toBeVisible();
  });

  test("without headingLevel the title is a paragraph", async () => {
    const { container } = await render(AeNotice, { props: { title: "x" } });
    expect(container.querySelector("p.ae-notice-title")).not.toBeNull();
    expect(container.querySelector("h1,h2,h3,h4,h5,h6")).toBeNull();
  });

  test("the dismiss button shows only when someone listens, and emits dismiss", async () => {
    const none = await render(AeNotice, { props: { title: "x" } });
    expect(none.container.querySelector(".ae-notice-dismiss")).toBeNull();
    let got = 0;
    await render(AeNotice, { props: { title: "x", onDismiss: () => got++ } });
    await page.getByRole("button", { name: "Dismiss" }).click();
    expect(got).toBe(1);
  });

  test("the dismiss button works from the keyboard", async () => {
    let got = 0;
    await render(AeNotice, { props: { title: "x", onDismiss: () => got++ } });
    await userEvent.tab();
    await userEvent.keyboard("{Enter}");
    expect(got).toBe(1);
  });

  test("an icon prop replaces the icon of the tone", async () => {
    const plain = await render(AeNotice, { props: { title: "x" } });
    const custom = await render(AeNotice, { props: { title: "x", icon: "lock" } });
    expect(custom.container.querySelector(".ae-notice-icon svg")!.innerHTML).not.toBe(
      plain.container.querySelector(".ae-notice-icon svg")!.innerHTML,
    );
  });

  test("actions sit at the end of the row when wide (36rem or more)", async () => {
    const { box } = await inBox(720, { title: "Form due", tone: "warning" }, { default: () => "Sign it.", actions });
    expect(box.querySelector(".ae-notice")!.classList.contains("ae-notice--actions")).toBe(true);
    const a = box.querySelector(".ae-notice-actions")!.getBoundingClientRect();
    const b = box.querySelector(".ae-notice-body")!.getBoundingClientRect();
    expect(a.left).toBeGreaterThanOrEqual(b.right - 2);
  });

  test("actions sit under the text, left-aligned, when narrow", async () => {
    const { box } = await inBox(320, { title: "Form due", tone: "warning" }, { default: () => "Sign it.", actions });
    const a = box.querySelector(".ae-notice-actions")!.getBoundingClientRect();
    const b = box.querySelector(".ae-notice-body")!.getBoundingClientRect();
    expect(a.top).toBeGreaterThanOrEqual(b.bottom - 2);
    expect(a.left).toBeLessThanOrEqual(b.left + 2);
  });

  test("the width is the notice's own: a narrow box on a wide screen stacks", async () => {
    const { box } = await inBox(400, { title: "x" }, { actions });
    const a = box.querySelector(".ae-notice-actions")!.getBoundingClientRect();
    const b = box.querySelector(".ae-notice-body")!.getBoundingClientRect();
    expect(a.top).toBeGreaterThanOrEqual(b.bottom - 2);
  });

  test("actions follow the message in reading and tab order", async () => {
    await render(AeNotice, { props: { title: "x", onDismiss: () => {} }, slots: { actions } });
    await userEvent.tab();
    expect(document.activeElement!.textContent).toBe("Sign");
    await userEvent.tab();
    expect(document.activeElement!.getAttribute("aria-label")).toBe("Dismiss");
  });

  test("class, style and aria attributes fall through to the root", async () => {
    const { container } = await render(AeNotice, {
      props: { title: "x" },
      attrs: { class: "mine", style: "margin-top: 7px", "data-x": "1", "aria-live": "off" },
    });
    const el = container.querySelector<HTMLElement>(".ae-notice")!;
    expect(el.classList.contains("mine")).toBe(true);
    expect(el.style.marginTop).toBe("7px");
    expect(el.dataset.x).toBe("1");
    expect(el.getAttribute("aria-live")).toBe("off");
  });

  test("axe finds nothing in any tone, with actions and a dismiss button", async () => {
    for (const tone of ["info", "success", "warning", "danger"] as const) {
      const { container } = await render(AeNotice, {
        props: { title: "Heads up", tone, onDismiss: () => {}, headingLevel: 2 },
        slots: { default: "Something to know.", actions },
      });
      container.classList.add("ae-root");
      await expectNoViolations(container);
    }
  });
});

import { describe, expect, test } from "vitest";
import { h } from "vue";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-vue";
import * as Vue from "vue";
import ENotice from "./ENotice.vue";
import EButton from "../Button/EButton.vue";
import { expectNoViolations } from "../../../test/axe.js";

async function inBox(width: number, props: Record<string, unknown> = {}, slots: Record<string, () => unknown> = {}) {
  const box = document.createElement("div");
  box.className = "e-root";
  box.style.width = `${width}px`;
  document.body.append(box);
  const result = await render(ENotice, { container: box, props, slots } as never);
  return { ...result, box };
}

const actions = () => h(EButton, { variant: "outline" }, () => "Sign");

describe("ENotice", () => {
  test("shows the title, the detail and the icon of its tone", async () => {
    const { container } = await render(ENotice, {
      props: { title: "Form due" },
      slots: { default: "Please sign before Oct 22." },
    });
    expect(container.querySelector(".e-notice-title")!.textContent).toBe("Form due");
    expect(container.querySelector(".e-notice-text")!.textContent).toBe("Please sign before Oct 22.");
    expect(container.querySelector(".e-notice-icon svg")).not.toBeNull();
    expect(container.querySelector(".e-notice")!.className).toBe("e-notice");
  });

  test("without detail there is no text element", async () => {
    const { container } = await render(ENotice, { props: { title: "Saved" } });
    expect(container.querySelector(".e-notice-text")).toBeNull();
  });

  test("tone adds its modifier; info adds none", async () => {
    for (const tone of ["neutral", "success", "warning", "danger"] as const) {
      const { container } = await render(ENotice, { props: { title: "x", tone } });
      expect(container.querySelector(`.e-notice--${tone}`)).not.toBeNull();
    }
    const { container } = await render(ENotice, { props: { title: "x", tone: "info" } });
    expect(container.querySelector("[class*=e-notice--]")).toBeNull();
  });

  test("danger is an alert, the others a status", async () => {
    const a = await render(ENotice, { props: { title: "Failed", tone: "danger" } });
    await expect.element(page.getByRole("alert")).toBeVisible();
    expect(a.container.querySelector(".e-notice")!.getAttribute("role")).toBe("alert");
    for (const tone of ["success", "warning", "info"] as const) {
      const { container } = await render(ENotice, { props: { title: "x", tone } });
      expect(container.querySelector(".e-notice")!.getAttribute("role")).toBe("status");
    }
  });

  test("role overrides the default, and false removes it", async () => {
    const a = await render(ENotice, { props: { title: "x", role: "region" } });
    expect(a.container.querySelector(".e-notice")!.getAttribute("role")).toBe("region");
    const b = await render(ENotice, { props: { title: "x", tone: "danger", role: false } });
    expect(b.container.querySelector(".e-notice")!.hasAttribute("role")).toBe(false);
  });

  test("headingLevel renders the title as a heading with the given id", async () => {
    const { container } = await render(ENotice, { props: { title: "Closure", headingLevel: 3, titleId: "closure" } });
    const h3 = container.querySelector("h3")!;
    expect(h3.id).toBe("closure");
    expect(h3.classList.contains("e-notice-title")).toBe(true);
    await expect.element(page.getByRole("heading", { level: 3, name: "Closure" })).toBeVisible();
  });

  test("without headingLevel the title is a paragraph", async () => {
    const { container } = await render(ENotice, { props: { title: "x" } });
    expect(container.querySelector("p.e-notice-title")).not.toBeNull();
    expect(container.querySelector("h1,h2,h3,h4,h5,h6")).toBeNull();
  });

  test("the close button shows only when closable, and emits close", async () => {
    const none = await render(ENotice, { props: { title: "x", onClose: () => {} } });
    expect(none.container.querySelector(".e-notice-dismiss")).toBeNull();
    let got = 0;
    await render(ENotice, { props: { title: "x", closable: true, onClose: () => got++ } });
    await page.getByRole("button", { name: "Dismiss" }).click();
    expect(got).toBe(1);
  });

  test("the close button works from the keyboard", async () => {
    let got = 0;
    await render(ENotice, { props: { title: "x", closable: true, onClose: () => got++ } });
    await userEvent.tab();
    await userEvent.keyboard("{Enter}");
    expect(got).toBe(1);
  });

  test("an icon prop replaces the icon of the tone", async () => {
    const plain = await render(ENotice, { props: { title: "x" } });
    const custom = await render(ENotice, { props: { title: "x", icon: "lock" } });
    expect(custom.container.querySelector(".e-notice-icon svg")!.innerHTML).not.toBe(
      plain.container.querySelector(".e-notice-icon svg")!.innerHTML,
    );
  });

  test("actions sit at the end of the row when wide (36rem or more)", async () => {
    const { box } = await inBox(720, { title: "Form due", tone: "warning" }, { default: () => "Sign it.", actions });
    expect(box.querySelector(".e-notice")!.classList.contains("e-notice--actions")).toBe(true);
    const a = box.querySelector(".e-notice-actions")!.getBoundingClientRect();
    const b = box.querySelector(".e-notice-body")!.getBoundingClientRect();
    expect(a.left).toBeGreaterThanOrEqual(b.right - 2);
  });

  test("actions sit under the text, left-aligned, when narrow", async () => {
    const { box } = await inBox(320, { title: "Form due", tone: "warning" }, { default: () => "Sign it.", actions });
    const a = box.querySelector(".e-notice-actions")!.getBoundingClientRect();
    const b = box.querySelector(".e-notice-body")!.getBoundingClientRect();
    expect(a.top).toBeGreaterThanOrEqual(b.bottom - 2);
    expect(a.left).toBeLessThanOrEqual(b.left + 2);
  });

  test("the width is the notice's own: a narrow box on a wide screen stacks", async () => {
    const { box } = await inBox(400, { title: "x" }, { actions });
    const a = box.querySelector(".e-notice-actions")!.getBoundingClientRect();
    const b = box.querySelector(".e-notice-body")!.getBoundingClientRect();
    expect(a.top).toBeGreaterThanOrEqual(b.bottom - 2);
  });

  test("actions follow the message in reading and tab order", async () => {
    await render(ENotice, { props: { title: "x", closable: true }, slots: { actions } });
    await userEvent.tab();
    expect(document.activeElement!.textContent).toBe("Sign");
    await userEvent.tab();
    expect(document.activeElement!.getAttribute("aria-label")).toBe("Dismiss");
  });

  test("class, style and aria attributes fall through to the root", async () => {
    const { container } = await render(ENotice, {
      props: { title: "x" },
      attrs: { class: "mine", style: "margin-top: 7px", "data-x": "1", "aria-live": "off" },
    });
    const el = container.querySelector<HTMLElement>(".e-notice")!;
    expect(el.classList.contains("mine")).toBe(true);
    expect(el.style.marginTop).toBe("7px");
    expect(el.dataset.x).toBe("1");
    expect(el.getAttribute("aria-live")).toBe("off");
  });

  test("axe finds nothing in any tone, with actions and a close button", async () => {
    for (const tone of ["neutral", "info", "success", "warning", "danger"] as const) {
      const { container } = await render(ENotice, {
        props: { title: "Heads up", tone, closable: true, headingLevel: 2 },
        slots: { default: "Something to know.", actions },
      });
      container.classList.add("e-root");
      await expectNoViolations(container);
    }
  });

  test("closable is reactive and the button sits in the dismiss slot", async () => {
    const closable = Vue.ref(false);
    const { container } = await render(
      Vue.defineComponent({
        render: () => Vue.h(ENotice, { title: "x", closable: closable.value }),
      }),
    );
    expect(container.querySelector(".e-notice-dismiss")).toBeNull();
    closable.value = true;
    await expect.poll(() => container.querySelector(".e-notice-dismiss")).not.toBeNull();
    closable.value = false;
    await expect.poll(() => container.querySelector(".e-notice-dismiss")).toBeNull();
  });

  test("the accent is a thicker inline-start border (the slab), not a pseudo-element, and flips in a right-to-left page", async () => {
    const { container } = await render(ENotice, { props: { title: "x", tone: "success" } });
    container.classList.add("e-root");
    const notice = container.querySelector<HTMLElement>(".e-notice")!;
    const style = getComputedStyle(notice);
    expect(parseFloat(style.borderInlineStartWidth)).toBeGreaterThan(4);
    expect(parseFloat(style.borderInlineEndWidth)).toBeGreaterThan(0);
    expect(parseFloat(style.borderInlineEndWidth)).toBeLessThan(parseFloat(style.borderInlineStartWidth));
    expect(getComputedStyle(notice, "::before").content).toBe("none");
    const body = notice.getBoundingClientRect();
    const ltrIcon = container.querySelector(".e-notice-icon")!.getBoundingClientRect();
    notice.dir = "rtl";
    const rtlIcon = container.querySelector(".e-notice-icon")!.getBoundingClientRect();
    expect(ltrIcon.left - body.left).toBeLessThan(body.right - ltrIcon.right);
    expect(body.right - rtlIcon.right).toBeLessThan(rtlIcon.left - body.left);
    expect(parseFloat(getComputedStyle(notice).borderRightWidth)).toBeGreaterThan(
      parseFloat(getComputedStyle(notice).borderLeftWidth),
    );
  });

  test("it is full width and follows the theme radius, like the other components", async () => {
    const { container } = await render(ENotice, { props: { title: "x" } });
    container.classList.add("e-root");
    const style = getComputedStyle(container.querySelector(".e-notice")!);
    expect(style.borderRadius).not.toBe("0px");
    expect(style.display).toBe("block");
  });

  test("neutral is a tone with its own modifier, a status role and no colour", async () => {
    const { container } = await render(ENotice, { props: { title: "Note", tone: "neutral" } });
    const el = container.querySelector(".e-notice")!;
    expect(el.classList.contains("e-notice--neutral")).toBe(true);
    expect(el.getAttribute("role")).toBe("status");
    container.classList.add("e-root");
    await expectNoViolations(container);
  });
});

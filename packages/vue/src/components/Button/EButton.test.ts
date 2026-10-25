import { describe, expect, test } from "vitest";
import { defineComponent, h, ref } from "vue";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-vue";
import EButton from "./EButton.vue";
import { expectNoViolations } from "../../../test/axe.js";

describe("EButton", () => {
  test("loading shows a spinner in place of the icon, marks the button busy and ignores clicks", async () => {
    let clicks = 0;
    const { container } = await render(EButton, {
      props: { loading: true, icon: "download", onClick: () => clicks++ },
      slots: { default: "Save" },
    });
    const button = container.querySelector("button")!;
    expect(button.getAttribute("aria-busy")).toBe("true");
    expect(button.disabled).toBe(false);
    expect(button.querySelector(".e-btn-spinner")).not.toBeNull();
    expect(button.querySelector(".e-icon")).toBeNull();
    expect(button.className).toContain("e-btn--loading");
    const idleBtn = await render(EButton, { slots: { default: "Save" } });
    const idleBox = idleBtn.container.querySelector("button")!;
    const full = (el: HTMLElement) => el.getBoundingClientRect().height + parseFloat(getComputedStyle(el).marginBottom);
    expect(full(button)).toBe(full(idleBox));
    await userEvent.click(button);
    expect(clicks).toBe(0);
    const idle = await render(EButton, { slots: { default: "Save" } });
    expect(idle.container.querySelector("button")!.hasAttribute("aria-busy")).toBe(false);
  });

  test("a loading link does not navigate", async () => {
    let clicks = 0;
    const { container } = await render(EButton, {
      props: { href: "/pay", loading: true, onClick: () => clicks++ },
      slots: { default: "Pay" },
    });
    const a = container.querySelector("a")!;
    expect(a.getAttribute("aria-busy")).toBe("true");
    a.addEventListener("click", (e) => e.preventDefault());
    await userEvent.click(a);
    expect(clicks).toBe(0);
  });

  test("is a button with the label from the slot, primary by default", async () => {
    const { container } = await render(EButton, { slots: { default: "Pay now" } });
    const button = page.getByRole("button", { name: "Pay now" });
    await expect.element(button).toBeVisible();
    expect(container.querySelector("button")!.className).toBe("e-btn");
    expect(container.querySelector("button")!.type).toBe("button");
  });

  test("href renders a link that looks like the button; external opens a new tab", async () => {
    const { container } = await render(EButton, {
      props: { href: "/docs", variant: "outline" },
      slots: { default: "Read the docs" },
    });
    await expect.element(page.getByRole("link", { name: "Read the docs" })).toBeVisible();
    const a = container.querySelector("a")!;
    expect(a.getAttribute("href")).toBe("/docs");
    expect(a.className).toBe("e-btn e-btn--outline");
    expect(container.querySelector("button")).toBeNull();
    expect(a.hasAttribute("target")).toBe(false);
    await render(EButton, { props: { href: "https://example.com", external: true }, slots: { default: "Elsewhere" } });
    const ext = page.getByRole("link", { name: "Elsewhere (opens in a new tab)" }).element();
    expect(ext.getAttribute("target")).toBe("_blank");
    expect(ext.getAttribute("rel")).toBe("noreferrer");
  });

  test("variant and block add modifier classes", async () => {
    const { container } = await render(EButton, {
      props: { variant: "danger", block: true },
      slots: { default: "Cancel visit" },
    });
    expect(container.querySelector("button")!.className).toBe("e-btn e-btn--danger e-btn--block");
  });

  test("click reaches the consumer's listener, because attributes fall through to the button", async () => {
    let clicks = 0;
    await render(EButton, { attrs: { onClick: () => clicks++ }, slots: { default: "Go" } });
    await page.getByRole("button", { name: "Go" }).click();
    expect(clicks).toBe(1);
  });

  test("a disabled button does not fire click", async () => {
    let clicks = 0;
    await render(EButton, {
      props: { disabled: true },
      attrs: { onClick: () => clicks++ },
      slots: { default: "Pay now" },
    });
    await page.getByRole("button", { name: "Pay now" }).click({ force: true });
    expect(clicks).toBe(0);
  });

  test("a disabled link is marked disabled, leaves the tab order and looks like a disabled button", async () => {
    const { container } = await render(EButton, {
      props: { href: "/pay", disabled: true },
      slots: { default: "Pay now" },
    });
    const a = container.querySelector("a")!;
    expect(a.getAttribute("aria-disabled")).toBe("true");
    expect(a.getAttribute("tabindex")).toBe("-1");
    const disabled = await render(EButton, { props: { disabled: true }, slots: { default: "Plain" } });
    const link = getComputedStyle(a);
    const button = getComputedStyle(disabled.container.querySelector("button")!);
    const edge = (el: Element) => getComputedStyle(el, "::before");
    expect(edge(a).borderTopStyle).toBe("dashed");
    for (const prop of ["cursor", "color", "backgroundColor"] as const) {
      expect(link[prop]).toBe(button[prop]);
    }
    expect(edge(a).borderTopWidth).toBe(edge(disabled.container.querySelector("button")!).borderTopWidth);
  });

  test("a disabled link does not navigate or fire click, by mouse or Enter", async () => {
    let clicks = 0;
    const { container } = await render(EButton, {
      props: { href: "/pay", disabled: true },
      attrs: { onClick: () => clicks++ },
      slots: { default: "Pay now" },
    });
    const a = container.querySelector("a")!;
    const notCancelled = a.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
    expect(notCancelled).toBe(false);
    expect(clicks).toBe(0);
    a.focus();
    await userEvent.keyboard("{Enter}");
    expect(clicks).toBe(0);
    expect(location.pathname).not.toBe("/pay");
  });

  test("an enabled link still fires click", async () => {
    let clicks = 0;
    const { container } = await render(EButton, {
      props: { href: "#go" },
      attrs: { onClick: () => clicks++ },
      slots: { default: "Go" },
    });
    expect(container.querySelector("a")!.hasAttribute("aria-disabled")).toBe(false);
    expect(container.querySelector("a")!.hasAttribute("tabindex")).toBe(false);
    await page.getByRole("link", { name: "Go" }).click();
    expect(clicks).toBe(1);
  });

  test("is exactly as tall as an input (the control height)", async () => {
    const { container } = await render(EButton, { slots: { default: "Pay now" } });
    const button = container.querySelector("button")!;
    // The face is shorter by the slab; the margin under it gives the room back.
    expect(button.getBoundingClientRect().height + parseFloat(getComputedStyle(button).marginBottom)).toBe(48);
  });

  test("an icon sits before the label and stays out of the accessible name", async () => {
    const { container } = await render(EButton, { props: { icon: "card" }, slots: { default: "Pay now" } });
    expect(container.querySelector("button svg.e-icon")).not.toBeNull();
    await expect.element(page.getByRole("button", { name: "Pay now", exact: true })).toBeVisible();
  });

  test('aria-pressed="true" marks a toggle: a filled tint and primary edge, not colour alone', async () => {
    const { container } = await render(EButton, {
      props: { variant: "outline" },
      attrs: { "aria-pressed": "true" },
      slots: { default: "Unpaid only" },
    });
    const el = container.querySelector("button")!;
    await expect.element(page.getByRole("button", { name: "Unpaid only" })).toHaveAttribute("aria-pressed", "true");
    const pressed = getComputedStyle(el);
    const off = await render(EButton, {
      props: { variant: "outline" },
      attrs: { "aria-pressed": "false" },
      slots: { default: "Off" },
    });
    const idle = getComputedStyle(off.container.querySelector("button")!);
    expect(pressed.backgroundColor).not.toBe(idle.backgroundColor);
    expect(pressed.borderTopColor).not.toBe(idle.borderTopColor);
  });

  test("has no accessibility violations in any variant", async () => {
    const { container } = await render(
      defineComponent({
        render: () =>
          h("div", [
            h(EButton, null, () => "Primary"),
            h(EButton, { variant: "secondary", icon: "check" }, () => "Secondary"),
            h(EButton, { variant: "outline" }, () => "Outline"),
            h(EButton, { variant: "danger" }, () => "Danger"),
            h(EButton, { variant: "quiet" }, () => "Quiet"),
            h(EButton, { disabled: true }, () => "Disabled"),
          ]),
      }),
    );
    await expectNoViolations(container);
  });

  test("a disabled toggle does not answer hover and a pressed toggle is filled like a segment", async () => {
    const { container } = await render(EButton, {
      props: { disabled: true, variant: "outline" },
      attrs: { "aria-pressed": "true" },
      slots: { default: "Unpaid only" },
    });
    const el = container.querySelector("button")!;
    container.classList.add("e-root");
    const rest = getComputedStyle(el).backgroundColor;
    await userEvent.hover(el);
    expect(getComputedStyle(el).backgroundColor).toBe(rest);
    expect(getComputedStyle(el, "::before").borderTopStyle).toBe("dashed");
    const on = await render(EButton, {
      props: { variant: "outline" },
      attrs: { "aria-pressed": "true" },
      slots: { default: "On" },
    });
    const primary = await render(EButton, { slots: { default: "Primary" } });
    expect(getComputedStyle(on.container.querySelector("button")!).backgroundColor).toBe(
      getComputedStyle(primary.container.querySelector("button")!).backgroundColor,
    );
  });

  test("size sm and lg change the height, and every size keeps a 44px target", async () => {
    const heights: number[] = [];
    for (const size of ["sm", "md", "lg"] as const) {
      const { container } = await render(EButton, { props: { size }, slots: { default: size } });
      heights.push(container.querySelector("button")!.getBoundingClientRect().height);
    }
    expect(heights[0]).toBeGreaterThanOrEqual(44);
    expect(heights[0]).toBeLessThan(heights[1]!);
    expect(heights[1]).toBeLessThan(heights[2]!);
    const { container } = await render(EButton, { props: { size: "md" }, slots: { default: "Pay" } });
    expect(container.querySelector("button")!.className).toBe("e-btn");
  });

  test("iconEnd puts an icon after the label, hidden from the name", async () => {
    const { container } = await render(EButton, { props: { iconEnd: "chevron-right" }, slots: { default: "Next" } });
    const button = container.querySelector("button")!;
    expect(button.lastElementChild!.matches("svg.e-icon")).toBe(true);
    await expect.element(page.getByRole("button", { name: "Next", exact: true })).toBeVisible();
  });

  test("loading is announced once it starts", async () => {
    const loading = ref(false);
    await render(defineComponent({ render: () => h(EButton, { loading: loading.value }, () => "Save") }));
    loading.value = true;
    const live = () => document.querySelector("[data-e-announcer=polite]")?.textContent;
    await expect.poll(live).toContain("Loading");
  });

  test("an external link says it opens in a new tab and has no active style when disabled", async () => {
    const { container } = await render(EButton, {
      props: { href: "https://example.com", external: true },
      slots: { default: "Docs" },
    });
    expect(container.querySelector("a .e-sr")!.textContent).toContain("opens in a new tab");
    const off = await render(EButton, { props: { href: "/x", disabled: true }, slots: { default: "Off" } });
    const a = off.container.querySelector("a")!;
    off.container.classList.add("e-root");
    const rest = getComputedStyle(a).backgroundColor;
    await userEvent.hover(a);
    expect(getComputedStyle(a).backgroundColor).toBe(rest);
  });
});

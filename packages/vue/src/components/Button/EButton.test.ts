import { describe, expect, test } from "vitest";
import { defineComponent, h } from "vue";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-vue";
import EButton from "./EButton.vue";
import { expectNoViolations } from "../../../test/axe.js";

describe("EButton", () => {
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
    const ext = page.getByRole("link", { name: "Elsewhere" }).element();
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
    expect(link.borderTopStyle).toBe("dashed");
    for (const prop of ["cursor", "color", "backgroundColor", "borderTopStyle", "borderBottomWidth"] as const) {
      expect(link[prop]).toBe(button[prop]);
    }
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
    expect(container.querySelector("button")!.getBoundingClientRect().height).toBe(48);
  });

  test("an icon sits before the label and stays out of the accessible name", async () => {
    const { container } = await render(EButton, { props: { icon: "card" }, slots: { default: "Pay now" } });
    expect(container.querySelector("button svg.e-icon")).not.toBeNull();
    await expect.element(page.getByRole("button", { name: "Pay now", exact: true })).toBeVisible();
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
});

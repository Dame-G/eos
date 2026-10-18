import { describe, expect, test } from "vitest";
import { defineComponent, h } from "vue";
import { page } from "vitest/browser";
import { render } from "vitest-browser-vue";
import AeButton from "./AeButton.vue";
import { expectNoViolations } from "../../../test/axe.js";

describe("AeButton", () => {
  test("is a button with the label from the slot, primary by default", async () => {
    const { container } = await render(AeButton, { slots: { default: "Pay now" } });
    const button = page.getByRole("button", { name: "Pay now" });
    await expect.element(button).toBeVisible();
    expect(container.querySelector("button")!.className).toBe("ae-btn");
    expect(container.querySelector("button")!.type).toBe("button");
  });

  test("variant and block add modifier classes", async () => {
    const { container } = await render(AeButton, {
      props: { variant: "danger", block: true },
      slots: { default: "Cancel visit" },
    });
    expect(container.querySelector("button")!.className).toBe("ae-btn ae-btn--danger ae-btn--block");
  });

  test("click reaches the consumer's listener, because attributes fall through to the button", async () => {
    let clicks = 0;
    await render(AeButton, { attrs: { onClick: () => clicks++ }, slots: { default: "Go" } });
    await page.getByRole("button", { name: "Go" }).click();
    expect(clicks).toBe(1);
  });

  test("a disabled button does not fire click", async () => {
    let clicks = 0;
    await render(AeButton, {
      props: { disabled: true },
      attrs: { onClick: () => clicks++ },
      slots: { default: "Pay now" },
    });
    await page.getByRole("button", { name: "Pay now" }).click({ force: true });
    expect(clicks).toBe(0);
  });

  test("is exactly as tall as an input (the control height)", async () => {
    const { container } = await render(AeButton, { slots: { default: "Pay now" } });
    expect(container.querySelector("button")!.getBoundingClientRect().height).toBe(48);
  });

  test("an icon sits before the label and stays out of the accessible name", async () => {
    const { container } = await render(AeButton, { props: { icon: "card" }, slots: { default: "Pay now" } });
    expect(container.querySelector("button svg.ae-icon")).not.toBeNull();
    await expect.element(page.getByRole("button", { name: "Pay now", exact: true })).toBeVisible();
  });

  test("has no accessibility violations in any variant", async () => {
    const { container } = await render(
      defineComponent({
        render: () =>
          h("div", [
            h(AeButton, null, () => "Primary"),
            h(AeButton, { variant: "secondary", icon: "check" }, () => "Secondary"),
            h(AeButton, { variant: "outline" }, () => "Outline"),
            h(AeButton, { variant: "danger" }, () => "Danger"),
            h(AeButton, { variant: "quiet" }, () => "Quiet"),
            h(AeButton, { disabled: true }, () => "Disabled"),
          ]),
      }),
    );
    await expectNoViolations(container);
  });
});

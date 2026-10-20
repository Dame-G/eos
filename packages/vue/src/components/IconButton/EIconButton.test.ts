import { describe, expect, test } from "vitest";
import { defineComponent, h } from "vue";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-vue";
import EIconButton from "./EIconButton.vue";
import { expectNoViolations } from "../../../test/axe.js";

describe("EIconButton", () => {
  test("is a button named by its label, with a hidden icon", async () => {
    const { container } = await render(EIconButton, { props: { icon: "download", label: "Download receipt" } });
    await expect.element(page.getByRole("button", { name: "Download receipt", exact: true })).toBeVisible();
    const button = container.querySelector("button")!;
    expect(button.className).toBe("e-icon-btn");
    expect(button.type).toBe("button");
    expect(button.querySelector("svg.e-icon")!.getAttribute("aria-hidden")).toBe("true");
  });

  test("has a 48px target", async () => {
    const { container } = await render(EIconButton, { props: { icon: "download", label: "Download receipt" } });
    const box = container.querySelector("button")!.getBoundingClientRect();
    expect([box.width, box.height]).toEqual([48, 48]);
  });

  test("click reaches the consumer's listener", async () => {
    let clicks = 0;
    await render(EIconButton, {
      props: { icon: "trash", label: "Delete" },
      attrs: { onClick: () => clicks++ },
    });
    await page.getByRole("button", { name: "Delete" }).click();
    expect(clicks).toBe(1);
  });

  test("is reached with Tab and activated with Enter and Space", async () => {
    let clicks = 0;
    const { container } = await render(EIconButton, {
      props: { icon: "trash", label: "Delete" },
      attrs: { onClick: () => clicks++ },
    });
    await userEvent.tab();
    expect(document.activeElement).toBe(container.querySelector("button"));
    await userEvent.keyboard("{Enter}");
    await userEvent.keyboard(" ");
    expect(clicks).toBe(2);
  });

  test("shows a focus ring when focused with the keyboard", async () => {
    const { container } = await render(EIconButton, { props: { icon: "trash", label: "Delete" } });
    await userEvent.tab();
    const style = getComputedStyle(container.querySelector("button")!);
    expect(style.outlineStyle).toBe("solid");
    expect(parseFloat(style.outlineWidth)).toBeGreaterThan(0);
  });

  test("a disabled button does not fire click and is skipped by Tab", async () => {
    let clicks = 0;
    const { container } = await render(EIconButton, {
      props: { icon: "trash", label: "Delete", disabled: true },
      attrs: { onClick: () => clicks++ },
    });
    await page.getByRole("button", { name: "Delete" }).click({ force: true });
    expect(clicks).toBe(0);
    await userEvent.tab();
    expect(document.activeElement).not.toBe(container.querySelector("button"));
  });

  test("a disabled button is drawn with a dashed edge, like a disabled EButton", async () => {
    const { container } = await render(EIconButton, { props: { icon: "trash", label: "Delete", disabled: true } });
    expect(getComputedStyle(container.querySelector("button")!).borderTopStyle).toBe("dashed");
  });

  test("other attributes fall through to the button, such as popovertarget", async () => {
    const { container } = await render(EIconButton, {
      props: { icon: "menu", label: "Open menu" },
      attrs: { popovertarget: "m1", "data-testid": "b", "aria-expanded": "false" },
    });
    const button = container.querySelector("button")!;
    expect(button.getAttribute("popovertarget")).toBe("m1");
    expect(button.getAttribute("data-testid")).toBe("b");
    expect(button.getAttribute("aria-expanded")).toBe("false");
  });

  test("has no accessibility violations in any state", async () => {
    const { container } = await render(
      defineComponent({
        render: () =>
          h("div", [
            h(EIconButton, { icon: "download", label: "Download receipt" }),
            h(EIconButton, { icon: "trash", label: "Delete", disabled: true }),
          ]),
      }),
    );
    await expectNoViolations(container);
  });
});

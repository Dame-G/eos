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
    expect(button.className).toBe("e-icon-btn e-interact");
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
    expect(getComputedStyle(container.querySelector("button")!, "::before").borderTopStyle).toBe("dashed");
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

  test("variant draws the filled button as a square, quiet is the default", async () => {
    const { container } = await render(EIconButton, { props: { icon: "plus", label: "Add", variant: "primary" } });
    const button = container.querySelector("button")!;
    expect(button.className).toContain("e-btn e-btn--primary e-btn--icon");
    const box = button.getBoundingClientRect();
    expect(box.width).toBe(box.height);
    const quiet = await render(EIconButton, { props: { icon: "plus", label: "Quiet" } });
    expect(quiet.container.querySelector("button")!.className).toBe("e-icon-btn e-interact");
  });

  test("size changes the square and keeps a 44px target", async () => {
    const sides: number[] = [];
    for (const variant of ["quiet", "outline"] as const) {
      for (const size of ["sm", "lg"] as const) {
        const { container } = await render(EIconButton, { props: { icon: "plus", label: "Add", variant, size } });
        const box = container.querySelector("button")!.getBoundingClientRect();
        expect(box.width).toBe(box.height);
        sides.push(box.width);
      }
    }
    expect(sides).toEqual([44, 56, 44, 56]);
  });

  test("loading shows a spinner, marks the button busy, announces it and ignores clicks", async () => {
    let clicks = 0;
    const { container } = await render(EIconButton, {
      props: { icon: "download", label: "Download", loading: true },
      attrs: { onClick: () => clicks++ },
    });
    const button = container.querySelector("button")!;
    expect(button.getAttribute("aria-busy")).toBe("true");
    expect(button.querySelector(".e-btn-spinner")).not.toBeNull();
    expect(button.querySelector("svg.e-icon")).toBeNull();
    await userEvent.click(button);
    expect(clicks).toBe(0);
  });

  test("the quiet (default) variant takes the busy style too", async () => {
    const { container } = await render(EIconButton, { props: { icon: "download", label: "Download", loading: true } });
    container.classList.add("e-root");
    const button = container.querySelector("button")!;
    expect(button.classList.contains("e-btn--loading")).toBe(true);
    expect(getComputedStyle(button, "::before").borderTopStyle).toBe("dashed");
  });

  test("type submits a form", async () => {
    let submitted = 0;
    const { container } = await render(
      defineComponent({
        render: () =>
          h("form", { onSubmit: (e: Event) => (e.preventDefault(), submitted++) }, [
            h(EIconButton, { icon: "check", label: "Save", type: "submit" }),
          ]),
      }),
    );
    expect(container.querySelector("button")!.type).toBe("submit");
    await page.getByRole("button", { name: "Save" }).click();
    expect(submitted).toBe(1);
  });

  test("tooltip shows the label on keyboard focus and keeps the button's attributes", async () => {
    let clicks = 0;
    await render(EIconButton, {
      props: { icon: "download", label: "Download receipt", tooltip: true },
      attrs: { onClick: () => clicks++, "data-x": "1" },
    });
    await userEvent.tab();
    // The bubble repeats the button's own name, so it is hidden from assistive technology; read the bubble itself.
    await expect.poll(() => document.querySelector(".e-tip-bubble")?.textContent).toContain("Download receipt");
    expect(document.querySelector(".e-tip-bubble")!.getAttribute("aria-hidden")).toBe("true");
    expect(document.activeElement!.getAttribute("data-x")).toBe("1");
    await userEvent.keyboard("{Enter}");
    expect(clicks).toBe(1);
  });
});

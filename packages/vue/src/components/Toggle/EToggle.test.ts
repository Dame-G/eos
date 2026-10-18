import { describe, expect, test } from "vitest";
import { defineComponent, h, nextTick, ref } from "vue";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-vue";
import EToggle from "./EToggle.vue";
import { expectNoViolations } from "../../../test/axe.js";

describe("EToggle", () => {
  test("is an outline button with aria-pressed, not pressed by default", async () => {
    const { container } = await render(EToggle, { slots: { default: "Unpaid only" } });
    const button = page.getByRole("button", { name: "Unpaid only" });
    await expect.element(button).toHaveAttribute("aria-pressed", "false");
    const el = container.querySelector("button")!;
    expect(el.className).toBe("e-btn e-btn--outline e-toggle");
    expect(el.type).toBe("button");
  });

  test("clicking toggles the state and reports it, value first", async () => {
    const got: boolean[] = [];
    const { container } = await render(EToggle, {
      attrs: { "onUpdate:modelValue": (v: boolean) => got.push(v) },
      slots: { default: "Unpaid only" },
    });
    const button = page.getByRole("button", { name: "Unpaid only" });
    await button.click();
    expect(got).toEqual([true]);
    await expect.element(button).toHaveAttribute("aria-pressed", "true");
    expect(container.querySelector("button")!.getAttribute("aria-pressed")).toBe("true");
    await button.click();
    expect(got).toEqual([true, false]);
    await expect.element(button).toHaveAttribute("aria-pressed", "false");
  });

  test("v-model round trip", async () => {
    const model = ref(true);
    await render(
      defineComponent({
        render: () =>
          h(
            EToggle,
            { modelValue: model.value, "onUpdate:modelValue": (v: boolean) => (model.value = v) },
            () => "List view",
          ),
      }),
    );
    const button = page.getByRole("button", { name: "List view" });
    await expect.element(button).toHaveAttribute("aria-pressed", "true");
    await button.click();
    expect(model.value).toBe(false);
    model.value = true;
    await nextTick();
    await expect.element(button).toHaveAttribute("aria-pressed", "true");
  });

  test("the keyboard toggles with Space and Enter", async () => {
    await render(EToggle, { slots: { default: "Filter" } });
    const button = page.getByRole("button", { name: "Filter" });
    await userEvent.tab();
    await expect.element(button).toHaveFocus();
    await userEvent.keyboard(" ");
    await expect.element(button).toHaveAttribute("aria-pressed", "true");
    await userEvent.keyboard("{Enter}");
    await expect.element(button).toHaveAttribute("aria-pressed", "false");
  });

  test("pressed shows a filled tint and a heavier edge, not colour alone", async () => {
    const { container } = await render(EToggle, { props: { modelValue: true }, slots: { default: "On" } });
    const style = getComputedStyle(container.querySelector("button")!);
    expect(style.boxShadow).not.toBe("none");
    expect(style.boxShadow).toContain("inset");
  });

  test("an icon sits before the label and stays out of the name", async () => {
    const { container } = await render(EToggle, { props: { icon: "filter" }, slots: { default: "Filters" } });
    expect(container.querySelector("button svg.e-icon")).not.toBeNull();
    await expect.element(page.getByRole("button", { name: "Filters", exact: true })).toBeVisible();
  });

  test("disabled does not toggle", async () => {
    const got: boolean[] = [];
    await render(EToggle, {
      props: { disabled: true },
      attrs: { "onUpdate:modelValue": (v: boolean) => got.push(v) },
      slots: { default: "Locked" },
    });
    const button = page.getByRole("button", { name: "Locked" });
    await expect.element(button).toBeDisabled();
    await button.click({ force: true });
    expect(got).toEqual([]);
  });

  test("attributes and listeners fall through to the button", async () => {
    let clicks = 0;
    const { container } = await render(EToggle, {
      attrs: { class: "mine", "data-x": "1", "aria-describedby": "x", onClick: () => clicks++ },
      slots: { default: "Go" },
    });
    const el = container.querySelector("button")!;
    expect(el.className).toContain("mine");
    expect(el.dataset["x"]).toBe("1");
    expect(el.getAttribute("aria-describedby")).toBe("x");
    await page.getByRole("button", { name: "Go" }).click();
    expect(clicks).toBe(1);
  });

  test("is 48px tall like every control", async () => {
    const { container } = await render(EToggle, { slots: { default: "Go" } });
    expect(container.querySelector("button")!.getBoundingClientRect().height).toBe(48);
  });

  test("has no accessibility violations: off, on, with icon, disabled", async () => {
    const { container } = await render(
      defineComponent({
        render: () =>
          h("div", [
            h(EToggle, null, () => "Off"),
            h(EToggle, { modelValue: true }, () => "On"),
            h(EToggle, { icon: "filter" }, () => "With icon"),
            h(EToggle, { disabled: true }, () => "Disabled"),
          ]),
      }),
    );
    await expectNoViolations(container);
  });
});

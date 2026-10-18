import { describe, expect, test } from "vitest";
import { defineComponent, h } from "vue";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-vue";
import EButtonGroup from "./EButtonGroup.vue";
import EButton from "../Button/EButton.vue";
import EToggle from "../Toggle/EToggle.vue";
import { expectNoViolations } from "../../../test/axe.js";

const group = (label = "Record actions") =>
  defineComponent({
    render: () =>
      h(EButtonGroup, { label }, () => [
        h(EButton, { variant: "outline" }, () => "Print"),
        h(EButton, { variant: "outline" }, () => "Download"),
      ]),
  });

describe("EButtonGroup", () => {
  test("is a group named by its label, holding the buttons", async () => {
    const { container } = await render(group());
    await expect.element(page.getByRole("group", { name: "Record actions" })).toBeVisible();
    expect(container.firstElementChild!.className).toBe("e-btngroup");
    expect(container.querySelectorAll("button").length).toBe(2);
  });

  test("lays the buttons out side by side with a gap and wraps", async () => {
    const { container } = await render(group());
    const style = getComputedStyle(container.firstElementChild!);
    expect(style.display).toBe("inline-flex");
    expect(style.flexWrap).toBe("wrap");
    const [a, b] = [...container.querySelectorAll("button")].map((x) => x.getBoundingClientRect());
    expect(Math.abs(a!.top - b!.top)).toBeLessThan(1);
    expect(b!.left - a!.right).toBeGreaterThan(0);
  });

  test("the keyboard reaches each button in order", async () => {
    await render(group());
    await userEvent.tab();
    await expect.element(page.getByRole("button", { name: "Print" })).toHaveFocus();
    await userEvent.tab();
    await expect.element(page.getByRole("button", { name: "Download" })).toHaveFocus();
  });

  test("class and attributes fall through to the group", async () => {
    const { container } = await render(EButtonGroup, {
      props: { label: "Tools" },
      attrs: { class: "mine", "data-x": "1" },
      slots: { default: "<button>One</button>" },
    });
    const el = container.firstElementChild!;
    expect(el.className).toBe("e-btngroup mine");
    expect(el.getAttribute("data-x")).toBe("1");
  });

  test("holds toggle buttons", async () => {
    await render(
      defineComponent({
        render: () =>
          h(EButtonGroup, { label: "Show" }, () => [
            h(EToggle, null, () => "Paid"),
            h(EToggle, { modelValue: true }, () => "Due"),
          ]),
      }),
    );
    await expect.element(page.getByRole("button", { name: "Due" })).toHaveAttribute("aria-pressed", "true");
  });

  test("has no accessibility violations", async () => {
    const { container } = await render(
      defineComponent({
        render: () =>
          h("div", [
            h(group("Record actions")),
            h(EButtonGroup, { label: "Filters" }, () => [
              h(EToggle, null, () => "Paid"),
              h(EToggle, { disabled: true }, () => "Due"),
            ]),
          ]),
      }),
    );
    await expectNoViolations(container);
  });
});

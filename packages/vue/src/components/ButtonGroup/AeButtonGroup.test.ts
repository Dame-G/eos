import { describe, expect, test } from "vitest";
import { defineComponent, h } from "vue";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-vue";
import AeButtonGroup from "./AeButtonGroup.vue";
import AeButton from "../Button/AeButton.vue";
import AeToggle from "../Toggle/AeToggle.vue";
import { expectNoViolations } from "../../../test/axe.js";

const group = (label = "Record actions") =>
  defineComponent({
    render: () =>
      h(AeButtonGroup, { label }, () => [
        h(AeButton, { variant: "outline" }, () => "Print"),
        h(AeButton, { variant: "outline" }, () => "Download"),
      ]),
  });

describe("AeButtonGroup", () => {
  test("is a group named by its label, holding the buttons", async () => {
    const { container } = await render(group());
    await expect.element(page.getByRole("group", { name: "Record actions" })).toBeVisible();
    expect(container.firstElementChild!.className).toBe("ae-btngroup");
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
    const { container } = await render(AeButtonGroup, {
      props: { label: "Tools" },
      attrs: { class: "mine", "data-x": "1" },
      slots: { default: "<button>One</button>" },
    });
    const el = container.firstElementChild!;
    expect(el.className).toBe("ae-btngroup mine");
    expect(el.getAttribute("data-x")).toBe("1");
  });

  test("holds toggle buttons", async () => {
    await render(
      defineComponent({
        render: () =>
          h(AeButtonGroup, { label: "Show" }, () => [
            h(AeToggle, null, () => "Paid"),
            h(AeToggle, { modelValue: true }, () => "Due"),
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
            h(AeButtonGroup, { label: "Filters" }, () => [
              h(AeToggle, null, () => "Paid"),
              h(AeToggle, { disabled: true }, () => "Due"),
            ]),
          ]),
      }),
    );
    await expectNoViolations(container);
  });
});

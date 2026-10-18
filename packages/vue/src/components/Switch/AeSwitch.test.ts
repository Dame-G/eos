import { describe, expect, test } from "vitest";
import { defineComponent, h, nextTick, ref } from "vue";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-vue";
import AeSwitch from "./AeSwitch.vue";
import { expectNoViolations } from "../../../test/axe.js";

describe("AeSwitch", () => {
  test("is a switch named by its label", async () => {
    const { container } = await render(AeSwitch, { props: { label: "Reminders" } });
    await expect.element(page.getByRole("switch", { name: "Reminders" })).toBeVisible();
    expect(container.querySelector("label")!.className).toBe("ae-choice ae-switch");
    expect(container.querySelector("input")!.className).toBe("ae-switch-input");
    expect(container.querySelector(".ae-switch-track")!.getAttribute("aria-hidden")).toBe("true");
  });

  test("v-model gets the new state first, and the model flips the switch", async () => {
    const model = ref(false);
    const got: boolean[] = [];
    await render(
      defineComponent({
        render: () =>
          h(AeSwitch, {
            label: "Reminders",
            modelValue: model.value,
            "onUpdate:modelValue": (v: boolean) => {
              got.push(v);
              model.value = v;
            },
          }),
      }),
    );
    const sw = page.getByRole("switch", { name: "Reminders" });
    await page.getByText("Reminders").click();
    expect(got).toEqual([true]);
    await expect.element(sw).toBeChecked();
    model.value = false;
    await nextTick();
    await expect.element(sw).not.toBeChecked();
  });

  test("Space toggles it from the keyboard", async () => {
    await render(AeSwitch, { props: { label: "Reminders" } });
    await userEvent.tab();
    await userEvent.keyboard(" ");
    await expect.element(page.getByRole("switch", { name: "Reminders" })).toBeChecked();
  });

  test("the knob sits at the start when off and travels 20px when on", async () => {
    const { container } = await render(AeSwitch, { props: { label: "Reminders" }, attrs: {} });
    const track = container.querySelector(".ae-switch-track")!;
    expect(getComputedStyle(track, "::after").transform).toBe("none");
    await page.getByText("Reminders").click();
    await expect.poll(() => getComputedStyle(track, "::after").transform).toBe("matrix(1, 0, 0, 1, 20, 0)");
  });

  test("description, disabled, name and value", async () => {
    const { container } = await render(AeSwitch, {
      props: { label: "Reminders", description: "By text", disabled: true, name: "remind", value: "on" },
    });
    const input = container.querySelector("input")!;
    expect(container.querySelector(".ae-choice-desc")!.textContent).toBe("By text");
    expect(input.disabled).toBe(true);
    expect(input.name).toBe("remind");
    expect(input.value).toBe("on");
    expect(container.querySelector("label")!.classList.contains("ae-choice--disabled")).toBe(true);
  });

  test("attributes land on the input, class and style on the row", async () => {
    const { container } = await render(AeSwitch, {
      props: { label: "A" },
      attrs: { "data-x": "1", class: "mine", style: "max-width: 300px" },
    });
    expect(container.querySelector("input")!.dataset["x"]).toBe("1");
    const label = container.querySelector("label")!;
    expect(label.className).toBe("ae-choice ae-switch mine");
    expect(label.style.maxWidth).toBe("300px");
  });

  test("has no accessibility violations in any state", async () => {
    const { container } = await render(
      defineComponent({
        render: () =>
          h("div", [
            h(AeSwitch, { label: "Off" }),
            h(AeSwitch, { label: "On", modelValue: true }),
            h(AeSwitch, { label: "Described", description: "More detail" }),
            h(AeSwitch, { label: "Disabled", disabled: true }),
            h(AeSwitch, { label: "Disabled on", disabled: true, modelValue: true }),
          ]),
      }),
    );
    await expectNoViolations(container);
  });
});

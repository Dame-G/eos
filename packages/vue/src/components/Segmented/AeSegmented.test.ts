import { describe, expect, test } from "vitest";
import { defineComponent, h, nextTick, ref } from "vue";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-vue";
import AeSegmented from "./AeSegmented.vue";
import { expectNoViolations } from "../../../test/axe.js";

const options = ["Day", "Week", "Month"];

describe("AeSegmented", () => {
  test("is a radio group named by its label, with a radio per option", async () => {
    const { container } = await render(AeSegmented, { props: { label: "View", options } });
    await expect.element(page.getByRole("radiogroup", { name: "View" })).toBeVisible();
    expect(container.querySelectorAll("input.ae-seg-input").length).toBe(3);
    expect(container.firstElementChild!.className).toBe("ae-seg");
    await expect.element(page.getByRole("radio", { name: "Week" })).toBeVisible();
  });

  test("the first option is active when nothing is bound", async () => {
    await render(AeSegmented, { props: { label: "View", options } });
    await expect.element(page.getByRole("radio", { name: "Day" })).toBeChecked();
  });

  test("v-model gets the value, and the model picks the option", async () => {
    const model = ref("Week");
    const got: string[] = [];
    await render(
      defineComponent({
        render: () =>
          h(AeSegmented, {
            label: "View",
            options,
            modelValue: model.value,
            "onUpdate:modelValue": (v?: string) => {
              got.push(v!);
              model.value = v!;
            },
          }),
      }),
    );
    await expect.element(page.getByRole("radio", { name: "Week" })).toBeChecked();
    await page.getByRole("radio", { name: "Month" }).click();
    expect(got).toEqual(["Month"]);
    await expect.element(page.getByRole("radio", { name: "Month" })).toBeChecked();
    model.value = "Day";
    await nextTick();
    await expect.element(page.getByRole("radio", { name: "Day" })).toBeChecked();
  });

  test("arrow keys move between options and choose", async () => {
    const model = ref("Day");
    await render(
      defineComponent({
        render: () =>
          h(AeSegmented, {
            label: "View",
            options,
            modelValue: model.value,
            "onUpdate:modelValue": (v?: string) => (model.value = v!),
          }),
      }),
    );
    await userEvent.tab();
    await userEvent.keyboard("{ArrowRight}");
    expect(model.value).toBe("Week");
    await userEvent.keyboard("{ArrowRight}");
    expect(model.value).toBe("Month");
    await userEvent.keyboard("{ArrowLeft}");
    expect(model.value).toBe("Week");
  });

  test("options carry an icon and a disabled flag", async () => {
    const { container } = await render(AeSegmented, {
      props: {
        label: "View",
        options: [
          { value: "list", label: "List", icon: "list" },
          { value: "grid", label: "Grid", disabled: true },
        ],
      },
    });
    expect(container.querySelector(".ae-seg-text svg.ae-icon")).not.toBeNull();
    await expect.element(page.getByRole("radio", { name: "Grid" })).toBeDisabled();
    await expect.element(page.getByRole("radio", { name: "List", exact: true })).toBeVisible();
  });

  test("the control is 48px tall and the active option is filled", async () => {
    const { container } = await render(AeSegmented, { props: { label: "View", options } });
    container.classList.add("ae-root");
    const seg = container.querySelector(".ae-seg")!;
    expect(seg.getBoundingClientRect().height).toBe(48);
    const active = container.querySelector(".ae-seg-input:checked + .ae-seg-text")!;
    expect(getComputedStyle(active).fontWeight).toBe("600");
    expect(getComputedStyle(seg).width).not.toBe("100%");
  });

  test("a hint or error goes under the control and is linked with aria-describedby", async () => {
    const hinted = await render(AeSegmented, { props: { label: "View", options, hint: "Pick a range" } });
    hinted.container.classList.add("ae-root");
    expect(hinted.container.firstElementChild!.className).toBe("ae-seg-field");
    const seg = hinted.container.querySelector(".ae-seg")!;
    const hint = hinted.container.querySelector(".ae-field-hint")!;
    expect(seg.getAttribute("aria-describedby")).toBe(hint.id);
    expect(hint.getBoundingClientRect().top - seg.getBoundingClientRect().bottom).toBe(8);
    await expect.element(page.getByRole("radiogroup", { name: "View" })).toHaveAccessibleDescription("Pick a range");

    const bad = await render(AeSegmented, { props: { label: "View2", options, error: "Choose one" } });
    expect(bad.container.querySelector(".ae-field-error")!.getAttribute("role")).toBe("alert");
  });

  test("disabled disables every option", async () => {
    const { container } = await render(AeSegmented, { props: { label: "View", options, disabled: true } });
    expect([...container.querySelectorAll("input")].every((i) => i.disabled)).toBe(true);
  });

  test("attributes land on the group, class and style on the outer element", async () => {
    const { container } = await render(AeSegmented, {
      props: { label: "View", options },
      attrs: { "data-x": "1", class: "mine" },
    });
    const seg = container.querySelector(".ae-seg") as HTMLElement;
    expect(seg.dataset["x"]).toBe("1");
    expect(seg.className).toBe("ae-seg mine");
  });

  test("has no accessibility violations in any state", async () => {
    const { container } = await render(
      defineComponent({
        render: () =>
          h("div", [
            h(AeSegmented, { label: "Plain", options }),
            h(AeSegmented, { label: "Hinted", options, hint: "A hint", modelValue: "Week" }),
            h(AeSegmented, { label: "Invalid", options, error: "Choose one" }),
            h(AeSegmented, { label: "Disabled", options, disabled: true }),
            h(AeSegmented, {
              label: "Icons",
              options: [
                { value: "a", label: "List", icon: "list" },
                { value: "b", label: "Grid", disabled: true },
              ],
            }),
          ]),
      }),
    );
    await expectNoViolations(container);
  });
});

import { describe, expect, test } from "vitest";
import { defineComponent, h, nextTick, ref } from "vue";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-vue";
import ESlotPicker from "./ESlotPicker.vue";
import { expectNoViolations } from "../../../test/axe.js";

const times = ["9:00 am", "9:30 am", { value: "10:00", label: "10:00 am", disabled: true }, "10:30 am"];

describe("ESlotPicker", () => {
  test("is a group named by its label with a radio per time", async () => {
    const { container } = await render(ESlotPicker, { props: { label: "Tuesday 22 September", options: times } });
    await expect.element(page.getByRole("group", { name: "Tuesday 22 September" })).toBeVisible();
    expect(container.querySelectorAll("input.e-slot-input[type=radio]").length).toBe(4);
    expect(container.querySelector("fieldset")!.className).toContain("e-slots");
    expect(container.querySelector("legend")!.className).toContain("e-slots-legend");
    await expect.element(page.getByRole("radio", { name: "9:30 am" })).toBeVisible();
  });

  test("all radios share one name; strings are both value and label", async () => {
    const { container } = await render(ESlotPicker, {
      props: { label: "Day", options: ["8 am", "9 am"], name: "when" },
    });
    const radios = [...container.querySelectorAll<HTMLInputElement>("input")];
    expect(radios.map((r) => r.name)).toEqual(["when", "when"]);
    expect(radios.map((r) => r.value)).toEqual(["8 am", "9 am"]);
  });

  test("v-model round trip", async () => {
    const model = ref<string | null>("9:30 am");
    const got: (string | null)[] = [];
    await render(
      defineComponent({
        render: () =>
          h(ESlotPicker, {
            label: "Day",
            options: times,
            modelValue: model.value,
            "onUpdate:modelValue": (v: string | null) => {
              got.push(v);
              model.value = v;
            },
          }),
      }),
    );
    await expect.element(page.getByRole("radio", { name: "9:30 am" })).toBeChecked();
    await page.getByRole("radio", { name: "10:30 am" }).click({ force: true });
    expect(got).toEqual(["10:30 am"]);
    await expect.element(page.getByRole("radio", { name: "10:30 am" })).toBeChecked();
    model.value = "9:00 am";
    await nextTick();
    await expect.element(page.getByRole("radio", { name: "9:00 am" })).toBeChecked();
  });

  test("without v-model it keeps its own choice", async () => {
    await render(ESlotPicker, { props: { label: "Day", options: times } });
    await page.getByRole("radio", { name: "9:00 am" }).click({ force: true });
    await expect.element(page.getByRole("radio", { name: "9:00 am" })).toBeChecked();
  });

  test("arrow keys move between times, skipping a taken one, and choose", async () => {
    await render(ESlotPicker, { props: { label: "Day", options: times, modelValue: "9:30 am" } });
    page.getByRole("radio", { name: "9:30 am" }).element().focus();
    await userEvent.keyboard("{ArrowRight}");
    await expect.element(page.getByRole("radio", { name: "10:30 am" })).toBeChecked();
  });

  test("a taken time is disabled, dashed and struck through", async () => {
    const { container } = await render(ESlotPicker, { props: { label: "Day", options: times } });
    await expect.element(page.getByRole("radio", { name: "10:00 am" })).toBeDisabled();
    const style = getComputedStyle(container.querySelector(".e-slot--off .e-slot-text")!);
    expect(style.borderStyle).toBe("dashed");
    expect(style.textDecorationLine).toBe("line-through");
  });

  test("the chosen time is filled and bold", async () => {
    const { container } = await render(ESlotPicker, { props: { label: "Day", options: times, modelValue: "9:00 am" } });
    const chosen = container.querySelector(".e-slot-input:checked + .e-slot-text")!;
    expect(getComputedStyle(chosen).fontWeight).toBe("600");
    const other = container.querySelectorAll(".e-slot-text")[1]!;
    expect(getComputedStyle(chosen).backgroundColor).not.toBe(getComputedStyle(other).backgroundColor);
  });

  test("each time is 48px tall", async () => {
    const { container } = await render(ESlotPicker, { props: { label: "Day", options: times } });
    container.classList.add("e-root");
    for (const el of container.querySelectorAll(".e-slot-text")) expect(el.getBoundingClientRect().height).toBe(48);
  });

  test("no times shows the empty text", async () => {
    await render(ESlotPicker, { props: { label: "Day", options: [] } });
    await expect.element(page.getByText("No times are open on this day.")).toBeVisible();
    await render(ESlotPicker, { props: { label: "Other day", options: [], emptyText: "Fully booked" } });
    await expect.element(page.getByText("Fully booked")).toBeVisible();
  });

  test("hint and error are announced with the group; required is passed on", async () => {
    const { container } = await render(ESlotPicker, {
      props: { label: "Day", options: times, hint: "Times are local", required: true },
    });
    const fs = container.querySelector("fieldset")!;
    expect(container.querySelector(".e-field-hint")!.id).toBe(fs.getAttribute("aria-describedby"));
    expect(container.querySelector<HTMLInputElement>("input")!.required).toBe(true);
    const err = await render(ESlotPicker, { props: { label: "Other", options: times, error: "Choose a time" } });
    expect(err.container.querySelector("fieldset")!.getAttribute("aria-invalid")).toBe("true");
    expect(err.container.querySelector("[role=alert]")!.textContent).toContain("Choose a time");
  });

  test("optional shows the word beside the legend", async () => {
    const { container } = await render(ESlotPicker, { props: { label: "Day", options: times, optional: true } });
    expect(container.querySelector(".e-field-flag")!.textContent).toBe("Optional");
    expect(container.querySelector<HTMLInputElement>("input")!.required).toBe(false);
  });

  test("disabled disables every time", async () => {
    await render(ESlotPicker, { props: { label: "Day", options: times, disabled: true } });
    await expect.element(page.getByRole("radio", { name: "9:00 am" })).toBeDisabled();
  });

  test("class and data attributes land on the fieldset", async () => {
    const { container } = await render(ESlotPicker, {
      props: { label: "Day", options: times },
      attrs: { class: "mine", "data-x": "1" },
    });
    expect(container.querySelector("fieldset")!.className).toContain("mine");
    expect(container.querySelector("fieldset")!.getAttribute("data-x")).toBe("1");
  });

  test("has no accessibility violations: default, chosen, invalid, disabled, empty", async () => {
    const { container } = await render(
      defineComponent({
        render: () =>
          h("div", [
            h(ESlotPicker, { label: "Monday", options: times }),
            h(ESlotPicker, { label: "Tuesday", options: times, modelValue: "9:00 am", hint: "Local time" }),
            h(ESlotPicker, { label: "Wednesday", options: times, error: "Choose a time" }),
            h(ESlotPicker, { label: "Thursday", options: times, disabled: true }),
            h(ESlotPicker, { label: "Friday", options: [] }),
          ]),
      }),
    );
    await expectNoViolations(container);
  });
});

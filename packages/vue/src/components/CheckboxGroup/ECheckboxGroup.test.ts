import { describe, expect, test } from "vitest";
import { defineComponent, h, ref, type Component } from "vue";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-vue";
import ECheckboxGroup from "./ECheckboxGroup.vue";
import { expectNoViolations } from "../../../test/axe.js";

const options = ["Email", "Text", { value: "post", label: "Post", description: "Statements only." }];

describe("ECheckboxGroup", () => {
  test("is a group named by its legend, with a checkbox per option", async () => {
    const { container } = await render(ECheckboxGroup, { props: { label: "Reach me by", options } });
    await expect.element(page.getByRole("group", { name: "Reach me by" })).toBeVisible();
    expect(container.querySelectorAll("input[type=checkbox]")).toHaveLength(3);
    await expect.element(page.getByRole("checkbox", { name: "Post" })).toHaveAccessibleDescription("Statements only.");
  });

  test("v-model is an array: checking adds, unchecking removes", async () => {
    const model = ref<string[]>(["Text"]);
    const got: string[][] = [];
    await render(
      defineComponent({
        render: () =>
          h(ECheckboxGroup, {
            label: "Reach me by",
            options,
            modelValue: model.value,
            "onUpdate:modelValue": (v: string[]) => {
              got.push(v);
              model.value = v;
            },
          }),
      }),
    );
    await expect.element(page.getByRole("checkbox", { name: "Text" })).toBeChecked();
    await page.getByRole("checkbox", { name: "Email" }).click();
    await page.getByRole("checkbox", { name: "Text" }).click();
    expect(got).toEqual([["Text", "Email"], ["Email"]]);
  });

  test("Space toggles the focused box from the keyboard", async () => {
    const got: string[][] = [];
    await render(ECheckboxGroup, {
      props: { label: "Reach me by", options, "onUpdate:modelValue": (v: string[]) => got.push(v) },
    });
    await userEvent.tab();
    await userEvent.keyboard(" ");
    expect(got).toEqual([["Email"]]);
  });

  test("hint, error, required and optional describe the group", async () => {
    const { container, rerender } = await render(ECheckboxGroup, {
      props: { label: "Reach me by", options, hint: "Pick any", required: true },
    });
    await expect.element(page.getByRole("group", { name: /Reach me by/ })).toHaveAccessibleDescription("Pick any");
    expect(container.querySelector(".e-field-flag")!.textContent).toBe("Required");
    await rerender({ label: "Reach me by", options, error: "Pick one", required: true } as never);
    await expect.element(page.getByRole("group", { name: /Reach me by/ })).toHaveAccessibleDescription("Pick one");
    expect(container.querySelector("input")!.getAttribute("aria-invalid")).toBe("true");
  });

  test("disabled disables every box, and a disabled option only its own", async () => {
    const { container } = await render(ECheckboxGroup, {
      props: { label: "Reach me by", options: ["A", { value: "b", label: "B", disabled: true }] },
    });
    const boxes = container.querySelectorAll<HTMLInputElement>("input");
    expect([boxes[0]!.disabled, boxes[1]!.disabled]).toEqual([false, true]);
    const all = await render(ECheckboxGroup, { props: { label: "All", options: ["A"], disabled: true } });
    expect(all.container.querySelector<HTMLInputElement>("input")!.matches(":disabled")).toBe(true);
  });

  test("readonly keeps the values and blocks changing them", async () => {
    const got: string[][] = [];
    const { container } = await render(ECheckboxGroup, {
      props: {
        label: "Reach me by",
        options,
        modelValue: ["Email"],
        readonly: true,
        "onUpdate:modelValue": (v: string[]) => got.push(v),
      },
    });
    // A plain group does not take aria-readonly: each box carries it.
    expect(container.querySelector("fieldset")!.hasAttribute("aria-readonly")).toBe(false);
    for (const box of container.querySelectorAll("input")) expect(box.getAttribute("aria-readonly")).toBe("true");
    await container.querySelectorAll<HTMLInputElement>("input")[1]!.click();
    expect(got).toEqual([]);
  });

  test("a disabled group's rows look disabled, not only the boxes", async () => {
    const { container } = await render(
      defineComponent({
        render: () =>
          h("div", { class: "e-root" }, [
            h(ECheckboxGroup, { label: "Off", options, disabled: true }),
            h(ECheckboxGroup, { label: "On", options }),
          ]),
      }),
    );
    const [off, on] = [...container.querySelectorAll("fieldset")].map((f) => f.querySelector(".e-choice")!);
    expect(getComputedStyle(off!).cursor).toBe("not-allowed");
    expect(getComputedStyle(off!).color).not.toBe(getComputedStyle(on!).color);
  });

  test("id names the fieldset, and the boxes are numbered from it", async () => {
    const { container } = await render(ECheckboxGroup, { props: { label: "Reach me by", options, id: "reach" } });
    expect(container.querySelector("fieldset")!.id).toBe("reach");
    expect([...container.querySelectorAll("input")].map((i) => i.id)).toEqual(["reach-1", "reach-2", "reach-3"]);
  });

  test("name is shared, so a form submits one entry per checked box", async () => {
    const { container } = await render(ECheckboxGroup, {
      props: { label: "Reach me by", options, name: "channels", modelValue: ["Email", "post"] },
    });
    const form = document.createElement("form");
    form.append(container.querySelector("fieldset")!);
    document.body.append(form);
    expect(new FormData(form).getAll("channels")).toEqual(["Email", "post"]);
    form.remove();
  });

  test("horizontal lays the boxes out in a wrapping row", async () => {
    const { container } = await render(ECheckboxGroup, {
      props: { label: "Reach me by", options, orientation: "horizontal" },
    });
    container.classList.add("e-root");
    expect(getComputedStyle(container.querySelector(".e-checkgroup-items")!).flexDirection).toBe("row");
  });

  test("has no accessibility violations", async () => {
    const { container } = await render(ECheckboxGroup, {
      props: { label: "Reach me by", options, hint: "Pick any", modelValue: ["Email"] },
    });
    await expectNoViolations(container);
  });
});

describe("ECheckboxGroup columns", () => {
  const options = ["One", "Two", "Three", "Four"];
  test("lays the options out in equal columns, row by row", async () => {
    const { container } = await render(
      defineComponent({
        render: () =>
          h("div", { style: "width: 600px" }, [h(ECheckboxGroup as Component, { label: "Pick", options, columns: 2 })]),
      }),
    );
    const boxes = [...container.querySelectorAll<HTMLElement>(".e-checkgroup-items > *")].map((e) =>
      e.getBoundingClientRect(),
    );
    expect(boxes[0]!.top).toBeCloseTo(boxes[1]!.top, 0);
    expect(boxes[2]!.top).toBeGreaterThan(boxes[0]!.top);
    expect(boxes[2]!.left).toBeCloseTo(boxes[0]!.left, 0);
    expect(boxes[1]!.left).toBeGreaterThan(boxes[0]!.left + 200);
  });

  test("drops to one column in a narrow container", async () => {
    const { container } = await render(
      defineComponent({
        render: () =>
          h("div", { style: "width: 300px" }, [h(ECheckboxGroup as Component, { label: "Pick", options, columns: 2 })]),
      }),
    );
    const boxes = [...container.querySelectorAll<HTMLElement>(".e-checkgroup-items > *")].map((e) =>
      e.getBoundingClientRect(),
    );
    expect(boxes[1]!.top).toBeGreaterThan(boxes[0]!.top);
  });
});

import { describe, expect, test } from "vitest";
import { defineComponent, h, nextTick, ref } from "vue";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-vue";
import ECheckbox from "./ECheckbox.vue";
import { expectNoViolations } from "../../../test/axe.js";

function colourOf(host: Element, token: string) {
  const probe = document.createElement("span");
  probe.style.color = `var(${token})`;
  host.append(probe);
  const colour = getComputedStyle(probe).color;
  probe.remove();
  return colour;
}

describe("ECheckbox", () => {
  test("is a checkbox named by its label, in a 48px row", async () => {
    const { container } = await render(ECheckbox, { props: { label: "Agree" } });
    container.classList.add("e-root");
    await expect.element(page.getByRole("checkbox", { name: "Agree" })).toBeVisible();
    const label = container.querySelector("label")!;
    expect(label.className).toBe("e-choice");
    expect(container.querySelector("input")!.className).toBe("e-check");
    expect(label.getBoundingClientRect().height).toBe(48);
  });

  test("v-model gets the checked state first, and the model checks the box", async () => {
    const model = ref(false);
    const got: boolean[] = [];
    await render(
      defineComponent({
        render: () =>
          h(ECheckbox, {
            label: "Agree",
            modelValue: model.value,
            "onUpdate:modelValue": (v: boolean) => {
              got.push(v);
              model.value = v;
            },
          }),
      }),
    );
    const box = page.getByRole("checkbox", { name: "Agree" });
    await box.click();
    expect(got).toEqual([true]);
    await expect.element(box).toBeChecked();
    model.value = false;
    await nextTick();
    await expect.element(box).not.toBeChecked();
  });

  test("Space toggles it from the keyboard", async () => {
    await render(ECheckbox, { props: { label: "Agree" } });
    await userEvent.tab();
    await userEvent.keyboard(" ");
    await expect.element(page.getByRole("checkbox", { name: "Agree" })).toBeChecked();
    await userEvent.keyboard(" ");
    await expect.element(page.getByRole("checkbox", { name: "Agree" })).not.toBeChecked();
  });

  test("clicking the label text toggles it", async () => {
    await render(ECheckbox, { props: { label: "Agree to the terms" } });
    await page.getByText("Agree to the terms").click();
    await expect.element(page.getByRole("checkbox")).toBeChecked();
  });

  test("description sits under the label", async () => {
    const { container } = await render(ECheckbox, {
      props: { label: "Text me", description: "Standard rates apply" },
    });
    expect(container.querySelector(".e-choice-text .e-choice-desc")!.textContent).toBe("Standard rates apply");
  });

  test("the description is the input's description, not part of its name", async () => {
    await render(ECheckbox, { props: { label: "Text me", description: "Standard rates apply" } });
    const box = page.getByRole("checkbox", { name: "Text me", exact: true });
    await expect.element(box).toBeVisible();
    await expect.element(box).toHaveAccessibleDescription("Standard rates apply");
  });

  test("toggling error keeps the same root and input, and focus", async () => {
    const error = ref<string | undefined>(undefined);
    const { container } = await render(
      defineComponent({ render: () => h(ECheckbox, { label: "Agree", error: error.value }) }),
    );
    const root = container.firstElementChild;
    const input = container.querySelector("input")!;
    input.focus();
    error.value = "You must agree";
    await nextTick();
    await expect.element(page.getByRole("alert")).toBeVisible();
    expect(container.firstElementChild).toBe(root);
    expect(container.querySelector("input")).toBe(input);
    expect(document.activeElement).toBe(input);
    error.value = undefined;
    await nextTick();
    expect(container.querySelector("input")).toBe(input);
    expect(input.hasAttribute("aria-describedby")).toBe(false);
  });

  test("an indeterminate box that is clicked stays mixed while the prop says so", async () => {
    const { container } = await render(ECheckbox, { props: { label: "All rows", indeterminate: true } });
    await page.getByRole("checkbox", { name: "All rows" }).click();
    await nextTick();
    expect(container.querySelector("input")!.indeterminate).toBe(true);
  });

  test("an error is linked, marks the box invalid, is announced and sits 8px under the box", async () => {
    const { container } = await render(ECheckbox, { props: { label: "Agree", error: "You must agree" } });
    container.classList.add("e-root");
    const input = container.querySelector("input")!;
    const error = container.querySelector(".e-field-error")!;
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(input.getAttribute("aria-describedby")).toBe(error.id);
    expect(error.getAttribute("role")).toBe("alert");
    expect(container.firstElementChild!.className).toBe("e-choice-wrap");
    expect(error.getBoundingClientRect().top - input.getBoundingClientRect().bottom).toBe(8);
    await expect.element(page.getByRole("checkbox", { name: "Agree" })).toHaveAccessibleDescription("You must agree");
  });

  test("indeterminate is the mixed state of the input", async () => {
    const { container } = await render(ECheckbox, { props: { label: "All rows", indeterminate: true } });
    expect(container.querySelector("input")!.indeterminate).toBe(true);
    // It reads as on, with a dash in place of the tick: a filled face and a mask on ::after.
    const box = container.querySelector("input")!;
    expect(getComputedStyle(box).backgroundColor).not.toBe(getComputedStyle(document.body).backgroundColor);
    expect(getComputedStyle(box, "::after").maskImage).toContain("rect");
  });

  test("bare hides the label visually and keeps it for screen readers", async () => {
    const { container } = await render(ECheckbox, { props: { label: "Select row 1", bare: true } });
    expect(container.querySelector("label")!.className).toBe("e-choice e-choice--bare");
    expect(container.querySelector(".e-sr")!.textContent).toBe("Select row 1");
    await expect.element(page.getByRole("checkbox", { name: "Select row 1" })).toBeVisible();
  });

  test("disabled, name, value and required reach the input", async () => {
    const { container } = await render(ECheckbox, {
      props: { label: "A", disabled: true, name: "agree", value: "yes", required: true },
    });
    const input = container.querySelector("input")!;
    expect(input.disabled).toBe(true);
    expect(input.name).toBe("agree");
    expect(input.value).toBe("yes");
    expect(input.required).toBe(true);
    expect(container.querySelector("label")!.classList.contains("e-choice--disabled")).toBe(true);
  });

  test("attributes land on the input, class and style on the row", async () => {
    const events: string[] = [];
    const { container } = await render(ECheckbox, {
      props: { label: "A" },
      attrs: { "data-x": "1", "aria-label": "Custom", class: "mine", onFocus: () => events.push("focus") },
    });
    const input = container.querySelector("input")!;
    expect(input.dataset["x"]).toBe("1");
    expect(container.firstElementChild!.className).toBe("e-choice-wrap mine");
    await userEvent.tab();
    expect(events).toEqual(["focus"]);
  });

  test("has no accessibility violations in any state", async () => {
    const { container } = await render(
      defineComponent({
        render: () =>
          h("div", [
            h(ECheckbox, { label: "Plain" }),
            h(ECheckbox, { label: "Described", description: "More detail" }),
            h(ECheckbox, { label: "Checked", modelValue: true }),
            h(ECheckbox, { label: "Mixed", indeterminate: true }),
            h(ECheckbox, { label: "Invalid", error: "Required to continue" }),
            h(ECheckbox, { label: "Disabled", disabled: true }),
            h(ECheckbox, { label: "Bare", bare: true }),
          ]),
      }),
    );
    await expectNoViolations(container);
  });
  test("an error turns the box edge danger, and pointing at it tints the face", async () => {
    const ok = await render(ECheckbox, { props: { label: "Agree" } });
    ok.container.classList.add("e-root");
    const plain = getComputedStyle(ok.container.querySelector("input")!).borderTopColor;
    const { container } = await render(ECheckbox, { props: { label: "Agree", error: "Required" } });
    container.classList.add("e-root");
    const box = container.querySelector("input")!;
    await new Promise((r) => setTimeout(r, 250));
    expect(getComputedStyle(box).borderTopColor).not.toBe(plain);
    expect(getComputedStyle(box).borderTopColor).toBe(colourOf(container, "--e-danger"));
    await userEvent.hover(box);
    await new Promise((r) => setTimeout(r, 250));
    expect(getComputedStyle(box).backgroundColor).toBe(colourOf(container, "--e-danger-soft"));
  });

  test("a checked box with an error keeps its primary fill and gains a danger ring", async () => {
    const { container } = await render(ECheckbox, { props: { label: "Agree", error: "Required", modelValue: true } });
    container.classList.add("e-root");
    const box = container.querySelector("input")!;
    await new Promise((r) => setTimeout(r, 250));
    const style = getComputedStyle(box);
    expect(style.backgroundColor).toBe(colourOf(container, "--e-primary"));
    expect(style.boxShadow).toContain(colourOf(container, "--e-danger"));
  });

  test("a disabled box with an error stays neutral", async () => {
    const { container } = await render(ECheckbox, { props: { label: "Agree", error: "Required", disabled: true } });
    container.classList.add("e-root");
    const style = getComputedStyle(container.querySelector("input")!);
    expect(style.outlineStyle).toBe("dashed");
    expect(style.boxShadow).toBe("none");
  });

  test("focus() through a component ref focuses the box", async () => {
    let api: { input: HTMLInputElement | null; focus: () => void } | null = null;
    const { container } = await render(
      defineComponent({ render: () => h(ECheckbox, { label: "Agree", ref: (r: unknown) => (api = r as typeof api) }) }),
    );
    api!.focus();
    expect(document.activeElement).toBe(container.querySelector("input"));
    expect(api!.input).toBe(container.querySelector("input"));
  });
});

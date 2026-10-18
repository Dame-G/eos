import { describe, expect, test } from "vitest";
import { defineComponent, h, nextTick, ref } from "vue";
import { page } from "vitest/browser";
import { render } from "vitest-browser-vue";
import AeTextarea from "./AeTextarea.vue";
import { expectNoViolations } from "../../../test/axe.js";

describe("AeTextarea", () => {
  test("is a labelled textarea, 4 rows by default, resizable vertically", async () => {
    const { container } = await render(AeTextarea, { props: { label: "Note" } });
    await expect.element(page.getByRole("textbox", { name: "Note" })).toBeVisible();
    const el = container.querySelector("textarea")!;
    expect(el.className).toBe("ae-input ae-textarea");
    expect(el.rows).toBe(4);
    expect(getComputedStyle(el).resize).toBe("vertical");
  });

  test("is at least 6.5rem tall, taller than a one-line input", async () => {
    const { container } = await render(AeTextarea, { props: { label: "Note", rows: 2 } });
    const el = container.querySelector("textarea")!;
    expect(el.rows).toBe(2);
    expect(el.getBoundingClientRect().height).toBeGreaterThanOrEqual(104);
  });

  test("v-model round trip", async () => {
    const model = ref("first");
    const got: string[] = [];
    await render(
      defineComponent({
        render: () =>
          h(AeTextarea, {
            label: "Note",
            modelValue: model.value,
            "onUpdate:modelValue": (v: string) => {
              got.push(v);
              model.value = v;
            },
          }),
      }),
    );
    const box = page.getByRole("textbox", { name: "Note" });
    await expect.element(box).toHaveValue("first");
    await box.fill("Hello");
    expect(got.at(-1)).toBe("Hello");
    model.value = "again";
    await nextTick();
    await expect.element(box).toHaveValue("again");
  });

  test("attributes land on the textarea, class and style on the wrapper", async () => {
    const { container } = await render(AeTextarea, {
      props: { label: "Note", hint: "Short" },
      attrs: { name: "note", maxlength: 200, "data-x": "1", class: "mine" },
    });
    const el = container.querySelector("textarea")!;
    expect(el.name).toBe("note");
    expect(el.maxLength).toBe(200);
    expect(el.dataset["x"]).toBe("1");
    expect(el.getAttribute("aria-describedby")).toBe(container.querySelector(".ae-field-hint")!.id);
    expect(container.firstElementChild!.className).toBe("ae-field mine");
  });

  test("an error marks the textarea invalid and is announced; the hint sits 8px under it", async () => {
    const invalid = await render(AeTextarea, { props: { label: "Note", error: "Too short" } });
    expect(invalid.container.querySelector("textarea")!.getAttribute("aria-invalid")).toBe("true");
    expect(invalid.container.querySelector(".ae-field-error")!.getAttribute("role")).toBe("alert");
    const hinted = await render(AeTextarea, { props: { label: "Note", hint: "Hint" } });
    const box = hinted.container.querySelector("textarea")!.getBoundingClientRect();
    const hint = hinted.container.querySelector(".ae-field-hint")!.getBoundingClientRect();
    expect(hint.top - box.bottom).toBe(8);
  });

  test("has no accessibility violations in any state", async () => {
    const { container } = await render(
      defineComponent({
        render: () =>
          h("div", [
            h(AeTextarea, { label: "Plain" }),
            h(AeTextarea, { label: "Hinted", hint: "A hint", required: true, placeholder: "Example" }),
            h(AeTextarea, { label: "Invalid", error: "Fix this" }),
            h(AeTextarea, { label: "Disabled", disabled: true, optional: true }),
          ]),
      }),
    );
    await expectNoViolations(container);
  });
});

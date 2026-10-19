import { describe, expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-vue";
import EColorField from "./EColorField.vue";
import { createEos } from "../../plugin.js";
import { expectNoViolations } from "../../../test/axe.js";

describe("EColorField", () => {
  test("is a labelled text box with a swatch beside it", async () => {
    const { container } = await render(EColorField, { props: { label: "Brand colour", modelValue: "#2c95b4" } });
    await expect.element(page.getByRole("textbox", { name: "Brand colour" })).toHaveValue("#2c95b4");
    const swatch = container.querySelector<HTMLInputElement>("input[type=color]")!;
    expect(swatch.value).toBe("#2c95b4");
    expect(swatch.getAttribute("aria-label")).toBe("Pick a colour");
  });

  test("a typed colour is normalised and written to the model; a partial one is not", async () => {
    const updates: string[] = [];
    await render(EColorField, {
      props: { label: "Brand colour", modelValue: "#2c95b4", "onUpdate:modelValue": (v: string) => updates.push(v) },
    });
    const box = page.getByRole("textbox", { name: "Brand colour" });
    await box.fill("#ABC");
    expect(updates.at(-1)).toBe("#aabbcc");
    updates.length = 0;
    await box.fill("#12");
    expect(updates).toEqual([]);
  });

  test("the placeholder example comes from the messages", async () => {
    const fallback = await render(EColorField, { props: { label: "Brand colour" } });
    expect(fallback.container.querySelector<HTMLInputElement>("input[type=text]")!.placeholder).toBe("#2c95b4");
    const custom = await render(EColorField, {
      props: { label: "Couleur" },
      global: { plugins: [createEos({ themeTarget: null, messages: { colorPlaceholder: "#0a5c36" } })] },
    });
    expect(custom.container.querySelector<HTMLInputElement>("input[type=text]")!.placeholder).toBe("#0a5c36");
  });

  test("text that is not a colour is flagged when the person leaves the box", async () => {
    await render(EColorField, { props: { label: "Brand colour", modelValue: "#2c95b4" } });
    const box = page.getByRole("textbox", { name: "Brand colour" });
    await box.fill("teal");
    await userEvent.tab();
    await expect.element(page.getByText("Enter a colour like #2c95b4")).toBeVisible();
    expect(box.element().getAttribute("aria-invalid")).toBe("true");
  });

  test("the picker changes the model and the text", async () => {
    const updates: string[] = [];
    const { container } = await render(EColorField, {
      props: { label: "Brand colour", modelValue: "#2c95b4", "onUpdate:modelValue": (v: string) => updates.push(v) },
    });
    const swatch = container.querySelector<HTMLInputElement>("input[type=color]")!;
    swatch.value = "#ff0000";
    swatch.dispatchEvent(new Event("input", { bubbles: true }));
    expect(updates.at(-1)).toBe("#ff0000");
  });

  test("an error from outside replaces the hint", async () => {
    await render(EColorField, {
      props: { label: "Brand colour", modelValue: "#2c95b4", hint: "A hint", error: "Too pale" },
    });
    await expect.element(page.getByText("Too pale")).toBeVisible();
  });

  test("has no accessibility violations", async () => {
    const { container } = await render(EColorField, {
      props: { label: "Brand colour", modelValue: "#2c95b4", hint: "A hint" },
    });
    await expectNoViolations(container);
  });
});

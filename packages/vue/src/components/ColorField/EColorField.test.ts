import { describe, expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-vue";
import EColorField from "./EColorField.vue";
import { createEos } from "../../plugin.js";
import { expectNoViolations } from "../../../test/axe.js";
import { expectPostingContract } from "../../../test/formPosting.js";

/** The top-left corner radius in px. */
const corner = (el: Element) => parseFloat(getComputedStyle(el).borderTopLeftRadius);

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

  test("text that is not a colour is flagged when the person leaves the box, and emits invalid", async () => {
    const heard: [string, string][] = [];
    const models: string[] = [];
    await render(EColorField, {
      props: {
        label: "Brand colour",
        modelValue: "#2c95b4",
        onInvalid: (text: string, message: string) => heard.push([text, message]),
        "onUpdate:modelValue": (v: string) => models.push(v),
      },
    });
    const box = page.getByRole("textbox", { name: "Brand colour" });
    await box.fill("teal");
    await userEvent.tab();
    await expect.element(page.getByText("Enter a colour like #2c95b4")).toBeVisible();
    expect(box.element().getAttribute("aria-invalid")).toBe("true");
    expect(heard).toHaveLength(1);
    expect(heard[0]![0]).toBe("teal");
    expect(heard[0]![1]).toMatch(/^Enter a colour like #2c95b4/);
    expect(models).toEqual([]);
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

  test("an empty value shows a neutral chip, not black", async () => {
    const { container } = await render(EColorField, { props: { label: "Brand colour", modelValue: "" } });
    expect(container.querySelector(".e-color-empty")).not.toBeNull();
    const filled = await render(EColorField, { props: { label: "Brand colour", modelValue: "#2c95b4" } });
    expect(filled.container.querySelector(".e-color-empty")).toBeNull();
  });

  test("clearing the text writes an empty value", async () => {
    const updates: string[] = [];
    await render(EColorField, {
      props: { label: "Brand colour", modelValue: "#2c95b4", "onUpdate:modelValue": (v: string) => updates.push(v) },
    });
    await page.getByRole("textbox", { name: "Brand colour" }).fill("");
    expect(updates.at(-1)).toBe("");
  });

  test("name submits the normalised hex through a hidden input", async () => {
    const { container } = await render(EColorField, { props: { label: "Brand colour", name: "brand" } });
    const hidden = container.querySelector<HTMLInputElement>("input[type=hidden]")!;
    expect(hidden.name).toBe("brand");
    expect(hidden.value).toBe("");
    await page.getByRole("textbox", { name: "Brand colour" }).fill("#ABC");
    expect(hidden.value).toBe("#aabbcc");
    await page.getByRole("textbox", { name: "Brand colour" }).fill("#12");
    expect(hidden.value).toBe("");
    expect(container.querySelector<HTMLInputElement>("input[type=text]")!.hasAttribute("name")).toBe(false);
  });

  test("readonly keeps the value, stays focusable and locks the picker", async () => {
    const updates: string[] = [];
    const { container } = await render(EColorField, {
      props: {
        label: "Brand colour",
        modelValue: "#2c95b4",
        readonly: true,
        "onUpdate:modelValue": (v: string) => updates.push(v),
      },
    });
    const box = container.querySelector<HTMLInputElement>("input[type=text]")!;
    expect(box.readOnly).toBe(true);
    expect(container.querySelector<HTMLInputElement>("input[type=color]")!.disabled).toBe(true);
    await userEvent.tab();
    expect(document.activeElement).toBe(box);
    await userEvent.keyboard("abc");
    expect(updates).toEqual([]);
    expect(box.value).toBe("#2c95b4");
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

  test("a disabled colour posts nothing, and a named one joins a form it is outside of", async () => {
    await expectPostingContract(EColorField, { label: "Brand", modelValue: "#2c95b4" });
  });

  test("a click on the padding focuses the text box, but the swatch keeps its own click", async () => {
    const { container } = await render(EColorField, { props: { label: "Brand", modelValue: "#2c95b4" } });
    (container.querySelector(".e-input-wrap") as HTMLElement).click();
    expect(document.activeElement).toBe(container.querySelector("input[type=text]"));
    (document.activeElement as HTMLElement).blur();
    (container.querySelector(".e-color-swatch") as HTMLElement).click();
    expect(document.activeElement).not.toBe(container.querySelector("input[type=text]"));
  });

  test("corners are concentric: the swatch and the empty chip sit the same distance inside the field on every side, and their corners are the field radius less the border and pad-inset, at any theme", async () => {
    const { container } = await render(EColorField, { props: { label: "Brand colour", modelValue: "" } });
    const root = container as HTMLElement;
    root.classList.add("e-root");
    const wrap = root.querySelector(".e-input-wrap")!;
    const swatch = wrap.querySelector(".e-color-swatch")!;
    const chip = wrap.querySelector(".e-color-empty")!;

    const w = wrap.getBoundingClientRect();
    const c = swatch.getBoundingClientRect();
    expect(c.left - w.left).toBeCloseTo(5, 0);
    expect(c.top - w.top).toBeCloseTo(5, 0);
    expect(w.bottom - c.bottom).toBeCloseTo(5, 0);

    for (const md of [null, "14px", "2px"]) {
      if (md) root.style.setProperty("--e-radius-md", md);
      const want = Math.max(0, corner(wrap) - 3);
      expect(corner(swatch)).toBeCloseTo(want, 0);
      expect(corner(chip)).toBeCloseTo(want, 0);
    }
  });
});

import { describe, expect, test } from "vitest";
import { defineComponent, h } from "vue";
import { page } from "vitest/browser";
import { render } from "vitest-browser-vue";
import EFieldset from "./EFieldset.vue";
import ETextField from "../TextField/ETextField.vue";
import { expectNoViolations } from "../../../test/axe.js";

const street = () => h(ETextField, { label: "Street" });

describe("EFieldset", () => {
  test("is a fieldset with a legend that names the group", async () => {
    const { container } = await render(EFieldset, { props: { legend: "Home address" }, slots: { default: street } });
    await expect.element(page.getByRole("group", { name: "Home address" })).toBeVisible();
    const fs = container.querySelector("fieldset")!;
    expect(fs.className).toBe("e-fieldset e-fieldset--box");
    expect(fs.querySelector("legend.e-fieldset-legend .e-fieldset-title")!.textContent).toBe("Home address");
    expect(fs.querySelector(".e-fieldset-body")).not.toBeNull();
  });

  test("bare drops the box: a kicker legend above the controls", async () => {
    const { container } = await render(EFieldset, {
      props: { legend: "Reminder", bare: true },
      slots: { default: street },
    });
    const fs = container.querySelector("fieldset")!;
    expect(fs.className).toBe("e-fieldset");
    expect(fs.querySelector("legend")!.classList.contains("e-kicker")).toBe(true);
    expect(fs.querySelector(".e-fieldset-body")).toBeNull();
    expect(fs.querySelector(".e-fieldset-rule")).toBeNull();
    expect(getComputedStyle(fs).borderTopWidth).toBe("0px");
  });

  test("the legend class and the wrapper's class are kept", async () => {
    const { container } = await render(EFieldset, {
      props: { legend: "L", legendClass: "extra" },
      attrs: { class: "mine" },
      slots: { default: street },
    });
    expect(container.querySelector("fieldset")!.className).toBe("e-fieldset e-fieldset--box mine");
    expect(container.querySelector("legend")!.classList.contains("extra")).toBe(true);
  });

  test("hideLegend keeps the legend for screen readers only", async () => {
    const { container } = await render(EFieldset, {
      props: { legend: "Hidden", hideLegend: true, bare: true },
      slots: { default: street },
    });
    const legend = container.querySelector("legend")!;
    expect(legend.classList.contains("e-fieldset-legend--hidden")).toBe(true);
    expect(legend.getBoundingClientRect().width).toBeLessThanOrEqual(1);
    await expect.element(page.getByRole("group", { name: "Hidden" })).toBeInTheDocument();
  });

  test("title and Required sit on the top edge with room either side", async () => {
    const { container } = await render(EFieldset, {
      props: { legend: "Home address", required: true },
      slots: { default: street },
    });
    container.classList.add("e-root");
    const fs = container.querySelector("fieldset")!.getBoundingClientRect();
    const title = container.querySelector(".e-fieldset-title")!;
    const flag = container.querySelector(".e-field-flag")!;
    const t = title.getBoundingClientRect();
    const fl = flag.getBoundingClientRect();
    const pad = parseFloat(getComputedStyle(title).paddingLeft);
    const padFlag = parseFloat(getComputedStyle(flag).paddingRight);
    expect(t.left - fs.left + pad).toBeGreaterThanOrEqual(24);
    expect(fs.right - fl.right + padFlag).toBeGreaterThanOrEqual(24);
    expect(fl.left).toBeGreaterThan(t.right);
    expect(flag.textContent).toBe("Required");
  });

  test("the rule runs between the title and the flag", async () => {
    const { container } = await render(EFieldset, {
      props: { legend: "Home address", optional: true },
      slots: { default: street },
    });
    const rule = container.querySelector(".e-fieldset-rule")!;
    expect(rule.getAttribute("aria-hidden")).toBe("true");
    expect(rule.getBoundingClientRect().width).toBeGreaterThanOrEqual(16);
    expect(container.querySelector(".e-field-flag")!.textContent).toBe("Optional");
  });

  test("the hint and the error are announced with the group", async () => {
    const hinted = await render(EFieldset, {
      props: { legend: "Contact", hint: "Pick the best way" },
      slots: { default: street },
    });
    const hintEl = hinted.container.querySelector(".e-field-hint")!;
    const fs = hinted.container.querySelector("fieldset")!;
    expect(fs.getAttribute("aria-describedby")).toBe(hintEl.id);
    await expect.element(page.getByRole("group", { name: "Contact" })).toHaveAccessibleDescription("Pick the best way");

    const bad = await render(EFieldset, {
      props: { legend: "Contact2", hint: "Hint", error: "Choose one" },
      slots: { default: street },
    });
    const errorEl = bad.container.querySelector(".e-field-error")!;
    expect(bad.container.querySelector(".e-field-hint")).toBeNull();
    expect(errorEl.getAttribute("role")).toBe("alert");
    expect(bad.container.querySelector("fieldset")!.getAttribute("aria-invalid")).toBe("true");
    expect(bad.container.querySelector("fieldset")!.getAttribute("aria-describedby")).toBe(errorEl.id);
  });

  test("disabled disables everything inside", async () => {
    const { container } = await render(EFieldset, {
      props: { legend: "Locked", disabled: true },
      slots: { default: street },
    });
    expect(container.querySelector("fieldset")!.disabled).toBe(true);
    expect(container.querySelector("input")!.matches(":disabled")).toBe(true);
  });

  test("the hint sits 8px under the last control, in the box and bare", async () => {
    const boxed = await render(EFieldset, { props: { legend: "Box", hint: "Hint" }, slots: { default: street } });
    boxed.container.classList.add("e-root");
    const input = boxed.container.querySelector("input")!.getBoundingClientRect();
    const hint = boxed.container.querySelector(".e-field-hint")!.getBoundingClientRect();
    expect(hint.top - input.bottom).toBe(8);

    const bare = await render(EFieldset, {
      props: { legend: "Bare", bare: true, hint: "Hint" },
      slots: { default: () => h("input", { class: "e-input", "aria-label": "x" }) },
    });
    bare.container.classList.add("e-root");
    const box = bare.container.querySelector("input")!.getBoundingClientRect();
    const hint2 = bare.container.querySelector(".e-field-hint")!.getBoundingClientRect();
    expect(hint2.top - box.bottom).toBe(-6);
  });

  test("has no accessibility violations in any state", async () => {
    const { container } = await render(
      defineComponent({
        render: () =>
          h("div", [
            h(EFieldset, { legend: "Boxed", required: true }, { default: street }),
            h(EFieldset, { legend: "Hinted", hint: "A hint", optional: true }, { default: street }),
            h(EFieldset, { legend: "Invalid", error: "Fix this" }, { default: street }),
            h(EFieldset, { legend: "Disabled", disabled: true }, { default: street }),
            h(EFieldset, { legend: "Bare", bare: true, hint: "Hint" }, { default: street }),
            h(EFieldset, { legend: "Bare invalid", bare: true, error: "Bad" }, { default: street }),
          ]),
      }),
    );
    await expectNoViolations(container);
  });
});

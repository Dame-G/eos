import { describe, expect, test } from "vitest";
import { defineComponent, h } from "vue";
import { page } from "vitest/browser";
import { render } from "vitest-browser-vue";
import AeFieldset from "./AeFieldset.vue";
import AeTextField from "../TextField/AeTextField.vue";
import { expectNoViolations } from "../../../test/axe.js";

const street = () => h(AeTextField, { label: "Street" });

describe("AeFieldset", () => {
  test("is a fieldset with a legend that names the group", async () => {
    const { container } = await render(AeFieldset, { props: { legend: "Home address" }, slots: { default: street } });
    await expect.element(page.getByRole("group", { name: "Home address" })).toBeVisible();
    const fs = container.querySelector("fieldset")!;
    expect(fs.className).toBe("ae-fieldset ae-fieldset--box");
    expect(fs.querySelector("legend.ae-fieldset-legend .ae-fieldset-title")!.textContent).toBe("Home address");
    expect(fs.querySelector(".ae-fieldset-body")).not.toBeNull();
  });

  test("bare drops the box: a kicker legend above the controls", async () => {
    const { container } = await render(AeFieldset, {
      props: { legend: "Reminder", bare: true },
      slots: { default: street },
    });
    const fs = container.querySelector("fieldset")!;
    expect(fs.className).toBe("ae-fieldset");
    expect(fs.querySelector("legend")!.classList.contains("ae-kicker")).toBe(true);
    expect(fs.querySelector(".ae-fieldset-body")).toBeNull();
    expect(fs.querySelector(".ae-fieldset-rule")).toBeNull();
    expect(getComputedStyle(fs).borderTopWidth).toBe("0px");
  });

  test("the legend class and the wrapper's class are kept", async () => {
    const { container } = await render(AeFieldset, {
      props: { legend: "L", legendClassName: "extra" },
      attrs: { class: "mine" },
      slots: { default: street },
    });
    expect(container.querySelector("fieldset")!.className).toBe("ae-fieldset ae-fieldset--box mine");
    expect(container.querySelector("legend")!.classList.contains("extra")).toBe(true);
  });

  test("title and Required sit on the top edge with room either side", async () => {
    const { container } = await render(AeFieldset, {
      props: { legend: "Home address", required: true },
      slots: { default: street },
    });
    container.classList.add("ae-root");
    const fs = container.querySelector("fieldset")!.getBoundingClientRect();
    const title = container.querySelector(".ae-fieldset-title")!;
    const flag = container.querySelector(".ae-field-flag")!;
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
    const { container } = await render(AeFieldset, {
      props: { legend: "Home address", optional: true },
      slots: { default: street },
    });
    const rule = container.querySelector(".ae-fieldset-rule")!;
    expect(rule.getAttribute("aria-hidden")).toBe("true");
    expect(rule.getBoundingClientRect().width).toBeGreaterThanOrEqual(16);
    expect(container.querySelector(".ae-field-flag")!.textContent).toBe("Optional");
  });

  test("the hint and the error are announced with the group", async () => {
    const hinted = await render(AeFieldset, {
      props: { legend: "Contact", hint: "Pick the best way" },
      slots: { default: street },
    });
    const hintEl = hinted.container.querySelector(".ae-field-hint")!;
    const fs = hinted.container.querySelector("fieldset")!;
    expect(fs.getAttribute("aria-describedby")).toBe(hintEl.id);
    await expect.element(page.getByRole("group", { name: "Contact" })).toHaveAccessibleDescription("Pick the best way");

    const bad = await render(AeFieldset, {
      props: { legend: "Contact2", hint: "Hint", error: "Choose one" },
      slots: { default: street },
    });
    const errorEl = bad.container.querySelector(".ae-field-error")!;
    expect(bad.container.querySelector(".ae-field-hint")).toBeNull();
    expect(errorEl.getAttribute("role")).toBe("alert");
    expect(bad.container.querySelector("fieldset")!.getAttribute("aria-invalid")).toBe("true");
    expect(bad.container.querySelector("fieldset")!.getAttribute("aria-describedby")).toBe(errorEl.id);
  });

  test("disabled disables everything inside", async () => {
    const { container } = await render(AeFieldset, {
      props: { legend: "Locked", disabled: true },
      slots: { default: street },
    });
    expect(container.querySelector("fieldset")!.disabled).toBe(true);
    expect(container.querySelector("input")!.matches(":disabled")).toBe(true);
  });

  test("the hint sits 8px under the last control, in the box and bare", async () => {
    const boxed = await render(AeFieldset, { props: { legend: "Box", hint: "Hint" }, slots: { default: street } });
    boxed.container.classList.add("ae-root");
    const input = boxed.container.querySelector("input")!.getBoundingClientRect();
    const hint = boxed.container.querySelector(".ae-field-hint")!.getBoundingClientRect();
    expect(hint.top - input.bottom).toBe(8);

    const bare = await render(AeFieldset, {
      props: { legend: "Bare", bare: true, hint: "Hint" },
      slots: { default: () => h("input", { class: "ae-input", "aria-label": "x" }) },
    });
    bare.container.classList.add("ae-root");
    const box = bare.container.querySelector("input")!.getBoundingClientRect();
    const hint2 = bare.container.querySelector(".ae-field-hint")!.getBoundingClientRect();
    expect(hint2.top - box.bottom).toBe(-6);
  });

  test("has no accessibility violations in any state", async () => {
    const { container } = await render(
      defineComponent({
        render: () =>
          h("div", [
            h(AeFieldset, { legend: "Boxed", required: true }, { default: street }),
            h(AeFieldset, { legend: "Hinted", hint: "A hint", optional: true }, { default: street }),
            h(AeFieldset, { legend: "Invalid", error: "Fix this" }, { default: street }),
            h(AeFieldset, { legend: "Disabled", disabled: true }, { default: street }),
            h(AeFieldset, { legend: "Bare", bare: true, hint: "Hint" }, { default: street }),
            h(AeFieldset, { legend: "Bare invalid", bare: true, error: "Bad" }, { default: street }),
          ]),
      }),
    );
    await expectNoViolations(container);
  });
});

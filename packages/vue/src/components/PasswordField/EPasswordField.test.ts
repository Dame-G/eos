import { describe, expect, test } from "vitest";
import { defineComponent, h, nextTick, ref } from "vue";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-vue";
import EPasswordField from "./EPasswordField.vue";
import { expectNoViolations } from "../../../test/axe.js";

const rules = [
  { label: "10 characters", test: (v: string) => v.length >= 10 },
  { label: "A number", test: (v: string) => /\d/.test(v) },
];

describe("EPasswordField", () => {
  test("is a labelled password input, labelled Password by default", async () => {
    const { container } = await render(EPasswordField);
    await expect.element(page.getByLabelText("Password", { exact: true })).toBeVisible();
    const input = container.querySelector("input")!;
    expect(input.type).toBe("password");
    expect(input.className).toBe("e-input");
    expect(container.querySelector("label")!.getAttribute("for")).toBe(input.id);
  });

  test("a custom label is used", async () => {
    await render(EPasswordField, { props: { label: "New password" } });
    await expect.element(page.getByLabelText("New password")).toBeVisible();
  });

  test("mode sets the autocomplete token", async () => {
    const { container } = await render(EPasswordField, { props: { mode: "new" } });
    expect(container.querySelector("input")!.autocomplete).toBe("new-password");
    const current = await render(EPasswordField);
    expect(current.container.querySelector("input")!.autocomplete).toBe("current-password");
  });

  test("never blocks paste, capitalising or spellchecking", async () => {
    const { container } = await render(EPasswordField);
    const input = container.querySelector("input")!;
    expect(input.getAttribute("autocapitalize")).toBe("none");
    expect(input.spellcheck).toBe(false);
    expect(input.getAttribute("onpaste")).toBeNull();
  });

  test("the toggle shows and hides the password and reports aria-pressed", async () => {
    const { container } = await render(EPasswordField, { props: { mode: "new", rules: [rules[0]!] } });
    const toggle = page.getByRole("button", { name: "Show password" });
    await expect.element(toggle).toHaveAttribute("aria-pressed", "false");
    await toggle.click();
    expect(container.querySelector("input")!.type).toBe("text");
    await expect.element(toggle).toHaveAttribute("aria-pressed", "true");
    expect(container.querySelector(".e-reveal")!.getAttribute("aria-label")).toBe("Show password");
    await toggle.click();
    expect(container.querySelector("input")!.type).toBe("password");
  });

  test("name and placeholder reach the input", async () => {
    const { container } = await render(EPasswordField, { props: { name: "pw", placeholder: "••••" } });
    const input = container.querySelector("input")!;
    expect(input.name).toBe("pw");
    expect(input.placeholder).toBe("••••");
  });

  test("a rule that flips is announced", async () => {
    const model = ref("");
    await render(
      defineComponent({
        render: () =>
          h(EPasswordField, {
            rules: [rules[1]!],
            modelValue: model.value,
            "onUpdate:modelValue": (v: string) => (model.value = v),
          }),
      }),
    );
    await userEvent.type(page.getByLabelText("Password"), "a1");
    await nextTick();
    const live = document.querySelector("[data-e-announcer=polite]")!;
    await expect.poll(() => live.textContent).toContain("A number: met");
  });

  test("the toggle works from the keyboard", async () => {
    const { container } = await render(EPasswordField);
    await userEvent.tab();
    await userEvent.tab();
    await expect.element(page.getByRole("button", { name: "Show password" })).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    expect(container.querySelector("input")!.type).toBe("text");
  });

  test("rules update as you type and say met or not met in words", async () => {
    const { container } = await render(EPasswordField, { props: { mode: "new", rules } });
    const list = page.getByRole("list", { name: "Your password needs:" });
    await expect.element(list).toBeVisible();
    expect(container.querySelectorAll(".e-rule[data-met]").length).toBe(0);
    expect(container.querySelector(".e-rule")!.textContent).toContain("not met yet");
    await page.getByLabelText("Password").fill("abcdefghijk");
    await nextTick();
    const items = container.querySelectorAll(".e-rule");
    expect(items[0]!.hasAttribute("data-met")).toBe(true);
    expect(items[0]!.textContent).toContain("(met)");
    expect(items[1]!.hasAttribute("data-met")).toBe(false);
    expect(items[0]!.querySelector("svg")).not.toBeNull();
    expect(items[1]!.querySelector(".e-rule-dot")).not.toBeNull();
    await page.getByLabelText("Password").fill("abcdefghij1");
    await nextTick();
    expect(container.querySelectorAll(".e-rule[data-met]").length).toBe(2);
  });

  test("the input is described by the hint and the rules", async () => {
    const { container } = await render(EPasswordField, { props: { rules, hint: "Use a passphrase" } });
    const input = container.querySelector("input")!;
    const ids = input.getAttribute("aria-describedby")!.split(" ");
    expect(ids).toContain(container.querySelector(".e-field-hint")!.id);
    expect(ids).toContain(container.querySelector(".e-rules")!.id);
  });

  test("v-model round trip", async () => {
    const model = ref("one");
    const got: string[] = [];
    await render(
      defineComponent({
        render: () =>
          h(EPasswordField, {
            modelValue: model.value,
            "onUpdate:modelValue": (v: string) => {
              got.push(v);
              model.value = v;
            },
          }),
      }),
    );
    const box = page.getByLabelText("Password");
    await expect.element(box).toHaveValue("one");
    await box.fill("two");
    expect(got.at(-1)).toBe("two");
    model.value = "three";
    await nextTick();
    await expect.element(box).toHaveValue("three");
  });

  test("passes name, aria-* and listeners to the input; class and style stay on the wrapper", async () => {
    const events: string[] = [];
    const { container } = await render(EPasswordField, {
      attrs: {
        name: "pw",
        "data-test": "x",
        class: "mine",
        style: "max-width: 300px",
        onBlur: () => events.push("blur"),
      },
    });
    const input = container.querySelector("input")!;
    expect(input.name).toBe("pw");
    expect(input.dataset["test"]).toBe("x");
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toBe("e-field mine");
    expect(root.style.maxWidth).toBe("300px");
    await userEvent.tab();
    await userEvent.tab();
    expect(events).toEqual(["blur"]);
  });

  test("a consumer's autocomplete wins over the mode", async () => {
    const { container } = await render(EPasswordField, { props: { mode: "new" }, attrs: { autocomplete: "off" } });
    expect(container.querySelector("input")!.autocomplete).toBe("off");
  });

  test("an error replaces the hint, marks the input invalid and is announced", async () => {
    const { container } = await render(EPasswordField, { props: { hint: "Hint", error: "Too short" } });
    expect(container.querySelector("input")!.getAttribute("aria-invalid")).toBe("true");
    expect(container.querySelector(".e-field-hint")).toBeNull();
    expect(container.querySelector("[role=alert]")!.textContent).toContain("Too short");
    expect(container.querySelector(".e-input-wrap")!.hasAttribute("data-invalid")).toBe(true);
  });

  test("disabled disables the input and the toggle", async () => {
    const { container } = await render(EPasswordField, { props: { disabled: true } });
    await expect.element(page.getByLabelText("Password")).toBeDisabled();
    await expect.element(page.getByRole("button", { name: "Show password" })).toBeDisabled();
    expect(container.querySelector(".e-input-wrap")!.hasAttribute("data-disabled")).toBe(true);
  });

  test("hideLabel keeps the label for screen readers", async () => {
    const { container } = await render(EPasswordField, { props: { hideLabel: true } });
    expect(container.querySelector("label")!.classList.contains("e-sr")).toBe(true);
    await expect.element(page.getByLabelText("Password")).toBeInTheDocument();
  });

  test("the field is 48px tall", async () => {
    const { container } = await render(EPasswordField);
    container.classList.add("e-root");
    expect(Math.round(container.querySelector(".e-input-wrap")!.getBoundingClientRect().height)).toBe(48);
  });

  test("has no accessibility violations: default, shown, rules, invalid, disabled", async () => {
    const { container } = await render(
      defineComponent({
        render: () =>
          h("div", [
            h(EPasswordField, { label: "Default" }),
            h(EPasswordField, { label: "With rules", rules, mode: "new", modelValue: "abcdefghij1" }),
            h(EPasswordField, { label: "Invalid", error: "Too short" }),
            h(EPasswordField, { label: "Disabled", disabled: true }),
          ]),
      }),
    );
    await expectNoViolations(container);
    await page.getByRole("button", { name: "Show password" }).first().click();
    await expectNoViolations(container);
  });
});

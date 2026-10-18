import { describe, expect, test } from "vitest";
import { defineComponent, h, nextTick, ref } from "vue";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-vue";
import AeRadioGroup from "./AeRadioGroup.vue";
import AeTextField from "../TextField/AeTextField.vue";
import { expectNoViolations } from "../../../test/axe.js";

describe("AeRadioGroup", () => {
  test("is a group named by its legend, with a radio per option", async () => {
    const { container } = await render(AeRadioGroup, { props: { label: "Reminder", options: ["Text", "Email"] } });
    await expect.element(page.getByRole("group", { name: "Reminder" })).toBeVisible();
    await expect.element(page.getByRole("radio", { name: "Text" })).toBeVisible();
    await expect.element(page.getByRole("radio", { name: "Email" })).toBeVisible();
    const fs = container.querySelector("fieldset")!;
    expect(fs.className).toBe("ae-fieldset ae-radiogroup");
    expect(fs.querySelector("legend")!.className).toBe("ae-fieldset-legend ae-kicker ae-radiogroup-legend");
    expect(fs.querySelectorAll("input.ae-radio").length).toBe(2);
  });

  test("the radios share one generated name, or the one given", async () => {
    const made = await render(AeRadioGroup, { props: { label: "A", options: ["x", "y"] } });
    const names = [...made.container.querySelectorAll("input")].map((i) => i.name);
    expect(new Set(names).size).toBe(1);
    expect(names[0]).toMatch(/^op-/);
    const given = await render(AeRadioGroup, { props: { label: "B", options: ["x"], name: "method" } });
    expect(given.container.querySelector("input")!.name).toBe("method");
  });

  test("v-model gets the value first, and the model picks the radio", async () => {
    const model = ref<string | undefined>(undefined);
    const got: string[] = [];
    await render(
      defineComponent({
        render: () =>
          h(AeRadioGroup, {
            label: "Reminder",
            options: ["Text", "Email"],
            modelValue: model.value,
            "onUpdate:modelValue": (v?: string) => {
              got.push(v!);
              model.value = v;
            },
          }),
      }),
    );
    await page.getByRole("radio", { name: "Email" }).click({ force: true });
    expect(got).toEqual(["Email"]);
    await expect.element(page.getByRole("radio", { name: "Email" })).toBeChecked();
    model.value = "Text";
    await nextTick();
    await expect.element(page.getByRole("radio", { name: "Text" })).toBeChecked();
    await expect.element(page.getByRole("radio", { name: "Email" })).not.toBeChecked();
  });

  test("arrow keys move between options and choose", async () => {
    const model = ref("Text");
    await render(
      defineComponent({
        render: () =>
          h(AeRadioGroup, {
            label: "Reminder",
            options: ["Text", "Email", "Call"],
            modelValue: model.value,
            "onUpdate:modelValue": (v?: string) => (model.value = v!),
          }),
      }),
    );
    await userEvent.tab();
    expect(document.activeElement).toBe(page.getByRole("radio", { name: "Text" }).element());
    await userEvent.keyboard("{ArrowDown}");
    expect(model.value).toBe("Email");
    await userEvent.keyboard("{ArrowDown}");
    expect(model.value).toBe("Call");
    await userEvent.keyboard("{ArrowUp}");
    expect(model.value).toBe("Email");
  });

  test("objects carry a label, a description and a disabled flag", async () => {
    const { container } = await render(AeRadioGroup, {
      props: {
        label: "Pay",
        options: [
          { value: "full", label: "Pay in full", description: "$162.40" },
          { value: "plan", label: "Payment plan", disabled: true },
        ],
      },
    });
    expect(container.querySelector(".ae-choice-desc")!.textContent).toBe("$162.40");
    const plan = page.getByRole("radio", { name: "Payment plan" });
    await expect.element(plan).toBeDisabled();
    expect(container.querySelectorAll(".ae-choice--disabled").length).toBe(1);
  });

  test("the legend, hint and error describe the group", async () => {
    const { container } = await render(AeRadioGroup, {
      props: { label: "Reminder", hint: "Pick one", options: ["Text", "Email"] },
    });
    const fs = container.querySelector("fieldset")!;
    expect(fs.querySelector("legend")).not.toBeNull();
    expect(fs.getAttribute("aria-describedby")).toBe(container.querySelector(".ae-field-hint")!.id);
    await expect.element(page.getByRole("group", { name: "Reminder" })).toHaveAccessibleDescription("Pick one");

    const bad = await render(AeRadioGroup, {
      props: { label: "Reminder2", hint: "Pick one", error: "Choose a way", options: ["Text"] },
    });
    expect(bad.container.querySelector(".ae-field-hint")).toBeNull();
    expect(bad.container.querySelector(".ae-field-error")!.getAttribute("role")).toBe("alert");
    expect(bad.container.querySelector("fieldset")!.getAttribute("aria-invalid")).toBe("true");
  });

  test("Required and Optional show beside the legend; required reaches every radio", async () => {
    const req = await render(AeRadioGroup, { props: { label: "A", options: ["x", "y"], required: true } });
    expect(req.container.querySelector(".ae-field-flag")!.textContent).toBe("Required");
    expect([...req.container.querySelectorAll("input")].every((i) => i.required)).toBe(true);
    const opt = await render(AeRadioGroup, { props: { label: "B", options: ["x"], optional: true } });
    expect(opt.container.querySelector(".ae-field-flag")!.textContent).toBe("Optional");
  });

  test("disabled disables every option", async () => {
    const { container } = await render(AeRadioGroup, { props: { label: "A", options: ["x", "y"], disabled: true } });
    expect([...container.querySelectorAll("input")].every((i) => i.matches(":disabled"))).toBe(true);
  });

  test("the hint sits 8px under the last option's radio", async () => {
    const { container } = await render(AeRadioGroup, { props: { label: "A", hint: "Hint", options: ["x", "y"] } });
    container.classList.add("ae-root");
    const radios = container.querySelectorAll("input.ae-radio");
    const last = radios[radios.length - 1]!.getBoundingClientRect();
    const hint = container.querySelector(".ae-field-hint")!.getBoundingClientRect();
    expect(hint.top - last.bottom).toBe(8);
  });

  test("reveal shows under the chosen option only, 4px under it and the full width of the group", async () => {
    const model = ref("full");
    const { container } = await render(
      defineComponent({
        render: () =>
          h(
            AeRadioGroup,
            {
              label: "Pay",
              options: [
                { value: "full", label: "Full" },
                { value: "part", label: "Part" },
              ],
              modelValue: model.value,
              "onUpdate:modelValue": (v?: string) => (model.value = v!),
            },
            {
              reveal: ({ option }: { option: { value: string } }) =>
                option.value === "part" ? h(AeTextField, { label: "Amount", class: "rv" }) : null,
            },
          ),
      }),
    );
    container.classList.add("ae-root");
    expect(container.querySelectorAll(".rv").length).toBe(0);
    expect(container.querySelector(".ae-choice--open")).toBeNull();
    await page.getByRole("radio", { name: "Part" }).click({ force: true });
    expect(container.querySelectorAll(".rv").length).toBe(1);
    const open = container.querySelector(".ae-choice--open")!;
    expect(open.textContent).toContain("Part");
    const reveal = container.querySelector(".ae-choice-reveal")!;
    expect(open.nextElementSibling).toBe(reveal);
    const fs = container.querySelector("fieldset")!.getBoundingClientRect();
    expect(reveal.getBoundingClientRect().width).toBe(fs.width);
    expect(getComputedStyle(reveal).paddingTop).toBe("4px");
    expect(getComputedStyle(open).paddingBottom).toBe("4px");
    await page.getByRole("radio", { name: "Full" }).click({ force: true });
    expect(container.querySelectorAll(".rv").length).toBe(0);
    expect(container.querySelector(".ae-choice-reveal")).toBeNull();
  });

  test("a reveal slot that renders nothing for an option leaves the option closed", async () => {
    const { container } = await render(AeRadioGroup, {
      props: { label: "Pay", modelValue: "full", options: ["full", "part"] },
      slots: { reveal: () => null },
    });
    expect(container.querySelector(".ae-choice--open")).toBeNull();
    expect(container.querySelector(".ae-choice-reveal")).toBeNull();
  });

  test("has no accessibility violations in any state, with a reveal open", async () => {
    const { container } = await render(
      defineComponent({
        render: () =>
          h("div", [
            h(AeRadioGroup, { label: "Plain", options: ["x", "y"] }),
            h(AeRadioGroup, { label: "Chosen", options: ["x", "y"], modelValue: "x", hint: "A hint", required: true }),
            h(AeRadioGroup, { label: "Invalid", options: ["x", "y"], error: "Choose one" }),
            h(AeRadioGroup, { label: "Disabled", options: ["x", "y"], disabled: true, optional: true }),
            h(
              AeRadioGroup,
              { label: "Revealed", options: ["full", "part"], modelValue: "part" },
              { reveal: () => h(AeTextField, { label: "Another amount" }) },
            ),
          ]),
      }),
    );
    await expectNoViolations(container);
  });
});

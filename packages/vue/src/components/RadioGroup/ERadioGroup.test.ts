import { describe, expect, test } from "vitest";
import { type Component, defineComponent, h, nextTick, ref } from "vue";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-vue";
import ERadioGroupGeneric from "./ERadioGroup.vue";
import ETextField from "../TextField/ETextField.vue";
import { expectNoViolations } from "../../../test/axe.js";

// Generic SFCs are not assignable to `mount`/`h` component typings; the tests drive them by props.
const ERadioGroup = ERadioGroupGeneric as unknown as Component;

function colourOf(host: Element, token: string) {
  const probe = document.createElement("span");
  probe.style.color = `var(${token})`;
  host.append(probe);
  const colour = getComputedStyle(probe).color;
  probe.remove();
  return colour;
}

describe("ERadioGroup", () => {
  test("is a group named by its legend, with a radio per option", async () => {
    const { container } = await render(ERadioGroup, { props: { label: "Reminder", options: ["Text", "Email"] } });
    await expect.element(page.getByRole("radiogroup", { name: "Reminder" })).toBeVisible();
    await expect.element(page.getByRole("radio", { name: "Text" })).toBeVisible();
    await expect.element(page.getByRole("radio", { name: "Email" })).toBeVisible();
    const fs = container.querySelector("fieldset")!;
    expect(fs.className).toBe("e-fieldset e-radiogroup");
    expect(fs.querySelector("legend")!.className).toBe("e-fieldset-legend e-kicker e-radiogroup-legend");
    expect(fs.querySelectorAll("input.e-radio").length).toBe(2);
  });

  test("the radios share one generated name, or the one given", async () => {
    const made = await render(ERadioGroup, { props: { label: "A", options: ["x", "y"] } });
    const names = [...made.container.querySelectorAll("input")].map((i) => i.name);
    expect(new Set(names).size).toBe(1);
    expect(names[0]).toMatch(/^e-/);
    const given = await render(ERadioGroup, { props: { label: "B", options: ["x"], name: "method" } });
    expect(given.container.querySelector("input")!.name).toBe("method");
  });

  test("v-model gets the value first, and the model picks the radio", async () => {
    const model = ref<string | undefined>(undefined);
    const got: string[] = [];
    await render(
      defineComponent({
        render: () =>
          h(ERadioGroup, {
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
          h(ERadioGroup, {
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
    const { container } = await render(ERadioGroup, {
      props: {
        label: "Pay",
        options: [
          { value: "full", label: "Pay in full", description: "$162.40" },
          { value: "plan", label: "Payment plan", disabled: true },
        ],
      },
    });
    expect(container.querySelector(".e-choice-desc")!.textContent).toBe("$162.40");
    // The description describes the radio and stays out of its name, as on a checkbox.
    const full = page.getByRole("radio", { name: "Pay in full", exact: true });
    await expect.element(full).toHaveAccessibleName("Pay in full");
    await expect.element(full).toHaveAccessibleDescription("$162.40");
    const plan = page.getByRole("radio", { name: "Payment plan" });
    await expect.element(plan).toBeDisabled();
    expect(container.querySelectorAll(".e-choice--disabled").length).toBe(1);
  });

  test("the legend, hint and error describe the group", async () => {
    const { container } = await render(ERadioGroup, {
      props: { label: "Reminder", hint: "Pick one", options: ["Text", "Email"] },
    });
    const fs = container.querySelector("fieldset")!;
    expect(fs.querySelector("legend")).not.toBeNull();
    expect(fs.getAttribute("aria-describedby")).toBe(container.querySelector(".e-field-hint")!.id);
    await expect.element(page.getByRole("radiogroup", { name: "Reminder" })).toHaveAccessibleDescription("Pick one");

    const bad = await render(ERadioGroup, {
      props: { label: "Reminder2", hint: "Pick one", error: "Choose a way", options: ["Text"] },
    });
    expect(bad.container.querySelector(".e-field-hint")).toBeNull();
    expect(bad.container.querySelector(".e-field-error")!.getAttribute("role")).toBe("alert");
    expect(bad.container.querySelector("input")!.getAttribute("aria-invalid")).toBe("true");
  });

  test("Required and Optional show beside the legend; required reaches every radio", async () => {
    const req = await render(ERadioGroup, { props: { label: "A", options: ["x", "y"], required: true } });
    expect(req.container.querySelector(".e-field-flag")!.textContent).toBe("Required");
    expect([...req.container.querySelectorAll("input")].every((i) => i.required)).toBe(true);
    const opt = await render(ERadioGroup, { props: { label: "B", options: ["x"], optional: true } });
    expect(opt.container.querySelector(".e-field-flag")!.textContent).toBe("Optional");
  });

  test("hideLabel keeps the group's accessible name and hides the legend", async () => {
    const { container } = await render(ERadioGroup, {
      props: { label: "Reminder", options: ["Text", "Email"], hideLabel: true },
    });
    await expect.element(page.getByRole("radiogroup", { name: "Reminder" })).toBeInTheDocument();
    expect(container.querySelector("legend")!.getBoundingClientRect().width).toBeLessThanOrEqual(1);
  });

  test("disabled disables every option", async () => {
    const { container } = await render(ERadioGroup, { props: { label: "A", options: ["x", "y"], disabled: true } });
    expect([...container.querySelectorAll("input")].every((i) => i.matches(":disabled"))).toBe(true);
  });

  test("the hint sits 8px under the last option's radio", async () => {
    const { container } = await render(ERadioGroup, { props: { label: "A", hint: "Hint", options: ["x", "y"] } });
    container.classList.add("e-root");
    const radios = container.querySelectorAll("input.e-radio");
    const last = radios[radios.length - 1]!.getBoundingClientRect();
    const hint = container.querySelector(".e-field-hint")!.getBoundingClientRect();
    expect(hint.top - last.bottom).toBe(8);
  });

  test("reveal shows under the chosen option only, 4px under it and the full width of the group", async () => {
    const model = ref("full");
    const { container } = await render(
      defineComponent({
        render: () =>
          h(
            ERadioGroup,
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
                option.value === "part" ? h(ETextField, { label: "Amount", class: "rv" }) : null,
            },
          ),
      }),
    );
    container.classList.add("e-root");
    expect(container.querySelectorAll(".rv").length).toBe(0);
    expect(container.querySelector(".e-choice--open")).toBeNull();
    await page.getByRole("radio", { name: "Part" }).click({ force: true });
    expect(container.querySelectorAll(".rv").length).toBe(1);
    const open = container.querySelector(".e-choice--open")!;
    expect(open.textContent).toContain("Part");
    const reveal = container.querySelector(".e-choice-reveal")!;
    expect(open.nextElementSibling).toBe(reveal);
    const fs = container.querySelector("fieldset")!.getBoundingClientRect();
    expect(reveal.getBoundingClientRect().width).toBe(fs.width);
    expect(getComputedStyle(reveal).paddingTop).toBe("4px");
    expect(getComputedStyle(open).paddingBottom).toBe("4px");
    await page.getByRole("radio", { name: "Full" }).click({ force: true });
    expect(container.querySelectorAll(".rv").length).toBe(0);
    expect(container.querySelector(".e-choice-reveal")).toBeNull();
  });

  test("a reveal slot that renders nothing for an option leaves the option closed", async () => {
    const { container } = await render(ERadioGroup, {
      props: { label: "Pay", modelValue: "full", options: ["full", "part"] },
      slots: { reveal: () => null },
    });
    expect(container.querySelector(".e-choice--open")).toBeNull();
    expect(container.querySelector(".e-choice-reveal")).toBeNull();
  });

  test("has no accessibility violations in any state, with a reveal open", async () => {
    const { container } = await render(
      defineComponent({
        render: () =>
          h("div", [
            h(ERadioGroup, { label: "Plain", options: ["x", "y"] }),
            h(ERadioGroup, { label: "Chosen", options: ["x", "y"], modelValue: "x", hint: "A hint", required: true }),
            h(ERadioGroup, { label: "Invalid", options: ["x", "y"], error: "Choose one" }),
            h(ERadioGroup, { label: "Disabled", options: ["x", "y"], disabled: true, optional: true }),
            h(
              ERadioGroup,
              { label: "Revealed", options: ["full", "part"], modelValue: "part" },
              { reveal: () => h(ETextField, { label: "Another amount" }) },
            ),
          ]),
      }),
    );
    await expectNoViolations(container);
  });
  test("an error turns the radio edges danger and tints a hovered one", async () => {
    const ok = await render(ERadioGroup, { props: { label: "Plan", options: ["A", "B"] } });
    ok.container.classList.add("e-root");
    const plain = getComputedStyle(ok.container.querySelector("input")!).borderTopColor;
    const { container } = await render(ERadioGroup, {
      props: { label: "Plan", options: ["A", "B"], error: "Pick one" },
    });
    container.classList.add("e-root");
    const radio = container.querySelector("input")!;
    expect(radio.getAttribute("aria-invalid")).toBe("true");
    await new Promise((r) => setTimeout(r, 250));
    expect(getComputedStyle(radio).borderTopColor).not.toBe(plain);
    expect(getComputedStyle(radio).borderTopColor).toBe(colourOf(container, "--e-danger"));
    await userEvent.hover(radio);
    await new Promise((r) => setTimeout(r, 250));
    expect(getComputedStyle(radio).backgroundColor).toBe(colourOf(container, "--e-danger-soft"));
  });

  test("exposes focus() and the chosen radio as input", async () => {
    let api: { input: HTMLInputElement | null; focus: () => void } | null = null;
    const { container } = await render(
      defineComponent({
        render: () =>
          h(ERadioGroup, {
            label: "Plan",
            options: ["A", "B"],
            modelValue: "B",
            ref: (r: unknown) => (api = r as typeof api),
          }),
      }),
    );
    const radios = container.querySelectorAll("input");
    expect(api!.input).toBe(radios[1]);
    api!.focus();
    expect(document.activeElement).toBe(radios[1]);
  });

  test("readonly keeps the choice and blocks changing it", async () => {
    const got: string[] = [];
    const { container } = await render(ERadioGroup, {
      props: {
        label: "Reminder",
        options: ["Email", "Text"],
        modelValue: "Email",
        readonly: true,
        "onUpdate:modelValue": (v: unknown) => got.push(v as string),
      },
    });
    expect(container.querySelector("fieldset")!.getAttribute("aria-readonly")).toBe("true");
    await container.querySelectorAll<HTMLInputElement>("input")[1]!.click();
    expect(got).toEqual([]);
    expect(container.querySelectorAll<HTMLInputElement>("input")[0]!.checked).toBe(true);
  });
});

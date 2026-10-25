import { describe, expect, test } from "vitest";
import { defineComponent, h, ref } from "vue";
import { page } from "vitest/browser";
import { render } from "vitest-browser-vue";
import EField from "./EField.vue";
import { createEos } from "../../plugin.js";
import { expectNoViolations } from "../../../test/axe.js";

type SlotProps = { id: string; ariaInvalid: "true" | undefined; ariaDescribedby: string | undefined };
const control = (p: SlotProps) =>
  h("input", { id: p.id, class: "e-input", "aria-invalid": p.ariaInvalid, "aria-describedby": p.ariaDescribedby });

describe("EField", () => {
  test("the label points at the control, so the control is named by it", async () => {
    const { container } = await render(EField, { props: { label: "Seat number" }, slots: { default: control } });
    const input = container.querySelector("input")!;
    expect(container.querySelector("label")!.getAttribute("for")).toBe(input.id);
    await expect.element(page.getByRole("textbox", { name: "Seat number" })).toBeVisible();
    expect(container.querySelector("label")!.className).toBe("e-field-label e-kicker");
  });

  test("an id from the consumer is the control's id, otherwise one is generated", async () => {
    const given = await render(EField, { props: { label: "A", id: "mine" }, slots: { default: control } });
    expect(given.container.querySelector("input")!.id).toBe("mine");
    const made = await render(EField, { props: { label: "B" }, slots: { default: control } });
    expect(made.container.querySelector("input")!.id).toMatch(/^e-/);
  });

  test("Required and Optional are words beside the label, in the configured messages", async () => {
    const { container } = await render(EField, {
      props: { label: "Email", required: true },
      slots: { default: control },
    });
    expect(container.querySelector(".e-field-flag")!.textContent).toBe("Required");
    const optional = await render(EField, {
      props: { label: "Suite", optional: true },
      slots: { default: control },
    });
    expect(optional.container.querySelector(".e-field-flag")!.textContent).toBe("Optional");
    const none = await render(EField, { props: { label: "Plain" }, slots: { default: control } });
    expect(none.container.querySelector(".e-field-flag")).toBeNull();
  });

  test("message overrides reach the flag", async () => {
    const plugin = createEos({ messages: { required: "Obligatoire" }, themeTarget: null });
    const { container } = await render(EField, {
      props: { label: "Nom", required: true },
      slots: { default: control },
      global: { plugins: [plugin] },
    });
    expect(container.querySelector(".e-field-flag")!.textContent).toBe("Obligatoire");
  });

  test("a hint is linked to the control with aria-describedby", async () => {
    const { container } = await render(EField, {
      props: { label: "Email", hint: "We never share it." },
      slots: { default: control },
    });
    const input = container.querySelector("input")!;
    const hint = container.querySelector(".e-field-hint")!;
    expect(input.getAttribute("aria-describedby")).toBe(hint.id);
    await expect
      .element(page.getByRole("textbox", { name: "Email" }))
      .toHaveAccessibleDescription("We never share it.");
  });

  test("an error replaces the hint, is announced, and marks the control invalid", async () => {
    const { container } = await render(EField, {
      props: { label: "Email", hint: "Hint", error: "Enter an email" },
      slots: { default: control },
    });
    expect(container.querySelector(".e-field-hint")).toBeNull();
    const error = container.querySelector(".e-field-error")!;
    expect(error.hasAttribute("role")).toBe(false);
    expect(error.querySelector("svg.e-icon")).not.toBeNull();
    const input = container.querySelector("input")!;
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(input.getAttribute("aria-describedby")).toBe(error.id);
    await expect.element(page.getByRole("textbox", { name: "Email" })).toHaveAccessibleDescription("Enter an email");
  });

  test("an error there on load is not announced; one that appears or changes later is, once", async () => {
    const region = () => document.querySelector('[data-e-announcer="assertive"]')?.textContent ?? "";
    const error = ref<string | undefined>("Already wrong");
    await render(
      defineComponent({ render: () => h(EField, { label: "Email", error: error.value }, { default: control }) }),
    );
    await new Promise((r) => setTimeout(r, 120));
    expect(region()).not.toContain("Already wrong");
    error.value = "Enter an email";
    await expect.poll(region).toContain("Enter an email");
  });

  test("without a hint or error the control has no aria-describedby and no aria-invalid", async () => {
    const { container } = await render(EField, { props: { label: "A" }, slots: { default: control } });
    const input = container.querySelector("input")!;
    expect(input.hasAttribute("aria-describedby")).toBe(false);
    expect(input.hasAttribute("aria-invalid")).toBe(false);
  });

  test("hideLabel keeps the label for screen readers and takes it out of the page", async () => {
    const { container } = await render(EField, {
      props: { label: "Amount", hideLabel: true },
      slots: { default: control },
    });
    const label = container.querySelector("label")!;
    expect(label.classList.contains("e-sr")).toBe(true);
    expect(label.getBoundingClientRect().width).toBeLessThanOrEqual(1);
    await expect.element(page.getByRole("textbox", { name: "Amount" })).toBeVisible();
  });

  test("class and style stay on the wrapper", async () => {
    const { container } = await render(EField, {
      props: { label: "A" },
      attrs: { class: "mine", style: "max-width: 200px" },
      slots: { default: control },
    });
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toBe("e-field mine");
    expect(root.style.maxWidth).toBe("200px");
  });

  test("the hint and the label sit 8px from the control", async () => {
    const { container } = await render(EField, {
      props: { label: "Email", hint: "Hint text" },
      slots: { default: control },
    });
    const label = container.querySelector("label")!.getBoundingClientRect();
    const input = container.querySelector("input")!.getBoundingClientRect();
    const hint = container.querySelector(".e-field-hint")!.getBoundingClientRect();
    expect(input.top - label.bottom).toBe(8);
    expect(hint.top - input.bottom).toBe(8);
  });

  test("has no accessibility violations in any state", async () => {
    const { container } = await render(
      defineComponent({
        render: () =>
          h("div", [
            h(EField, { label: "Plain" }, { default: control }),
            h(EField, { label: "Hinted", hint: "A hint", required: true }, { default: control }),
            h(EField, { label: "Invalid", error: "Fix this", optional: true }, { default: control }),
            h(EField, { label: "Hidden label", hideLabel: true }, { default: control }),
          ]),
      }),
    );
    await expectNoViolations(container);
  });

  test("the aside slot sits beside the hint, and its id is the control's", async () => {
    const { container } = await render(EField, {
      props: { label: "Bio", hint: "Short" },
      slots: { default: control, aside: (p: { id: string }) => h("span", { class: "side", "data-id": p.id }, "3/10") },
    });
    const foot = container.querySelector(".e-field-foot")!;
    expect(foot.querySelector(".e-field-hint")).not.toBeNull();
    expect(foot.querySelector(".side")!.getAttribute("data-id")).toBe(container.querySelector("input")!.id);
    const none = await render(EField, { props: { label: "Bio" }, slots: { default: control } });
    expect(none.container.querySelector(".e-field-foot")).toBeNull();
  });
});

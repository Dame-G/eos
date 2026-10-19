import { describe, expect, test } from "vitest";
import { defineComponent, h, ref } from "vue";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-vue";
import EAddressField, { type Address } from "./EAddressField.vue";
import { createEos } from "../../plugin.js";
import { expectNoViolations } from "../../../test/axe.js";

const input = (c: Element, name: string) => c.querySelector<HTMLInputElement>(`input[name="${name}"]`)!;
const regionButton = (c: Element) => c.querySelector<HTMLButtonElement>("button.e-sel-trigger")!;

async function bound(initial: Address, props: Record<string, unknown> = {}) {
  const model = ref<Address>(initial);
  const result = await render(
    defineComponent({
      render: () =>
        h(EAddressField, {
          ...props,
          modelValue: model.value,
          "onUpdate:modelValue": (v: Address) => (model.value = v),
        }),
    }),
  );
  return { ...result, model };
}

describe("EAddressField", () => {
  test("is one group named 'Address' with five labelled fields", async () => {
    const { container } = await render(EAddressField);
    await expect.element(page.getByRole("group", { name: "Address" })).toBeVisible();
    expect(container.querySelector("fieldset.e-fieldset")).not.toBeNull();
    await expect.element(page.getByRole("textbox", { name: /^Street/ })).toBeVisible();
    await expect.element(page.getByRole("textbox", { name: /^Apartment, suite or unit/ })).toBeVisible();
    await expect.element(page.getByRole("textbox", { name: /^City/ })).toBeVisible();
    await expect.element(page.getByRole("combobox", { name: /^State/ })).toBeVisible();
    await expect.element(page.getByRole("textbox", { name: /^ZIP code/ })).toBeVisible();
  });

  test("the legend can be changed", async () => {
    await render(EAddressField, { props: { legend: "Billing address" } });
    await expect.element(page.getByRole("group", { name: /^Billing address/ })).toBeVisible();
  });

  test("each field has the right autocomplete token, input mode and name", async () => {
    const { container } = await render(EAddressField, { props: { name: "home" } });
    expect(input(container, "home-street").autocomplete).toBe("address-line1");
    expect(input(container, "home-unit").autocomplete).toBe("address-line2");
    expect(input(container, "home-city").autocomplete).toBe("address-level2");
    expect(input(container, "home-postal").autocomplete).toBe("postal-code");
    expect(input(container, "home-postal").inputMode).toBe("text");
    expect(container.querySelector<HTMLInputElement>("input[type=hidden]")!.name).toBe("home-region");
  });

  test("the default name prefix is 'address'", async () => {
    const { container } = await render(EAddressField);
    expect(input(container, "address-street")).not.toBeNull();
  });

  test("street, city, region and postal are required; the unit is optional", async () => {
    const { container } = await render(EAddressField);
    expect(input(container, "address-street").required).toBe(true);
    expect(input(container, "address-city").required).toBe(true);
    expect(input(container, "address-postal").required).toBe(true);
    expect(input(container, "address-unit").required).toBe(false);
    const flags = [...container.querySelectorAll(".e-field-flag")].map((f) => f.textContent!.trim());
    expect(flags.filter((f) => f === "Required")).toHaveLength(4);
    expect(flags.filter((f) => f === "Optional")).toHaveLength(1);
  });

  test("street and unit take the whole row; city, state and ZIP share rows when wide", async () => {
    const { container } = await render(
      defineComponent({ render: () => h("div", { style: { width: "720px" } }, [h(EAddressField)]) }),
    );
    const width = (name: string) => input(container, name).closest(".e-field")!.getBoundingClientRect();
    const grid = container.querySelector(".e-address-grid")!.getBoundingClientRect();
    expect(Math.round(width("address-street").width)).toBe(Math.round(grid.width));
    expect(Math.round(width("address-unit").width)).toBe(Math.round(grid.width));
    expect(width("address-city").width).toBeLessThan(grid.width / 2);
    expect(Math.round(width("address-city").top)).toBe(Math.round(width("address-postal").top));
  });

  test("v-model round trip: typing into the fields updates the whole address", async () => {
    const { container, model } = await bound({ city: "Austin" });
    expect(input(container, "address-city").value).toBe("Austin");
    await page.getByRole("textbox", { name: /^Street/ }).fill("12 Main St");
    await page.getByRole("textbox", { name: /^ZIP code/ }).fill("78701");
    expect(model.value).toEqual({ city: "Austin", street: "12 Main St", postal: "78701" });
  });

  test("a model set from outside shows in the fields", async () => {
    const { container, model } = await bound({});
    model.value = { street: "1 Elm St", unit: "Apt 2", city: "Reno", region: "NV", postal: "89501" };
    await expect.poll(() => input(container, "address-street").value).toBe("1 Elm St");
    expect(input(container, "address-unit").value).toBe("Apt 2");
    expect(regionButton(container).textContent).toContain("Nevada");
    expect(container.querySelector<HTMLInputElement>("input[type=hidden]")!.value).toBe("NV");
  });

  test("without v-model the group keeps its own state", async () => {
    const { container } = await render(EAddressField);
    await page.getByRole("textbox", { name: /^City/ }).fill("Boise");
    expect(input(container, "address-city").value).toBe("Boise");
  });

  test("keyboard: the region is chosen with the arrow keys and Enter, and the model gets its code", async () => {
    const { container, model } = await bound({}, {});
    regionButton(container).focus();
    await userEvent.keyboard("{ArrowDown}");
    await expect.poll(() => document.querySelector("[role=listbox]")).not.toBeNull();
    await userEvent.keyboard("{Enter}");
    await expect.poll(() => model.value.region).toBe("AL");
    expect(regionButton(container).textContent).toContain("Alabama");
  });

  test("regions replaces the default list (strings or value and label)", async () => {
    const { container, model } = await bound(
      {},
      { regions: [{ value: "ON", label: "Ontario" }, "Quebec"], legend: "Adresse" },
    );
    regionButton(container).focus();
    await userEvent.keyboard("{ArrowDown}");
    await expect.poll(() => document.querySelectorAll("[role=option]").length).toBe(2);
    await userEvent.keyboard("{ArrowDown}");
    await userEvent.keyboard("{Enter}");
    await expect.poll(() => model.value.region).toBe("Quebec");
  });

  test("the default list is the 50 states and DC", async () => {
    const { container } = await render(EAddressField);
    regionButton(container).focus();
    await userEvent.keyboard("{ArrowDown}");
    await expect.poll(() => document.querySelectorAll("[role=option]").length).toBe(51);
  });

  test("errors show under their field and mark it invalid", async () => {
    const { container } = await render(EAddressField, {
      props: { errors: { street: "Enter a street", postal: "Enter a ZIP code", region: "Choose a state" } },
    });
    expect(input(container, "address-street").getAttribute("aria-invalid")).toBe("true");
    expect(input(container, "address-postal").getAttribute("aria-invalid")).toBe("true");
    expect(input(container, "address-city").getAttribute("aria-invalid")).toBeNull();
    await expect.element(page.getByText("Enter a street")).toBeVisible();
    await expect.element(page.getByText("Choose a state")).toBeVisible();
    expect(input(container, "address-street").getAttribute("aria-describedby")).toBeTruthy();
  });

  test("disabled disables every field, including the region", async () => {
    const { container } = await render(EAddressField, { props: { disabled: true } });
    expect(container.querySelector("fieldset")!.disabled).toBe(true);
    for (const el of container.querySelectorAll<HTMLInputElement>("input:not([type=hidden])"))
      expect(el.matches(":disabled")).toBe(true);
    expect(regionButton(container).matches(":disabled")).toBe(true);
  });

  test("words follow message overrides (German labels)", async () => {
    await render(EAddressField, {
      global: {
        plugins: [
          createEos({
            themeTarget: null,
            messages: {
              address: "Anschrift",
              street: "Straße",
              unit: "Zusatz",
              city: "Ort",
              region: "Land",
              postal: "PLZ",
              select: "Wählen",
            },
          }),
        ],
      },
    });
    await expect.element(page.getByRole("group", { name: /^Anschrift/ })).toBeVisible();
    await expect.element(page.getByRole("textbox", { name: /^Straße/ })).toBeVisible();
    await expect.element(page.getByRole("textbox", { name: /^PLZ/ })).toBeVisible();
    await expect.element(page.getByRole("combobox", { name: /^Land/ })).toBeVisible();
  });

  test("class and style fall through to the fieldset", async () => {
    const { container } = await render(EAddressField, { attrs: { class: "mine", style: "max-width: 30rem" } });
    const fs = container.querySelector("fieldset")!;
    expect(fs.classList.contains("mine")).toBe(true);
    expect(fs.style.maxWidth).toBe("30rem");
  });

  test("axe: empty, filled, with errors, disabled", async () => {
    const states: Record<string, unknown>[] = [
      {},
      { modelValue: { street: "1 Elm St", city: "Reno", region: "NV", postal: "89501" } },
      {
        errors: {
          street: "Enter a street",
          city: "Enter a city",
          region: "Choose a state",
          postal: "Enter a ZIP code",
        },
      },
      { disabled: true },
    ];
    for (const props of states) {
      const { container } = await render(EAddressField, { props });
      await expectNoViolations(container);
    }
  });

  test("postalInputmode is text by default and can be numeric", async () => {
    const text = await render(EAddressField, { props: { name: "a" } });
    expect(input(text.container, "a-postal").inputMode).toBe("text");
    const num = await render(EAddressField, { props: { name: "b", postalInputmode: "numeric" } });
    expect(input(num.container, "b-postal").inputMode).toBe("numeric");
  });

  test("an error in one field of a row does not push the labels of its neighbours away from their inputs", async () => {
    const { container } = await render(EAddressField, {
      props: { name: "a", errors: { postal: "Enter a postal code." } },
    });
    const gap = (name: string) => {
      const control = container.querySelector<HTMLElement>(`input[name="${name}"], button.e-sel-trigger`)!;
      const field = control.closest(".e-field")!;
      const label = field.querySelector(".e-field-label")!;
      return Math.round(control.getBoundingClientRect().top - label.getBoundingClientRect().bottom);
    };
    expect(gap("a-city")).toBe(gap("a-postal"));
  });
});

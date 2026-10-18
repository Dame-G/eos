import { describe, expect, test } from "vitest";
import { defineComponent, h, nextTick, ref } from "vue";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-vue";
import AeSearchBar from "./AeSearchBar.vue";
import { expectNoViolations } from "../../../test/axe.js";

describe("AeSearchBar", () => {
  test("is a search landmark with a named box and a submit button", async () => {
    const { container } = await render(AeSearchBar);
    await expect.element(page.getByRole("search")).toBeVisible();
    await expect.element(page.getByRole("textbox", { name: "Search" })).toBeVisible();
    await expect.element(page.getByRole("button", { name: "Search" })).toBeVisible();
    const input = container.querySelector("input")!;
    expect(input.name).toBe("q");
    expect(input.className).toBe("ae-input");
    expect(container.querySelector("button")!.type).toBe("submit");
    expect(container.querySelector(".ae-search-lead svg")).not.toBeNull();
  });

  test("label, placeholder, action and name are used", async () => {
    const { container } = await render(AeSearchBar, {
      props: { label: "Search help", placeholder: "Search articles", action: "Find", name: "term" },
    });
    const input = page.getByRole("textbox", { name: "Search help" });
    await expect.element(input).toHaveAttribute("placeholder", "Search articles");
    await expect.element(page.getByRole("button", { name: "Find" })).toBeVisible();
    expect(container.querySelector("input")!.name).toBe("term");
  });

  test("Enter and the button both submit the current text, value first", async () => {
    const got: string[] = [];
    await render(AeSearchBar, { attrs: { onSubmit: (v: string) => got.push(v) } });
    await page.getByRole("textbox", { name: "Search" }).fill("flu shot");
    await userEvent.keyboard("{Enter}");
    await page.getByRole("button", { name: "Search" }).click();
    expect(got).toEqual(["flu shot", "flu shot"]);
  });

  test("submitting does not reload the page (the default is prevented)", async () => {
    const { container } = await render(AeSearchBar);
    const ev = new SubmitEvent("submit", { bubbles: true, cancelable: true });
    container.querySelector("form")!.dispatchEvent(ev);
    expect(ev.defaultPrevented).toBe(true);
  });

  test("v-model round trip", async () => {
    const model = ref("a");
    const got: string[] = [];
    await render(
      defineComponent({
        render: () =>
          h(AeSearchBar, {
            modelValue: model.value,
            "onUpdate:modelValue": (v: string) => {
              got.push(v);
              model.value = v;
            },
          }),
      }),
    );
    const box = page.getByRole("textbox", { name: "Search" });
    await expect.element(box).toHaveValue("a");
    await box.fill("bcd");
    expect(got.at(-1)).toBe("bcd");
    model.value = "zed";
    await nextTick();
    await expect.element(box).toHaveValue("zed");
  });

  test("without v-model it keeps its own text", async () => {
    await render(AeSearchBar);
    await page.getByRole("textbox", { name: "Search" }).fill("local");
    await expect.element(page.getByRole("textbox", { name: "Search" })).toHaveValue("local");
  });

  test("the keyboard reaches the box, then the button", async () => {
    await render(AeSearchBar);
    await userEvent.tab();
    await expect.element(page.getByRole("textbox", { name: "Search" })).toHaveFocus();
    await userEvent.tab();
    await expect.element(page.getByRole("button", { name: "Search" })).toHaveFocus();
  });

  test("attributes land on the input; class and style stay on the form", async () => {
    const events: string[] = [];
    const { container } = await render(AeSearchBar, {
      attrs: {
        class: "mine",
        style: "max-width: 320px",
        autocomplete: "off",
        "data-test": "x",
        onFocus: () => events.push("focus"),
      },
    });
    const form = container.querySelector("form")!;
    const input = container.querySelector("input")!;
    expect(form.className).toBe("ae-search mine");
    expect(form.style.maxWidth).toBe("320px");
    expect(input.autocomplete).toBe("off");
    expect(input.dataset["test"]).toBe("x");
    expect(form.hasAttribute("autocomplete")).toBe(false);
    await userEvent.tab();
    expect(events).toEqual(["focus"]);
  });

  test("disabled disables the box and the button", async () => {
    await render(AeSearchBar, { props: { disabled: true } });
    await expect.element(page.getByRole("textbox", { name: "Search" })).toBeDisabled();
    await expect.element(page.getByRole("button", { name: "Search" })).toBeDisabled();
  });

  test("is as tall as an input (48px)", async () => {
    const { container } = await render(AeSearchBar);
    container.classList.add("ae-root");
    expect(Math.round(container.querySelector("form")!.getBoundingClientRect().height)).toBe(48);
  });

  test("has no accessibility violations: empty, filled, disabled", async () => {
    const { container } = await render(
      defineComponent({
        render: () =>
          h("div", [
            h(AeSearchBar, { label: "Search the site" }),
            h(AeSearchBar, { label: "Search articles", modelValue: "billing" }),
            h(AeSearchBar, { label: "Search is off", disabled: true }),
          ]),
      }),
    );
    await expectNoViolations(container);
  });
});

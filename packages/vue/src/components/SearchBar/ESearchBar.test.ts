import { describe, expect, test } from "vitest";
import { defineComponent, h, nextTick, ref } from "vue";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-vue";
import * as Vue from "vue";
import ESearchBar from "./ESearchBar.vue";
import { expectNoViolations } from "../../../test/axe.js";

describe("ESearchBar", () => {
  test("is a search landmark with a named box and a submit button", async () => {
    const { container } = await render(ESearchBar);
    await expect.element(page.getByRole("search")).toBeVisible();
    await expect.element(page.getByRole("textbox", { name: "Search" })).toBeVisible();
    await expect.element(page.getByRole("button", { name: "Search" })).toBeVisible();
    const input = container.querySelector("input")!;
    expect(input.name).toBe("q");
    expect(input.className).toBe("e-input");
    expect(container.querySelector("button")!.type).toBe("submit");
    expect(container.querySelector(".e-search-lead svg")).not.toBeNull();
  });

  test("label, placeholder, action and name are used", async () => {
    const { container } = await render(ESearchBar, {
      props: { label: "Search help", placeholder: "Search articles", action: "Find", name: "term" },
    });
    const input = page.getByRole("textbox", { name: "Search help" });
    await expect.element(input).toHaveAttribute("placeholder", "Search articles");
    await expect.element(page.getByRole("button", { name: "Find" })).toBeVisible();
    expect(container.querySelector("input")!.name).toBe("term");
  });

  test("Enter and the button both submit the current text, value first", async () => {
    const got: string[] = [];
    await render(ESearchBar, { attrs: { onSubmit: (v: string) => got.push(v) } });
    await page.getByRole("textbox", { name: "Search" }).fill("flu shot");
    await userEvent.keyboard("{Enter}");
    await page.getByRole("button", { name: "Search" }).click();
    expect(got).toEqual(["flu shot", "flu shot"]);
  });

  test("submitting does not reload the page (the default is prevented)", async () => {
    const { container } = await render(ESearchBar);
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
          h(ESearchBar, {
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

  test("the mobile keyboard offers a search key", async () => {
    const { container } = await render(ESearchBar);
    expect(container.querySelector("input")!.getAttribute("enterkeyhint")).toBe("search");
  });

  test("the clear button empties the box, emits clear and returns focus to the box", async () => {
    let cleared = 0;
    const { container } = await render(ESearchBar, {
      props: { modelValue: "abc", onClear: () => cleared++ },
    });
    await page.getByRole("button", { name: "Clear" }).click();
    expect(cleared).toBe(1);
    expect(document.activeElement).toBe(container.querySelector("input"));
  });

  test("without v-model it keeps its own text", async () => {
    await render(ESearchBar);
    await page.getByRole("textbox", { name: "Search" }).fill("local");
    await expect.element(page.getByRole("textbox", { name: "Search" })).toHaveValue("local");
  });

  test("the keyboard reaches the box, then the button", async () => {
    await render(ESearchBar);
    await userEvent.tab();
    await expect.element(page.getByRole("textbox", { name: "Search" })).toHaveFocus();
    await userEvent.tab();
    await expect.element(page.getByRole("button", { name: "Search" })).toHaveFocus();
  });

  test("attributes land on the input; class and style stay on the form", async () => {
    const events: string[] = [];
    const { container } = await render(ESearchBar, {
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
    expect(form.className).toBe("e-search mine");
    expect(form.style.maxWidth).toBe("320px");
    expect(input.autocomplete).toBe("off");
    expect(input.dataset["test"]).toBe("x");
    expect(form.hasAttribute("autocomplete")).toBe(false);
    await userEvent.tab();
    expect(events).toEqual(["focus"]);
  });

  test("disabled disables the box and the button", async () => {
    await render(ESearchBar, { props: { disabled: true } });
    await expect.element(page.getByRole("textbox", { name: "Search" })).toBeDisabled();
    await expect.element(page.getByRole("button", { name: "Search" })).toBeDisabled();
  });

  test("is as tall as an input (48px)", async () => {
    const { container } = await render(ESearchBar);
    container.classList.add("e-root");
    expect(Math.round(container.querySelector("form")!.getBoundingClientRect().height)).toBe(48);
  });

  test("has no accessibility violations: empty, filled, disabled", async () => {
    const { container } = await render(
      defineComponent({
        render: () =>
          h("div", [
            h(ESearchBar, { label: "Search the site" }),
            h(ESearchBar, { label: "Search articles", modelValue: "billing" }),
            h(ESearchBar, { label: "Search is off", disabled: true }),
          ]),
      }),
    );
    await expectNoViolations(container);
  });

  test("the label names the search landmark, so two searches stay distinguishable", async () => {
    await render(
      Vue.defineComponent({
        render: () =>
          Vue.h("div", [
            Vue.h(ESearchBar, { label: "Search the site" }),
            Vue.h(ESearchBar, { label: "Search help articles" }),
          ]),
      }),
    );
    await expect.element(page.getByRole("search", { name: "Search the site" })).toBeVisible();
    await expect.element(page.getByRole("search", { name: "Search help articles" })).toBeVisible();
    await render(ESearchBar);
    await expect.element(page.getByRole("search", { name: "Search", exact: true }).first()).toBeVisible();
  });
  test("disabled gives the box the dashed disabled look and no hover change", async () => {
    const off = await render(ESearchBar, { props: { disabled: true } });
    off.container.classList.add("e-root");
    const form = off.container.querySelector("form")!;
    expect(form.hasAttribute("data-disabled")).toBe(true);
    const idle = getComputedStyle(form);
    expect(idle.outlineStyle).toBe("dashed");
    const { backgroundColor, boxShadow } = idle;
    const on = await render(ESearchBar);
    on.container.classList.add("e-root");
    expect(getComputedStyle(on.container.querySelector("form")!).backgroundColor).not.toBe(backgroundColor);
    expect(on.container.querySelector("form")!.hasAttribute("data-disabled")).toBe(false);
    await userEvent.hover(form);
    await new Promise((r) => setTimeout(r, 250));
    const hovered = getComputedStyle(form);
    expect(hovered.backgroundColor).toBe(backgroundColor);
    expect(hovered.boxShadow).toBe(boxShadow);
  });

  test("exposes the input and focus()", async () => {
    let api: { input: HTMLInputElement | null; focus: () => void } | null = null;
    const { container } = await render(
      defineComponent({ render: () => h(ESearchBar, { ref: (r: unknown) => (api = r as typeof api) }) }),
    );
    api!.focus();
    expect(document.activeElement).toBe(container.querySelector("input"));
    expect(api!.input).toBe(container.querySelector("input"));
  });
});

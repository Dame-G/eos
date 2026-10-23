import { describe, expect, test } from "vitest";
import { defineComponent, h, nextTick, ref } from "vue";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-vue";
import * as Vue from "vue";
import ESearchBar from "./ESearchBar.vue";
import { expectNoViolations } from "../../../test/axe.js";
import { settled } from "../../../test/frames.js";

/** The top-left corner radius in px. */
const corner = (el: Element) => parseFloat(getComputedStyle(el).borderTopLeftRadius);

describe("ESearchBar", () => {
  test("is a search landmark with a named box and a submit button", async () => {
    const { container } = await render(ESearchBar, { props: { clearable: true } });
    await expect.element(page.getByRole("search")).toBeVisible();
    await expect.element(page.getByRole("textbox", { name: "Search" })).toBeVisible();
    await expect.element(page.getByRole("button", { name: "Search" })).toBeVisible();
    const input = container.querySelector("input")!;
    expect(input.hasAttribute("name")).toBe(false);
    expect(input.className).toBe("e-input");
    expect(container.querySelector("button")!.type).toBe("button");
    expect(container.querySelector("form")).toBeNull();
    expect(container.querySelector(".e-search-lead svg")).not.toBeNull();
  });

  test("label, placeholder, action and name are used", async () => {
    const { container } = await render(ESearchBar, {
      props: { clearable: true, label: "Search help", placeholder: "Search articles", action: "Find", name: "term" },
    });
    const input = page.getByRole("textbox", { name: "Search help" });
    await expect.element(input).toHaveAttribute("placeholder", "Search articles");
    await expect.element(page.getByRole("button", { name: "Find" })).toBeVisible();
    expect(container.querySelector("input")!.name).toBe("term");
  });

  test("Enter and the button both submit the current text, value first", async () => {
    const got: string[] = [];
    await render(ESearchBar, { props: { clearable: true }, attrs: { onSubmit: (v: string) => got.push(v) } });
    await page.getByRole("textbox", { name: "Search" }).fill("flu shot");
    await userEvent.keyboard("{Enter}");
    await page.getByRole("button", { name: "Search" }).click();
    expect(got).toEqual(["flu shot", "flu shot"]);
  });

  test("Enter submits the search and never an enclosing form", async () => {
    const got: string[] = [];
    let posted = 0;
    await render(
      defineComponent({
        render: () =>
          h("form", { onSubmit: (e: Event) => (e.preventDefault(), posted++) }, [
            h(ESearchBar, { clearable: true, modelValue: "flu", name: "q", onSubmit: (v: string) => got.push(v) }),
            h("input", { type: "submit", value: "Save" }),
          ]),
      }),
    );
    await page.getByRole("textbox", { name: "Search" }).click();
    await userEvent.keyboard("{Enter}");
    expect(got).toEqual(["flu"]);
    expect(posted).toBe(0);
  });

  test("the text posts under name with a form of your own, and nothing posts while disabled", async () => {
    const make = (disabled: boolean) =>
      render(
        defineComponent({
          render: () => h("form", [h(ESearchBar, { clearable: true, modelValue: "flu", name: "q", disabled })]),
        }),
      );
    const on = await make(false);
    expect(new FormData(on.container.querySelector("form")!).get("q")).toBe("flu");
    const off = await make(true);
    expect([...new FormData(off.container.querySelector("form")!).keys()]).toEqual([]);
  });

  test("an IME composition's Enter does not submit", async () => {
    const got: string[] = [];
    const { container } = await render(ESearchBar, {
      props: { clearable: true, modelValue: "x", onSubmit: (v: string) => got.push(v) },
    });
    container
      .querySelector("input")!
      .dispatchEvent(
        new KeyboardEvent("keydown", { key: "Enter", isComposing: true, bubbles: true, cancelable: true }),
      );
    expect(got).toEqual([]);
  });

  test("size and loading: a bigger box, and a busy button", async () => {
    const { container } = await render(ESearchBar, { props: { clearable: true, size: "lg", loading: true } });
    container.classList.add("e-root");
    expect(Math.round(container.querySelector(".e-search")!.getBoundingClientRect().height)).toBe(56);
    expect(container.querySelector("button")!.getAttribute("aria-busy")).toBe("true");
    expect(container.querySelector("input")!.getAttribute("aria-busy")).toBe("true");
  });

  test("v-model round trip", async () => {
    const model = ref("a");
    const got: string[] = [];
    await render(
      defineComponent({
        render: () =>
          h(ESearchBar, {
            clearable: true,
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
    const { container } = await render(ESearchBar, { props: { clearable: true } });
    expect(container.querySelector("input")!.getAttribute("enterkeyhint")).toBe("search");
  });

  test("the clear button empties the box, emits clear and returns focus to the box", async () => {
    let cleared = 0;
    const { container } = await render(ESearchBar, {
      props: { clearable: true, modelValue: "abc", onClear: () => cleared++ },
    });
    await page.getByRole("button", { name: "Clear" }).click();
    expect(cleared).toBe(1);
    expect(document.activeElement).toBe(container.querySelector("input"));
  });

  test("without v-model it keeps its own text", async () => {
    await render(ESearchBar, { props: { clearable: true } });
    await page.getByRole("textbox", { name: "Search" }).fill("local");
    await expect.element(page.getByRole("textbox", { name: "Search" })).toHaveValue("local");
  });

  test("the keyboard reaches the box, then the button", async () => {
    await render(ESearchBar, { props: { clearable: true } });
    await userEvent.tab();
    await expect.element(page.getByRole("textbox", { name: "Search" })).toHaveFocus();
    await userEvent.tab();
    await expect.element(page.getByRole("button", { name: "Search" })).toHaveFocus();
  });

  test("attributes land on the input; class and style stay on the search box", async () => {
    const events: string[] = [];
    const { container } = await render(ESearchBar, {
      props: { clearable: true },
      attrs: {
        class: "mine",
        style: "max-width: 320px",
        autocomplete: "off",
        "data-test": "x",
        onFocus: () => events.push("focus"),
      },
    });
    const form = container.querySelector<HTMLElement>("[role=search]")!;
    const input = container.querySelector("input")!;
    expect(form.className.split(" ")).toEqual(expect.arrayContaining(["e-search", "mine"]));
    expect(form.style.maxWidth).toBe("320px");
    expect(input.autocomplete).toBe("off");
    expect(input.dataset["test"]).toBe("x");
    expect(form.hasAttribute("autocomplete")).toBe(false);
    await userEvent.tab();
    expect(events).toEqual(["focus"]);
  });

  test("disabled disables the box and the button", async () => {
    await render(ESearchBar, { props: { clearable: true, disabled: true } });
    await expect.element(page.getByRole("textbox", { name: "Search" })).toBeDisabled();
    await expect.element(page.getByRole("button", { name: "Search" })).toBeDisabled();
  });

  test("is as tall as an input (48px)", async () => {
    const { container } = await render(ESearchBar, { props: { clearable: true } });
    container.classList.add("e-root");
    expect(Math.round(container.querySelector("[role=search]")!.getBoundingClientRect().height)).toBe(48);
  });

  test("has no accessibility violations: empty, filled, disabled", async () => {
    const { container } = await render(
      defineComponent({
        render: () =>
          h("div", [
            h(ESearchBar, { clearable: true, label: "Search the site" }),
            h(ESearchBar, { clearable: true, label: "Search articles", modelValue: "billing" }),
            h(ESearchBar, { clearable: true, label: "Search is off", disabled: true }),
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
            Vue.h(ESearchBar, { clearable: true, label: "Search the site" }),
            Vue.h(ESearchBar, { clearable: true, label: "Search help articles" }),
          ]),
      }),
    );
    await expect.element(page.getByRole("search", { name: "Search the site" })).toBeVisible();
    await expect.element(page.getByRole("search", { name: "Search help articles" })).toBeVisible();
    await render(ESearchBar, { props: { clearable: true } });
    await expect.element(page.getByRole("search", { name: "Search", exact: true }).first()).toBeVisible();
  });
  test("disabled gives the box the dashed disabled look and no hover change", async () => {
    const off = await render(ESearchBar, { props: { clearable: true, disabled: true } });
    off.container.classList.add("e-root");
    const form = off.container.querySelector("[role=search]")!;
    expect(form.hasAttribute("data-disabled")).toBe(true);
    const idle = getComputedStyle(form);
    expect(idle.outlineStyle).toBe("dashed");
    const { backgroundColor, boxShadow } = idle;
    const on = await render(ESearchBar, { props: { clearable: true } });
    on.container.classList.add("e-root");
    expect(getComputedStyle(on.container.querySelector("[role=search]")!).backgroundColor).not.toBe(backgroundColor);
    expect(on.container.querySelector("[role=search]")!.hasAttribute("data-disabled")).toBe(false);
    await userEvent.hover(form);
    await settled();
    const hovered = getComputedStyle(form);
    expect(hovered.backgroundColor).toBe(backgroundColor);
    expect(hovered.boxShadow).toBe(boxShadow);
  });

  test("exposes the input and focus()", async () => {
    let api: { input: HTMLInputElement | null; focus: () => void } | null = null;
    const { container } = await render(
      defineComponent({
        render: () => h(ESearchBar, { clearable: true, ref: (r: unknown) => (api = r as typeof api) }),
      }),
    );
    api!.focus();
    expect(document.activeElement).toBe(container.querySelector("input"));
    expect(api!.input).toBe(container.querySelector("input"));
  });

  test("corners are concentric: the action button is inset by the edge and a tight gap at any theme", async () => {
    const { container } = await render(ESearchBar, { props: { clearable: true } });
    const root = container as HTMLElement;
    root.classList.add("e-root");
    const wrap = root.querySelector(".e-input-wrap")!;
    const btn = wrap.querySelector(".e-btn")!;

    for (const md of [null, "14px", "2px"]) {
      if (md) root.style.setProperty("--e-radius-md", md);
      expect(corner(btn)).toBeCloseTo(Math.max(0, corner(wrap) - 5), 0);
    }
  });
});

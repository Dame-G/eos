import { describe, expect, test } from "vitest";
import { defineComponent, h, nextTick, ref } from "vue";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-vue";
import ETextField from "./ETextField.vue";
import { expectNoViolations } from "../../../test/axe.js";
import { expectPostingContract } from "../../../test/formPosting.js";

/** The top-left corner radius in px. */
const corner = (el: Element) => parseFloat(getComputedStyle(el).borderTopLeftRadius);

describe("ETextField", () => {
  test("is a labelled text input: the label names it", async () => {
    const { container } = await render(ETextField, { props: { label: "Name" } });
    await expect.element(page.getByRole("textbox", { name: "Name" })).toBeVisible();
    const input = container.querySelector("input")!;
    expect(input.type).toBe("text");
    expect(input.className).toBe("e-input");
    expect(container.querySelector("label")!.getAttribute("for")).toBe(input.id);
  });

  test("v-model round trip: typing updates the model (value first), and a new model value shows in the input", async () => {
    const model = ref("Ana");
    const got: string[] = [];
    await render(
      defineComponent({
        render: () =>
          h(ETextField, {
            label: "Name",
            modelValue: model.value,
            "onUpdate:modelValue": (v: string) => {
              got.push(v);
              model.value = v;
            },
          }),
      }),
    );
    const box = page.getByRole("textbox", { name: "Name" });
    await expect.element(box).toHaveValue("Ana");
    await box.fill("Maria");
    expect(got.at(-1)).toBe("Maria");
    expect(typeof got.at(-1)).toBe("string");
    model.value = "Zed";
    await nextTick();
    await expect.element(box).toHaveValue("Zed");
  });

  test("without v-model it keeps its own value", async () => {
    const { container } = await render(ETextField, { props: { label: "Name" } });
    await page.getByRole("textbox", { name: "Name" }).fill("Local");
    expect(container.querySelector("input")!.value).toBe("Local");
  });

  test("typing with the keyboard works", async () => {
    await render(ETextField, { props: { label: "Name" } });
    await userEvent.tab();
    await userEvent.keyboard("Hi");
    await expect.element(page.getByRole("textbox", { name: "Name" })).toHaveValue("Hi");
  });

  test("passes name, autocomplete, maxlength, inputmode, aria-* and data-* to the input", async () => {
    const { container } = await render(ETextField, {
      props: { label: "Email", hint: "We never share it." },
      attrs: {
        name: "email",
        autocomplete: "email",
        maxlength: 40,
        inputmode: "email",
        "aria-label": "Your email",
        "data-test": "x",
        pattern: ".+",
      },
    });
    const input = container.querySelector("input")!;
    expect(input.name).toBe("email");
    expect(input.autocomplete).toBe("email");
    expect(input.maxLength).toBe(40);
    expect(input.getAttribute("inputmode")).toBe("email");
    expect(input.getAttribute("aria-label")).toBe("Your email");
    expect(input.dataset["test"]).toBe("x");
    expect(input.getAttribute("pattern")).toBe(".+");
    expect(input.getAttribute("aria-describedby")).toBeTruthy();
    expect(container.firstElementChild!.hasAttribute("name")).toBe(false);
  });

  test("a consumer's aria-describedby joins the hint id", async () => {
    const { container } = await render(ETextField, {
      props: { label: "A", hint: "Hint" },
      attrs: { "aria-describedby": "elsewhere" },
    });
    const input = container.querySelector("input")!;
    const hintId = container.querySelector(".e-field-hint")!.id;
    expect(input.getAttribute("aria-describedby")).toBe(`${hintId} elsewhere`);
  });

  test("listeners fall through to the input; class and style stay on the wrapper", async () => {
    const events: string[] = [];
    const { container } = await render(ETextField, {
      props: { label: "A" },
      attrs: {
        class: "mine",
        style: "max-width: 240px",
        onBlur: () => events.push("blur"),
        onKeydown: (e: KeyboardEvent) => events.push(e.key),
        onFocus: () => events.push("focus"),
      },
    });
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toBe("e-field mine");
    expect(root.style.maxWidth).toBe("240px");
    expect(container.querySelector("input")!.className).toBe("e-input");
    await userEvent.tab();
    await userEvent.keyboard("a");
    await userEvent.tab();
    expect(events).toEqual(["focus", "a", "Tab", "blur"]);
  });

  test("an error replaces the hint, marks the input invalid and is announced", async () => {
    const { container } = await render(ETextField, {
      props: { label: "Email", hint: "Hint", error: "Enter an email" },
    });
    const input = container.querySelector("input")!;
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(container.querySelector(".e-field-hint")).toBeNull();
    expect(container.querySelector(".e-field-error")!.getAttribute("role")).toBe("alert");
    await expect.element(page.getByRole("textbox", { name: "Email" })).toHaveAccessibleDescription("Enter an email");
  });

  test("an invalid input keeps the error colour on hover and fills to its top edge", async () => {
    const { container } = await render(ETextField, { props: { label: "Email", error: "Enter an email" } });
    container.classList.add("e-root");
    const input = container.querySelector("input")!;
    const idle = getComputedStyle(input);
    const idleBorder = idle.borderColor;
    const idleShadow = idle.boxShadow;
    await userEvent.hover(input);
    await new Promise((r) => setTimeout(r, 250));
    const hovered = getComputedStyle(input);
    expect(hovered.borderColor).toBe(idleBorder);
    expect(hovered.boxShadow).not.toBe(idleShadow);
    expect(hovered.boxShadow).not.toBe("none");
  });

  test("required sets the attribute and the word; optional only the word", async () => {
    const req = await render(ETextField, { props: { label: "Nom", required: true } });
    expect(req.container.querySelector("input")!.required).toBe(true);
    expect(req.container.querySelector(".e-field-flag")!.textContent).toBe("Required");
    const opt = await render(ETextField, { props: { label: "Suite", optional: true } });
    expect(opt.container.querySelector("input")!.required).toBe(false);
    expect(opt.container.querySelector(".e-field-flag")!.textContent).toBe("Optional");
  });

  test("placeholder, type and disabled", async () => {
    const { container } = await render(ETextField, {
      props: { label: "Email", type: "email", placeholder: "you@example.com", disabled: true },
    });
    const input = container.querySelector("input")!;
    expect(input.type).toBe("email");
    expect(input.placeholder).toBe("you@example.com");
    expect(input.disabled).toBe(true);
    expect(getComputedStyle(input).outlineStyle).toBe("dashed");
  });

  test("read-only stays focusable", async () => {
    const { container } = await render(ETextField, { props: { label: "A" }, attrs: { readonly: true } });
    const input = container.querySelector("input")!;
    input.focus();
    expect(document.activeElement).toBe(input);
    expect(input.readOnly).toBe(true);
  });

  test("hideLabel keeps the accessible name", async () => {
    const { container } = await render(ETextField, { props: { label: "Amount", hideLabel: true } });
    expect(container.querySelector("label")!.classList.contains("e-sr")).toBe(true);
    await expect.element(page.getByRole("textbox", { name: "Amount" })).toBeVisible();
  });

  test("an id from the consumer reaches the input", async () => {
    const { container } = await render(ETextField, { props: { label: "A", id: "mine" } });
    expect(container.querySelector("input")!.id).toBe("mine");
  });

  test("prefix and suffix sit inside one well, are part of the input description, and a click on them focuses the input", async () => {
    const { container } = await render(ETextField, { props: { label: "Payment amount", prefix: "$", suffix: "USD" } });
    const wrap = container.querySelector(".e-input-wrap")!;
    const pre = wrap.querySelector(".e-affix--pre")!;
    expect(pre.hasAttribute("aria-hidden")).toBe(false);
    expect(wrap.querySelector("input")!.getAttribute("aria-describedby")).toContain(pre.id);
    expect(wrap.querySelector("input")!.getAttribute("aria-describedby")).toContain(
      wrap.querySelector(".e-affix--post")!.id,
    );
    expect(wrap.querySelector(".e-affix--post")!.textContent).toBe("USD");
    await expect.element(page.getByRole("textbox", { name: "Payment amount" })).toBeVisible();
    (pre as HTMLElement).click();
    expect(document.activeElement).toBe(container.querySelector("input"));
  });

  test("the wrap shows invalid and disabled through data attributes", async () => {
    const { container } = await render(ETextField, {
      props: { label: "A", prefix: "$", error: "No", disabled: true },
    });
    const wrap = container.querySelector(".e-input-wrap")!;
    expect(wrap.hasAttribute("data-invalid")).toBe(true);
    expect(wrap.hasAttribute("data-disabled")).toBe(true);
  });

  test("a bare input and a boxed input are both 48px tall", async () => {
    const { container } = await render(
      defineComponent({
        render: () => h("div", [h(ETextField, { label: "A" }), h(ETextField, { label: "B", prefix: "$" })]),
      }),
    );
    container.classList.add("e-root");
    const heights = [".e-field .e-input", ".e-input-wrap"].map((s) =>
      Math.round(container.querySelector(s)!.getBoundingClientRect().height),
    );
    expect(heights).toEqual([48, 48]);
  });

  test("the hint sits 8px under the input", async () => {
    const { container } = await render(ETextField, { props: { label: "A", hint: "Hint" } });
    const input = container.querySelector("input")!.getBoundingClientRect();
    const hint = container.querySelector(".e-field-hint")!.getBoundingClientRect();
    expect(hint.top - input.bottom).toBe(8);
  });

  test("keyboard focus draws an outline on the input", async () => {
    const { container } = await render(ETextField, { props: { label: "A" } });
    const input = container.querySelector("input")!;
    await userEvent.tab();
    expect(document.activeElement).toBe(input);
    expect(getComputedStyle(input).outlineStyle).toBe("solid");
  });

  test("has no accessibility violations in any state", async () => {
    const { container } = await render(
      defineComponent({
        render: () =>
          h("div", [
            h(ETextField, { label: "Plain" }),
            h(ETextField, { label: "Hinted", hint: "A hint", required: true, placeholder: "Example" }),
            h(ETextField, { label: "Invalid", error: "Fix this", modelValue: "x" }),
            h(ETextField, { label: "Disabled", disabled: true }),
            h(ETextField, { label: "Optional", optional: true }),
            h(ETextField, { label: "Amount", prefix: "$", suffix: "USD", hint: "Hint" }),
            h(ETextField, { label: "Boxed invalid", prefix: "$", error: "Bad" }),
            h(ETextField, { label: "Hidden label", hideLabel: true }),
            h(ETextField, { label: "Readonly", readonly: true, modelValue: "x" }),
            h(ETextField, { label: "Readonly boxed", readonly: true, prefix: "$", modelValue: "x" }),
          ]),
      }),
    );
    await expectNoViolations(container);
  });

  test("readonly sets the attribute, marks the wrap and keeps the text", async () => {
    const { container } = await render(ETextField, {
      props: { label: "Code", prefix: "#", modelValue: "abc", readonly: true },
    });
    const input = container.querySelector("input")!;
    expect(input.readOnly).toBe(true);
    expect(container.querySelector(".e-input-wrap")!.hasAttribute("data-readonly")).toBe(true);
    input.focus();
    expect(document.activeElement).toBe(input);
    await userEvent.keyboard("zzz");
    expect(input.value).toBe("abc");
  });

  test("autocomplete and maxlength are props that land on the input", async () => {
    const { container } = await render(ETextField, { props: { label: "Email", autocomplete: "email", maxlength: 20 } });
    const input = container.querySelector("input")!;
    expect(input.getAttribute("autocomplete")).toBe("email");
    expect(input.maxLength).toBe(20);
  });

  test("counter shows the length out of maxlength and is part of the input's description", async () => {
    const { container } = await render(ETextField, {
      props: { label: "Bio", counter: true, maxlength: 5, modelValue: "abc", hint: "Short" },
    });
    const count = container.querySelector(".e-field-count")!;
    expect(count.textContent!.trim()).toBe("3 of 5 characters");
    expect(count.hasAttribute("data-full")).toBe(false);
    expect(container.querySelector("input")!.getAttribute("aria-describedby")!.split(" ")).toContain(count.id);
    const full = await render(ETextField, { props: { label: "Bio", counter: true, maxlength: 3, modelValue: "abc" } });
    expect(full.container.querySelector(".e-field-count")!.hasAttribute("data-full")).toBe(true);
    const open = await render(ETextField, { props: { label: "Bio", counter: true, modelValue: "a" } });
    expect(open.container.querySelector(".e-field-count")!.textContent!.trim()).toBe("1 character");
  });

  test("clearable shows a button only while there is text; it empties the input, emits clear and keeps focus", async () => {
    let cleared = 0;
    const model = ref("abc");
    const { container } = await render(
      defineComponent({
        render: () =>
          h(ETextField, {
            label: "Name",
            clearable: true,
            modelValue: model.value,
            "onUpdate:modelValue": (v: string) => (model.value = v),
            onClear: () => cleared++,
          }),
      }),
    );
    await page.getByRole("button", { name: "Clear" }).click();
    expect(model.value).toBe("");
    expect(cleared).toBe(1);
    expect(document.activeElement).toBe(container.querySelector("input"));
    await nextTick();
    expect(container.querySelector(".e-input-btn")).toBeNull();
  });

  test("no clear button while disabled or readonly", async () => {
    const off = await render(ETextField, { props: { label: "A", clearable: true, modelValue: "x", disabled: true } });
    expect(off.container.querySelector(".e-input-btn")).toBeNull();
    const ro = await render(ETextField, { props: { label: "B", clearable: true, modelValue: "x", readonly: true } });
    expect(ro.container.querySelector(".e-input-btn")).toBeNull();
  });

  test("loading shows a spinner in the box and sets aria-busy on the input", async () => {
    const { container } = await render(ETextField, { props: { label: "City", loading: true } });
    expect(container.querySelector(".e-input-wrap .e-input-spin")).not.toBeNull();
    expect(container.querySelector("input")!.getAttribute("aria-busy")).toBe("true");
  });

  test("size changes the height: sm is shorter and lg taller than the default", async () => {
    const height = async (size?: "sm" | "md" | "lg") => {
      const { container } = await render(ETextField, { props: { label: "x", size } });
      container.classList.add("e-root");
      return container.querySelector("input")!.getBoundingClientRect().height;
    };
    const [sm, md, lg] = [await height("sm"), await height("md"), await height()];
    expect(sm).toBeLessThan(md);
    expect(md).toBe(48);
    expect(await height("lg")).toBeGreaterThan(lg);
  });

  test("a boxed size keeps the clear button inside the box", async () => {
    const { container } = await render(ETextField, {
      props: { label: "x", size: "sm", clearable: true, modelValue: "a" },
    });
    container.classList.add("e-root");
    const wrap = container.querySelector(".e-input-wrap")!.getBoundingClientRect();
    const btn = container.querySelector(".e-input-btn")!.getBoundingClientRect();
    expect(btn.height).toBeLessThan(wrap.height);
    expect(btn.top).toBeGreaterThanOrEqual(wrap.top);
    expect(btn.bottom).toBeLessThanOrEqual(wrap.bottom);
  });

  test("a disabled text field posts nothing, and a named one joins a form it is outside of", async () => {
    await expectPostingContract(ETextField, { label: "Name", modelValue: "Ana" });
  });

  test("corners are concentric: the bare input and the clear button follow the wrap's radius at any theme", async () => {
    const { container } = await render(ETextField, { props: { label: "A", clearable: true, modelValue: "x" } });
    const root = container as HTMLElement;
    root.classList.add("e-root");
    const wrap = root.querySelector(".e-input-wrap")!;
    const input = wrap.querySelector(".e-input")!;
    const btn = wrap.querySelector(".e-input-btn")!;

    for (const md of [null, "14px", "2px"]) {
      if (md) root.style.setProperty("--e-radius-md", md);
      const outer = corner(wrap);
      expect(corner(input)).toBeCloseTo(Math.max(0, outer - 1), 0); // flush: the edge
      expect(corner(btn)).toBeCloseTo(Math.max(0, outer - 5), 0); // the edge and a tight gap
    }
  });
});

import { describe, expect, test } from "vitest";
import { defineComponent, h, nextTick, ref } from "vue";
import { userEvent, page } from "vitest/browser";
import { render } from "vitest-browser-vue";
import EOtpField from "./EOtpField.vue";
import { createEos } from "../../plugin.js";
import { expectNoViolations } from "../../../test/axe.js";
import { expectPostingContract } from "../../../test/formPosting.js";

const boxesOf = (root: Element) => [...root.querySelectorAll<HTMLInputElement>("input.e-otp-box")];
const code = (root: Element) =>
  boxesOf(root)
    .map((b) => b.value)
    .join("");

function paste(el: HTMLElement, text: string) {
  const data = new DataTransfer();
  data.setData("text", text);
  el.dispatchEvent(new ClipboardEvent("paste", { clipboardData: data, bubbles: true, cancelable: true }));
}

async function bound(props: Record<string, unknown>, initial = "") {
  const model = ref(initial);
  const got: string[] = [];
  const done: string[] = [];
  const result = await render(
    defineComponent({
      render: () =>
        h(EOtpField, {
          ...props,
          modelValue: model.value,
          "onUpdate:modelValue": (v: string) => {
            got.push(v);
            model.value = v;
          },
          onComplete: (v: string) => done.push(v),
        }),
    }),
  );
  return { model, got, done, ...result };
}

describe("EOtpField", () => {
  test("is a group named by its label with one box per character, each labelled", async () => {
    const { container } = await render(EOtpField, { props: { label: "Code" } });
    await expect.element(page.getByRole("group", { name: "Code" })).toBeVisible();
    expect(boxesOf(container).length).toBe(6);
    await expect.element(page.getByRole("textbox", { name: "Digit 3 of 6" })).toBeVisible();
    expect(container.querySelector(".e-otp")!.getAttribute("role")).toBe("group");
    expect(container.firstElementChild!.className).toBe("e-field");
  });

  test("the label defaults to Verification code", async () => {
    await render(EOtpField);
    await expect.element(page.getByRole("group", { name: "Verification code" })).toBeVisible();
  });

  test("hideLabel keeps the accessible name and hides the label", async () => {
    const { container } = await render(EOtpField, { props: { label: "Code", hideLabel: true } });
    expect(container.querySelector(".e-field-label")!.classList.contains("e-sr")).toBe(true);
    await expect.element(page.getByRole("group", { name: "Code" })).toBeVisible();
  });

  test("required sets the attribute on every box and shows the word", async () => {
    const { container } = await render(EOtpField, { props: { label: "Code", required: true } });
    expect(boxesOf(container).every((b) => b.required)).toBe(true);
    expect(container.querySelector(".e-field-flag")!.textContent).toBe("Required");
  });

  test("optional shows the word and leaves the boxes optional", async () => {
    const { container } = await render(EOtpField, { props: { label: "Code", optional: true } });
    expect(boxesOf(container).some((b) => b.required)).toBe(false);
    expect(container.querySelector(".e-field-flag")!.textContent).toBe("Optional");
  });

  test("the first box offers one-time-code autofill; numeric codes open the number pad", async () => {
    const { container } = await render(EOtpField, { props: { label: "Code" } });
    const boxes = boxesOf(container);
    expect(boxes[0]!.getAttribute("autocomplete")).toBe("one-time-code");
    expect(boxes[1]!.getAttribute("autocomplete")).toBe("off");
    expect(boxes[0]!.getAttribute("inputmode")).toBe("numeric");
  });

  test("one keystroke per character, complete once, backspace removes", async () => {
    const { container, got, done } = await bound({ label: "Code", length: 6 });
    boxesOf(container)[0]!.focus();
    await userEvent.keyboard("123456");
    expect(got.at(-1)).toBe("123456");
    expect(done).toEqual(["123456"]);
    expect(code(container)).toBe("123456");
    await userEvent.keyboard("{Backspace}");
    expect(got.at(-1)).toBe("12345");
    expect(done).toEqual(["123456"]);
    expect(code(container)).toBe("12345");
  });

  test("typing moves focus on to the next box", async () => {
    const { container } = await bound({ label: "Code" });
    boxesOf(container)[0]!.focus();
    await userEvent.keyboard("12");
    expect(document.activeElement).toBe(boxesOf(container)[2]);
  });

  test("letters are ignored in a numeric code, kept and upper-cased in a text code", async () => {
    const numeric = await bound({ label: "Code" });
    boxesOf(numeric.container)[0]!.focus();
    await userEvent.keyboard("a1b2");
    expect(numeric.got.at(-1)).toBe("12");
    const text = await bound({ label: "Code2", inputmode: "text", length: 4 });
    boxesOf(text.container)[0]!.focus();
    await userEvent.keyboard("a1b2");
    expect(text.got.at(-1)).toBe("A1B2");
    expect(boxesOf(text.container)[0]!.getAttribute("inputmode")).toBe("text");
    await expect.element(page.getByRole("textbox", { name: "Character 2 of 4" })).toBeVisible();
  });

  test("a paste fills every box and completes", async () => {
    const { container, got, done } = await bound({ label: "Code" });
    boxesOf(container)[0]!.focus();
    paste(boxesOf(container)[0]!, "987654");
    await nextTick();
    expect(got.at(-1)).toBe("987654");
    expect(done).toEqual(["987654"]);
    expect(code(container)).toBe("987654");
  });

  test("typing over a filled box replaces it", async () => {
    const { container, got } = await bound({ label: "Code" }, "123456");
    boxesOf(container)[1]!.focus();
    await userEvent.keyboard("9");
    expect(got.at(-1)).toBe("193456");
  });

  test("backspace in an empty box steps back and deletes the character before", async () => {
    const { container, got } = await bound({ label: "Code" }, "123");
    boxesOf(container)[3]!.focus();
    await userEvent.keyboard("{Backspace}");
    expect(got.at(-1)).toBe("12");
    expect(document.activeElement).toBe(boxesOf(container)[2]);
  });

  test("in a right-to-left page the arrows follow the boxes: left is the next box, right the one before", async () => {
    const { container } = await render(EOtpField, {
      props: { label: "Code", modelValue: "1234" },
      global: { plugins: [createEos({ themeTarget: null, locale: "he-IL", dir: "rtl" })] },
    });
    container.setAttribute("dir", "rtl");
    const boxes = boxesOf(container);
    boxes[2]!.focus();
    await userEvent.keyboard("{ArrowLeft}");
    expect(document.activeElement).toBe(boxes[3]);
    await userEvent.keyboard("{ArrowRight}{ArrowRight}");
    expect(document.activeElement).toBe(boxes[1]);
  });

  test("arrows, Home and End move; Delete removes", async () => {
    const { container, got } = await bound({ label: "Code" }, "1234");
    const boxes = boxesOf(container);
    boxes[2]!.focus();
    await userEvent.keyboard("{ArrowLeft}");
    expect(document.activeElement).toBe(boxes[1]);
    await userEvent.keyboard("{ArrowRight}{ArrowRight}");
    expect(document.activeElement).toBe(boxes[3]);
    await userEvent.keyboard("{Home}");
    expect(document.activeElement).toBe(boxes[0]);
    await userEvent.keyboard("{End}");
    expect(document.activeElement).toBe(boxes[4]);
    boxes[1]!.focus();
    await userEvent.keyboard("{Delete}");
    expect(got.at(-1)).toBe("134");
  });

  test("only the first empty box is in the tab order", async () => {
    const { container } = await render(EOtpField, { props: { label: "Code", modelValue: "12" } });
    const tabbable = boxesOf(container).filter((b) => b.tabIndex === 0);
    expect(tabbable).toEqual([boxesOf(container)[2]]);
    const full = await render(EOtpField, { props: { label: "Code", modelValue: "123456" } });
    expect(boxesOf(full.container).findIndex((b) => b.tabIndex === 0)).toBe(5);
  });

  test("Tab leaves the field instead of stepping through the boxes", async () => {
    const { container } = await render(
      defineComponent({
        render: () =>
          h("div", [
            h("button", { id: "before" }, "before"),
            h(EOtpField, { label: "Code", modelValue: "12" }),
            h("button", { id: "after" }, "after"),
          ]),
      }),
    );
    boxesOf(container)[2]!.focus();
    await userEvent.tab();
    expect(document.activeElement!.id).toBe("after");
    await userEvent.tab({ shift: true });
    expect(document.activeElement).toBe(boxesOf(container)[2]);
    await userEvent.tab({ shift: true });
    expect(document.activeElement!.id).toBe("before");
  });

  test("autocapitalize applies only to text codes", async () => {
    const numeric = await render(EOtpField, { props: { label: "Code" } });
    expect(boxesOf(numeric.container)[0]!.hasAttribute("autocapitalize")).toBe(false);
    const text = await render(EOtpField, { props: { label: "Code", inputmode: "text" } });
    expect(boxesOf(text.container)[0]!.getAttribute("autocapitalize")).toBe("characters");
  });

  test("a code from outside the component shows in the boxes", async () => {
    const { container, model } = await bound({ label: "Code" });
    model.value = "246810";
    await nextTick();
    expect(code(container)).toBe("246810");
    expect(boxesOf(container)[0]!.hasAttribute("data-filled")).toBe(true);
  });

  test("without v-model it keeps its own code", async () => {
    const { container } = await render(EOtpField, { props: { label: "Code", length: 4 } });
    boxesOf(container)[0]!.focus();
    await userEvent.keyboard("1234");
    expect(code(container)).toBe("1234");
  });

  test("groupSize puts a gap between groups", async () => {
    const { container } = await render(EOtpField, { props: { label: "Code", groupSize: 3 } });
    const seps = container.querySelectorAll(".e-otp-sep");
    expect(seps.length).toBe(1);
    expect(seps[0]!.getAttribute("aria-hidden")).toBe("true");
    expect(seps[0]!.previousElementSibling).toBe(boxesOf(container)[2]);
    expect(seps[0]!.nextElementSibling).toBe(boxesOf(container)[3]);
  });

  test("autoFocus starts in the first empty box", async () => {
    const focused: (string | null)[] = [];
    await render(EOtpField, {
      props: { label: "Code", autoFocus: true, modelValue: "12" },
      attrs: { onFocusin: (e: FocusEvent) => focused.push((e.target as HTMLElement).getAttribute("aria-label")) },
    });
    expect(focused).toEqual(["Digit 3 of 6"]);
  });

  test("name submits the whole code in a hidden input", async () => {
    const { container } = await render(EOtpField, { props: { label: "Code", name: "otp", modelValue: "123" } });
    const hidden = container.querySelector<HTMLInputElement>("input[type=hidden]")!;
    expect(hidden.name).toBe("otp");
    expect(hidden.value).toBe("123");
  });

  test("the hint or error is read with each box", async () => {
    const hinted = await render(EOtpField, { props: { label: "Code", hint: "Sent by text" } });
    const hintId = hinted.container.querySelector(".e-field-hint")!.id;
    expect(boxesOf(hinted.container).every((b) => b.getAttribute("aria-describedby") === hintId)).toBe(true);
    const bad = await render(EOtpField, { props: { label: "Code", error: "Wrong code" } });
    expect(bad.container.querySelector(".e-field-error")!.getAttribute("role")).toBe("alert");
    expect(boxesOf(bad.container).every((b) => b.getAttribute("aria-invalid") === "true")).toBe(true);
    const errorId = bad.container.querySelector(".e-field-error")!.id;
    expect(boxesOf(bad.container).every((b) => b.getAttribute("aria-describedby") === errorId)).toBe(true);
  });

  test("boxes are 48px tall at most and sit in one row", async () => {
    const { container } = await render(EOtpField, { props: { label: "Code" } });
    container.classList.add("e-root");
    const rects = boxesOf(container).map((b) => b.getBoundingClientRect());
    expect(rects.every((r) => Math.round(r.height) === 48)).toBe(true);
    expect(rects.every((r) => r.width <= 48 && r.width >= 30)).toBe(true);
    expect(new Set(rects.map((r) => r.top)).size).toBe(1);
  });

  test("the hint sits 8px under the boxes", async () => {
    const { container } = await render(EOtpField, { props: { label: "Code", hint: "Hint" } });
    container.classList.add("e-root");
    const box = boxesOf(container)[0]!.getBoundingClientRect();
    const hint = container.querySelector(".e-field-hint")!.getBoundingClientRect();
    expect(hint.top - box.bottom).toBe(8);
  });

  test("disabled disables every box", async () => {
    const { container } = await render(EOtpField, { props: { label: "Code", disabled: true } });
    expect(boxesOf(container).every((b) => b.disabled)).toBe(true);
  });

  test("@focus and @blur fire as focus enters and leaves the field, not between its inputs", async () => {
    const seen: string[] = [];
    const { container } = await render(
      defineComponent({
        render: () =>
          h("div", [
            h(EOtpField, { label: "Code", modelValue: "12", onFocus: () => seen.push("focus"), onBlur: () => seen.push("blur") }),
            h("button", { class: "after" }, "After"),
          ]),
      }),
    );
    const inputs = [...container.querySelectorAll<HTMLInputElement>("input.e-otp-box")];
    inputs[0]!.focus();
    inputs[1]!.focus();
    expect(seen).toEqual(["focus"]);
    container.querySelector<HTMLElement>(".after")!.focus();
    expect(seen).toEqual(["focus", "blur"]);
  });

  test("attributes land on the group, class and style on the wrapper", async () => {
    const { container } = await render(EOtpField, {
      props: { label: "Code" },
      attrs: { "data-x": "1", class: "mine" },
    });
    expect(container.querySelector<HTMLElement>(".e-otp")!.dataset["x"]).toBe("1");
    expect(container.firstElementChild!.className).toBe("e-field mine");
  });

  test("has no accessibility violations in any state", async () => {
    const { container } = await render(
      defineComponent({
        render: () =>
          h("div", [
            h(EOtpField, { label: "Empty" }),
            h(EOtpField, { label: "Filled", modelValue: "123456", hint: "A hint" }),
            h(EOtpField, { label: "Invalid", modelValue: "12", error: "Wrong code", groupSize: 3 }),
            h(EOtpField, { label: "Disabled", disabled: true, inputmode: "text", length: 4 }),
          ]),
      }),
    );
    await expectNoViolations(container);
  });
  test("exposes focus() and the first box as input", async () => {
    let api: { input: HTMLInputElement | null; focus: () => void } | null = null;
    const { container } = await render(
      defineComponent({ render: () => h(EOtpField, { ref: (r: unknown) => (api = r as typeof api) }) }),
    );
    const boxes = container.querySelectorAll<HTMLInputElement>("input.e-otp-box");
    expect(api!.input).toBe(boxes[0]);
    api!.focus();
    expect(document.activeElement).toBe(boxes[0]);
  });

  test("a disabled code posts nothing, and a named one joins a form it is outside of", async () => {
    await expectPostingContract(EOtpField, { modelValue: "123456" });
  });

  test("readonly keeps the code and ignores typing, Backspace and paste", async () => {
    const got: string[] = [];
    const { container } = await render(EOtpField, {
      props: { modelValue: "1234", readonly: true, "onUpdate:modelValue": (v: string) => got.push(v) },
    });
    const boxes = container.querySelectorAll<HTMLInputElement>("input.e-otp-box");
    expect(boxes[0]!.readOnly).toBe(true);
    boxes[1]!.focus();
    await userEvent.keyboard("9{Backspace}{Delete}");
    expect(got).toEqual([]);
    expect([...boxes].map((b) => b.value).join("")).toBe("1234");
  });
});

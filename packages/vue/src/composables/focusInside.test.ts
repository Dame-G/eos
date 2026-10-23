import { describe, expect, test } from "vitest";
import { defineComponent, h } from "vue";
import { render } from "vitest-browser-vue";
import { focusInside } from "./focusInside.js";

function box(inner: () => unknown, disabled = false) {
  return render(
    defineComponent({
      render: () =>
        h("div", { class: "box", style: "padding:20px", onClick: focusInside }, [
          h("input", { disabled }),
          ...(inner() as never[]),
        ]),
    }),
  );
}

describe("focusInside", () => {
  test("a click on the padding of the box focuses the input", async () => {
    const { container } = await box(() => []);
    (container.querySelector(".box") as HTMLElement).click();
    expect(document.activeElement).toBe(container.querySelector("input"));
  });

  test("a click on a button or link inside keeps its own behaviour", async () => {
    const { container } = await box(() => [h("button", { type: "button" }, "Clear"), h("a", { href: "#x" }, "Help")]);
    container.querySelector("button")!.click();
    expect(document.activeElement).not.toBe(container.querySelector("input"));
    container.querySelector("a")!.click();
    expect(document.activeElement).not.toBe(container.querySelector("input"));
  });

  test("a disabled input is left alone", async () => {
    const { container } = await box(() => [], true);
    (container.querySelector(".box") as HTMLElement).click();
    expect(document.activeElement).not.toBe(container.querySelector("input"));
  });
});

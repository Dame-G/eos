import { describe, expect, test, vi } from "vitest";
import { defineComponent, h } from "vue";
import { render } from "vitest-browser-vue";
import { useFieldAttrs } from "./useFieldAttrs.js";

const Field = defineComponent({
  inheritAttrs: false,
  props: { describedby: { type: String, default: undefined } },
  setup(props) {
    const attrs = useFieldAttrs();
    return () => h("div", attrs.wrapper(), [h("input", attrs.input(props.describedby))]);
  },
});

describe("useFieldAttrs", () => {
  test("class and style stay on the wrapper, everything else goes to the input", async () => {
    const { container } = await render(Field, {
      attrs: { class: "outer", style: "color: red", name: "email", "data-x": "1", maxlength: "5" },
    });
    const wrapper = container.querySelector("div")!;
    const input = container.querySelector("input")!;
    expect(wrapper.className).toBe("outer");
    expect(wrapper.getAttribute("style")).toContain("color");
    expect(wrapper.hasAttribute("name")).toBe(false);
    expect(input.getAttribute("name")).toBe("email");
    expect(input.getAttribute("data-x")).toBe("1");
    expect(input.getAttribute("maxlength")).toBe("5");
    expect(input.hasAttribute("class")).toBe(false);
    expect(input.hasAttribute("style")).toBe(false);
  });

  test("listeners reach the input", async () => {
    const onBlur = vi.fn();
    const { container } = await render(Field, { attrs: { onBlur } });
    const input = container.querySelector("input")!;
    input.focus();
    input.blur();
    expect(onBlur).toHaveBeenCalledTimes(1);
  });

  test("aria-describedby joins the component's ids with the consumer's", async () => {
    const { container } = await render(Field, {
      props: { describedby: "hint" },
      attrs: { "aria-describedby": "mine" },
    });
    expect(container.querySelector("input")!.getAttribute("aria-describedby")).toBe("hint mine");
  });

  test("no aria-describedby when there is none", async () => {
    const { container } = await render(Field);
    expect(container.querySelector("input")!.hasAttribute("aria-describedby")).toBe(false);
  });
});

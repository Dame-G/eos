import { describe, expect, test } from "vitest";
import { defineComponent, h } from "vue";
import { render } from "vitest-browser-vue";
import { useFieldControl } from "./useFieldControl.js";

const Probe = defineComponent({
  inheritAttrs: false,
  props: {
    disabled: Boolean,
    readonly: Boolean,
    required: Boolean,
    loading: Boolean,
    size: { type: String, default: undefined },
    name: { type: String, default: undefined },
  },
  setup(props) {
    const control = useFieldControl(props as never);
    const field = { id: "f", ariaInvalid: "true" as const, ariaDescribedby: "f-hint", required: false };
    return () =>
      h("div", control.attrs.wrapper(), [
        h("input", control.bind(field, ["f-prefix", false])),
        h("input", { type: "hidden", ...control.hidden(props.name, 7) }),
      ]);
  },
});

describe("useFieldControl", () => {
  test("bind gives the input its id, state, busy flag, size and joined description", async () => {
    const { container } = await render(Probe, {
      props: { disabled: true, readonly: true, required: true, loading: true, size: "sm" },
      attrs: { "aria-describedby": "mine" },
    });
    const input = container.querySelector<HTMLInputElement>("input")!;
    expect(input.id).toBe("f");
    expect(input.disabled && input.readOnly && input.required).toBe(true);
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(input.getAttribute("aria-busy")).toBe("true");
    expect(input.getAttribute("data-size")).toBe("sm");
    expect(input.getAttribute("aria-describedby")).toBe("f-prefix f-hint mine");
  });

  test("the default size and an idle field add no attribute", async () => {
    const { container } = await render(Probe, { props: { size: "md" } });
    const input = container.querySelector("input")!;
    expect(input.hasAttribute("data-size")).toBe(false);
    expect(input.hasAttribute("aria-busy")).toBe(false);
  });

  test("hidden carries the name, the value, the disabled state and the form attribute", async () => {
    const { container } = await render(Probe, { props: { name: "n", disabled: true }, attrs: { form: "other" } });
    const hidden = container.querySelector<HTMLInputElement>("input[type=hidden]")!;
    expect(hidden.name).toBe("n");
    expect(hidden.value).toBe("7");
    expect(hidden.disabled).toBe(true);
    expect(hidden.getAttribute("form")).toBe("other");
  });
});

/* eslint-disable vue/one-component-per-file */
import { expect } from "vitest";
import { defineComponent, h, type Component } from "vue";
import { render } from "vitest-browser-vue";

let formCount = 0;

/** What a form posts: every name with its values, in order. */
function posted(form: HTMLFormElement): [string, string][] {
  return [...new FormData(form).entries()].map(([k, v]) => [k, String(v)]);
}

/**
 * The posting contract of a named field: it posts its value under `name`, a disabled one posts nothing, and one placed
 * outside the form joins it through the `form` attribute. Give the props that make the field hold a value.
 */
export async function expectPostingContract(component: Component, props: Record<string, unknown>, name = "field") {
  const inside = (extra: Record<string, unknown>) =>
    render(defineComponent({ render: () => h("form", [h(component, { ...props, name, ...extra })]) }));

  const on = await inside({});
  const values = posted(on.container.querySelector("form")!);
  expect(values.map(([k]) => k)).toContain(name);

  const off = await inside({ disabled: true });
  expect(posted(off.container.querySelector("form")!)).toEqual([]);

  const outside = (extra: Record<string, unknown>) => {
    const id = `posting-form-${++formCount}`;
    return render(
      defineComponent({
        render: () => h("div", [h("form", { id }), h(component, { ...props, name, form: id, ...extra })]),
      }),
    );
  };
  const joined = await outside({});
  expect(posted(joined.container.querySelector("form")!)).toEqual(values);
  const joinedOff = await outside({ disabled: true });
  expect(posted(joinedOff.container.querySelector("form")!)).toEqual([]);
}

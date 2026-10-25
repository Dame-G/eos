import { describe, expect, test, vi } from "vitest";
import { defineComponent, h, nextTick, ref } from "vue";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-vue";
import ESegmented from "./ESegmented.vue";
import ETabs from "../Tabs/ETabs.vue";
import { expectNoViolations } from "../../../test/axe.js";
import { frames, settled } from "../../../test/frames.js";

function colourOf(host: Element, token: string) {
  const probe = document.createElement("span");
  probe.style.color = `var(${token})`;
  host.append(probe);
  const colour = getComputedStyle(probe).color;
  probe.remove();
  return colour;
}

const options = ["Day", "Week", "Month"];

describe("ESegmented", () => {
  test("is a radio group named by its label, with a radio per option", async () => {
    const { container } = await render(ESegmented, { props: { label: "View", options } });
    await expect.element(page.getByRole("radiogroup", { name: "View" })).toBeVisible();
    expect(container.querySelectorAll("input.e-seg-input").length).toBe(3);
    expect(container.firstElementChild!.className).toBe("e-seg-field");
    expect(container.querySelectorAll(".e-seg").length).toBe(1);
    await expect.element(page.getByRole("radio", { name: "Week" })).toBeVisible();
  });

  test("the first option shows as active when nothing is bound, but no radio is checked, so nothing posts", async () => {
    const { container } = await render(ESegmented, { props: { label: "View", options, name: "view", required: true } });
    const day = container.querySelector<HTMLInputElement>("input")!;
    expect(day.hasAttribute("data-on")).toBe(true);
    expect(day.checked).toBe(false);
    const form = document.createElement("form");
    form.append(container.firstElementChild!);
    document.body.append(form);
    expect(new FormData(form).getAll("view")).toEqual([]);
    expect(form.checkValidity()).toBe(false);
    form.remove();
  });

  test("an unset v-model shows the first option without emitting, so a form stays clean", async () => {
    const model = ref<string | undefined>(undefined);
    const got: unknown[] = [];
    await render(
      defineComponent({
        render: () =>
          h(ESegmented, {
            label: "View",
            options,
            modelValue: model.value,
            "onUpdate:modelValue": (v?: string) => {
              got.push(v);
              model.value = v;
            },
          }),
      }),
    );
    expect(document.querySelector(".e-seg-input[data-on]")!.getAttribute("value")).toBe("Day");
    await frames();
    expect(got).toEqual([]);
    expect(model.value).toBeUndefined();
    await page.getByRole("radio", { name: "Week" }).click();
    expect(got).toEqual(["Week"]);
  });

  test("the first option that can be chosen is shown as the default", async () => {
    const model = ref<string | undefined>(undefined);
    await render(
      defineComponent({
        render: () =>
          h(ESegmented, {
            label: "View",
            options: [{ value: "a", label: "A", disabled: true }, "B"],
            modelValue: model.value,
            "onUpdate:modelValue": (v?: string) => (model.value = v),
          }),
      }),
    );
    expect(document.querySelector(".e-seg-input[data-on]")!.getAttribute("value")).toBe("B");
    expect(model.value).toBeUndefined();
  });

  test("readonly keeps the choice and blocks changing it", async () => {
    const got: string[] = [];
    await render(ESegmented, {
      props: {
        label: "View",
        options,
        modelValue: "Week",
        readonly: true,
        "onUpdate:modelValue": (v: unknown) => got.push(v as string),
      },
    });
    await expect.element(page.getByRole("radiogroup", { name: "View" })).toHaveAttribute("aria-readonly", "true");
    await page.getByRole("radio", { name: "Day" }).click({ force: true });
    expect(got).toEqual([]);
    await expect.element(page.getByRole("radio", { name: "Week" })).toBeChecked();
  });

  test("required marks the group and its name", async () => {
    await render(ESegmented, { props: { label: "View", options, required: true } });
    const group = page.getByRole("radiogroup", { name: "View, Required" });
    await expect.element(group).toHaveAttribute("aria-required", "true");
  });

  test("v-model gets the value, and the model picks the option", async () => {
    const model = ref("Week");
    const got: string[] = [];
    await render(
      defineComponent({
        render: () =>
          h(ESegmented, {
            label: "View",
            options,
            modelValue: model.value,
            "onUpdate:modelValue": (v?: string) => {
              got.push(v!);
              model.value = v!;
            },
          }),
      }),
    );
    await expect.element(page.getByRole("radio", { name: "Week" })).toBeChecked();
    await page.getByRole("radio", { name: "Month" }).click();
    expect(got).toEqual(["Month"]);
    await expect.element(page.getByRole("radio", { name: "Month" })).toBeChecked();
    model.value = "Day";
    await nextTick();
    await expect.element(page.getByRole("radio", { name: "Day" })).toBeChecked();
  });

  test("arrow keys move between options and choose", async () => {
    const model = ref("Day");
    await render(
      defineComponent({
        render: () =>
          h(ESegmented, {
            label: "View",
            options,
            modelValue: model.value,
            "onUpdate:modelValue": (v?: string) => (model.value = v!),
          }),
      }),
    );
    await userEvent.tab();
    await userEvent.keyboard("{ArrowRight}");
    expect(model.value).toBe("Week");
    await userEvent.keyboard("{ArrowRight}");
    expect(model.value).toBe("Month");
    await userEvent.keyboard("{ArrowLeft}");
    expect(model.value).toBe("Week");
  });

  test("options carry an icon and a disabled flag", async () => {
    const { container } = await render(ESegmented, {
      props: {
        label: "View",
        options: [
          { value: "list", label: "List", icon: "file" },
          { value: "grid", label: "Grid", disabled: true },
        ],
      },
    });
    expect(container.querySelector(".e-seg-text svg.e-icon")).not.toBeNull();
    await expect.element(page.getByRole("radio", { name: "Grid" })).toBeDisabled();
    await expect.element(page.getByRole("radio", { name: "List", exact: true })).toBeVisible();
  });

  test("the control is 48px tall and the active option is filled", async () => {
    const { container } = await render(ESegmented, { props: { label: "View", options } });
    container.classList.add("e-root");
    const seg = container.querySelector(".e-seg")!;
    expect(seg.getBoundingClientRect().height).toBe(48);
    const active = container.querySelector(".e-seg-input[data-on] + .e-seg-text")!;
    expect(getComputedStyle(active).fontWeight).toBe("600");
    expect(getComputedStyle(seg).width).not.toBe("100%");
  });

  test("a hint or error goes under the control and is linked with aria-describedby", async () => {
    const hinted = await render(ESegmented, { props: { label: "View", options, hint: "Pick a range" } });
    hinted.container.classList.add("e-root");
    expect(hinted.container.firstElementChild!.className).toBe("e-seg-field");
    const seg = hinted.container.querySelector(".e-seg")!;
    const hint = hinted.container.querySelector(".e-field-hint")!;
    expect(seg.getAttribute("aria-describedby")).toBe(hint.id);
    expect(hint.getBoundingClientRect().top - seg.getBoundingClientRect().bottom).toBe(8);
    await expect.element(page.getByRole("radiogroup", { name: "View" })).toHaveAccessibleDescription("Pick a range");

    const bad = await render(ESegmented, { props: { label: "View2", options, error: "Choose one" } });
    expect(bad.container.querySelector(".e-field-error")!.hasAttribute("role")).toBe(false);
  });

  test("optional adds the word to the group's accessible name", async () => {
    await render(ESegmented, { props: { label: "View", options, optional: true } });
    await expect.element(page.getByRole("radiogroup", { name: "View, Optional" })).toBeVisible();
  });

  test("disabled disables every option", async () => {
    const { container } = await render(ESegmented, { props: { label: "View", options, disabled: true } });
    expect([...container.querySelectorAll("input")].every((i) => i.disabled)).toBe(true);
  });

  test("@focus and @blur fire as focus enters and leaves the field, not between its inputs", async () => {
    const seen: string[] = [];
    const { container } = await render(
      defineComponent({
        render: () =>
          h("div", [
            h(ESegmented, {
              label: "View",
              options,
              modelValue: "Day",
              onFocus: () => seen.push("focus"),
              onBlur: () => seen.push("blur"),
            }),
            h("button", { class: "after" }, "After"),
          ]),
      }),
    );
    const inputs = [...container.querySelectorAll<HTMLInputElement>("input.e-seg-input")];
    inputs[0]!.focus();
    inputs[1]!.focus();
    expect(seen).toEqual(["focus"]);
    container.querySelector<HTMLElement>(".after")!.focus();
    expect(seen).toEqual(["focus", "blur"]);
  });

  test("attributes land on the group, class and style on the outer element", async () => {
    const { container } = await render(ESegmented, {
      props: { label: "View", options },
      attrs: { "data-x": "1", class: "mine" },
    });
    const seg = container.querySelector(".e-seg") as HTMLElement;
    expect(seg.dataset["x"]).toBe("1");
    expect(seg.className).toBe("e-seg");
    expect(container.firstElementChild!.className).toBe("e-seg-field mine");
  });

  test("has no accessibility violations in any state", async () => {
    const { container } = await render(
      defineComponent({
        render: () =>
          h("div", [
            h(ESegmented, { label: "Plain", options }),
            h(ESegmented, { label: "Hinted", options, hint: "A hint", modelValue: "Week" }),
            h(ESegmented, { label: "Invalid", options, error: "Choose one" }),
            h(ESegmented, { label: "Disabled", options, disabled: true }),
            h(ESegmented, {
              label: "Icons",
              options: [
                { value: "a", label: "List", icon: "file" },
                { value: "b", label: "Grid", disabled: true },
              ],
            }),
          ]),
      }),
    );
    await expectNoViolations(container);
  });

  test("a selected option that is disabled stays readable: ink on the tint, not muted on the fill", async () => {
    const { container } = await render(ESegmented, {
      props: { label: "Currency", options: ["USD", "CAD"], modelValue: "USD", disabled: true },
    });
    const text = container.querySelector<HTMLElement>(".e-seg-input[data-on] + .e-seg-text")!;
    const probe = document.createElement("div");
    probe.style.cssText = "background: var(--e-primary); color: var(--e-ink)";
    container.append(probe);
    const fill = getComputedStyle(probe).backgroundColor;
    const ink = getComputedStyle(probe).color;
    probe.remove();
    expect(getComputedStyle(text).backgroundColor).not.toBe(fill);
    expect(getComputedStyle(text).color).toBe(ink);
  });

  test("an option that is not chosen answers the pointer as an inactive tab does", async () => {
    const tabs = await render(ETabs, {
      props: {
        items: [
          { id: "a", label: "A" },
          { id: "b", label: "B" },
        ],
      },
      slots: { a: () => "A", b: () => "B" },
    });
    tabs.container.classList.add("e-root");
    const { container } = await render(ESegmented, { props: { label: "View", options, modelValue: "Day" } });
    container.classList.add("e-root");
    const look = (el: Element) => {
      const css = getComputedStyle(el);
      return {
        bg: css.backgroundColor,
        edge: css.borderTopColor,
        width: css.borderTopWidth,
        shadow: css.boxShadow,
        ink: css.color,
      };
    };
    await userEvent.hover(container.querySelectorAll("input")[1]!);
    await settled();
    const seg = look(container.querySelectorAll(".e-seg-text")[1]!);
    await userEvent.hover(tabs.container.querySelectorAll(".e-tab")[1]!);
    await settled();
    const tab = look(tabs.container.querySelectorAll(".e-tab")[1]!);
    expect(seg).toEqual(tab);
    // The edge changes colour but never gets thicker: no ring is laid inside it.
    expect(seg.shadow).toBe("none");
    expect(seg.width).toBe("1px");
  });

  test("the end pieces carry the track's corners, so a ring, an outline or a slab is never cut by the track's clip", async () => {
    const { container } = await render(ESegmented, { props: { label: "View", options, modelValue: "Day" } });
    container.classList.add("e-root");
    const corner = (el: Element, which: string) =>
      parseFloat(getComputedStyle(el).getPropertyValue(`border-${which}-radius`));
    const track = container.querySelector(".e-seg")!;
    const pieces = container.querySelectorAll(".e-seg-text");
    for (const md of [null, "14px", "2px"]) {
      if (md) (container as HTMLElement).style.setProperty("--e-radius-md", md);
      const want = corner(track, "top-left");
      expect(corner(pieces[0]!, "top-left")).toBe(want);
      expect(corner(pieces[0]!, "bottom-left")).toBe(want);
      expect(corner(pieces.item(pieces.length - 1), "top-right")).toBe(want);
      expect(corner(pieces.item(pieces.length - 1), "bottom-right")).toBe(want);
      // The pieces between them stay square.
      expect(corner(pieces[1]!, "top-left")).toBe(0);
    }
  });

  test("a chosen option that is disabled is a flat tint with no edge of its own, inside the dashed track", async () => {
    const { container } = await render(ESegmented, {
      props: { label: "Currency", options: ["USD", "CAD"], modelValue: "USD", disabled: true },
    });
    container.classList.add("e-root");
    const chosen = getComputedStyle(container.querySelector(".e-seg-input[data-on] + .e-seg-text")!);
    expect(chosen.outlineStyle).toBe("none");
    expect(chosen.boxShadow).toBe("none");
    expect(getComputedStyle(container.querySelector(".e-seg")!).outlineStyle).toBe("dashed");
  });

  test("in a narrow space the options scroll, and the chosen one is brought into view", async () => {
    const options = Array.from({ length: 6 }, (_, i) => `Option number ${i}`);
    const { container } = await render(ESegmented, { props: { label: "Pick", options } });
    container.classList.add("e-root");
    const track = container.querySelector<HTMLElement>(".e-seg")!;
    container.style.width = "16rem";
    await expect.poll(() => track.scrollWidth).toBeGreaterThan(track.clientWidth);
    expect(getComputedStyle(track).overflowX).toBe("auto");
    const inView = () => {
      const chosen = container
        .querySelector<HTMLElement>(".e-seg-input[data-on]")!
        .parentElement!.getBoundingClientRect();
      const box = track.getBoundingClientRect();
      return chosen.right <= box.right + 1 && chosen.left >= box.left - 1;
    };
    await page.getByRole("radio", { name: "Option number 5" }).click({ force: true });
    await expect.poll(inView).toBe(true);
  });

  test("with reduced motion the chosen option jumps into view instead of a smooth scroll", async () => {
    const real = window.matchMedia.bind(window);
    vi.stubGlobal("matchMedia", (q: string) =>
      q.includes("prefers-reduced-motion") ? ({ matches: true } as MediaQueryList) : real(q),
    );
    const behaviours: (string | undefined)[] = [];
    const spy = vi.spyOn(HTMLElement.prototype, "scrollTo").mockImplementation(function (o?: unknown) {
      behaviours.push((o as ScrollToOptions | undefined)?.behavior);
    });
    try {
      const options = Array.from({ length: 6 }, (_, i) => `Option number ${i}`);
      const { container } = await render(ESegmented, { props: { label: "Pick", options } });
      container.classList.add("e-root");
      container.style.width = "16rem";
      const track = container.querySelector<HTMLElement>(".e-seg")!;
      await expect.poll(() => track.scrollWidth).toBeGreaterThan(track.clientWidth);
      await page.getByRole("radio", { name: "Option number 5" }).click({ force: true });
      await expect.poll(() => behaviours.length).toBeGreaterThan(0);
      expect(behaviours).not.toContain("smooth");
    } finally {
      spy.mockRestore();
      vi.unstubAllGlobals();
    }
  });

  test("the hint id does not come from the name, so two groups sharing a name keep their own hints", async () => {
    const { container } = await render(
      defineComponent({
        render: () =>
          h("div", [
            h(ESegmented, { label: "A", options, name: "view", hint: "First" }),
            h(ESegmented, { label: "B", options, name: "view", hint: "Second" }),
          ]),
      }),
    );
    const ids = [...container.querySelectorAll(".e-field-hint")].map((el) => el.id);
    expect(new Set(ids).size).toBe(2);
    await expect.element(page.getByRole("radiogroup", { name: "B" })).toHaveAccessibleDescription("Second");
  });
  test("an error turns the edge of the options that are not chosen danger and tints a hovered option", async () => {
    const { container } = await render(ESegmented, { props: { label: "View", options, error: "Pick a view" } });
    container.classList.add("e-root");
    const edge = (host: Element, n: number) =>
      getComputedStyle(host.querySelectorAll(".e-seg-text")[n]!).borderTopColor;
    expect(edge(container, 1)).toBe(colourOf(container, "--e-danger"));
    const ok = await render(ESegmented, { props: { label: "View", options } });
    ok.container.classList.add("e-root");
    expect(edge(ok.container, 1)).not.toBe(colourOf(container, "--e-danger"));
    await userEvent.hover(container.querySelectorAll("input")[1]!);
    await settled();
    expect(getComputedStyle(container.querySelectorAll(".e-seg-text")[1]!).backgroundColor).toBe(
      colourOf(container, "--e-danger-soft"),
    );
  });

  test("id names the group and its options; size sm is a shorter control with smaller text", async () => {
    const { container } = await render(ESegmented, { props: { label: "View", options, id: "view", size: "sm" } });
    container.classList.add("e-root");
    const group = container.querySelector<HTMLElement>("[role=radiogroup]")!;
    expect(group.id).toBe("view");
    expect(container.querySelector("input")!.id).toBe("view-0");
    expect(Math.round(group.getBoundingClientRect().height)).toBe(40);
    expect(getComputedStyle(container.querySelector(".e-seg-text")!).fontSize).toBe("14px");
  });

  test("showLabel shows the label above the control and names the group with it, flag included", async () => {
    const { container } = await render(ESegmented, {
      props: { label: "View", options, showLabel: true, required: true },
    });
    const label = container.querySelector(".e-seg-field > .e-field-label")!;
    expect(label.textContent).toContain("View");
    expect(label.textContent).toContain("Required");
    const group = container.querySelector("[role=radiogroup]")!;
    expect(group.getAttribute("aria-labelledby")).toBe(label.id);
    expect(group.hasAttribute("aria-label")).toBe(false);
    await expect.element(page.getByRole("radiogroup", { name: "View Required" })).toBeVisible();
  });

  test("exposes focus() and the chosen radio as input", async () => {
    let api: { input: HTMLInputElement | null; focus: () => void } | null = null;
    const { container } = await render(
      defineComponent({
        render: () =>
          h(ESegmented, { label: "View", options, modelValue: "Week", ref: (r: unknown) => (api = r as typeof api) }),
      }),
    );
    const radios = container.querySelectorAll("input");
    expect(api!.input).toBe(radios[1]);
    api!.focus();
    expect(document.activeElement).toBe(radios[1]);
  });
});

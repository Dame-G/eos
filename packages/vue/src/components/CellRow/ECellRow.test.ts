import { describe, expect, test } from "vitest";
import { defineComponent, h, ref } from "vue";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-vue";
import ECellRow from "./ECellRow.vue";
import EList from "../List/EList.vue";
import EVirtualList from "../VirtualList/EVirtualList.vue";
import { expectNoViolations } from "../../../test/axe.js";

const moves = [
  {
    n: "1.",
    cells: [
      { value: "1w", label: "e4" },
      { value: "1b", label: "e5" },
    ],
  },
  {
    n: "2.",
    cells: [
      { value: "2w", label: "Nf3" },
      { value: "2b", label: "Nc6", disabled: true },
    ],
  },
  {
    n: "3.",
    cells: [
      { value: "3w", label: "Bb5" },
      { value: "3b", label: "a6" },
    ],
  },
  { n: "4.", cells: [{ value: "4w", label: "Ba4" }] },
];

function host(mode: "current" | "select" = "current") {
  const model = ref<string | number | null>("1w");
  const picked: (string | number)[] = [];
  const Host = defineComponent({
    render: () =>
      h(
        EList,
        {
          label: "Moves",
          mode,
          modelValue: model.value,
          "onUpdate:modelValue": (v: string | number | null | undefined) => (model.value = v ?? null),
          onSelect: (v: string | number) => picked.push(v),
        },
        () => moves.map((m) => h(ECellRow, { key: m.n, label: m.n, cells: m.cells, columns: 2 })),
      ),
  });
  return { Host, model, picked };
}

const cell = (name: string) => page.getByRole("button", { name });

describe("ECellRow", () => {
  test("a number and two cells that are chosen on their own, named with the number", async () => {
    const { Host, model, picked } = host();
    const { container } = await render(Host);
    expect(container.querySelectorAll(".e-cell").length).toBe(7);
    await cell("2. Nf3").click();
    expect(model.value).toBe("2w");
    expect(picked).toEqual(["2w"]);
    await expect.element(cell("2. Nf3")).toHaveAttribute("aria-current", "true");
    await expect.element(cell("1. e4")).not.toHaveAttribute("aria-current");
    await cell("3. a6").click();
    expect(model.value).toBe("3b");
  });

  test("a disabled cell does not answer", async () => {
    const { Host, model } = host();
    await render(Host);
    await cell("2. Nc6").click({ force: true });
    expect(model.value).toBe("1w");
  });

  test("one tab stop for the whole list; Left and Right move across a row, Up and Down keep the column", async () => {
    const { Host } = host();
    const { container } = await render(Host);
    const stops = [...container.querySelectorAll<HTMLElement>(".e-cell")].filter((c) => c.tabIndex === 0);
    expect(stops.map((c) => c.getAttribute("aria-label"))).toEqual(["1. e4"]);
    await userEvent.tab();
    expect(document.activeElement?.getAttribute("aria-label")).toBe("1. e4");
    await userEvent.keyboard("{ArrowRight}");
    expect(document.activeElement?.getAttribute("aria-label")).toBe("1. e5");
    await userEvent.keyboard("{ArrowRight}");
    expect(document.activeElement?.getAttribute("aria-label")).toBe("1. e5");
    await userEvent.keyboard("{ArrowDown}");
    // The black move of row 2 is disabled, so focus settles on the nearest cell that is available.
    expect(document.activeElement?.getAttribute("aria-label")).toBe("2. Nf3");
    await userEvent.keyboard("{ArrowDown}");
    expect(document.activeElement?.getAttribute("aria-label")).toBe("3. Bb5");
    await userEvent.keyboard("{ArrowRight}{ArrowDown}");
    expect(document.activeElement?.getAttribute("aria-label")).toBe("4. Ba4");
    await userEvent.keyboard("{ArrowUp}");
    expect(document.activeElement?.getAttribute("aria-label")).toBe("3. Bb5");
    await userEvent.keyboard("{End}");
    expect(document.activeElement?.getAttribute("aria-label")).toBe("4. Ba4");
    await userEvent.keyboard("{Home}");
    expect(document.activeElement?.getAttribute("aria-label")).toBe("1. e4");
  });

  test("a select list makes the cells options", async () => {
    const { Host, model } = host("select");
    const { container } = await render(Host);
    expect(container.querySelectorAll("[role='option']").length).toBe(7);
    await page.getByRole("option", { name: "1. e5" }).click();
    expect(model.value).toBe("1b");
    await expect.element(page.getByRole("option", { name: "1. e5" })).toHaveAttribute("aria-selected", "true");
  });

  test("the cell slot replaces a cell's text", async () => {
    const { container } = await render(
      defineComponent({
        render: () =>
          h(EList, { label: "Moves" }, () =>
            h(
              ECellRow,
              { label: "1.", cells: [{ value: "a", label: "e4" }] },
              { cell: ({ cell }: { cell: { label: string } }) => h("b", { class: "mine" }, cell.label.toUpperCase()) },
            ),
          ),
      }),
    );
    expect(container.querySelector(".mine")!.textContent).toBe("E4");
  });

  test("works in a virtual list, reaching rows that are not rendered yet", async () => {
    const rows = Array.from({ length: 200 }, (_, i) => ({
      n: `${i + 1}.`,
      cells: [
        { value: `${i}w`, label: `w${i}` },
        { value: `${i}b`, label: `b${i}` },
      ],
    }));
    const model = ref<string | number | null>("0w");
    await render(
      defineComponent({
        render: () =>
          h("div", { style: "height: 240px" }, [
            h(
              EList,
              {
                label: "Moves",
                modelValue: model.value,
                followFocus: true,
                "onUpdate:modelValue": (v: string | number | null | undefined) => (model.value = v ?? null),
              },
              () =>
                h(
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- generic over the item, left open here
                  EVirtualList as any,
                  { items: rows, rowHeight: 48, itemKey: "n" },
                  {
                    default: ({ item }: { item: (typeof rows)[number] }) =>
                      h(ECellRow, { label: item.n, cells: item.cells }),
                  },
                ),
            ),
          ]),
      }),
    );
    await userEvent.tab();
    await userEvent.keyboard("{ArrowRight}");
    expect(model.value).toBe("0b");
    await userEvent.keyboard("{End}");
    await expect.poll(() => model.value).toBe("199b");
    await userEvent.keyboard("{ArrowLeft}{ArrowUp}");
    await expect.poll(() => model.value).toBe("198w");
  });

  test("has no axe violations", async () => {
    const { Host } = host();
    const { container } = await render(Host);
    await expectNoViolations(container);
    const s = host("select");
    const second = await render(s.Host);
    await expectNoViolations(second.container);
  });
});

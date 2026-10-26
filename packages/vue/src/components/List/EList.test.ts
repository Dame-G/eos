import { describe, expect, test } from "vitest";
import { defineComponent, h, nextTick, ref } from "vue";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-vue";
import EList from "./EList.vue";
import EListRow from "../ListRow/EListRow.vue";
import EVirtualList from "../VirtualList/EVirtualList.vue";
import { expectNoViolations } from "../../../test/axe.js";

const games = [
  { id: "g1", title: "You – Dameless", subtitle: "5+3 · 2 min ago" },
  { id: "g2", title: "Dameless – Stockfish 4", subtitle: "3+2 · 1 h ago" },
  { id: "g3", title: "You – cutemouse83", subtitle: "10+5 · yesterday", disabled: true },
  { id: "g4", title: "deeper-lmr vs v14", subtitle: "412 pairs" },
];

function host(props: Record<string, unknown> = {}, initial: string | null = null) {
  const model = ref<string | number | null>(initial);
  const chosen: (string | number)[] = [];
  const Host = defineComponent({
    render: () =>
      h("div", [
        h("button", { id: "before" }, "Before"),
        h(
          EList,
          {
            label: "Games",
            modelValue: model.value,
            "onUpdate:modelValue": (v?: string | number | null) => (model.value = v ?? null),
            onSelect: (v: string | number) => chosen.push(v),
            ...props,
          },
          () => games.map((g) => h(EListRow, { key: g.id, value: g.id, ...g })),
        ),
        h("button", { id: "after" }, "After"),
      ]),
  });
  return { Host, model, chosen };
}

const rows = () => [...document.querySelectorAll<HTMLElement>(".e-listrow")];
const focusedTitle = () => document.activeElement?.querySelector(".e-listrow-title")?.textContent?.trim();

describe("EList", () => {
  test("is a list named by its label; each row is a list item holding a button", async () => {
    const { Host } = host();
    await render(Host);
    await expect.element(page.getByRole("list", { name: "Games" })).toBeVisible();
    expect(page.getByRole("listitem").elements()).toHaveLength(4);
    await expect.element(page.getByRole("button", { name: /You – Dameless/ })).toBeVisible();
  });

  test("the current row is marked aria-current and drawn as the current place", async () => {
    const { Host } = host({}, "g2");
    await render(Host);
    const [a, b] = rows();
    expect(a!.hasAttribute("aria-current")).toBe(false);
    expect(b!.getAttribute("aria-current")).toBe("true");
    const probe = document.createElement("span");
    probe.style.color = "var(--e-primary)";
    document.body.append(probe);
    expect(getComputedStyle(b!).borderTopColor).toBe(getComputedStyle(probe).color);
    probe.remove();
  });

  test("one tab stop: Tab enters on the current row, and leaves the list on the next Tab", async () => {
    const { Host } = host({}, "g2");
    await render(Host);
    document.getElementById("before")!.focus();
    await userEvent.tab();
    expect(focusedTitle()).toBe("Dameless – Stockfish 4");
    await userEvent.tab();
    expect(document.activeElement!.id).toBe("after");
    await userEvent.tab({ shift: true });
    expect(focusedTitle()).toBe("Dameless – Stockfish 4");
  });

  test("with no current row, Tab enters on the first row", async () => {
    const { Host } = host();
    await render(Host);
    document.getElementById("before")!.focus();
    await userEvent.tab();
    expect(focusedTitle()).toBe("You – Dameless");
  });

  test("Up and Down move between rows past disabled ones, Home and End go to the ends; focus alone chooses nothing", async () => {
    const { Host, model } = host();
    await render(Host);
    rows()[0]!.focus();
    await userEvent.keyboard("{ArrowDown}");
    expect(focusedTitle()).toBe("Dameless – Stockfish 4");
    await userEvent.keyboard("{ArrowDown}");
    expect(focusedTitle()).toBe("deeper-lmr vs v14");
    await userEvent.keyboard("{ArrowUp}");
    expect(focusedTitle()).toBe("Dameless – Stockfish 4");
    await userEvent.keyboard("{End}");
    expect(focusedTitle()).toBe("deeper-lmr vs v14");
    await userEvent.keyboard("{ArrowDown}");
    expect(focusedTitle()).toBe("deeper-lmr vs v14");
    await userEvent.keyboard("{Home}");
    expect(focusedTitle()).toBe("You – Dameless");
    await userEvent.keyboard("{ArrowUp}");
    expect(focusedTitle()).toBe("You – Dameless");
    expect(model.value).toBeNull();
  });

  test("Tab returns to the row last focused", async () => {
    const { Host } = host();
    await render(Host);
    rows()[0]!.focus();
    await userEvent.keyboard("{ArrowDown}");
    await userEvent.tab();
    expect(document.activeElement!.id).toBe("after");
    await userEvent.tab({ shift: true });
    expect(focusedTitle()).toBe("Dameless – Stockfish 4");
  });

  test("a click, Enter or Space makes a row current and fires select; a disabled row does nothing", async () => {
    const { Host, model, chosen } = host();
    await render(Host);
    await page.getByRole("button", { name: /Dameless – Stockfish 4/ }).click();
    expect(model.value).toBe("g2");
    rows()[3]!.focus();
    await userEvent.keyboard("{Enter}");
    expect(model.value).toBe("g4");
    rows()[0]!.focus();
    await userEvent.keyboard(" ");
    expect(model.value).toBe("g1");
    await userEvent.click(rows()[2]!, { force: true });
    expect(model.value).toBe("g1");
    expect(chosen).toEqual(["g2", "g4", "g1"]);
  });

  test("followFocus makes the row that focus moves to the current one", async () => {
    const { Host, model, chosen } = host({ followFocus: true }, "g1");
    await render(Host);
    rows()[0]!.focus();
    await userEvent.keyboard("{ArrowDown}");
    expect(model.value).toBe("g2");
    await userEvent.keyboard("{End}");
    expect(model.value).toBe("g4");
    expect(chosen).toEqual(["g2", "g4"]);
  });

  test("mode select is a listbox of options with aria-selected; Enter and Space select", async () => {
    const { Host, model } = host({ mode: "select" }, "g1");
    await render(Host);
    await expect.element(page.getByRole("listbox", { name: "Games" })).toBeVisible();
    const options = page.getByRole("option").elements();
    expect(options).toHaveLength(4);
    expect(options.map((o) => o.getAttribute("aria-selected"))).toEqual(["true", "false", "false", "false"]);
    expect(options[2]!.getAttribute("aria-disabled")).toBe("true");
    (options[0] as HTMLElement).focus();
    await userEvent.keyboard("{ArrowDown}");
    await userEvent.keyboard("{Enter}");
    expect(model.value).toBe("g2");
    await userEvent.keyboard("{ArrowDown}");
    await userEvent.keyboard(" ");
    expect(model.value).toBe("g4");
    await nextTick();
    expect(options[3]!.getAttribute("aria-selected")).toBe("true");
  });

  test("with an EVirtualList inside, the arrow keys and End reach rows that are not rendered yet", async () => {
    const many = Array.from({ length: 500 }, (_, i) => ({ id: i, title: `Game ${i + 1}`, disabled: i === 498 }));
    await render(
      defineComponent({
        render: () =>
          h(EList, { label: "Games" }, () =>
            h(
              // eslint-disable-next-line @typescript-eslint/no-explicit-any -- generic over the item, left open here
              EVirtualList as any,
              { items: many, rowHeight: 52, itemKey: "id", style: "height: 300px" },
              {
                default: ({ item }: { item: { id: number; title: string; disabled: boolean } }) =>
                  h(EListRow, { value: item.id, title: item.title, disabled: item.disabled }),
              },
            ),
          ),
      }),
    );
    await expect.poll(() => rows().length).toBeGreaterThan(0);
    expect(rows().length).toBeLessThan(30);
    rows()[0]!.focus();
    await userEvent.keyboard("{ArrowDown}");
    expect(focusedTitle()).toBe("Game 2");
    await userEvent.keyboard("{End}");
    await expect.poll(() => focusedTitle()).toBe("Game 500");
    await userEvent.keyboard("{ArrowUp}");
    await expect.poll(() => focusedTitle()).toBe("Game 498");
    await userEvent.keyboard("{Home}");
    await expect.poll(() => focusedTitle()).toBe("Game 1");
  });

  test("has no axe violations, as a list with a current row and as a listbox", async () => {
    const current = host({}, "g2");
    const { container } = await render(current.Host);
    await expectNoViolations(container);
    const select = host({ mode: "select" }, "g1");
    const second = await render(select.Host);
    await expectNoViolations(second.container);
  });
});

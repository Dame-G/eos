import { describe, expect, test } from "vitest";
import { defineComponent, h, nextTick, ref } from "vue";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-vue";
import ETree, { type TreeNode } from "./ETree.vue";
import { expectNoViolations } from "../../../test/axe.js";

const items: TreeNode[] = [
  { id: "live", label: "You – Dameless", description: "5+3 · live" },
  {
    id: "lmr",
    label: "deeper-lmr vs v14",
    description: "412 pairs",
    children: [
      { id: "lmr-1", label: "Game 1", description: "1–0" },
      { id: "lmr-2", label: "Game 2", description: "½–½" },
    ],
  },
  { id: "old", label: "You – cutemouse83", disabled: true },
];

function host(initial: { selected?: string | null; expanded?: string[] } = {}) {
  const selected = ref<string | null>(initial.selected ?? null);
  const expanded = ref<string[]>(initial.expanded ?? []);
  const chosen: string[] = [];
  const Host = defineComponent({
    render: () =>
      h(ETree, {
        items,
        label: "Games",
        modelValue: selected.value,
        "onUpdate:modelValue": (v?: string | null) => (selected.value = v ?? null),
        expanded: expanded.value,
        "onUpdate:expanded": (v: string[]) => (expanded.value = v),
        onSelect: (id: string) => chosen.push(id),
      }),
  });
  return { Host, selected, expanded, chosen };
}

const item = (name: string | RegExp) => page.getByRole("treeitem", { name });
const focused = () => document.activeElement?.querySelector(".e-listrow-title")?.textContent;

describe("ETree", () => {
  test("is a tree named by its label; a node with children says whether it is open, at its level", async () => {
    const { Host } = host();
    await render(Host);
    await expect.element(page.getByRole("tree", { name: "Games" })).toBeVisible();
    expect(page.getByRole("treeitem").elements()).toHaveLength(3);
    const group = item(/deeper-lmr/).element();
    expect(group.getAttribute("aria-expanded")).toBe("false");
    expect(group.getAttribute("aria-level")).toBe("1");
    expect(
      item(/You – Dameless/)
        .element()
        .hasAttribute("aria-expanded"),
    ).toBe(false);
    expect(
      item(/cutemouse83/)
        .element()
        .getAttribute("aria-disabled"),
    ).toBe("true");
  });

  test("Right opens a node and moves into it, Left goes back to the parent and closes it", async () => {
    const { Host, expanded } = host();
    await render(Host);
    await userEvent.tab();
    expect(focused()).toBe("You – Dameless");
    await userEvent.keyboard("{ArrowDown}");
    expect(focused()).toBe("deeper-lmr vs v14");
    await userEvent.keyboard("{ArrowRight}");
    await expect.poll(() => expanded.value).toEqual(["lmr"]);
    await expect.element(item(/Game 1/)).toBeVisible();
    expect(
      item(/Game 1/)
        .element()
        .getAttribute("aria-level"),
    ).toBe("2");
    await userEvent.keyboard("{ArrowRight}");
    expect(focused()).toBe("Game 1");
    await userEvent.keyboard("{ArrowLeft}");
    expect(focused()).toBe("deeper-lmr vs v14");
    await userEvent.keyboard("{ArrowLeft}");
    await expect.poll(() => expanded.value).toEqual([]);
    expect(page.getByRole("treeitem").elements()).toHaveLength(3);
  });

  test("Up, Down, Home and End move between the rows that are showing, past disabled ones", async () => {
    const { Host } = host({ expanded: ["lmr"] });
    await render(Host);
    await userEvent.tab();
    await userEvent.keyboard("{End}");
    expect(focused()).toBe("Game 2");
    await userEvent.keyboard("{ArrowUp}");
    expect(focused()).toBe("Game 1");
    await userEvent.keyboard("{Home}");
    expect(focused()).toBe("You – Dameless");
  });

  test("Enter, Space or a press selects a node; selecting is aria-selected and drawn as the current place", async () => {
    const { Host, selected, chosen } = host({ expanded: ["lmr"] });
    await render(Host);
    await userEvent.tab();
    await userEvent.keyboard("{Enter}");
    expect(selected.value).toBe("live");
    await userEvent.keyboard("{ArrowDown}{ArrowDown}");
    await userEvent.keyboard(" ");
    expect(selected.value).toBe("lmr-1");
    await item(/Game 2/).click();
    expect(selected.value).toBe("lmr-2");
    await nextTick();
    const row = item(/Game 2/).element() as HTMLElement;
    expect(row.getAttribute("aria-selected")).toBe("true");
    const probe = document.createElement("span");
    probe.style.color = "var(--e-primary)";
    document.body.append(probe);
    await expect.poll(() => getComputedStyle(row).borderTopColor).toBe(getComputedStyle(probe).color);
    probe.remove();
    expect(chosen).toEqual(["live", "lmr-1", "lmr-2"]);
  });

  test("pressing a node with children opens it as well", async () => {
    const { Host, expanded } = host();
    await render(Host);
    await item(/deeper-lmr/).click();
    await expect.poll(() => expanded.value).toEqual(["lmr"]);
  });

  test("a disabled node cannot be selected", async () => {
    const { Host, selected } = host();
    await render(Host);
    await userEvent.click(item(/cutemouse83/).element(), { force: true });
    expect(selected.value).toBeNull();
  });

  test("children step in by a chevron's width, and the chevron turns while open", async () => {
    const { Host } = host({ expanded: ["lmr"] });
    await render(Host);
    const parent = item(/deeper-lmr/)
      .element()
      .querySelector<HTMLElement>(".e-listrow-title")!;
    const child = item(/Game 1/)
      .element()
      .querySelector<HTMLElement>(".e-listrow-title")!;
    expect(Math.round(child.getBoundingClientRect().left)).toBeGreaterThan(
      Math.round(parent.getBoundingClientRect().left),
    );
    const chevron = item(/deeper-lmr/)
      .element()
      .querySelector<HTMLElement>(".e-tree-chevron")!;
    await expect.poll(() => getComputedStyle(chevron).transform).not.toBe("none");
  });

  test("the item, leading and trailing slots take their places", async () => {
    const { container } = await render(ETree, {
      props: { items, label: "Games" },
      slots: {
        item: ({ item }: { item: TreeNode }) => h("span", { class: "mine" }, item.label.toUpperCase()),
        leading: () => h("span", { class: "lead" }, "•"),
        trailing: ({ item }: { item: TreeNode }) => String(item.children?.length ?? 0),
      },
    });
    const first = container.querySelector(".e-tree-row")!;
    expect(first.querySelector(".mine")!.textContent).toBe("YOU – DAMELESS");
    expect(first.querySelector(".lead")).not.toBeNull();
    expect(container.querySelectorAll(".e-listrow-trail")[1]!.textContent).toBe("2");
  });

  test("has no axe violations, closed, open and with a selection", async () => {
    const { Host } = host({ expanded: ["lmr"], selected: "lmr-1" });
    const { container } = await render(Host);
    await expectNoViolations(container);
  });
});

describe("ETree additions", () => {
  const tree = (props: Record<string, unknown>, slots: Record<string, unknown> = {}) => {
    const selected = ref<string | null>(null);
    const expanded = ref<string[]>([]);
    const Host = defineComponent({
      render: () =>
        h(
          ETree,
          {
            items,
            label: "Games",
            modelValue: selected.value,
            "onUpdate:modelValue": (v?: string | null) => (selected.value = v ?? null),
            expanded: expanded.value,
            "onUpdate:expanded": (v: string[]) => (expanded.value = v),
            ...props,
          },
          slots,
        ),
    });
    return { Host, selected, expanded };
  };
  const rowsOf = (c: Element) => c.querySelectorAll<HTMLElement>(".e-tree-row");

  test("toggleOn chevron: the row selects, the chevron opens and closes", async () => {
    const { Host, selected, expanded } = tree({ toggleOn: "chevron" });
    const { container } = await render(Host);
    const row = rowsOf(container)[1]!;
    await userEvent.click(row.querySelector(".e-listrow-title")!);
    expect(selected.value).toBe("lmr");
    expect(expanded.value).toEqual([]);
    await userEvent.click(row.querySelector(".e-tree-chevron")!);
    expect(expanded.value).toEqual(["lmr"]);
    expect(selected.value).toBe("lmr");
    await userEvent.click(rowsOf(container)[0]!.querySelector(".e-tree-chevron")!);
    expect(selected.value).toBe("lmr");
    await userEvent.click(row.querySelector(".e-tree-chevron")!);
    expect(expanded.value).toEqual([]);
  });

  test("toggleOn row (the default) does both", async () => {
    const { Host, selected, expanded } = tree({});
    const { container } = await render(Host);
    await userEvent.click(rowsOf(container)[1]!.querySelector(".e-listrow-title")!);
    expect(selected.value).toBe("lmr");
    expect(expanded.value).toEqual(["lmr"]);
  });

  test("the keyboard still selects with Enter and opens with Right in chevron mode", async () => {
    const { Host, selected, expanded } = tree({ toggleOn: "chevron" });
    await render(Host);
    await userEvent.tab();
    await userEvent.keyboard("{ArrowDown}{Enter}");
    expect(selected.value).toBe("lmr");
    await userEvent.keyboard("{ArrowRight}");
    expect(expanded.value).toEqual(["lmr"]);
  });

  test("a control in a row is the control's: it neither selects nor opens, and its keys stay its own", async () => {
    let pressed = 0;
    const { Host, selected, expanded } = tree(
      {},
      {
        trailing: ({ item }: { item: TreeNode }) =>
          h("button", { type: "button", "aria-label": `Remove ${item.label}`, onClick: () => pressed++ }, "x"),
      },
    );
    await render(Host);
    await page.getByRole("button", { name: "Remove deeper-lmr vs v14" }).click();
    expect(pressed).toBe(1);
    expect(selected.value).toBeNull();
    expect(expanded.value).toEqual([]);
    (page.getByRole("button", { name: "Remove deeper-lmr vs v14" }).element() as HTMLElement).focus();
    await userEvent.keyboard("{Enter}");
    expect(pressed).toBe(2);
    expect(selected.value).toBeNull();
    await expectNoViolations(document.body);
  });

  test("dense shortens the rows, indent sm steps in less, and class reaches the root", async () => {
    const step = (c: Element) =>
      parseFloat(getComputedStyle(rowsOf(c)[2]!).paddingInlineStart) -
      parseFloat(getComputedStyle(rowsOf(c)[0]!).paddingInlineStart);
    const a = await render(tree({ expanded: ["lmr"] }).Host);
    const stepA = step(a.container);
    const heightA = rowsOf(a.container)[0]!.getBoundingClientRect().height;
    a.unmount();
    const b = await render(tree({ expanded: ["lmr"], dense: true, indent: "sm", class: "mine" }).Host);
    expect(b.container.querySelector(".e-tree")!.classList.contains("mine")).toBe(true);
    expect(step(b.container)).toBeLessThan(stepA);
    const heightB = rowsOf(b.container)[0]!.getBoundingClientRect().height;
    expect(heightB).toBeLessThan(heightA);
    expect(heightB).toBeGreaterThanOrEqual(44);
  });
});

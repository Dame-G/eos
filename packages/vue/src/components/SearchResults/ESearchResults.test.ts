import { describe, expect, test } from "vitest";
import { defineComponent, h, nextTick, ref } from "vue";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-vue";
import ESearchResults from "./ESearchResults.vue";
import { expectNoViolations } from "../../../test/axe.js";

const items = [
  { label: "Dialog", description: "Components › Containers", href: "/components/Dialog" },
  { label: "Drawer", description: "Components › Containers", href: "/components/Drawer" },
  { label: "Disclosure", href: "/components/Disclosure" },
];

const FakeRouterLink = defineComponent({
  props: { to: { type: String, required: true } },
  setup:
    (props, { slots }) =>
    () =>
      h("a", { href: `/app${props.to}`, "data-router": "" }, slots.default?.()),
});

interface Handle {
  focusFirst: () => void;
  focus: () => void;
}

describe("ESearchResults", () => {
  test("is a named list of links with a title and a muted parent line", async () => {
    const { container } = await render(ESearchResults, { props: { items, label: "Search results" } });
    await expect.element(page.getByRole("list", { name: "Search results" })).toBeVisible();
    expect(page.getByRole("link").elements().length).toBe(3);
    const links = [...container.querySelectorAll("a.e-opt")];
    expect(links.map((a) => a.getAttribute("href"))).toEqual([
      "/components/Dialog",
      "/components/Drawer",
      "/components/Disclosure",
    ]);
    expect(links[0]!.querySelector(".e-opt-label")!.textContent).toBe("Dialog");
    expect(links[0]!.querySelector(".e-opt-desc")!.textContent).toBe("Components › Containers");
    expect(links[2]!.querySelector(".e-opt-desc")).toBeNull();
    expect(getComputedStyle(links[0]!).textDecorationLine).toBe("none");
  });

  test("query marks the first match in the title and description", async () => {
    const { container } = await render(ESearchResults, { props: { items, label: "Results", query: " Dia" } });
    expect([...container.querySelectorAll("mark")].map((m) => m.textContent)).toEqual(["Dia"]);
  });

  test("emptyText shows only when there are no items, and nothing renders without it", async () => {
    const empty = await render(ESearchResults, { props: { items: [], label: "Results", emptyText: "Nothing found." } });
    await expect.element(page.getByText("Nothing found.")).toBeVisible();
    expect(empty.container.querySelector("ul")).toBeNull();
    const none = await render(ESearchResults, { props: { items: [], label: "Results" } });
    expect(none.container.querySelector(".e-results")).toBeNull();
  });

  test("ArrowDown and ArrowUp move focus between results, and ArrowUp on the first emits edge", async () => {
    let edges = 0;
    const { container } = await render(ESearchResults, {
      props: { items, label: "Results", onEdge: () => edges++ },
    });
    const links = [...container.querySelectorAll<HTMLElement>("a")];
    links[0]!.focus();
    await userEvent.keyboard("{ArrowDown}");
    expect(document.activeElement).toBe(links[1]);
    await userEvent.keyboard("{ArrowDown}{ArrowDown}");
    expect(document.activeElement).toBe(links[2]);
    await userEvent.keyboard("{ArrowUp}{ArrowUp}");
    expect(edges).toBe(0);
    expect(document.activeElement).toBe(links[0]);
    await userEvent.keyboard("{ArrowUp}");
    expect(edges).toBe(1);
  });

  test("focusFirst and focus are exposed", async () => {
    const refs: { current: Handle | null } = { current: null };
    const host = defineComponent({
      setup() {
        const r = ref<Handle | null>(null);
        return () =>
          h(ESearchResults, {
            ref: (el: unknown) => {
              r.value = el as Handle | null;
              refs.current = r.value;
            },
            items,
            label: "Results",
          });
      },
    });
    const { container } = await render(host);
    const links = [...container.querySelectorAll<HTMLElement>("a")];
    refs.current!.focusFirst();
    expect(document.activeElement).toBe(links[0]);
    links[1]!.focus();
    refs.current!.focus();
    expect(document.activeElement).toBe(links[1]);
  });

  test("click and Enter emit select with the item; modified clicks do not", async () => {
    const picked: string[] = [];
    const { container } = await render(ESearchResults, {
      props: {
        items,
        label: "Results",
        onSelect: (item: { label: string }, e: MouseEvent) => (e.preventDefault(), picked.push(item.label)),
      },
    });
    const links = [...container.querySelectorAll<HTMLElement>("a")];
    await page.getByRole("link", { name: /Drawer/ }).click();
    links[2]!.focus();
    await userEvent.keyboard("{Enter}");
    links[0]!.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, ctrlKey: true }));
    expect(picked).toEqual(["Drawer", "Disclosure"]);
  });

  test("a result with nowhere to go is a button, never a link to #", async () => {
    const picked: string[] = [];
    const { container } = await render(ESearchResults, {
      props: {
        items: [{ label: "Run the tour" }, { label: "Docs", href: "/docs" }],
        label: "Results",
        onSelect: (item: { label: string }) => picked.push(item.label),
      },
    });
    expect(container.querySelectorAll('a[href="#"]').length).toBe(0);
    expect(container.querySelectorAll("button.e-opt").length).toBe(1);
    expect(container.querySelectorAll("a.e-opt").length).toBe(1);
    await page.getByRole("button", { name: "Run the tour" }).click();
    expect(picked).toEqual(["Run the tour"]);
  });

  test("Home and End jump to the first and last result, and ArrowDown on the last emits exit-bottom", async () => {
    let top = 0;
    let bottom = 0;
    let edge = 0;
    const { container } = await render(ESearchResults, {
      props: { items, label: "Results", onExitTop: () => top++, onExitBottom: () => bottom++, onEdge: () => edge++ },
    });
    const links = [...container.querySelectorAll<HTMLElement>("a")];
    links[1]!.focus();
    await userEvent.keyboard("{End}");
    expect(document.activeElement).toBe(links[2]);
    await userEvent.keyboard("{ArrowDown}");
    expect(bottom).toBe(1);
    expect(document.activeElement).toBe(links[2]);
    await userEvent.keyboard("{Home}");
    expect(document.activeElement).toBe(links[0]);
    await userEvent.keyboard("{ArrowUp}");
    expect([top, edge]).toEqual([1, 1]);
  });

  test("the empty message is announced when it appears", async () => {
    await render(ESearchResults, { props: { items: [], label: "Results", emptyText: "Nothing found for tax." } });
    await expect
      .poll(() => document.querySelector("[data-e-announcer=polite]")?.textContent?.replace(/\u00a0/g, ""))
      .toBe("Nothing found for tax.");
  });

  test("keys follow the result, so reordering keeps its element", async () => {
    const list = ref([...items]);
    const { container } = await render(
      defineComponent({ render: () => h(ESearchResults, { items: list.value, label: "Results" }) }),
    );
    const first = container.querySelector("a")!;
    list.value = [items[2]!, items[0]!, items[1]!];
    await nextTick();
    expect([...container.querySelectorAll("a")].find((a) => a === first)).toBeDefined();
  });

  test("linkComponent renders router links from `to`", async () => {
    const { container } = await render(ESearchResults, {
      props: { items: [{ label: "Forms", to: "/forms" }], label: "Results", linkComponent: FakeRouterLink },
    });
    const a = container.querySelector<HTMLAnchorElement>("a[data-router]")!;
    expect(a.getAttribute("href")).toBe("/app/forms");
    expect(a.classList.contains("e-opt")).toBe(true);
  });

  test("shows a focus ring on the focused result and a tint on hover", async () => {
    const { container } = await render(ESearchResults, { props: { items, label: "Results" } });
    const first = container.querySelector<HTMLElement>("a")!;
    const rest = getComputedStyle(first).backgroundColor;
    await userEvent.tab();
    expect(document.activeElement).toBe(first);
    expect(getComputedStyle(first).outlineStyle).toBe("solid");
    await page.getByRole("link", { name: /Drawer/ }).hover();
    expect(getComputedStyle(container.querySelectorAll("a")[1]!).backgroundColor).not.toBe(rest);
  });

  test("long titles wrap inside a 320px list instead of overflowing it", async () => {
    const long = [{ label: "A".repeat(20) + " very long result title that keeps going ".repeat(4), href: "/x" }];
    const { container } = await render(
      defineComponent({
        render: () => h("div", { style: { width: "320px" } }, [h(ESearchResults, { items: long, label: "Results" })]),
      }),
    );
    const list = container.querySelector<HTMLElement>(".e-results")!;
    expect(list.scrollWidth).toBeLessThanOrEqual(list.clientWidth + 1);
    expect(list.getBoundingClientRect().width).toBeLessThanOrEqual(320);
  });

  test("has no accessibility violations", async () => {
    const { container } = await render(ESearchResults, { props: { items, label: "Search results", query: "dr" } });
    await expectNoViolations(container);
    const empty = await render(ESearchResults, { props: { items: [], label: "Results", emptyText: "Nothing found." } });
    await expectNoViolations(empty.container);
  });
});

describe("ESearchResults corners", () => {
  test.each(["", "2px", "14px"])("a result's corner is the panel's less its padding (md %s)", async (md) => {
    const { container } = await render(ESearchResults, { props: { items, label: "Results" } });
    container.classList.add("e-root");
    const box = container.querySelector<HTMLElement>(".e-results")!;
    if (md) container.style.setProperty("--e-radius-md", md);
    const css = getComputedStyle(box);
    const outer = parseFloat(css.borderTopLeftRadius);
    const inset = parseFloat(css.paddingTop) + parseFloat(css.borderTopWidth);
    const inner = parseFloat(getComputedStyle(box.querySelector(".e-opt")!).borderTopLeftRadius);
    expect(Math.abs(inner - Math.max(0, outer - inset))).toBeLessThan(0.5);
  });
});

import { describe, expect, test } from "vitest";
import { defineComponent, h, markRaw } from "vue";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-vue";
import EListRow from "./EListRow.vue";
import EList from "../List/EList.vue";
import EStamp from "../Stamp/EStamp.vue";
import { expectNoViolations } from "../../../test/axe.js";

function inList(rows: () => unknown, props: Record<string, unknown> = {}) {
  return render(defineComponent({ render: () => h(EList, { label: "Games", ...props }, rows) }));
}

describe("EListRow", () => {
  test("shows a title and a muted second line, each kept to one line", async () => {
    const { container } = await inList(() =>
      h(EListRow, { value: 1, title: "You – Dameless", subtitle: "5+3 · rated · 2 min ago" }),
    );
    const title = container.querySelector<HTMLElement>(".e-listrow-title")!;
    const sub = container.querySelector<HTMLElement>(".e-listrow-sub")!;
    expect(title.textContent!.trim()).toBe("You – Dameless");
    expect(sub.textContent!.trim()).toBe("5+3 · rated · 2 min ago");
    expect(getComputedStyle(title).whiteSpace).toBe("nowrap");
    expect(getComputedStyle(title).textOverflow).toBe("ellipsis");
    expect(getComputedStyle(sub).color).not.toBe(getComputedStyle(title).color);
  });

  test("a long title ends in an ellipsis instead of widening the row", async () => {
    const { container } = await render(
      defineComponent({
        render: () =>
          h("div", { style: "width: 240px" }, [
            h(EList, { label: "Games" }, () => h(EListRow, { value: 1, title: "A very long name ".repeat(10) })),
          ]),
      }),
    );
    const row = container.querySelector<HTMLElement>(".e-listrow")!;
    expect(Math.round(row.getBoundingClientRect().width)).toBe(240);
  });

  test("the title, subtitle, leading and trailing slots take their places", async () => {
    const { container } = await inList(() =>
      h(
        EListRow,
        { value: 1 },
        {
          leading: () => h(EStamp, { tone: "success" }, () => "Won"),
          title: () => [h("strong", "You"), " – Dameless"],
          subtitle: () => "5+3",
          trailing: () => "1–0",
        },
      ),
    );
    const row = container.querySelector(".e-listrow")!;
    expect(row.firstElementChild!.classList.contains("e-listrow-lead")).toBe(true);
    expect(row.lastElementChild!.classList.contains("e-listrow-trail")).toBe(true);
    expect(row.querySelector(".e-listrow-title strong")!.textContent).toBe("You");
    expect(row.querySelector(".e-listrow-trail")!.textContent).toBe("1–0");
  });

  test("live shows a pulsing dot before the title and is read as Live", async () => {
    const { container } = await inList(() => h(EListRow, { value: 1, title: "You – Dameless", live: true }));
    const dot = container.querySelector<HTMLElement>(".e-listrow-pulse")!;
    expect(dot).not.toBeNull();
    expect(getComputedStyle(dot).animationName).toBe("e-listrow-pulse");
    await expect.element(page.getByRole("button", { name: "Live, You – Dameless" })).toBeVisible();
  });

  test("the live slot replaces the dot", async () => {
    const { container } = await inList(() =>
      h(EListRow, { value: 1, title: "Game", live: true }, { live: () => h("span", { class: "mine" }, "●") }),
    );
    expect(container.querySelector(".e-listrow-pulse")).toBeNull();
    expect(container.querySelector(".e-listrow-live .mine")).not.toBeNull();
  });

  test("with href or to it is a link, rendered by linkComponent", async () => {
    const Router = markRaw(
      defineComponent({
        props: { to: String },
        render() {
          return h("a", { href: "/r" + this.to, "data-router": "" }, this.$slots.default?.());
        },
      }),
    );
    const { container } = await inList(
      () => [
        h(EListRow, { value: 1, title: "One", href: "/games/1" }),
        h(EListRow, { value: 2, title: "Two", to: "/games/2", linkComponent: Router }),
      ],
      { modelValue: 2 },
    );
    const [one, two] = [...container.querySelectorAll("a")];
    expect(one!.getAttribute("href")).toBe("/games/1");
    expect(two!.hasAttribute("data-router")).toBe(true);
    expect(two!.getAttribute("aria-current")).toBe("true");
    expect(two!.classList.contains("e-listrow")).toBe(true);
  });

  test("disabled dims the row, marks it aria-disabled and drops its link", async () => {
    const { container } = await inList(() => h(EListRow, { value: 1, title: "One", href: "/1", disabled: true }));
    const row = container.querySelector<HTMLElement>(".e-listrow")!;
    expect(row.tagName).toBe("BUTTON");
    expect(row.getAttribute("aria-disabled")).toBe("true");
    expect(getComputedStyle(row).cursor).toBe("not-allowed");
  });

  test("at least a control's height, and the hover darkens its edge without changing its size", async () => {
    const { container } = await inList(() => h(EListRow, { value: 1, title: "One" }));
    const row = container.querySelector<HTMLElement>(".e-listrow")!;
    const h0 = row.getBoundingClientRect().height;
    const probe = document.createElement("div");
    probe.style.height = "var(--e-control-height)";
    document.body.append(probe);
    expect(h0).toBeGreaterThanOrEqual(probe.getBoundingClientRect().height - 0.5);
    probe.remove();
    const rest = getComputedStyle(row).borderTopColor;
    await page.getByRole("button", { name: "One" }).hover();
    await expect.poll(() => getComputedStyle(row).borderTopColor).not.toBe(rest);
    expect(row.getBoundingClientRect().height).toBe(h0);
  });

  test("shows an inset focus ring", async () => {
    const { container } = await inList(() => h(EListRow, { value: 1, title: "One" }));
    const row = container.querySelector<HTMLElement>(".e-listrow")!;
    await userEvent.tab();
    expect(document.activeElement).toBe(row);
    expect(getComputedStyle(row).outlineStyle).toBe("solid");
    expect(parseFloat(getComputedStyle(row).outlineOffset)).toBeLessThan(0);
  });

  test("has no axe violations: live, current, disabled, with slots", async () => {
    const { container } = await inList(
      () => [
        h(EListRow, { value: 1, title: "You – Dameless", subtitle: "5+3", live: true }),
        h(EListRow, { value: 2, title: "Two", subtitle: "3+2" }, { trailing: () => "92 · 88" }),
        h(EListRow, { value: 3, title: "Three", disabled: true }),
      ],
      { modelValue: 2 },
    );
    await expectNoViolations(container);
  });
});

describe("EListRow additions", () => {
  test("expanded puts aria-expanded on the button, not the wrapper", async () => {
    const { container } = await inList(() => [
      h(EListRow, { value: 1, title: "Open one", expanded: true }),
      h(EListRow, { value: 2, title: "Closed one", expanded: false }),
      h(EListRow, { value: 3, title: "Plain" }),
    ]);
    const rows = [...container.querySelectorAll<HTMLElement>(".e-listrow")];
    expect(rows.map((r) => r.getAttribute("aria-expanded"))).toEqual(["true", "false", null]);
    expect(container.querySelector(".e-listrow-item[aria-expanded]")).toBeNull();
  });

  test("live false reserves the gutter, so live and finished titles line up", async () => {
    const { container } = await inList(() => [
      h(EListRow, { value: 1, title: "Live game", subtitle: "now", live: true }),
      h(EListRow, { value: 2, title: "Finished game", subtitle: "yesterday", live: false }),
      h(EListRow, { value: 3, title: "No gutter", subtitle: "x" }),
    ]);
    const text = (i: number) => {
      const row = container.querySelectorAll(".e-listrow")[i]!;
      const range = document.createRange();
      const node = [...row.querySelector(".e-listrow-title")!.childNodes]
        .filter((n) => n.nodeType === 3 && n.textContent!.trim())
        .pop()!;
      range.selectNodeContents(node);
      return [range.getBoundingClientRect().left, row.querySelector(".e-listrow-sub")!.getBoundingClientRect().left];
    };
    expect(text(0)[0]).toBeCloseTo(text(1)[0]!, 0);
    expect(text(0)[1]).toBeCloseTo(text(1)[1]!, 0);
    expect(text(2)[0]).toBeLessThan(text(1)[0]!);
    expect(container.querySelectorAll(".e-listrow-pulse").length).toBe(1);
    expect(container.querySelectorAll(".e-sr").length).toBe(1);
  });

  test("liveTone recolours the dot", async () => {
    const { container } = await inList(() => [
      h(EListRow, { value: 1, title: "Live", live: true, liveTone: "danger" }),
      h(EListRow, { value: 2, title: "Live", live: true }),
    ]);
    const [a, b] = [...container.querySelectorAll<HTMLElement>(".e-listrow-pulse")];
    expect(getComputedStyle(a!).backgroundColor).not.toBe(getComputedStyle(b!).backgroundColor);
    const danger = document.createElement("i");
    danger.style.color = "var(--e-danger)";
    container.append(danger);
    expect(getComputedStyle(a!).backgroundColor).toBe(getComputedStyle(danger).color);
  });

  test("trailingStack puts two lines in the trailing slot", async () => {
    const { container } = await inList(() =>
      h(
        EListRow,
        { value: 1, title: "Game", trailingStack: true },
        { trailing: () => [h("span", "1–0"), h("span", "2 min")] },
      ),
    );
    const [one, two] = [...container.querySelectorAll(".e-listrow-trail > span")];
    expect(two!.getBoundingClientRect().top).toBeGreaterThan(one!.getBoundingClientRect().bottom - 2);
  });

  test("actions sit beside the row's button, not inside it, and the row makes room", async () => {
    let deleted = 0;
    let pressed = 0;
    const { container } = await inList(
      () =>
        h(
          EListRow,
          { value: 1, title: "A game with a rather long name that must stop short of the actions" },
          {
            actions: () => h("button", { type: "button", "aria-label": "Delete game", onClick: () => deleted++ }, "x"),
          },
        ),
      { onSelect: () => pressed++ },
    );
    const row = container.querySelector<HTMLElement>(".e-listrow")!;
    const action = container.querySelector<HTMLElement>(".e-listrow-actions button")!;
    expect(row.contains(action)).toBe(false);
    await new Promise((r) => requestAnimationFrame(r));
    expect(row.getBoundingClientRect().right).toBeGreaterThan(action.getBoundingClientRect().right - 1);
    const title = container.querySelector<HTMLElement>(".e-listrow-title")!;
    expect(title.getBoundingClientRect().right).toBeLessThanOrEqual(action.getBoundingClientRect().left);
    await page.getByRole("button", { name: "Delete game" }).click();
    expect(deleted).toBe(1);
    expect(pressed).toBe(0);
    await expectNoViolations(container);
  });

  test("the arrow keys on an action do not move the list's focus", async () => {
    const { container } = await inList(() => [
      h(EListRow, { value: 1, title: "One" }, { actions: () => h("button", { type: "button", id: "act" }, "x") }),
      h(EListRow, { value: 2, title: "Two" }),
    ]);
    (container.querySelector("#act") as HTMLElement).focus();
    await userEvent.keyboard("{ArrowDown}");
    expect(document.activeElement?.id).toBe("act");
  });
});

import { describe, expect, test } from "vitest";
import { defineComponent, h, markRaw } from "vue";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-vue";
import ELinkCard from "./ELinkCard.vue";
import EGrid from "../Grid/EGrid.vue";
import { expectNoViolations } from "../../../test/axe.js";

const card = (props: Record<string, unknown> = {}) =>
  render(ELinkCard, {
    props: { title: "EButton", href: "#button", ...props },
    slots: { default: "A button for an action." },
  });

describe("ELinkCard", () => {
  test("is one link named by its title, with the text under it", async () => {
    const { container } = await card();
    const links = container.querySelectorAll("a");
    expect(links).toHaveLength(1);
    expect(links[0]!.getAttribute("href")).toBe("#button");
    await expect.element(page.getByRole("link", { name: "EButton" })).toBeVisible();
    expect(container.querySelector(".e-linkcard-body")!.textContent).toBe("A button for an action.");
  });

  test("a click anywhere on the card follows the link", async () => {
    const { container } = await card({ href: "#card-target" });
    const el = container.querySelector<HTMLElement>(".e-linkcard")!;
    const box = el.getBoundingClientRect();
    const hit = document.elementFromPoint(box.right - 4, box.bottom - 4);
    expect(hit).toBe(container.querySelector("a"));
  });

  test("hover recolours the border and never thickens it", async () => {
    const { container } = await card();
    const el = container.querySelector<HTMLElement>(".e-linkcard")!;
    const rest = getComputedStyle(el);
    const before = { width: rest.borderTopWidth, color: rest.borderTopColor, size: el.getBoundingClientRect().height };
    await userEvent.hover(el);
    await expect.poll(() => getComputedStyle(el).borderTopColor).not.toBe(before.color);
    expect(getComputedStyle(el).borderTopWidth).toBe(before.width);
    expect(el.getBoundingClientRect().height).toBe(before.size);
    expect(getComputedStyle(el).boxShadow).toBe("none");
  });

  test("focusing the link rings the whole card", async () => {
    const { container } = await card();
    await userEvent.keyboard("{Tab}");
    expect(document.activeElement).toBe(container.querySelector("a"));
    const el = container.querySelector<HTMLElement>(".e-linkcard")!;
    expect(getComputedStyle(el).outlineStyle).toBe("solid");
  });

  test("size sets the padding, and the border is inside it", async () => {
    const pad = async (size: string) => {
      const { container } = await card({ size });
      return parseFloat(getComputedStyle(container.querySelector(".e-linkcard")!).paddingTop);
    };
    const [sm, md, lg] = [await pad("sm"), await pad("md"), await pad("lg")];
    expect(sm).toBeLessThan(md);
    expect(md).toBeLessThan(lg);
  });

  test("external opens a new tab and says so", async () => {
    const { container } = await card({ external: true });
    const a = container.querySelector("a")!;
    expect(a.getAttribute("target")).toBe("_blank");
    expect(a.getAttribute("rel")).toBe("noreferrer");
    expect(a.textContent).toContain("opens in a new tab");
  });

  test("linkComponent gets to", async () => {
    const Router = markRaw(
      defineComponent({
        props: { to: String },
        render() {
          return h("a", { href: "/r" + this.to, "data-router": "" }, this.$slots.default?.());
        },
      }),
    );
    const { container } = await card({ href: undefined, to: "/pay", linkComponent: Router });
    const a = container.querySelector("a")!;
    expect(a.getAttribute("href")).toBe("/r/pay");
    expect(a.classList.contains("e-linkcard-link")).toBe(true);
  });

  test("has no accessibility violations in a list", async () => {
    const { container } = await render(
      defineComponent({
        render: () =>
          h(EGrid, { as: "ul" }, () => [
            h(ELinkCard, { as: "li", title: "EButton", href: "#a" }, () => "A button."),
            h(ELinkCard, { as: "li", title: "ELink", href: "#b", external: true }, () => "A link."),
          ]),
      }),
    );
    expect(container.querySelectorAll("li.e-linkcard")).toHaveLength(2);
    await expectNoViolations(container);
  });
});

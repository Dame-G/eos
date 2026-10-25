import { describe, expect, test } from "vitest";
import { defineComponent, h } from "vue";
import { page } from "vitest/browser";
import { render } from "vitest-browser-vue";
import EAvatarGroup from "./EAvatarGroup.vue";
import { createEos } from "../../plugin.js";
import { expectNoViolations } from "../../../test/axe.js";

const people = [{ name: "Ada Lovelace" }, { name: "Grace Hopper" }, { name: "Alan Turing" }, { name: "Edith Clarke" }];

describe("EAvatarGroup", () => {
  test("is one image named by the people in it", async () => {
    await render(EAvatarGroup, { props: { items: people.slice(0, 3) } });
    await expect.element(page.getByRole("img", { name: "Ada Lovelace, Grace Hopper, and Alan Turing" })).toBeVisible();
  });

  test("shows max avatars and a +N tile, and the name says how many more", async () => {
    const { container } = await render(EAvatarGroup, { props: { items: people, max: 2 } });
    expect(container.querySelectorAll(".e-avatar-group > .e-avatar")).toHaveLength(3);
    expect(container.querySelector(".e-avatar-group > span.e-avatar:last-child")!.textContent!.trim()).toBe("+2");
    expect(container.querySelector(".e-avatar-group")!.getAttribute("aria-label")).toBe(
      "Ada Lovelace, Grace Hopper, and 2 more",
    );
  });

  test("no tile when everyone fits", async () => {
    const { container } = await render(EAvatarGroup, { props: { items: people, max: 4 } });
    expect(container.querySelectorAll(".e-avatar")).toHaveLength(4);
    expect(container.textContent).not.toContain("+");
  });

  test("one person over max shows them all, never a +1 tile", async () => {
    const five = [...people, { name: "Hedy Lamarr" }];
    const { container } = await render(EAvatarGroup, { props: { items: five, max: 4 } });
    expect(container.querySelectorAll(".e-avatar")).toHaveLength(5);
    expect(container.textContent).not.toContain("+");
  });

  test("an unknown locale still names the group", async () => {
    const plugin = createEos({ locale: "not a locale!", warnOnContrast: false });
    const { container } = await render(EAvatarGroup, { props: { items: people.slice(0, 2) }, global: { plugins: [plugin] } });
    expect(container.querySelector(".e-avatar-group")!.getAttribute("aria-label")).toContain("Grace Hopper");
  });

  test("label replaces the list of names", async () => {
    await render(EAvatarGroup, { props: { items: people, label: "Care team" } });
    await expect.element(page.getByRole("img", { name: "Care team" })).toBeVisible();
  });

  test("avatars overlap, and size applies to all of them and the tile", async () => {
    const { container } = await render(
      defineComponent({
        render: () => h("div", { class: "e-root" }, [h(EAvatarGroup, { items: people, max: 2, size: "sm" })]),
      }),
    );
    const tiles = [...container.querySelectorAll(".e-avatar")].map((e) => e.getBoundingClientRect());
    expect(tiles.map((r) => r.width)).toEqual([32, 32, 32]);
    expect(tiles[1]!.left).toBeLessThan(tiles[0]!.right);
  });

  test("the list is joined by the words of the locale", async () => {
    const plugin = createEos({ locale: "de", warnOnContrast: false });
    const { container } = await render(EAvatarGroup, {
      props: { items: people.slice(0, 2) },
      global: { plugins: [plugin] },
    });
    expect(container.querySelector(".e-avatar-group")!.getAttribute("aria-label")).toBe(
      "Ada Lovelace und Grace Hopper",
    );
  });

  test("has no accessibility violations", async () => {
    const { container } = await render(EAvatarGroup, { props: { items: people, max: 2 } });
    await expectNoViolations(container);
  });
});

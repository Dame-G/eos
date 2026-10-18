import { describe, expect, test } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-vue";
import ETimeline, { type TimelineItem } from "./ETimeline.vue";
import { createEos } from "../../plugin.js";
import { expectNoViolations } from "../../../test/axe.js";

const items: TimelineItem[] = [
  { kind: "you", note: "You paid $40.00 by card.", source: "Oct 12, 9:41 am, online" },
  { kind: "team", note: "A balance of $162.40 was posted.", source: "Oct 1, 8:00 am" },
  { kind: "system", note: "A reminder was sent.", source: "Oct 8, 6:00 am, automatic" },
];

describe("ETimeline", () => {
  test("is an ordered list named 'Activity, newest first' with one item per event", async () => {
    const { container } = await render(ETimeline, { props: { items } });
    await expect.element(page.getByRole("list", { name: "Activity, newest first" })).toBeVisible();
    const ol = container.querySelector("ol")!;
    expect(ol.className).toBe("e-activity");
    expect(ol.querySelectorAll(":scope > li.e-activity-row")).toHaveLength(3);
    expect(page.getByRole("listitem").elements()).toHaveLength(3);
  });

  test("each row: a source chip, the note and the source line", async () => {
    const { container } = await render(ETimeline, { props: { items } });
    const rows = [...container.querySelectorAll(".e-activity-row")];
    const chips = rows.map((r) => r.querySelector(".e-chip")!.textContent!.trim());
    expect(chips).toEqual(["You", "Team", "Automatic"]);
    expect(rows[0]!.querySelector(".e-activity-main")!.textContent).toBe("You paid $40.00 by card.");
    expect(rows[0]!.querySelector(".e-activity-source")!.textContent).toBe("Oct 12, 9:41 am, online");
    expect(rows[1]!.querySelector(".e-chip")!.classList.contains("e-chip--info")).toBe(true);
    expect(rows[0]!.querySelector(".e-chip")!.className).toBe("e-chip");
  });

  test("the source lines up under the note, in the second column", async () => {
    const { container } = await render(ETimeline, { props: { items } });
    const row = container.querySelector(".e-activity-row")!;
    const main = row.querySelector(".e-activity-main")!.getBoundingClientRect();
    const source = row.querySelector(".e-activity-source")!.getBoundingClientRect();
    expect(Math.round(source.left)).toBe(Math.round(main.left));
    expect(source.top).toBeGreaterThanOrEqual(main.bottom - 1);
  });

  test("the first row has no rule above it; the others do", async () => {
    const { container } = await render(ETimeline, { props: { items } });
    const rows = [...container.querySelectorAll<HTMLElement>(".e-activity-row")];
    expect(getComputedStyle(rows[0]!).borderTopWidth).toBe("0px");
    expect(parseFloat(getComputedStyle(rows[1]!).borderTopWidth)).toBeGreaterThan(0);
  });

  test("an unknown kind reads as automatic", async () => {
    const { container } = await render(ETimeline, {
      props: { items: [{ kind: "robot" as TimelineItem["kind"], note: "n", source: "s" }] },
    });
    expect(container.querySelector(".e-chip")!.textContent!.trim()).toBe("Automatic");
  });

  test("words follow the message overrides", async () => {
    const { container } = await render(ETimeline, {
      props: { items },
      global: {
        plugins: [
          createEos({
            themeTarget: null,
            messages: { activity: "Verlauf, neueste zuerst", you: "Sie", team: "Team", automatic: "Automatisch" },
          }),
        ],
      },
    });
    expect(container.querySelector("ol")!.getAttribute("aria-label")).toBe("Verlauf, neueste zuerst");
    expect([...container.querySelectorAll(".e-chip")].map((c) => c.textContent!.trim())).toEqual([
      "Sie",
      "Team",
      "Automatisch",
    ]);
  });

  test("attributes fall through to the list; a given aria-label replaces the default", async () => {
    const { container } = await render(ETimeline, {
      props: { items },
      attrs: { class: "mine", "aria-label": "Payments", id: "t1" },
    });
    const ol = container.querySelector("ol")!;
    expect(ol.className).toBe("e-activity mine");
    expect(ol.getAttribute("aria-label")).toBe("Payments");
    expect(ol.id).toBe("t1");
  });

  test("axe: with events and empty", async () => {
    const full = await render(ETimeline, { props: { items } });
    await expectNoViolations(full.container);
    const empty = await render(ETimeline, { props: { items: [] } });
    await expectNoViolations(empty.container, { disable: ["list"] });
  });
});

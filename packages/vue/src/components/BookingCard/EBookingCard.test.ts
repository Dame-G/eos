import { describe, expect, test } from "vitest";
import { defineComponent, h } from "vue";
import { page } from "vitest/browser";
import { render } from "vitest-browser-vue";
import EBookingCard from "./EBookingCard.vue";
import EGrid from "../Grid/EGrid.vue";
import EButton from "../Button/EButton.vue";
import { createEos } from "../../plugin.js";
import { expectNoViolations } from "../../../test/axe.js";

const day = new Date(2026, 9, 22, 12);
const text = (el: Element | null) => (el?.textContent ?? "").trim();
const base = {
  date: day,
  time: "9:30 am",
  title: "Check-up",
  provider: { name: "Amara Singh", role: "Physician" },
  location: "Main office",
  status: "confirmed",
} as const;
const reschedule = () => h(EButton, { variant: "outline" }, () => "Reschedule");

describe("EBookingCard", () => {
  test("is an article whose heading is the provider's name (h3 by default)", async () => {
    const { container } = await render(EBookingCard, { props: base });
    const card = container.querySelector("article")!;
    expect(card.classList.contains("e-surface")).toBe(true);
    expect(card.classList.contains("e-appt")).toBe(true);
    await expect.element(page.getByRole("heading", { level: 3, name: "Amara Singh" })).toBeVisible();
  });

  test("headingLevel sets the heading element", async () => {
    const { container } = await render(EBookingCard, { props: { ...base, headingLevel: 4 } });
    expect(container.querySelector("h4.e-appt-title")).not.toBeNull();
    expect(container.querySelector("h3")).toBeNull();
  });

  test("the provider leads: photo or initials, name, status, then role and visit type", async () => {
    const { container } = await render(EBookingCard, { props: base });
    const avatar = container.querySelector(".e-avatar")!;
    expect(avatar.classList.contains("e-avatar--l")).toBe(true);
    expect(text(avatar)).toBe("AS");
    expect(container.querySelector(".e-appt-date")).toBeNull();
    await expect.element(page.getByRole("img", { name: "Confirmed" })).toBeVisible();
    expect(text(container.querySelector(".e-appt-role"))).toBe("Physician");
    expect(text(container.querySelector(".e-appt-kind"))).toBe("Check-up");
    const head = container.querySelector(".e-appt-head")!;
    expect(head.querySelector(".e-stamp.e-stamp--s")).not.toBeNull();
  });

  test("a photo URL replaces the initials", async () => {
    const { container } = await render(EBookingCard, {
      props: { ...base, provider: { name: "Amara Singh", photo: "data:image/gif;base64,R0lGODlhAQABAAAAACw=" } },
    });
    expect(container.querySelector(".e-avatar img")).not.toBeNull();
  });

  test("with no provider the date tile leads and the title takes the name's line", async () => {
    const { container } = await render(EBookingCard, {
      props: { ...base, provider: undefined, title: "Group session", subtitle: "Bring a mat" },
    });
    expect(container.querySelector(".e-avatar")).toBeNull();
    const tile = container.querySelector(".e-appt-date")!;
    expect(tile.getAttribute("aria-hidden")).toBe("true");
    expect(text(tile.querySelector(".e-appt-month"))).toBe("Oct");
    expect(text(tile.querySelector(".e-appt-day"))).toBe("22");
    await expect.element(page.getByRole("heading", { name: "Group session" })).toBeVisible();
    expect(text(container.querySelector(".e-appt-role"))).toBe("Bring a mat");
    expect(container.querySelector(".e-appt-kind")).toBeNull();
  });

  test("the facts are a list: the date in words with the time, and the place", async () => {
    const { container } = await render(EBookingCard, { props: base });
    const items = [...container.querySelectorAll(".e-appt-facts li")].map(text);
    expect(items).toEqual(["Thursday, October 22, 2026 at 9:30 am", "Main office"]);
    expect(page.getByRole("list").elements()).toHaveLength(1);
  });

  test("without a location only the date shows", async () => {
    const { container } = await render(EBookingCard, { props: { ...base, location: undefined } });
    expect(container.querySelectorAll(".e-appt-facts li")).toHaveLength(1);
  });

  test("without a status there is no stamp; tone and label alone make one", async () => {
    const none = await render(EBookingCard, { props: { ...base, status: undefined } });
    expect(none.container.querySelector(".e-stamp")).toBeNull();
    const custom = await render(EBookingCard, {
      props: { ...base, status: undefined, tone: "warning", label: "Waitlist" },
    });
    expect(custom.container.querySelector(".e-stamp")!.getAttribute("aria-label")).toBe("Waitlist");
  });

  test("actions sit on a footer bar at the foot; none, no bar", async () => {
    const withBar = await render(EBookingCard, { props: base, slots: { actions: reschedule } });
    const bar = withBar.container.querySelector(".e-appt > .e-actions--bar")!;
    expect(bar.tagName).toBe("FOOTER");
    expect(Math.round(bar.getBoundingClientRect().bottom)).toBe(
      Math.round(withBar.container.querySelector(".e-appt")!.getBoundingClientRect().bottom),
    );
    await expect.element(page.getByRole("button", { name: "Reschedule" })).toBeVisible();
    const without = await render(EBookingCard, { props: base });
    expect(without.container.querySelector(".e-actions")).toBeNull();
  });

  test("a card without a practitioner is as tall as one with", async () => {
    const { container } = await render(
      defineComponent({
        render: () =>
          h("div", [
            h(EBookingCard, { ...base, provider: { name: "Amara Singh", role: "Practitioner" } }),
            h(EBookingCard, { date: day, time: "9:30 am", title: "Group session", location: "Main office" }),
          ]),
      }),
    );
    const heights = [...container.querySelectorAll(".e-appt-main")].map((c) =>
      Math.round(c.getBoundingClientRect().height),
    );
    expect(heights[0]).toBe(heights[1]);
  });

  test("in a Grid every card takes the tallest height, with the actions bar at its foot", async () => {
    const { container } = await render(
      defineComponent({
        render: () =>
          h("div", { style: { width: "560px" } }, [
            h(EGrid, { min: "15rem", gap: 3 }, () => [
              h(
                EBookingCard,
                {
                  date: day,
                  time: "9:30 am",
                  title: "Check-up",
                  provider: { name: "Dr. Alexandra Montgomery-Whitfield the Third", role: "Physician" },
                  location: "Main office",
                  status: "confirmed",
                },
                { actions: reschedule },
              ),
              h(
                EBookingCard,
                {
                  date: new Date(2026, 9, 23, 12),
                  time: "10:00 am",
                  title: "Lab work",
                  provider: { name: "Lee Chen", role: "Nurse" },
                  location: "Lab",
                  status: "scheduled",
                },
                { actions: reschedule },
              ),
            ]),
          ]),
      }),
    );
    const cards = [...container.querySelectorAll(".e-appt")];
    const rects = cards.map((c) => c.getBoundingClientRect());
    expect(Math.round(rects[0]!.height)).toBe(Math.round(rects[1]!.height));
    expect(Math.round(rects[0]!.top)).toBe(Math.round(rects[1]!.top));
    const bars = [...container.querySelectorAll(".e-appt > .e-actions--bar")].map((b) => b.getBoundingClientRect());
    expect(Math.round(bars[0]!.bottom)).toBe(Math.round(rects[0]!.bottom));
    expect(Math.round(bars[1]!.bottom)).toBe(Math.round(rects[1]!.bottom));
  });

  test("the date follows the locale: month names, long date and the 'at' wording", async () => {
    const { container } = await render(EBookingCard, {
      props: { ...base, provider: undefined },
      global: {
        plugins: [createEos({ themeTarget: null, locale: "de-DE", messages: { dateAtTime: "{date} um {time}" } })],
      },
    });
    expect(text(container.querySelector(".e-appt-month"))).toMatch(/^Okt/);
    expect(text(container.querySelector(".e-appt-facts li"))).toBe("Donnerstag, 22. Oktober 2026 um 9:30 am");
  });

  test("class, style and data attributes fall through to the article", async () => {
    const { container } = await render(EBookingCard, {
      props: base,
      attrs: { class: "mine", "data-id": "b1", id: "booking-1" },
    });
    const card = container.querySelector("article")!;
    expect(card.classList.contains("mine")).toBe(true);
    expect(card.dataset.id).toBe("b1");
    expect(card.id).toBe("booking-1");
  });

  test("axe: with provider, without, every status, with actions", async () => {
    const statuses = ["scheduled", "confirmed", "cancelled", "pending", "action"] as const;
    const { container } = await render(
      defineComponent({
        render: () =>
          h(EGrid, null, () => [
            ...statuses.map((s) => h(EBookingCard, { ...base, status: s })),
            h(EBookingCard, { date: day, time: "9 am", title: "Group session", subtitle: "Room 2", location: "Annex" }),
            h(EBookingCard, base, { actions: reschedule }),
          ]),
      }),
    );
    await expectNoViolations(container);
  });

  test("a narrow card drops the stamp under the kind of booking and runs the facts the full width", async () => {
    const box = (width: string) =>
      defineComponent({
        render: () => h("div", { style: { width } }, [h(EBookingCard, base)]),
      });
    const narrow = await render(box("17rem"));
    const rect = (c: Element, sel: string) => c.querySelector(sel)!.getBoundingClientRect();
    expect(rect(narrow.container, ".e-appt .e-stamp").top).toBeGreaterThanOrEqual(
      rect(narrow.container, ".e-appt-sub").bottom - 1,
    );
    expect(rect(narrow.container, ".e-appt-facts").left).toBeLessThan(rect(narrow.container, ".e-appt-body").left);
    const wide = await render(box("34rem"));
    expect(rect(wide.container, ".e-appt .e-stamp").top).toBeLessThan(rect(wide.container, ".e-appt-sub").top);
    expect(rect(wide.container, ".e-appt-facts").left).toBeGreaterThanOrEqual(
      rect(wide.container, ".e-appt-body").left - 1,
    );
  });
});

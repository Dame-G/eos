import { afterEach, describe, expect, test } from "vitest";
import { effectScope, ref } from "vue";
import { useQuietFocus } from "./useQuietFocus.js";

const inside = (el: Element) => !!el.closest(".popup");

let scope = effectScope();
const mounted: HTMLElement[] = [];

function dom() {
  const host = document.createElement("div");
  host.innerHTML = `<button id="trigger">open</button><div class="popup"><button id="item">item</button></div>`;
  document.body.append(host);
  mounted.push(host);
  return {
    trigger: host.querySelector<HTMLElement>("#trigger")!,
    item: host.querySelector<HTMLElement>("#item")!,
  };
}

function quiet() {
  const open = ref(false);
  const api = scope.run(() => useQuietFocus(open, inside))!;
  return { open, ...api };
}

afterEach(() => {
  scope.stop();
  scope = effectScope();
  for (const el of mounted.splice(0)) el.remove();
});

describe("useQuietFocus", () => {
  test("an open nobody marked is not a person's, and the mark is used once", () => {
    const q = quiet();
    expect(q.personOpened()).toBe(false);
    q.intent();
    expect(q.personOpened()).toBe(true);
    expect(q.personOpened()).toBe(false);
  });

  test("focus returns to the trigger only when it was inside the popup as it closed", () => {
    const { item, trigger } = dom();
    const q = quiet();
    q.open.value = true;
    item.focus();
    q.open.value = false;
    expect(q.returnsFocus()).toBe(true);

    q.open.value = true;
    trigger.focus();
    q.open.value = false;
    expect(q.returnsFocus()).toBe(false);
  });

  test("returnsFocus clears a pending mark so the next open starts quiet", () => {
    const q = quiet();
    q.intent();
    q.returnsFocus();
    expect(q.personOpened()).toBe(false);
  });

  test("undoFocusSteal hands focus back to the element that had it", () => {
    const { item, trigger } = dom();
    const q = quiet();
    trigger.focus();
    q.undoFocusSteal();
    item.focus();
    expect(document.activeElement).toBe(trigger);
  });

  test("undoFocusSteal leaves focus alone outside the popup and after the scope ends", () => {
    const { item, trigger } = dom();
    const q = quiet();
    q.undoFocusSteal();
    trigger.focus();
    expect(document.activeElement).toBe(trigger);
    scope.stop();
    item.focus();
    expect(document.activeElement).toBe(item);
  });

  test("with nothing focused before, the stolen focus is dropped", () => {
    const { item } = dom();
    (document.activeElement as HTMLElement | null)?.blur();
    const q = quiet();
    q.undoFocusSteal();
    item.focus();
    expect(document.activeElement).not.toBe(item);
  });
});

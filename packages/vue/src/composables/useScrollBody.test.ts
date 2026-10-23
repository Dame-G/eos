import { afterEach, beforeEach, expect, test } from "vitest";
import { defineComponent, h, nextTick, ref } from "vue";
import { render } from "vitest-browser-vue";
import EDialog from "../components/Dialog/EDialog.vue";

// The test browser hides scrollbars, so a 15px one is simulated where the lock measures it
// (`innerWidth - documentElement.clientWidth`).
const SCROLLBAR = 15;
beforeEach(() => {
  Object.defineProperty(document.documentElement, "clientWidth", {
    configurable: true,
    get: () => window.innerWidth - SCROLLBAR,
  });
});
afterEach(() => {
  delete (document.documentElement as { clientWidth?: number }).clientWidth;
  document.documentElement.style.removeProperty("scrollbar-gutter");
});

async function paddingWhileOpen() {
  const open = ref(false);
  await render(
    defineComponent({
      render: () =>
        h(
          EDialog,
          { open: open.value, title: "Sure?", "onUpdate:open": (v: boolean) => (open.value = v) },
          () => "Body",
        ),
    }),
  );
  open.value = true;
  await nextTick();
  await expect.poll(() => document.body.style.overflow).toBe("hidden");
  const padding = document.body.style.paddingRight;
  open.value = false;
  await expect.poll(() => document.body.style.overflow).not.toBe("hidden");
  return padding;
}

// The lock pads the body by the scrollbar width so the page keeps its place when the scrollbar goes. A page that keeps
// the scrollbar's space itself (`scrollbar-gutter: stable`) would then hold it twice and shift left.
test("a modal pads the body by the scrollbar it hides", async () => {
  expect(await paddingWhileOpen()).toBe(`${SCROLLBAR}px`);
});

test("a modal does not pad a page that keeps a stable scrollbar gutter", async () => {
  document.documentElement.style.setProperty("scrollbar-gutter", "stable");
  expect(["", "0px"]).toContain(await paddingWhileOpen());
});

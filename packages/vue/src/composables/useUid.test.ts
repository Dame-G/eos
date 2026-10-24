import { describe, expect, test } from "vitest";
import { defineComponent, h, ref } from "vue";
import { render } from "vitest-browser-vue";
import { useUid } from "./useUid.js";

function ids(given?: () => string | undefined) {
  const found: string[] = [];
  const Probe = defineComponent({
    setup() {
      const id = useUid(given);
      found.push(id.value);
      return () => h("i", { id: id.value });
    },
  });
  return { found, Probe };
}

describe("useUid", () => {
  test("generates a prefixed id, different for each component", async () => {
    const { found, Probe } = ids();
    await render(defineComponent({ render: () => [h(Probe), h(Probe)] }));
    expect(found).toHaveLength(2);
    expect(found[0]).toMatch(/^e-/);
    expect(found[0]).not.toBe(found[1]);
  });

  test("a generated id has no dash after its prefix, so an id derived from it (`-0`, `-label`) never equals another generated id", async () => {
    const { found, Probe } = ids();
    await render(defineComponent({ render: () => [h(Probe), h(Probe), h(Probe)] }));
    for (const id of found) expect(id).toMatch(/^e-[A-Za-z0-9_]+$/);
    const derived = found.map((id) => `${id}-0`);
    for (const d of derived) expect(found).not.toContain(d);
  });

  test("the id a consumer gives wins, and a blank one falls back to the generated id", async () => {
    const given = ids(() => "mine");
    await render(given.Probe);
    expect(given.found[0]).toBe("mine");
    const blank = ids(() => "");
    await render(blank.Probe);
    expect(blank.found[0]).toMatch(/^e-/);
  });

  test("follows a changing id", async () => {
    const name = ref<string | undefined>("a");
    let id!: ReturnType<typeof useUid>;
    await render(
      defineComponent({
        setup() {
          id = useUid(name);
          return () => h("i");
        },
      }),
    );
    expect(id.value).toBe("a");
    name.value = undefined;
    expect(id.value).toMatch(/^e-/);
  });
});

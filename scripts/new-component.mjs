// Scaffolds a component: pnpm new:component <Name> [--layer <layer>]
// Writes packages/vue/src/components/<Name>/ (index.ts, E<Name>.vue, E<Name>.test.ts, README.md), adds an empty fixture
// to packages/vue/test/ssr/fixtures.ts to fill in if the component needs props to render, then regenerates src/index.ts
// and the props table. What is left to do by hand is listed at the end (CONTRIBUTING.md, Adding a component).
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const pkg = join(root, "packages", "vue");
const args = process.argv.slice(2);
const layerAt = args.indexOf("--layer");
const layer = layerAt >= 0 ? args.splice(layerAt, 2)[1] : "e.primitives";
const name = args[0]?.replace(/^E(?=[A-Z])/, "");
// The component layers, read from the source of LAYER_ORDER so the tokens need no build.
const theme = readFileSync(join(root, "packages/tokens/src/theme.ts"), "utf8");
const layers = /LAYER_ORDER =\s*"([^"]+)"/
  .exec(theme)[1]
  .split(",")
  .map((s) => s.trim())
  .filter((l) => !["e.reset", "e.tokens", "e.base"].includes(l));

if (!name || !/^[A-Z][A-Za-z0-9]*$/.test(name)) {
  console.error("Usage: pnpm new:component <Name> [--layer <layer>]   (PascalCase, without the E prefix: Stamp)");
  process.exit(1);
}
if (!layers.includes(layer)) {
  console.error(`Unknown layer "${layer}". One of: ${layers.join(", ")}`);
  process.exit(1);
}
const dir = join(pkg, "src", "components", name);
if (existsSync(dir)) {
  console.error(`src/components/${name} already exists`);
  process.exit(1);
}

const E = `E${name}`;
const block = `e-${name.replace(/(?<=[a-z0-9])([A-Z])/g, "-$1").toLowerCase()}`;

const files = {
  "index.ts": `export { default as ${E} } from "./${E}.vue";\n`,

  [`${E}.vue`]: `<script setup lang="ts">
import "../../styles/base.css";

defineProps<{
  /** TODO: one line on what the prop does; it becomes the editor tooltip and the README props table. */
  label?: string;
}>();

defineSlots<{
  /** TODO: what goes in the default slot. */
  default(): unknown;
}>();
</script>

<template>
  <div class="${block}"><slot /></div>
</template>

<style>
@layer ${layer} {
  .${block} {
    display: block;
  }
}
</style>
`,

  [`${E}.test.ts`]: `import { describe, expect, test } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-vue";
import ${E} from "./${E}.vue";
import { expectNoViolations } from "../../../test/axe.js";

describe("${E}", () => {
  test("renders its content", async () => {
    await render(${E}, { slots: { default: "Text" } });
    await expect.element(page.getByText("Text")).toBeVisible();
  });

  test("attributes fall through to the root", async () => {
    const { container } = await render(${E}, { attrs: { "data-testid": "x", class: "mine" } });
    const el = container.querySelector(".${block}")!;
    expect(el.getAttribute("data-testid")).toBe("x");
    expect(el.classList.contains("mine")).toBe(true);
  });

  test("has no axe violations", async () => {
    const { container } = await render(${E}, { slots: { default: "Text" } });
    await expectNoViolations(container);
  });
});
`,

  "README.md": `# ${E}

TODO: what the component is for, in one sentence. Then the sibling to use instead: "Use [\`EButton\`](../Button/README.md) to ...".

\`\`\`vue
<${E}>Text</${E}>
\`\`\`

## Props

<!-- props:start -->
<!-- props:end -->

\`class\`, \`style\` and attributes land on the root \`div\`.

## Slots

| Slot      | Use                             |
| --------- | ------------------------------- |
| \`default\` | TODO: what goes in the default slot. |

## Accessibility

- TODO: what the consumer must know or do. If it takes no focus, keep "Not focusable." below and drop the Keyboard section.

Not focusable.

## Related

TODO: the siblings, linked: [\`EButton\`](../Button/README.md).
`,
};

mkdirSync(dir, { recursive: true });
for (const [file, content] of Object.entries(files)) writeFileSync(join(dir, file), content);

// An empty fixture, so the server render and hydration tests show where the component's props go.
const fixtures = join(pkg, "test", "ssr", "fixtures.ts");
const marker = "  // new:component adds entries above this line\n";
const source = readFileSync(fixtures, "utf8");
if (source.includes(marker)) writeFileSync(fixtures, source.replace(marker, `  ${E}: {},\n${marker}`));

const node = (script, ...rest) =>
  execFileSync(process.execPath, [join(pkg, "scripts", script), ...rest], { stdio: "inherit" });
node("gen-index.mjs");
node("gen-props.mjs");
execFileSync(process.execPath, [join(root, "node_modules", "prettier", "bin", "prettier.cjs"), "--write", dir], {
  stdio: "ignore",
});

console.log(`
Created packages/vue/src/components/${name} (${E}, in @layer ${layer}). Next:
  1. Write the component, its tests (keyboard and axe for every state) and the README TODOs.
  2. Give ${E} the props it needs to render in test/ssr/fixtures.ts, or delete its empty entry.
  3. node scripts/gen-props.mjs (in packages/vue) after changing a prop's doc comment or default.
  4. Accept the new exports: pnpm --filter @eos-ui/vue exec vitest run test/public-api.test.ts -u, and after a
     build, node scripts/check-api-types.mjs --update (in packages/vue) if it exports types.
  5. pnpm changeset (a minor: a new component), then pnpm check:source, pnpm lint and pnpm test.`);

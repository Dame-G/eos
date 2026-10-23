// The public API is deliberate: every runtime export of `@eos-ui/vue` is listed in public-api.txt.
// A new component or composable changes the list. After adding one on purpose, run
// `pnpm --filter @eos-ui/vue exec vitest run test/public-api.test.ts -u` and commit the updated file.
import { expect, test } from "vitest";
import * as api from "../src/index.js";

test("exports exactly the documented names", async () => {
  const names = Object.keys(api).sort();
  await expect(names.join("\n") + "\n").toMatchFileSnapshot("./public-api.txt");
});

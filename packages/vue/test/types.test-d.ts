// Type-level tests. Not run by vitest: `pnpm typecheck` (vue-tsc) compiles them, so a wrong type is a compile error.
// Keep them to the public contract: the global component map, the plugin options, and a few props and emits.
import { expectTypeOf } from "vitest";
import type { GlobalComponents, ComponentCustomProperties } from "vue";
import {
  createEos,
  themeCss,
  EButton,
  EDialog,
  ESelect,
  type Eos,
  type EosOptions,
  type EosConfig,
} from "../src/index.js";
import * as Library from "../src/index.js";
// Opt-in, as `@eos-ui/vue/globals` (the package entry alone declares no global components).
import type {} from "../src/globals.js";

// With the globals types loaded, GlobalComponents maps every E-component to the exported component.
expectTypeOf<GlobalComponents["EButton"]>().toEqualTypeOf<typeof Library.EButton>();
expectTypeOf<GlobalComponents["EDialog"]>().toEqualTypeOf<typeof Library.EDialog>();
expectTypeOf<GlobalComponents["EToastProvider"]>().toEqualTypeOf<typeof Library.EToastProvider>();
expectTypeOf<ComponentCustomProperties["$e"]>().toEqualTypeOf<EosConfig>();

// createEos and themeCss.
expectTypeOf(createEos).parameter(0).toEqualTypeOf<EosOptions | undefined>();
expectTypeOf(createEos).returns.toEqualTypeOf<Eos>();
expectTypeOf<EosOptions["locale"]>().toEqualTypeOf<string | undefined>();
expectTypeOf<EosOptions["dir"]>().toEqualTypeOf<"ltr" | "rtl" | null | undefined>();
expectTypeOf<EosOptions["themeTarget"]>().toEqualTypeOf<HTMLElement | null | undefined>();
expectTypeOf<EosOptions["warnOnContrast"]>().toEqualTypeOf<boolean | undefined>();
expectTypeOf<EosOptions["applyTheme"]>().toEqualTypeOf<boolean | undefined>();
expectTypeOf(themeCss).returns.toEqualTypeOf<string>();

// Props and emits.
type ButtonProps = InstanceType<typeof EButton>["$props"];
expectTypeOf<ButtonProps["variant"]>().toEqualTypeOf<
  "primary" | "secondary" | "outline" | "danger" | "quiet" | undefined
>();
expectTypeOf<ButtonProps["type"]>().toEqualTypeOf<"button" | "submit" | "reset" | undefined>();
expectTypeOf<ButtonProps["disabled"]>().toEqualTypeOf<boolean | undefined>();

type DialogProps = InstanceType<typeof EDialog>["$props"];
expectTypeOf<DialogProps["title"]>().toEqualTypeOf<string>();
expectTypeOf<DialogProps["role"]>().toEqualTypeOf<"dialog" | "alertdialog" | undefined>();
expectTypeOf<DialogProps["open"]>().toEqualTypeOf<boolean | undefined>();
expectTypeOf<InstanceType<typeof EDialog>["$emit"]>().toBeCallableWith("close");
expectTypeOf<InstanceType<typeof EDialog>["$emit"]>().toBeCallableWith("update:open", true);

expectTypeOf<Parameters<typeof ESelect>[0]>().toHaveProperty("options");

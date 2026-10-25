// @internal: shared by the components, not exported from the package (see scripts/gen-index.mjs).
/* eslint-disable vue/one-component-per-file -- two small wrappers around the same Reka providers */
import { defineComponent, h, inject, provide, type InjectionKey } from "vue";
import { ConfigProvider, TooltipProvider, injectTooltipProviderContext } from "reka-ui";
import { useDir } from "./useDir.js";
import { useScrollBody } from "./useScrollBody.js";

/** Set below a `RekaConfig` that gave Reka the direction and the scroll lock, so the parts inside do not give it again. */
const PROVIDED: InjectionKey<true> = Symbol("eos.reka");

/** Milliseconds after one tooltip closes during which the next one opens without waiting out its delay. */
export const TOOLTIP_SKIP_DELAY = 300;

/**
 * Gives the Reka parts inside it the direction (`useDir`) and the scroll-lock padding (`useScrollBody`) through Reka's
 * `ConfigProvider`. `EConfigProvider` renders one with `root` for everything inside it, and adds the one
 * `TooltipProvider` its tooltips share. A dialog or a menu renders one too, which steps aside when one is already
 * above it, so each part still works on its own, without the plugin or a provider.
 */
export const RekaConfig = defineComponent({
  name: "RekaConfig",
  props: {
    /** Always provide, even inside another: an `EConfigProvider` may change the direction for its part. */
    root: Boolean,
  },
  setup(props, { slots }) {
    if (!props.root && inject(PROVIDED, false)) return () => slots.default?.();
    provide(PROVIDED, true);
    const dir = useDir();
    const scrollBody = useScrollBody();
    return () =>
      h(
        ConfigProvider,
        { dir: dir.value, scrollBody: scrollBody.value },
        props.root ? { default: () => h(TooltipProvider, { skipDelayDuration: TOOLTIP_SKIP_DELAY }, slots) } : slots,
      );
  },
});

/**
 * Reka's `TooltipProvider` for one tooltip, unless there is one above it already (an `EConfigProvider`'s, or the
 * app's own), which then also shares the skip delay between the tooltips under it.
 */
export const TooltipScope = defineComponent({
  name: "TooltipScope",
  props: {
    delayDuration: { type: Number, required: true },
  },
  setup(props, { slots }) {
    if (injectTooltipProviderContext(null)) return () => slots.default?.();
    return () =>
      h(TooltipProvider, { delayDuration: props.delayDuration, skipDelayDuration: TOOLTIP_SKIP_DELAY }, slots);
  },
});

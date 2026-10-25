import { defineComponent, h } from "vue";
import { warnOnce } from "../../env.js";
import EToggletip from "./EToggletip.vue";

/**
 * The old name of `EToggletip`, kept for one minor release. It renders `EToggletip` with the same props, slots and
 * `v-model`, and warns once in development.
 * @deprecated Use `EToggletip`.
 */
export default defineComponent({
  name: "EDefinition",
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    warnOnce("EDefinition", "EDefinition is renamed EToggletip; the old name goes in the next minor release.");
    return () => h(EToggletip, attrs, slots);
  },
}) as unknown as typeof EToggletip;

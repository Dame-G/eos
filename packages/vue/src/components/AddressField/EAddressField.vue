<script setup lang="ts">
import EFieldset from "../Fieldset/EFieldset.vue";
import ETextField from "../TextField/ETextField.vue";
import ESelect from "../Select/ESelect.vue";
import type { EOptionInput } from "../Select/options.js";
import { US_STATES } from "./usStates.js";
import { useMessages } from "../../config.js";
import "../../styles/base.css";

export interface Address {
  /** Street and number. */
  street?: string;
  /** Apartment, suite or unit. */
  unit?: string;
  city?: string;
  /** The code of the chosen region, such as `CA`. */
  region?: string;
  /** ZIP or postal code. */
  postal?: string;
}

const props = withDefaults(
  defineProps<{
    /** The group's title. Default "Address". */
    legend?: string;
    /** What to fix, per field. */
    errors?: Address;
    /** The choices for the region field: strings, or `{ value, label }`. Replaces the default list of US states, so pass it for any other country. */
    regions?: readonly EOptionInput[];
    /** The input mode of the postal code: `numeric` for ZIP codes, `text` (default) for postal codes with letters. */
    postalInputmode?: "numeric" | "text";
    /** The prefix of the fields' names: `address-street`, `address-unit`, `address-city`, `address-region`, `address-postal`. */
    name?: string;
    /** Disables every field. */
    disabled?: boolean;
  }>(),
  { postalInputmode: "text" },
);

/** The address. Leave `v-model` off and the group keeps its own state. */
const model = defineModel<Address>({ default: () => ({}) });

const t = useMessages();
const prefix = () => props.name || "address";

function set(key: keyof Address, value: string) {
  model.value = { ...model.value, [key]: value };
}
</script>

<template>
  <EFieldset :legend="legend || t('address')" :disabled="disabled">
    <div class="e-address-grid">
      <div class="e-address-wide">
        <ETextField
          :label="t('street')"
          :name="`${prefix()}-street`"
          autocomplete="address-line1"
          required
          :model-value="model.street || ''"
          :error="errors?.street"
          @update:model-value="set('street', $event)"
        />
      </div>
      <div class="e-address-wide">
        <ETextField
          :label="t('unit')"
          :name="`${prefix()}-unit`"
          autocomplete="address-line2"
          optional
          :model-value="model.unit || ''"
          :error="errors?.unit"
          @update:model-value="set('unit', $event)"
        />
      </div>
      <ETextField
        :label="t('city')"
        :name="`${prefix()}-city`"
        autocomplete="address-level2"
        required
        :model-value="model.city || ''"
        :error="errors?.city"
        @update:model-value="set('city', $event)"
      />
      <ESelect
        :label="t('region')"
        :name="`${prefix()}-region`"
        required
        :options="regions || US_STATES"
        :placeholder="t('select')"
        :model-value="model.region || ''"
        :error="errors?.region"
        @update:model-value="set('region', $event)"
      />
      <ETextField
        :label="t('postal')"
        :name="`${prefix()}-postal`"
        autocomplete="postal-code"
        :inputmode="postalInputmode"
        required
        :model-value="model.postal || ''"
        :error="errors?.postal"
        @update:model-value="set('postal', $event)"
      />
    </div>
  </EFieldset>
</template>

<style>
@layer e.composites {
  .e-address-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr));
    align-items: start;
    gap: var(--e-space-4);
  }

  .e-address-wide {
    grid-column: 1 / -1;
  }
}
</style>

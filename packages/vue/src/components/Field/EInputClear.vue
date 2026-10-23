<script setup lang="ts">
import EIcon from "../Icon/EIcon.vue";
import { useMessages } from "../../config.js";
import "../../styles/base.css";
import "../TextField/input.css";

const t = useMessages();
</script>

<template>
  <button type="button" class="e-input-btn e-interact e-interact--inset" :aria-label="t('clear')" @mousedown.prevent>
    <EIcon name="x" />
  </button>
</template>

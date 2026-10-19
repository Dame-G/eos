<script setup lang="ts">
import { injectDialogRootContext } from "reka-ui";

const titleId = injectDialogRootContext().titleId;
</script>

<template>
  <div class="e-drawer-body" tabindex="0" role="region" :aria-labelledby="titleId"><slot /></div>
</template>

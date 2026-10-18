<script setup lang="ts">
import { injectDialogRootContext } from "reka-ui";

// A scrolling body has to be reachable from the keyboard, and a focusable region needs a name: the drawer's title.
const titleId = injectDialogRootContext().titleId;
</script>

<template>
  <div class="ae-drawer-body" tabindex="0" role="region" :aria-labelledby="titleId"><slot /></div>
</template>

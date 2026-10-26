<script lang="ts">
/** One row of an `ETree`, and the rows nested under it. */
export interface TreeNode {
  /** Names the node: the tree's `v-model` is the `id` of the selected node, and `v-model:expanded` lists the open ones. Unique in the tree. */
  id: string;
  /** The first line. */
  label: string;
  /** A muted second line. */
  description?: string;
  /** The rows under this one. A node with children opens and closes. */
  children?: TreeNode[];
  /** Keeps it in the tree but unavailable: it dims and cannot be selected or opened. */
  disabled?: boolean;
}
</script>

<script setup lang="ts">
import { computed } from "vue";
import { TreeItem, TreeRoot } from "reka-ui";
import EIcon from "../Icon/EIcon.vue";
import { RekaConfig } from "../../composables/useRekaConfig.js";
import "../../styles/base.css";
import "../../styles/listrow.css";

const props = defineProps<{
  /** The nodes at the top level, each with its `children`. */
  items: TreeNode[];
  /** The tree's accessible name, such as "Games". */
  label: string;
}>();

const emit = defineEmits<{
  /** A node was chosen with a press, Enter or Space. Its `id`. */
  select: [id: string];
}>();

defineSlots<{
  /** The lines of a row, instead of `label` and `description`. */
  item?(props: { item: TreeNode; level: number; expanded: boolean; selected: boolean }): unknown;
  /** Before the lines, such as an icon or a stamp. */
  leading?(props: { item: TreeNode; level: number }): unknown;
  /** At the end of a row, such as a count. Keep it to text: a tree item cannot hold a control. */
  trailing?(props: { item: TreeNode; level: number }): unknown;
}>();

/** The `id` of the selected node. Without a binding it keeps its own state. */
const selected = defineModel<string | null>();
/** The `id`s of the open nodes. Without a binding it keeps its own state. */
const expanded = defineModel<string[]>("expanded", { default: () => [] });

const byId = computed(() => {
  const map = new Map<string, TreeNode>();
  const walk = (nodes: TreeNode[]) => {
    for (const n of nodes) {
      map.set(n.id, n);
      if (n.children) walk(n.children);
    }
  };
  walk(props.items);
  return map;
});
const selectedNode = computed(() => (selected.value != null ? byId.value.get(selected.value) : undefined));

const getKey = (n: TreeNode) => n.id;
const getChildren = (n: TreeNode) => (n.children?.length ? n.children : undefined);

function onSelect(node: TreeNode | undefined) {
  if (!node) return;
  selected.value = node.id;
  emit("select", node.id);
}
</script>

<template>
  <RekaConfig>
    <TreeRoot
      v-slot="{ flattenItems }"
      class="e-tree"
      :aria-label="label"
      :items="items"
      :get-key="getKey"
      :get-children="getChildren"
      :model-value="selectedNode"
      :expanded="expanded"
      selection-behavior="replace"
      @update:model-value="onSelect"
      @update:expanded="(ids: string[]) => (expanded = ids)"
    >
      <TreeItem
        v-for="node in flattenItems"
        v-slot="{ isExpanded, isSelected }"
        :key="node._id"
        v-bind="node.bind"
        :disabled="node.value.disabled"
        class="e-listrow e-tree-row e-interact--inset"
        :style="{ '--_level': node.level }"
      >
        <EIcon v-if="node.hasChildren" class="e-tree-chevron" name="chevron-right" />
        <span v-else class="e-tree-chevron" aria-hidden="true"></span>
        <span v-if="$slots.leading" class="e-listrow-lead"
          ><slot name="leading" :item="node.value" :level="node.level"
        /></span>
        <span class="e-listrow-main">
          <slot name="item" :item="node.value" :level="node.level" :expanded="isExpanded" :selected="isSelected">
            <span class="e-listrow-title">{{ node.value.label }}</span>
            <span v-if="node.value.description" class="e-listrow-sub">{{ node.value.description }}</span>
          </slot>
        </span>
        <span v-if="$slots.trailing" class="e-listrow-trail"
          ><slot name="trailing" :item="node.value" :level="node.level"
        /></span>
      </TreeItem>
    </TreeRoot>
  </RekaConfig>
</template>

<style>
@layer e.blocks {
  .e-tree {
    display: grid;
    gap: var(--e-pad-inset);
    min-width: 0;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  /* Each level steps in by the width of the chevron and its gap, so a child's text starts under its parent's. */
  .e-tree-row {
    --_level: 1;

    padding-inline-start: calc(
      var(--e-pad-control-sm) - var(--e-stroke-edge) + (var(--_level) - 1) * (var(--e-icon-size-md) + var(--e-gap-snug))
    );
  }

  .e-tree-chevron {
    flex: none;
    inline-size: var(--e-icon-size-md);
    block-size: var(--e-icon-size-md);
    color: var(--e-muted);
    transition: transform var(--e-duration-tap) var(--e-easing-out);
  }

  .e-tree-chevron:dir(rtl) {
    transform: scaleX(-1);
  }

  .e-tree-row[aria-expanded="true"] > .e-tree-chevron {
    transform: rotate(90deg);
  }
}
</style>

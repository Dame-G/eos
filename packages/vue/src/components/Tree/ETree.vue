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

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** The nodes at the top level, each with its `children`. */
    items: TreeNode[];
    /** The tree's accessible name, such as "Games". */
    label: string;
    /** What a press on a row does to a node with children. `row`: selects it and opens or closes it. `chevron`: pressing the row only selects it, and the chevron alone opens and closes it (Right and Left still do from the keyboard). */
    toggleOn?: "row" | "chevron";
    /** Shortens the rows to the tap target, for a tree of many small nodes. */
    dense?: boolean;
    /** How far each level steps in: `md` by the chevron's width and gap, so a child's text starts under its parent's, `sm` by a smaller step. */
    indent?: "sm" | "md";
  }>(),
  { toggleOn: "row", indent: "md" },
);

const emit = defineEmits<{
  /** A node was chosen with a press, Enter or Space. Its `id`. */
  select: [id: string];
}>();

defineSlots<{
  /** The lines of a row, instead of `label` and `description`. */
  item?(props: { item: TreeNode; level: number; expanded: boolean; selected: boolean }): unknown;
  /** Before the lines, such as an icon or a stamp. */
  leading?(props: { item: TreeNode; level: number }): unknown;
  /** At the end of a row, such as a count or a few buttons. A press on a control in it does not select or open the row, and its keys stay its own. */
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

type RowEvent = CustomEvent<{ originalEvent?: Event }>;

/** The element the press or key came from, and whether it came from the chevron or from a control of the row's own. */
function origin(event: RowEvent) {
  const original = event.detail?.originalEvent;
  const target = original?.target instanceof Element ? original.target : null;
  const row = target?.closest("[role='treeitem']") ?? null;
  const control = target?.closest("button, a[href], input, select, textarea, [role='button'], [data-tree-control]");
  return {
    click: original?.type === "click",
    chevron: !!target?.closest(".e-tree-chevron"),
    control: !!control && !!row && control !== row && row.contains(control),
  };
}

/** A press on a control inside a row is the control's. In `chevron` mode the chevron toggles and the rest of the row selects. */
function onRowSelect(event: RowEvent) {
  const o = origin(event);
  if (o.click && (o.control || (props.toggleOn === "chevron" && o.chevron))) event.preventDefault();
}

function onRowToggle(event: RowEvent) {
  const o = origin(event);
  if (o.click && (o.control || (props.toggleOn === "chevron" && !o.chevron))) event.preventDefault();
}

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
      v-bind="$attrs"
      class="e-tree"
      :class="[
        dense && 'e-tree--dense',
        indent === 'sm' && 'e-tree--indent-sm',
        toggleOn === 'chevron' && 'e-tree--chevron',
      ]"
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
        @select="onRowSelect"
        @toggle="onRowToggle"
      >
        <span class="e-tree-chevron" aria-hidden="true"
          ><EIcon v-if="node.hasChildren" name="chevron-right" class="e-tree-chevron-icon"
        /></span>
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
      var(--e-pad-control-sm) - var(--e-stroke-edge) + (var(--_level) - 1) *
        var(--_step, calc(var(--e-icon-size-md) + var(--e-gap-snug)))
    );
  }

  .e-tree--indent-sm {
    --_step: var(--e-gap-base);
  }

  .e-tree--dense .e-tree-row {
    min-height: var(--e-tap);
    padding-block: 0;
  }

  /* When only the chevron opens a row, it is a target of its own: its box reaches the tap size without moving anything. */
  .e-tree--chevron .e-tree-chevron {
    position: relative;
  }

  .e-tree--chevron .e-tree-chevron::after {
    content: "";
    position: absolute;
    inset-block: calc((var(--e-icon-size-md) - var(--e-tap)) / 2);
    inset-inline: calc((var(--e-icon-size-md) - var(--e-tap)) / 2);
  }

  .e-tree-chevron {
    display: grid;
    flex: none;
    place-items: center;
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

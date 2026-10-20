# ETooltip

A short label that names an icon-only control. It never holds anything to read or click; use [`EDefinition`](../Definition/README.md) for that.

```vue
<ETooltip label="Download receipt">
  <EIconButton icon="download" label="Download receipt" />
</ETooltip>
```

## Props

<!-- props:start -->

| Prop    | Type      | Default      | Notes                                                                                 |
| ------- | --------- | ------------ | ------------------------------------------------------------------------------------- |
| `open`  | `boolean` | `false`      | `v-model:open`: whether the bubble shows. Hover, focus and Escape update it.          |
| `label` | `string`  | **Required** | What the tooltip says: a name for the control, never anything you must read or click. |

<!-- props:end -->

`class`, `style` and attributes land on the bubble; the trigger is your own element.

## Slots

| Slot      | Use                                                                                       |
| --------- | ----------------------------------------------------------------------------------------- |
| `default` | One focusable element (icon button, link); it is the trigger and gets `aria-describedby`. |

## Accessibility

- Shows on keyboard focus at once, on hover after 400ms and while a finger is held; hides on Escape (focus stays) and when focus or pointer leaves. It stays open while the pointer is over it (WCAG 1.4.13).
- It describes, not names: give an icon button its own `label` as well.

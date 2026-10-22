# EDisclosure

A section that opens and closes, for secondary detail. Give several the same `group` for an accordion that keeps one open at a time.

```vue
<EDisclosure title="History (4)">
  <EDescriptionList :items="history" />
</EDisclosure>
```

## Props

<!-- props:start -->

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `open` | `boolean` | `false` | `v-model:open`: whether it is open. Without a binding it keeps its own state. |
| `title` | `string` | None | The summary line that opens and closes it. The `title` slot takes rich content. |
| `group` | `string` | None | Disclosures that share a `group` open one at a time (the native `name` of `details`). |

<!-- props:end -->

`class`, `style` and attributes land on the `details` element.

## Slots

| Slot      | Use                                             |
| --------- | ----------------------------------------------- |
| `title`   | The summary line, in place of the `title` prop. |
| `default` | What opens and closes.                          |

## Accessibility

- A native `details`. The summary is keyboard operable (Enter, Space) and the open state is announced.

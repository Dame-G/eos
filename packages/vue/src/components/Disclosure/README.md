# EDisclosure

A section that opens and closes, for secondary detail. Give several the same `group` for an accordion that keeps one open at a time.

```vue
<EDisclosure title="History (4)">
  <EDescriptionList :items="history" />
</EDisclosure>
```

## Props

<!-- props:start -->

| Prop       | Type      | Default | Notes                                                                                 |
| ---------- | --------- | ------- | ------------------------------------------------------------------------------------- |
| `open`     | `boolean` | `false` | `v-model:open`: whether it is open. Without a binding it keeps its own state.         |
| `title`    | `string`  | None    | The summary line that opens and closes it. The `title` slot takes rich content.       |
| `group`    | `string`  | None    | Disclosures that share a `group` open one at a time (the native `name` of `details`). |
| `disabled` | `boolean` | `false` | Keeps it as it is: the summary shows it is unavailable and no longer toggles it.      |

<!-- props:end -->

`class`, `style` and attributes land on the `details` element. Opening and closing slide where the browser can animate the height, and switch at once under reduced motion.

## Slots

| Slot      | Use                                             |
| --------- | ----------------------------------------------- |
| `title`   | The summary line, in place of the `title` prop. |
| `default` | What opens and closes.                          |

## Accessibility

- A native `details`. The summary is keyboard operable (Enter, Space) and the open state is announced.
- `disabled` sets `aria-disabled="true"` on the summary: it stays focusable, is dimmed and does not toggle.

## Keyboard

| Key          | Action                                |
| ------------ | ------------------------------------- |
| Enter, Space | Opens or closes the focused summary.  |
| Tab          | Moves to the next summary or control. |

## Related

[`EExpandableRow`](../ExpandableRow/README.md) for a row in a list that opens to more, [`ETabs`](../Tabs/README.md) to switch between panels.

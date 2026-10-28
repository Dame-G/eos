# EDisclosure

A section that opens and closes, for secondary detail. Give several the same `group` for an accordion that keeps one open at a time. Use [`EExpandableRow`](../ExpandableRow/README.md) for a row of a list, and [`ETabs`](../Tabs/README.md) to switch between views.

```vue
<EDisclosure title="History (4)">
  <EDescriptionList :items="history" />
</EDisclosure>
```

## Props

<!-- props:start -->

| Prop         | Type                 | Default    | Notes                                                                                                                     |
| ------------ | -------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------- |
| `open`       | `boolean`            | `false`    | `v-model:open`: whether it is open. Without a binding it keeps its own state.                                             |
| `title`      | `string`             | None       | The summary line that opens and closes it. The `title` slot takes rich content.                                           |
| `group`      | `string`             | None       | Disclosures that share a `group` open one at a time (the native `name` of `details`).                                     |
| `disabled`   | `boolean`            | `false`    | Keeps it as it is: the summary shows it is unavailable and no longer toggles it.                                          |
| `titleStyle` | `"kicker" \| "text"` | `"kicker"` | How the summary is set: `kicker` in small capitals, as the label of a section, or `text` in the size and weight of a row. |

<!-- props:end -->

`class`, `style` and attributes land on the `details` element. Opening and closing slide where the browser can animate the height, and switch at once under reduced motion.

The summary is a small-capitals label by default, for the sections of a settings panel. `titleStyle="text"` sets it in the size and weight of a row, for a disclosure inside a list or a form.

## Slots

| Slot      | Use                                             |
| --------- | ----------------------------------------------- |
| `title`   | The summary line, in place of the `title` prop. |
| `default` | What opens and closes.                          |

## Accessibility

- A native `details`, so the open state is announced.
- `disabled` sets `aria-disabled="true"` on the summary: it stays focusable, is dimmed and does not toggle.
- In print a closed disclosure prints open, without its chevron, so nothing in it is lost on paper.

## Keyboard

| Key          | Action                                |
| ------------ | ------------------------------------- |
| Enter, Space | Opens or closes the focused summary.  |
| Tab          | Moves to the next summary or control. |

## Related

[`ENavList`](../NavList/README.md) for a group of links that opens and closes.

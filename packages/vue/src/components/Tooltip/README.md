# ETooltip

A label that names an icon-only control. Built on Reka UI's Tooltip. Wrap one focusable element and provide `label`. It never holds anything you must read or click: use `EPopover` for that.

```vue
<ETooltip label="Download receipt">
  <EIconButton icon="download" label="Download receipt" />
</ETooltip>
```

## Props

| Prop    | Type     | Notes                            |
| ------- | -------- | -------------------------------- |
| `label` | `string` | Required. What the tooltip says. |

## Slots

| Slot    | Notes                                                                                                  |
| ------- | ------------------------------------------------------------------------------------------------------ |
| default | One focusable element (an icon button, a link). It becomes the trigger and is described by the bubble. |

`class`, `style` and other attributes land on the bubble; the trigger is your own element.

## Behaviour and accessibility

- Shows on keyboard focus straight away, on hover after 400ms, and while a finger is held on the control (it goes a moment after the finger lifts). It hides on `Escape` (focus stays), when focus or the pointer leaves, and on a press.
- The bubble is `role="tooltip"` and the trigger gets `aria-describedby` pointing at it while it is shown. The trigger keeps its own accessible name, so give an icon button its `label` as well: a tooltip is a description, not a name.
- The bubble stays open while the pointer is over it (WCAG 1.4.13).
- Black on white (`--e-ink` on `--e-surface`), small text, centred, at most 16rem wide. It sits above the trigger, 8px away, and flips when there is no room. It renders in the portal target with the `e-root` class, so a scoped theme reaches it.
- Deliberate differences from the reference: the bubble is mounted only while shown (the reference kept it in the page at opacity 0) and is placed by floating-ui, so the reference's `.e-tip` wrapper and its reveal rules are gone; see `parity-allow.json`.

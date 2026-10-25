# ETooltip

A short label that names an icon-only control. It never holds anything to read or click. Use [`EToggletip`](../Toggletip/README.md) for that.

```vue
<ETooltip label="Download receipt">
  <EIconButton icon="download" label="Download receipt" />
</ETooltip>
```

## Props

<!-- props:start -->

| Prop    | Type                                    | Default      | Notes                                                                                                                       |
| ------- | --------------------------------------- | ------------ | --------------------------------------------------------------------------------------------------------------------------- |
| `open`  | `boolean`                               | `false`      | `v-model:open`: whether the bubble shows. Hover, focus and Escape update it.                                                |
| `label` | `string`                                | **Required** | What the tooltip says: a name for the control, never anything you must read or click.                                       |
| `side`  | `"top" \| "bottom" \| "start" \| "end"` | `"top"`      | Which edge of the control it sits on. `start` and `end` follow the reading direction.                                       |
| `delay` | `number`                                | `400`        | Milliseconds of hovering before it shows. Keyboard focus shows it at once, and so does moving from one tooltip to the next. |

<!-- props:end -->

`class`, `style` and attributes land on the bubble. The trigger is your own element.

## Slots

| Slot      | Use                                                                                                     |
| --------- | ------------------------------------------------------------------------------------------------------- |
| `default` | One focusable element, such as an icon button or a link. It is the trigger and gets `aria-describedby`. |

## Events

| Event   | Payload | Notes                                                                                                                                         |
| ------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `close` |         | The person hid it, by blur, pointer leave, Escape or the end of a touch. `open` is already `false`. Setting `open` to false does not fire it. |

## Accessibility

- Shows on keyboard focus at once, on hover after `delay` (400ms by default, none when you move from one tooltip to the next) and while a finger is held. It hides on Escape (focus stays) and when focus or pointer leaves. It stays open while the pointer is over it (WCAG 1.4.13).
- It describes, not names: give an icon button its own `label` as well.

## Keyboard

| Key    | Action                                          |
| ------ | ----------------------------------------------- |
| Tab    | Focusing the control shows the tooltip at once. |
| Escape | Hides it. Focus stays on the control.           |

## Related

[`EToggletip`](../Toggletip/README.md) for an explanation people read or click.

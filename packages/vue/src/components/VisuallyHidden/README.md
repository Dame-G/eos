# EVisuallyHidden

Text that is read out but not shown, for the context a sighted person gets from layout: "receipt 8842" after a Download button, "(done)" after a completed step.

```vue
<EButton icon="download">Download <EVisuallyHidden>receipt 8842</EVisuallyHidden></EButton>
```

## Props

| Prop | Type     | Default  | Notes                  |
| ---- | -------- | -------- | ---------------------- |
| `as` | `string` | `"span"` | The element to render. |

## Slots

| Slot      | What                                  |
| --------- | ------------------------------------- |
| `default` | The text that is read out, not shown. |

Native attributes land on the rendered element. The styles are the shared `.e-sr` class in `styles/base.css`, so the component has no CSS of its own.

## Rules

- Never hide text that a sighted person also needs, and never use it to repeat visible text.
- Keep a space inside the text where it joins visible words (" (done)").

## Accessibility

- The element is 1px, clipped and absolutely positioned, so it takes no space but stays in the accessibility tree and in the accessible name of the control it sits in.

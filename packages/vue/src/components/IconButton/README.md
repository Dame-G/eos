# EIconButton

An icon-only button with a target as tall as the control height, for rows where a text button would crowd. Never use it for the main action: that is an [`EButton`](../Button/README.md).

```vue
<EIconButton icon="download" label="Download receipt" @click="download" />
```

## Props

<!-- props:start -->

| Prop       | Type                                                           | Default      | Notes                                                                                                                                                |
| ---------- | -------------------------------------------------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `icon`     | `IconProp`                                                     | **Required** | The glyph.                                                                                                                                           |
| `label`    | `string`                                                       | **Required** | The accessible name, phrased as an action such as "Download receipt".                                                                                |
| `variant`  | `"quiet" \| "primary" \| "secondary" \| "outline" \| "danger"` | `"quiet"`    | `quiet` has no fill and suits a row or a toolbar. The others are the `EButton` variants as a square.                                                 |
| `size`     | `"sm" \| "md" \| "lg"`                                         | `"md"`       | `sm` is a compact square, `lg` a larger one. Every size keeps a 44px target.                                                                         |
| `disabled` | `boolean`                                                      | `false`      | Disables the button.                                                                                                                                 |
| `loading`  | `boolean`                                                      | `false`      | Shows a spinner in place of the icon and ignores clicks while an action runs. The button stays focusable, is marked busy and "Loading" is announced. |
| `type`     | `"button" \| "submit" \| "reset"`                              | `"button"`   | `submit` submits a form.                                                                                                                             |
| `tooltip`  | `boolean`                                                      | `false`      | Shows the label in a tooltip on hover and focus, for an icon that is not obvious.                                                                    |

<!-- props:end -->

`class`, `style`, attributes and listeners (`@click`, `aria-*`, `popovertarget`) land on the `button` element. It is `type="button"` and hidden in print.

## Accessibility

- A `button` named by `label`. `tooltip` shows the label in an [`ETooltip`](../Tooltip/README.md) for an icon that is not obvious; attributes and listeners still land on the `button`.
- Hover washes the quiet button, press sinks it, and `aria-pressed="true"` draws it sunk for a toggle. The other variants are the `EButton` ones as a square.
- `loading` marks the button `aria-busy`, ignores clicks and announces "Loading".

## Keyboard

| Key          | Action                                                |
| ------------ | ----------------------------------------------------- |
| Enter, Space | Presses the button.                                   |
| Tab          | Moves focus to the button. A disabled one is skipped. |

## Related

[`EMenu`](../Menu/README.md) for a list of actions.

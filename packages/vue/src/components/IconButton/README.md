# EIconButton

An icon-only button with a target as tall as the control height, for rows where a text button would crowd. Never use it for the main action.

```vue
<EIconButton icon="download" label="Download receipt" @click="download" />
```

## Props

<!-- props:start -->

| Prop       | Type       | Default      | Notes                                                                 |
| ---------- | ---------- | ------------ | --------------------------------------------------------------------- |
| `icon`     | `IconProp` | **Required** | The glyph.                                                            |
| `label`    | `string`   | **Required** | The accessible name, phrased as an action such as "Download receipt". |
| `disabled` | `boolean`  | `false`      | Disables the button.                                                  |

<!-- props:end -->

`class`, `style`, attributes and listeners (`@click`, `aria-*`, `popovertarget`) land on the `button` element. It is `type="button"` and hidden in print.

## Accessibility

- A `button` named by `label`. Pair it with `ETooltip` when the icon is not obvious.

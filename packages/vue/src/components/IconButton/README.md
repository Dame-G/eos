# EIconButton

An icon-only button with a target as tall as the control height, for rows where a text button would crowd. Never use it for the main action: that is an [`EButton`](../Button/README.md).

```vue
<EIconButton icon="download" label="Download receipt" @click="download" />
```

## Props

<!-- props:start -->

| Prop            | Type                                                           | Default      | Notes                                                                                                                                                |
| --------------- | -------------------------------------------------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `icon`          | `IconProp`                                                     | **Required** | The glyph.                                                                                                                                           |
| `label`         | `string`                                                       | **Required** | The accessible name, phrased as an action such as "Download receipt".                                                                                |
| `variant`       | `"quiet" \| "primary" \| "secondary" \| "outline" \| "danger"` | `"quiet"`    | `quiet` has no fill and suits a row or a toolbar. The others are the `EButton` variants as a square.                                                 |
| `size`          | `"xs" \| "sm" \| "md" \| "lg"`                                 | `"md"`       | `xs` is a dense square for a compact row (its hit area is still 44px), `sm` a compact square, `lg` a larger one.                                     |
| `href`          | `string`                                                       | None         | Makes it a link to this address, for an icon that goes to a page. Give `href` or, with a `linkComponent`, `to`.                                      |
| `to`            | `unknown`                                                      | None         | A router location, passed to `linkComponent` as `to` (for `RouterLink`). Use it instead of `href`.                                                   |
| `linkComponent` | `string \| Component`                                          | `"a"`        | What renders a link: `RouterLink` or any component that takes `href` or `to` and a default slot.                                                     |
| `current`       | `boolean`                                                      | `false`      | Marks it as the page you are on (`aria-current="page"`). Only a link has a current page.                                                             |
| `disabled`      | `boolean`                                                      | `false`      | Disables the button.                                                                                                                                 |
| `loading`       | `boolean`                                                      | `false`      | Shows a spinner in place of the icon and ignores clicks while an action runs. The button stays focusable, is marked busy and "Loading" is announced. |
| `type`          | `"button" \| "submit" \| "reset"`                              | `"button"`   | `submit` submits a form.                                                                                                                             |
| `tooltip`       | `boolean`                                                      | `false`      | Shows the label in a tooltip on hover and focus, for an icon that is not obvious.                                                                    |

<!-- props:end -->

`class`, `style`, attributes and listeners (`@click`, `aria-*`, `popovertarget`) land on the `button` element. It is `type="button"` and hidden in print.

Give it `href`, or `to` with a `linkComponent` such as `RouterLink`, and it is a link instead: an `a` (or your component) named by `label`, in the same shapes and sizes. `current` marks the page you are on. A disabled quiet icon button only dims, with no dashed box; the filled variants keep the dashed edge. `size="xs"` is a dense square of 32px whose hit area stays 44px.

```vue
<EIconButton icon="user" label="Profile" :to="{ name: 'profile' }" :link-component="RouterLink" current />
```

## Accessibility

- A `button` named by `label`. `tooltip` shows the label in an [`ETooltip`](../Tooltip/README.md) for an icon that is not obvious; attributes and listeners still land on the `button`.
- Hover washes the quiet button, press sinks it, and `aria-pressed="true"` draws it sunk for a toggle. The other variants are the `EButton` ones as a square.
- A link takes `aria-current="page"` from `current`. A disabled link gets `aria-disabled="true"`, leaves the tab order and does not navigate.
- `loading` marks the button `aria-busy`, ignores clicks and announces "Loading".

## Keyboard

| Key          | Action                                                |
| ------------ | ----------------------------------------------------- |
| Enter, Space | Presses the button.                                   |
| Tab          | Moves focus to the button. A disabled one is skipped. |

## Related

[`EMenu`](../Menu/README.md) for a list of actions.

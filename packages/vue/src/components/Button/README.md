# EButton

A button for an action: one `primary` per screen, the other variants rank below it. Use [`ELink`](../Link/README.md) to go somewhere, [`EIconButton`](../IconButton/README.md) where a text button would crowd, and [`EActions`](../Actions/README.md) to group several.

```vue
<EButton @click="pay">Pay $162.40</EButton>
<EButton variant="outline" icon="download">Download</EButton>
<EButton variant="danger">Cancel visit</EButton>
<EButton type="submit" block>Save changes</EButton>
```

## Props

<!-- props:start -->

| Prop       | Type                                                           | Default     | Notes                                                                                                                                                                                |
| ---------- | -------------------------------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `variant`  | `"primary" \| "secondary" \| "outline" \| "danger" \| "quiet"` | `"primary"` | `primary` is the one main action on a screen. `secondary` confirms. `outline` is for the other actions beside it. `danger` cancels or removes. `quiet` is an underlined text action. |
| `icon`     | `IconProp`                                                     | None        | Shows an icon before the label, as a name such as `download` or as a component.                                                                                                      |
| `iconEnd`  | `IconProp`                                                     | None        | Shows an icon after the label, such as `chevron-right` on a button that goes forward or opens a list.                                                                                |
| `size`     | `"xs" \| "sm" \| "md" \| "lg"`                                 | `"md"`      | `xs` is a dense button for a compact list or row (32px tall; its hit area is still 44px). `sm` is a compact button for a dense toolbar. `lg` is for a hero call to action.           |
| `block`    | `boolean`                                                      | `false`     | Makes the button fill the width of its container.                                                                                                                                    |
| `disabled` | `boolean`                                                      | `false`     | Stops the button taking focus and ignores clicks. With `href` the link gets `aria-disabled="true"` and `tabindex="-1"` and does not navigate.                                        |
| `type`     | `"button" \| "submit" \| "reset"`                              | `"button"`  | `submit` submits a form. Use it on the one button that submits.                                                                                                                      |
| `href`     | `string`                                                       | None        | Renders a link that looks like the button, for a destination rather than an action (a call to action that goes to a page).                                                           |
| `external` | `boolean`                                                      | `false`     | Opens the link in a new tab and tells screen readers so. Needs `href`.                                                                                                               |
| `loading`  | `boolean`                                                      | `false`     | Shows a spinner in place of the icon and ignores clicks while an action runs. The button stays focusable, is marked busy and "Loading" is announced.                                 |

<!-- props:end -->

`class`, `style`, attributes and listeners land on the `button` element, or on the `a` element with `href`. No outer margin: space buttons with `EActions`, `EInline` or `EStack`. Hidden in print.

A disabled `quiet` button has no box to dash, so it only dims and loses its underline, which keeps a toolbar of them calm; the other variants keep the dashed edge. `size="xs"` is a dense button, 32px tall, for a compact list or a row of actions. Its face is shorter than a tap target but its hit area is still 44px, so the gap to the next control must be at least `gap-snug`.

## Slots

| Slot      | Use                                                                         |
| --------- | --------------------------------------------------------------------------- |
| `default` | The label: a verb that says what happens, like "Pay $162.40", not "Submit". |

## Accessibility

- The label is the accessible name, and the icon is hidden. For an icon alone use `EIconButton`.
- `loading` marks the button `aria-busy` and announces "Loading" once it starts.
- `external` adds hidden text "(opens in a new tab)" to the link.
- `aria-pressed="true"` draws a toggle filled in the primary colour, like a chosen segment. A disabled toggle stays dimmed under the pointer.
- For repeated labels (several "Download" buttons), add hidden text with `EVisuallyHidden`.

## Keyboard

| Key   | Action                                                                                  |
| ----- | --------------------------------------------------------------------------------------- |
| Enter | Presses a button or follows a link.                                                     |
| Space | Presses a button. A link (`href`) does not activate on Space, like a native link.       |
| Tab   | Moves focus to the button. A disabled button is skipped, a loading one stays focusable. |

## Related

[`ECopyButton`](../CopyButton/README.md) to copy text, [`EMenu`](../Menu/README.md) for a list of actions.

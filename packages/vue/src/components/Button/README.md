# EButton

A button for an action. `primary` is the one main action on a screen; the other variants rank below it. It is a real `<button>`.

```vue
<EButton @click="pay">Pay $162.40</EButton>
<EButton variant="outline" icon="download">Download</EButton>
<EButton variant="danger">Cancel visit</EButton>
<EButton type="submit" block>Save changes</EButton>
```

## Props

| Prop       | Type                                                           | Default   | Notes                                                                                                                                                                    |
| ---------- | -------------------------------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `variant`  | `"primary" \| "secondary" \| "outline" \| "danger" \| "quiet"` | `primary` | `primary` is the one main action; `secondary` confirms; `outline` is for the other actions beside it; `danger` cancels or removes; `quiet` is an underlined text action. |
| `icon`     | `IconProp`                                                     |           | An icon before the label: a name such as `"download"` or an icon component. See `EIcon`.                                                                                 |
| `block`    | `boolean`                                                      |           | Full width.                                                                                                                                                              |
| `disabled` | `boolean`                                                      |           | Dashed and unfilled. A disabled button is not focusable and ignores clicks.                                                                                              |
| `type`     | `"button" \| "submit" \| "reset"`                              | `button`  | `button` never submits a form; set `submit` on the one that should.                                                                                                      |
| `href`     | `string`                                                       |           | Renders a link that looks like the button, for a call to action that goes to a page.                                                                                     |
| `external` | `boolean`                                                      |           | With `href`: opens in a new tab.                                                                                                                                         |

Native attributes and listeners (`@click`, `name`, `value`, `form`, `aria-*`, `data-*`, `class`, `style`) fall through to the `<button>`.

## Slots

| Slot    | Use                                                                         |
| ------- | --------------------------------------------------------------------------- |
| default | The label: a verb that says what happens, like "Pay $162.40", not "Submit". |

## Accessibility

- A real `button`: Tab focuses it, Enter and Space press it, and it has the focus ring.
- The accessible name is the label. The icon is hidden from assistive technology, so a label is always needed; for an icon alone use `EIconButton`.
- When the label is short or repeated (several "Download" buttons), add hidden text with `EVisuallyHidden` ("Download receipt 8842").
- Disabled styling does not rely on colour: the fill goes and the border turns dashed. In forced-colours mode the border uses `ButtonText` (`GrayText` when disabled).

## Rules

- One `primary` button per screen. Put it first in a row of actions.
- A button does something; if it only goes to another page, use `ELink` in text, or `href` for a call to action. A link-button is a real `a`: Enter follows it, Space does not.
- Hidden when printed.
- Buttons set no outer margin: space them with `EActions`, `EInline` or `EStack`.

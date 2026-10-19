# EButton

A button for an action: one `primary` per screen, the other variants rank below it.

```vue
<EButton @click="pay">Pay $162.40</EButton>
<EButton variant="outline" icon="download">Download</EButton>
<EButton variant="danger">Cancel visit</EButton>
<EButton type="submit" block>Save changes</EButton>
```

## Props

| Prop       | Type                                                           | Default   | Notes                                                                                                                              |
| ---------- | -------------------------------------------------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `variant`  | `"primary" \| "secondary" \| "outline" \| "danger" \| "quiet"` | `primary` | `primary` main action; `secondary` confirms; `outline` other actions; `danger` cancels or removes; `quiet` underlined text action. |
| `icon`     | `IconProp`                                                     |           | Icon before the label: a name such as `download` or a component.                                                                   |
| `block`    | `boolean`                                                      |           | Full width.                                                                                                                        |
| `disabled` | `boolean`                                                      |           | Dashed and unfilled; not focusable, ignores clicks. No effect with `href`.                                                         |
| `type`     | `"button" \| "submit" \| "reset"`                              | `button`  | Set `submit` on the one that submits a form.                                                                                       |
| `href`     | `string`                                                       |           | Renders a link styled as the button, for a call to action that goes to a page. Space does not follow it.                           |
| `external` | `boolean`                                                      |           | With `href`: opens in a new tab.                                                                                                   |

`class`, `style`, attributes and listeners land on the `button` element, or on the `a` element with `href`. No outer margin: space buttons with `EActions`, `EInline` or `EStack`. Hidden in print.

## Slots

| Slot      | Use                                                                         |
| --------- | --------------------------------------------------------------------------- |
| `default` | The label: a verb that says what happens, like "Pay $162.40", not "Submit". |

## Accessibility

- The label is the accessible name; the icon is hidden. For an icon alone use `EIconButton`.
- For repeated labels (several "Download" buttons), add hidden text with `EVisuallyHidden`.

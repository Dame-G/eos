# EButton

A button for an action: one `primary` per screen, the other variants rank below it.

```vue
<EButton @click="pay">Pay $162.40</EButton>
<EButton variant="outline" icon="download">Download</EButton>
<EButton variant="danger">Cancel visit</EButton>
<EButton type="submit" block>Save changes</EButton>
```

## Props

<!-- props:start -->

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `variant` | `"primary" \| "secondary" \| "outline" \| "danger" \| "quiet"` | `"primary"` | `primary` is the one main action on a screen; `secondary` confirms; `outline` is for the other actions beside it; `danger` cancels or removes; `quiet` is an underlined text action. |
| `icon` | `IconProp` | — | An icon before the label: a name such as `download`, or a component. |
| `block` | `boolean` | `false` | Full width. |
| `disabled` | `boolean` | `false` | Dashed and unfilled; not focusable, ignores clicks. With `href` the link gets `aria-disabled="true"` and `tabindex="-1"` and does not navigate. |
| `type` | `"button" \| "submit" \| "reset"` | `"button"` | Set `submit` on the one that submits a form. |
| `href` | `string` | — | Renders a link that looks like the button, for a destination rather than an action (a call to action that goes to a page). Space does not follow it. |
| `external` | `boolean` | `false` | With `href`: opens in a new tab. |
| `loading` | `boolean` | `false` | Swaps the icon for a spinner, flattens the face, and dashes its edge, and ignores clicks while an action runs. The button keeps its width and stays focusable, and is announced as busy. |

<!-- props:end -->

`class`, `style`, attributes and listeners land on the `button` element, or on the `a` element with `href`. No outer margin: space buttons with `EActions`, `EInline` or `EStack`. Hidden in print.

## Slots

| Slot      | Use                                                                         |
| --------- | --------------------------------------------------------------------------- |
| `default` | The label: a verb that says what happens, like "Pay $162.40", not "Submit". |

## Accessibility

- The label is the accessible name; the icon is hidden. For an icon alone use `EIconButton`.
- For repeated labels (several "Download" buttons), add hidden text with `EVisuallyHidden`.

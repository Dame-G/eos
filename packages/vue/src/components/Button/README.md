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
| `variant` | `"primary" \| "secondary" \| "outline" \| "danger" \| "quiet"` | `"primary"` | `primary` is the one main action on a screen. `secondary` confirms. `outline` is for the other actions beside it. `danger` cancels or removes. `quiet` is an underlined text action. |
| `icon` | `IconProp` | — | Shows an icon before the label, as a name such as `download` or as a component. |
| `block` | `boolean` | `false` | Makes the button fill the width of its container. |
| `disabled` | `boolean` | `false` | Stops the button taking focus and ignores clicks. With `href` the link gets `aria-disabled="true"` and `tabindex="-1"` and does not navigate. |
| `type` | `"button" \| "submit" \| "reset"` | `"button"` | `submit` submits a form. Use it on the one button that submits. |
| `href` | `string` | — | Renders a link that looks like the button, for a destination rather than an action (a call to action that goes to a page). A link does not activate on Space, like a native link. |
| `external` | `boolean` | `false` | Opens the link in a new tab. Needs `href`. |
| `loading` | `boolean` | `false` | Shows a spinner in place of the icon and ignores clicks while an action runs. The button stays focusable and is announced as busy. |

<!-- props:end -->

`class`, `style`, attributes and listeners land on the `button` element, or on the `a` element with `href`. No outer margin: space buttons with `EActions`, `EInline` or `EStack`. Hidden in print.

## Slots

| Slot      | Use                                                                         |
| --------- | --------------------------------------------------------------------------- |
| `default` | The label: a verb that says what happens, like "Pay $162.40", not "Submit". |

## Accessibility

- The label is the accessible name, and the icon is hidden. For an icon alone use `EIconButton`.
- For repeated labels (several "Download" buttons), add hidden text with `EVisuallyHidden`.

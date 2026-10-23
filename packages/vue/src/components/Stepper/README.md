# EStepper

Shows where a person is in a multi-step flow such as registration. It displays progress and does not navigate.

```vue
<EStepper
  label="Registration"
  :steps="[
    { label: 'About you', state: 'done' },
    { label: 'Insurance', state: 'current' },
    { label: 'Review', state: 'upcoming' },
  ]"
/>
```

## Props

<!-- props:start -->

| Prop    | Type     | Default      | Notes                                                                                                                                                                  |
| ------- | -------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `steps` | `Step[]` | **Required** | The steps in order: `{ label, state }`. `state` is `done`, `current` or `upcoming` (`todo` is an alias). Mark one step `current`. Labels of one or two words fit best. |
| `label` | `string` | `"Progress"` | The list's accessible name.                                                                                                                                            |

<!-- props:end -->

`class`, `style` and attributes land on the `ol` element. The steps stack in one column when the container is narrower than 32rem.

## Accessibility

- An ordered list. The current step has `aria-current="step"` and done steps are read as "(done)".

## Keyboard

Not focusable and takes no keys. It shows progress and does not navigate.

## Related

[`EProgress`](../Progress/README.md) for a bar, [`ETabs`](../Tabs/README.md) to move between views.

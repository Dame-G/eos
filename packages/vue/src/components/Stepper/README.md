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

| Prop    | Type     | Default      | Notes                                                                                                                                                                        |
| ------- | -------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `steps` | `Step[]` | **Required** | The steps in order: `{ label, state }`; `state` is `done`, `current` or `upcoming` (`todo` is an alias). Exactly one is normally `current`. Keep labels to one or two words. |
| `label` | `string` | `"Progress"` | The list's accessible name.                                                                                                                                                  |

<!-- props:end -->

`class`, `style` and attributes land on the `ol` element. The steps stack vertically on narrow screens.

## Accessibility

- An ordered list; the current step has `aria-current="step"`, and done steps are read as "(done)".

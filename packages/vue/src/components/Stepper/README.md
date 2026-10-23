# EStepper

Shows where a person is in a multi-step flow such as registration. It displays progress and does not navigate. Use [`EProgress`](../Progress/README.md) for a single bar of progress.

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

| Prop          | Type                         | Default      | Notes                                                                                                                                                                                                 |
| ------------- | ---------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `steps`       | `Step[]`                     | **Required** | The steps in order: `{ label, state, optional?, disabled? }`. `state` is `done`, `current`, `upcoming` (`todo` is an alias) or `error`. Mark one step `current`. Labels of one or two words fit best. |
| `label`       | `string`                     | `"Progress"` | The list's accessible name.                                                                                                                                                                           |
| `interactive` | `boolean`                    | `false`      | Makes each step a button that emits `select`, so the person can go back to a step or jump ahead. Leave it off for a display of progress.                                                              |
| `orientation` | `"horizontal" \| "vertical"` | None         | `vertical` always stacks the steps in a column, the dot beside its label. `horizontal` always lays them in a row. Left out, the row stacks by itself when the space it is given is narrow.            |

<!-- props:end -->

`class`, `style` and attributes land on the `ol` element. Without `orientation` the steps stack in one column when the container is narrower than 32rem.

## Events

| Event    | Payload         | When                                                      |
| -------- | --------------- | --------------------------------------------------------- |
| `select` | `index`, `step` | A step is chosen. Only an `interactive` stepper emits it. |

## Accessibility

- An ordered list. The current step has `aria-current="step"`, done steps are read with the `done` message, "(done)", and a step in `error` with `stepError`, "(has an error)". The brackets are part of the messages, so a translation can drop them. An `optional` step shows "Optional" under its label.
- With `interactive` each step is a `button`; `aria-current` moves to the button of the current step and a `disabled` step is `aria-disabled`: dimmed, still in the Tab order, and choosing it does nothing, as with a pager's dimmed step.

## Keyboard

A display-only stepper takes no keys. With `interactive`:

| Key          | Action                                                                |
| ------------ | --------------------------------------------------------------------- |
| Tab          | Moves to the next step, `disabled` ones too.                          |
| Enter, Space | Chooses the focused step and emits `select`, unless it is `disabled`. |

## Related

[`EProgress`](../Progress/README.md) for a bar, [`ETabs`](../Tabs/README.md) to move between views.

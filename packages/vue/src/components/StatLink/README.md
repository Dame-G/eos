# EStatLink

A compact link that shows a name and its one figure, such as "You 1840" or "Dameless v14", for a header. Use [`ELink`](../Link/README.md) for a link in text, [`EMetric`](../Metric/README.md) for a figure that leads a section, and [`ENavList`](../NavList/README.md) for a row of destinations.

```vue
<EStatLink label="You" :value="1840" href="/you" />
<EStatLink label="Dameless" value="v14" to="/dameless" :link-component="RouterLink" />
```

## Props

<!-- props:start -->

| Prop            | Type                  | Default      | Notes                                                                                                                                                      |
| --------------- | --------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `label`         | `string`              | **Required** | What the figure belongs to, such as "You" or a product name. It starts the link's name.                                                                    |
| `value`         | `number \| string`    | None         | The one figure, set in mono after the label. A number is formatted for the locale; a string is shown as given, such as "v14".                              |
| `href`          | `string`              | None         | Where the link goes. Give `href` or, with a `linkComponent`, `to`. With neither it is text, not a link.                                                    |
| `to`            | `unknown`             | None         | A router location, passed to `linkComponent` as `to` (for `RouterLink`). Use it instead of `href`. Without a `linkComponent`, a string `to` is the `href`. |
| `linkComponent` | `string \| Component` | `"a"`        | What renders the link: `RouterLink` or any component that takes `href` or `to` and a default slot. It receives `to` or `href` and the class `e-statlink`.  |
| `current`       | `boolean`             | `false`      | Marks it as the page you are on (`aria-current="page"`), drawn as the current place.                                                                       |

<!-- props:end -->

`class`, `style`, attributes and listeners land on the `a` element (a `span` with no `href` or `to`).

## Accessibility

- The link's name is the label, a space and the figure ("You 1,840"), read in that order. Make the label say where it goes.
- `current` sets `aria-current="page"`, drawn as the current place: the primary tint and edge, so colour is not the only cue.
- It is a full tap target (`--e-tap` tall) at any text size.

## Keyboard

| Key   | Action                                               |
| ----- | ---------------------------------------------------- |
| Enter | Follows the link. A link does not activate on Space. |
| Tab   | Moves focus to the link.                             |

## Related

[`EAppHeader`](../AppHeader/README.md), where it usually sits.

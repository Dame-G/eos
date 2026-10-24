# EAvatarGroup

Several people as overlapping avatars, with a "+N" tile for the rest. Use [`EAvatar`](../Avatar/README.md) for one person.

```vue
<EAvatarGroup :items="[{ name: 'Ada Lovelace' }, { name: 'Grace Hopper', src: '/people/grace.jpg' }]" :max="3" />
```

## Props

<!-- props:start -->

| Prop    | Type                   | Default      | Notes                                                            |
| ------- | ---------------------- | ------------ | ---------------------------------------------------------------- |
| `items` | `AvatarGroupItem[]`    | **Required** | The people, in order. Each is `{ name, src? }`.                  |
| `max`   | `number`               | `4`          | How many avatars show before the rest collapse into a "+N" tile. |
| `size`  | `"sm" \| "md" \| "lg"` | None         | `sm` 32px, `md` 44px or `lg` 64px, for every avatar.             |
| `label` | `string`               | None         | Names the group, instead of the list of names.                   |

<!-- props:end -->

`class`, `style` and attributes land on the `span` element.

## Accessibility

- The group is one image (`role="img"`) named by the people it shows and the count of the rest, such as "Ada Lovelace, Grace Hopper, and 2 more", joined with the words of the locale. Set `label` to name it differently, for example "Care team".
- The avatars inside are not announced one by one. Put a list of links or buttons beside the group when each person must be reachable.

Not focusable.

## Related

[`EAvatar`](../Avatar/README.md) for one person, [`ETag`](../Tag/README.md) for a labelled chip.

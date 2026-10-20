# ELink

An inline anchor for going somewhere. Things that change something are buttons.

```vue
<ELink href="/statements">All statements</ELink>
<ELink href="https://example.com/help" external>Help centre</ELink>
```

An icon before the text, for a link such as the project's repository:

```vue
<ELink href="https://github.com/Dame-G/eos" external :icon="GithubMark">GitHub</ELink>
```

## Props

<!-- props:start -->

| Prop       | Type       | Default      | Notes                                                                                                                                                 |
| ---------- | ---------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `href`     | `string`   | **Required** | Where the link goes.                                                                                                                                  |
| `external` | `boolean`  | `false`      | Opens in a new tab (`target="_blank"`, `rel="noreferrer"`).                                                                                           |
| `icon`     | `IconProp` | —            | An icon before the text: a built-in name, a name from your icon set, or an icon component. It is hidden from screen readers; the text names the link. |

<!-- props:end -->

`class`, `style`, attributes and listeners (`@click`, `aria-*`, `download`) land on the `a` element. In print the address is written after the text.

## Slots

| Slot      | Use                               |
| --------- | --------------------------------- |
| `default` | The link text: say where it goes. |

## Accessibility

- An `a` with `href`: say in the text when an external link opens a new tab and that would surprise people.

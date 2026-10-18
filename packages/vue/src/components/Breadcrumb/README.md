# EBreadcrumb

The path to the current page. The last item is the current page and is not a link. Use it two or more levels deep; never as the only way back.

```vue
<EBreadcrumb
  :items="[
    { label: 'Account', href: '/account' },
    { label: 'Statements', href: '/statements' },
    { label: 'Visit on Oct 2' },
  ]"
/>
```

## Props

| Prop            | Type                  | Default | Notes                                                                         |
| --------------- | --------------------- | ------- | ----------------------------------------------------------------------------- |
| `items`         | `BreadcrumbItem[]`    |         | `{ label, href?, to? }`, top level first. The last item is the current page.  |
| `linkComponent` | `string \| Component` | `"a"`   | What renders each link. Pass `RouterLink` for vue-router. See "Router usage". |

`class`, `style` and attributes fall through to the `nav`.

## Router usage

Eos does not depend on vue-router. Every link-bearing component (EBreadcrumb, ENavList, EBackLink) takes a `linkComponent` prop. Give items a `to` and pass `RouterLink`:

```vue
<script setup>
import { RouterLink } from "vue-router";
</script>

<EBreadcrumb
  :link-component="RouterLink"
  :items="[{ label: 'Home', to: '/' }, { label: 'Statements', to: '/statements' }, { label: 'Visit' }]"
/>
```

The link component receives `href` and/or `to` (only those the item has), the `e-crumb` class, and the label in its default slot. Items can mix `href` and `to`.

## Accessibility

- A `nav` landmark named "Breadcrumb" (a message key, so it can be translated) holding an ordered list.
- The last item is a `span` with `aria-current="page"`, not a link. The chevrons between levels are decorative.
- Each link is control height (48px) so it is easy to hit.

## Rules

- Two or more levels deep. It shows where you are; it is not the way back (use EBackLink).
- Labels are the words people use for each page.

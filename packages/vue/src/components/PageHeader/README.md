# EPageHeader

The top of a page: title, optional breadcrumb, description, status and main actions. Every page has exactly one.

```vue
<EPageHeader title="Visit on Oct 2" description="Statement 4471 · Main office">
  <template #breadcrumb><EBreadcrumb :items="crumbs" /></template>
  <template #status><EStamp status="due" detail="Nov 1" /></template>
  <template #actions>
    <EButton icon="card">Pay $162.40</EButton>
    <EButton variant="outline" icon="download">Download</EButton>
  </template>
</EPageHeader>
```

## Props

<!-- props:start -->

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `title` | `string` | **Required** | The page's title: where the person is, in their words ("Visit on Oct 2"). |
| `description` | `string` | — | A short line under the title. |
| `headingLevel` | `1 \| 2 \| 3 \| 4 \| 5 \| 6` | `1` | The heading level of the title, 1 by default. A page has exactly one h1; change it only when the header is not the page's title. |

<!-- props:end -->

`class`, `style` and attributes land on the `div` element.

## Slots

| Slot         | Use                                                                      |
| ------------ | ------------------------------------------------------------------------ |
| `breadcrumb` | An `EBreadcrumb`, above the title.                                       |
| `status`     | An `EStamp`, beside the title.                                           |
| `actions`    | `EButton`s, main one first (one primary, rest outline); hidden in print. |

## Accessibility

- The title is a heading (`h1` by default); keep one `h1` per page.

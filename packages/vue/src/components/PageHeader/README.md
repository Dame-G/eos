# EPageHeader

The top of a page's content: an optional breadcrumb, the title, a short description, a status and the main actions. Every page has exactly one. The title says where you are in the words people use ("Visit on Oct 2"), not the component or feature name.

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

## Props and slots

| Prop           | Type               | Default | Notes                                                   |
| -------------- | ------------------ | ------- | ------------------------------------------------------- |
| `title`        | `string`           |         | The page's one heading.                                 |
| `description`  | `string`           |         | A line under the title.                                 |
| `headingLevel` | `1 \| 2 \| 3 \| 4` | `1`     | Change it only when the header is not the page's title. |

| Slot         | Holds                                                   |
| ------------ | ------------------------------------------------------- |
| `breadcrumb` | An `EBreadcrumb`, above the title.                      |
| `status`     | An `EStamp`, beside the title.                          |
| `actions`    | `EButton`s, the main one first. Laid out by `EActions`. |

`class`, `style` and attributes fall through to the root. The header keeps a bottom margin of `--e-space-6`, the gap to the page below it.

## Accessibility

- The title is a real heading (`h1` by default). Only one `h1` per page.
- The actions are an `EActions` group; they wrap under the title on a narrow container and are hidden when printed.

## Rules

- Actions: one primary, the rest outline. Say what happens ("Pay $162.40"), not "Submit".
- The title is smaller (`--e-text-2xl`) at 32rem and under.

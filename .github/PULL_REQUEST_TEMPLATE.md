## What changed and why

## Checklist

- [ ] `pnpm lint`, `pnpm format:check`, `pnpm typecheck` and `pnpm test` pass
- [ ] `pnpm knip` passes
- [ ] `pnpm check:package` passes (needs a build)
- [ ] `pnpm --filter @eos-ui/vue check:css` passes
- [ ] `pnpm --filter @eos-ui/vue check:layers` passes
- [ ] `pnpm --filter @eos-ui/vue check:props` passes
- [ ] `pnpm --filter @eos-ui/vue check:docs` passes
- [ ] New or changed components have tests, including an axe check
- [ ] The component README matches the props, slots and events
- [ ] A changeset is added for user-facing changes (`pnpm changeset`)

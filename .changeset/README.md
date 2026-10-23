# Changesets

Run `pnpm changeset` for every user-facing change. The release workflow turns the changesets into a version PR. Merging that PR publishes `@eos-ui/vue` and `@eos-ui/tokens` to npm. Both packages share one version.

Docs-only wording changes, tests and internal refactors need no changeset. Label the pull request `no-changeset` so the CI check skips it.

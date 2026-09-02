## Comments

Code explains itself. Comments are the exception, not the habit.

### Never write

- **No JSDoc/block comments (`/** ... */`) on functions, components, types, props, or
  constants.** Not on exports, not on internal helpers. The signature and the name are
  the documentation.
- **No multi-line prose comments.** If an explanation needs a paragraph, it does not
  belong in the source file — put it in `docs/` and link to it if it's genuinely needed.
- **No comments that restate the code.** If the line says what the comment says, delete
  the comment.
- **No section-divider or banner comments** (`// ---- Handlers ----`,
  `{/* Year navigation */}`, `// Month grid`). If a file needs signposting to be
  readable, split it into smaller files or components instead.
- **No commented-out code.** Delete it; git remembers.
- **No changelog, attribution, or TODO-with-a-name comments.** Use git history and the
  issue tracker.

```ts
// ❌ everything below is noise
/**
 * Employee-submitted leave request. Runs as the caller, so `leave_insert_own`
 * pins the status and an employee cannot self-approve. The schema is the single
 * enforcement point for half-day values, so `days` is already correct here.
 */
export const createLeaveRequest = authActionClient
```

```ts
// ✅ the name and the code carry it; one short line for the non-obvious part
export const createLeaveRequest = authActionClient
```

### Write only when it earns its place

A comment is justified when it explains something the reader **cannot** recover from
the code itself — and then it is **one short line**, ideally under ~100 characters:

- A security or authorization invariant: `// Defense in depth: RLS enforces the same thing.`
- A non-obvious constraint or ordering requirement: `// Must run before the session cookie is read.`
- A deliberate deviation or workaround, with the reason: `// Safari won't fire change on a detached input.`
- A `// reason: ...` next to an unavoidable `any` / `@ts-expect-error`
  (required — see [`typescript.md`](./typescript.md)).
- Functional directives (`eslint-disable-*`, `@ts-expect-error`, `prettier-ignore`) —
  these are code, not commentary, and always stay.

Prefer making the comment unnecessary: rename the variable, extract a well-named
function, or introduce a named constant instead of explaining a magic value.

### Checklist

- [ ] No `/** ... */` blocks anywhere in `src/`
- [ ] No comment spans more than one line
- [ ] Every remaining comment states a *why* that the code cannot state itself
- [ ] No commented-out code, no section banners, no restating comments

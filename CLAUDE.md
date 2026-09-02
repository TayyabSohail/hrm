# CLAUDE.md

Standing context for Claude Code in this repository. Kept short on purpose — full
detail lives under `.claude/docs/` and `docs/`.

## Project

Next.js (App Router) + Supabase + TanStack React Query boilerplate. TypeScript strict
mode, shadcn/ui + Tailwind, React Hook Form + Zod, next-safe-action, pnpm.

## Read first

- Canonical implementation standard: `.claude/skills/coding-standards/SKILL.md`
  — apply it to every coding task in this repo, especially frontend work. It indexes
  the detailed, topic-by-topic rules under `.claude/docs/*`.
- Docs index: `docs/index.md` (architecture, UI system, data layer, backend, QA)

## Comments

No JSDoc/block comments (`/** ... */`) and no multi-line prose comments — not on
functions, components, types, or props. Don't explain code in paragraphs; let names and
signatures do it. A comment is justified only when it states a _why_ the code cannot,
and then it's **one short line**. Functional directives (`eslint-disable-*`,
`@ts-expect-error`, `prettier-ignore`) always stay. Full rule:
`.claude/docs/rules/comments.md`.

## Priority when guidance conflicts

1. Explicit instruction in the current chat
2. This file
3. `.claude/skills/coding-standards/SKILL.md` and `.claude/docs/*`
4. `docs/*`
5. Generic/external skills (`.agents/skills/*`, marketplace skills)

## Commands

- `pnpm dev` / `pnpm build` / `pnpm typecheck` / `pnpm lint` / `pnpm format` / `pnpm style`
- `pnpm ui add <component>` to add a shadcn primitive — never hand-edit
  `src/components/ui/*` directly.

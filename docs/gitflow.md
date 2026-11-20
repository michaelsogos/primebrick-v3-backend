# GitFlow Rules - Primebrick Backend

This repository follows GitFlow. AI agents MUST follow these rules.

## ⚠️ CRITICAL: COMMIT ⇒ PUSH — origin always aligned

Every commit MUST be pushed immediately. A commit that stays local serves
no one — `git push` is part of the commit, not a separate decision.
The commit cadence itself lives in `docs/ai/commit-verification.md`;
this section adds the mandatory push half.

## ⚠️ CRITICAL: Governed branch lifecycle — `tools/gitflow.ts`

Closing a `feature/*`, `release/*` or `hotfix/*` branch via raw
`git merge` / `git branch -d` / `git push --delete` is FORBIDDEN.
The only path is the canonical tool (same pattern as check-standards):

    bun ../primebrick-v3-sdk/tools/gitflow.ts finish [name]

which merges `--no-ff` into the base, pushes the base, deletes the
branch locally AND on origin, then audits the final state.


**On the `git flow` binary** (AVH edition 1.12.3, installed in `~/bin`
— upstream nvie 0.4.2 fast-forwards feature finishes; AVH defaults to
`--no-ff` for multi-commit features but still fast-forwards single-commit
ones, so every repo carries `gitflow.feature.finish.no-ff=true` plus the
standard config: master→main, develop, prefixes, no version-tag).
`git flow` is then fine for `feature start`/`publish`/`track` —
but closing stays ONLY via the governed tool: native `finish` neither
pushes the base nor deletes the remote branch nor audits.

## ⚠️ CRITICAL: One open work branch — never orphans

At most ONE branch across `feature/*`, `release/*`, `hotfix/*` may be
open at a time (zero is the cleanest state: `/main` + `/develop` only).
Before starting or closing work — and at every session start — run:

    bun ../primebrick-v3-sdk/tools/gitflow.ts audit

- An open branch fully merged into its base is an **ORPHAN** (landed,
  never closed) — a STOP condition: report and ask the user.
- An unexpected open work branch is the same class of anomaly — STOP,
  notify, ask. Never resolve silently.
- Release/Hotfix follow the same law: one open at a time, closed via
  `gitflow finish` (merge to main, tag, back-merge to develop, delete
  local + remote).
- Origin must carry only `main`, `develop` and the one open branch.

**Bases are merge-only — nobody commits on `main` or `develop`,
ever** (no fixes, no docs, no regen output, no exceptions). All work
lands through a work branch. Consequently an open work branch MUST
contain every commit of its base: `audit` fails with `STALE BASE`
when the base moved while a work branch is open — that is proof of a
violation (a direct base commit or an illicit close), not drift to
tolerate. STOP and report; resync only by merging the base into the
work branch once the violation is explained.

The rule is enforced **physically**, not by doc-reading discipline: the
shared governed `pre-commit` hook (`primebrick-v3-sdk/tools/githooks/`,
wired via `core.hooksPath` by `gitflow install-hooks`) REJECTS commits
on `main`/`develop` — a merge commit stays legal, so governed closes
are unaffected. `audit` fails when the wiring is missing.
## Branch Creation Rules

- **NEVER work directly on `develop` or `main`** - always create feature branches first
- **Feature branches**: `git checkout -b feature/<slug>` from updated `develop`
- **Release branches**: `git checkout -b release/<version>` from `develop` (for version bumps)
- **Hotfix branches**: `git checkout -b hotfix/<version>` from `main` (for production fixes)

## When to ask user permission

- **ASK before creating NEW feature branch** if another feature branch is already open
- **DO NOT ask permission** to commit changes on existing feature branch
- **DO NOT ask permission** to close a feature branch (follow proper closing procedure)

## Branch Closing Procedure (MANDATORY)

When closing ANY branch (`feature/*`, `release/*`, `hotfix/*`):

1. **Merge to appropriate base branch**:
   - Feature: `git merge --no-ff feature/<branch>` into `develop`
   - Release: `git merge --no-ff release/<version>` into `main`
   - Hotfix: `git merge --no-ff hotfix/<version>` into `main`

2. **Push the merged base branch**: `git push origin <base-branch>`

3. **Delete branch LOCALLY**: `git branch -d <branch-name>`

4. **Delete branch on ORIGIN**: `git push origin --delete <branch-name>`

5. **For Release/Hotfix**: Also merge `main` back to `develop` to stay aligned

## CRITICAL: Automated Package.json Version Sync

**The version in `package.json` is automatically managed by the `version-sync.mjs` script.**

The script runs automatically as a `prebuild` hook and:
- Detects the branch type (`release/` or `hotfix/`)
- Calculates the expected version from the latest git tag
- Validates that the branch name matches the expected version
- Automatically updates `package.json` to the correct version if needed

**Correct flow for release:**
1. Create release branch from develop with correct version (e.g., `release/0.23.0`)
2. The script will automatically update `package.json` during build
3. Merge release to main
4. Tag main
5. Push main with tags
6. Merge main back to develop
7. Push develop
8. Delete release branch

**Note:** The script enforces correct branch naming. If you create `release/0.24.0` when the latest tag is `0.22.0`, it will fail because the expected version is `0.23.0`.

## Version Tagging Rules

- **NO 'v' prefix** in branch names: `release/0.13.2` (not `release/v0.13.2`)
- **NO 'v' prefix** in tags for FE/BE: `0.13.2` (not `v0.13.2`)
- **Tag derived from branch name**: `release/0.13.2` → tag `0.13.2`
- **Hotfix increments PATCH**: `0.13.1` → `hotfix/0.13.2` → tag `0.13.2`
- **Release increments MINOR**: `0.13.2` → `release/0.14.0` → tag `0.14.0`

## Common Mistakes to Avoid

- ❌ Committing directly on `develop` or `main`
- ❌ Creating commits before creating feature branch
- ❌ Forgetting to delete branches (both local and origin)
- ❌ Using 'v' prefix in tags
- ❌ Not pushing merged base branch
- ❌ Leaving feature branches open after merge

## Repository-Specific Rules

- When working from meta-workspace root, use `cd primebrick-be-v3 && git <command>`

## Commit rules

- NEVER commit automatically - wait for explicit user instruction
- DO NOT ask user to approve commit messages
- Write appropriate commit messages directly when instructed
- DO NOT open editor for commit approval

## Commit and Push Guidelines

When instructed to "commit and push everything" or similar commands:
- Run `git add -A` in ALL repositories in the workspace
- Commit ALL staged files in each repository
- Push ALL branches to origin
- Do NOT filter files by task relevance - commit everything that has changed
- This applies to multi-repository workspaces: commit changes in frontend, backend, and microservices repositories

## New task workflow

When the user starts a fresh piece of work with phrases such as "Let's start a new task", "Iniziamo un nuovo task", or equivalent:

1. Infer a branch slug from context — lowercase, kebab-case, ASCII letters/digits/hyphens only
2. Before the first tracked-file change, ensure a branch `feature/<slug>` exists from up-to-date `develop`
3. State the slug once (e.g. "Branch: `feature/iana-timezone`") so the user can rename if needed

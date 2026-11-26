# Dev server & process lifecycle (agent-owned)

> Audience: AI agents and developers running this repo locally.
> `.devin/rules/dev-server.md` is a pointer to this page — this is the
> canonical text.

## Golden rules

1. **The agent owns the dev-server lifecycle** — start, stop, restart are
   autonomous operations, no ask-first (supersedes the old "user must
   confirm" policy).
2. **A process that is provably user-started is NEVER killed** without
   explicit user permission — and "not user-started" must be PROVEN
   empirically (see step 3), never assumed from "the port is busy" or
   "I didn't start it".
3. **Never duplicate, never migrate**: no second server on the same port,
   no "just use a different port". If the port is taken, resolve the owner.
4. **The stack must survive the turn**: BE, FE, job-handler and CRM stay
   running across agent turns — a service started inside an agent shell
   dies with the session, so services MUST be started **detached** via
   `primebrick-workspace/scripts/dev-stack.ps1` (delegates to
   `dev-stack.mjs` — genuinely idempotent: per-service state files in
   `temp/dev/<name>.json`, serialized lock, process-TREE kill via
   `taskkill /T`, `status`/`stop`/`restart`/`reap` subcommands;
   `reap` kills untracked primebrick dev processes — zombies — while a
   chain that reaches an IDE terminal is classified USER-STARTED and
   never touched. Logs to `temp/logs/` at the multi-repo checkout root
   (`D:\git\primebrick\temp\logs\` — NOT under primebrick-workspace). If a
   turn finds a service down, restart it detached — never leave the only
   copy of the stack inside an ephemeral shell.
5. **Releases and branch churn kill the stack — restart it after**:
   checkouts, merges and release flows rewrite source files under
   running `bun --hot`/tsx watchers; watch-mode services crash
   mid-operation and stay down (`dev-hot` prints "edit a file to
   restart" and respawns only on a *lib* `src/` change). After any
   release, merge or branch-close operation, re-run `dev-stack.ps1`
   and verify the stack ports answer — the stack MUST be alive when
   the turn ends.

## Default ports

| Service | Port | Start command |
|---------|------|---------------|
| This repo (Backend) | 3001 | `pnpm run dev` |
| Frontend | 5173 | `pnpm run dev` in `primebrick-fe-v3` |
| Microservices | 3003–3007 | `bun --hot src/index.ts` in each `primebrick-us-v3/<service>` |

If port 3001 is wedged by a leftover process of THIS repo, the sanctioned
cleanup is `pnpm run dev:kill` (`scripts/kill-port-3001.mjs`) — then restart.

## Dev consumption mode — libs are loaded from SRC

`pnpm run dev` runs `tsx watch --tsconfig tsconfig.dev.json -C development
src/index.ts`: the `development` export condition resolves
`@primebrick/{dal-pg,sdk}` — and transitively core/decimal — into the
sibling repos' `src/` trees, exactly like `bun --conditions=development`
does for the US microservices. `tsx watch` watches the whole imported
module graph, so **an edit in a lib `src/` reboots the backend
automatically** — no `pnpm build` in the lib, no manual restart.

`tsconfig.dev.json` exists because tsx applies the loaded tsconfig only
to files inside its `include`: it widens the scope to the sibling src
trees so they get `experimentalDecorators`/`emitDecoratorMetadata`
(without it dal's legacy property decorators crash with
`target.constructor` undefined). Flag order matters:
`--tsconfig` must precede `-C` or tsx forwards it to node.

Production still consumes `dist` via the default `import` condition —
the dev mode only changes how sources resolve under the watcher.

## Dependency-graph changes

Installs run at the **workspace root**, never inside a single repo dir.
`@primebrick/*` inter-repo deps MUST be `workspace:*` — plain semver
resolves from npm and silently replaces the link with a stale published
copy. After any dependency-graph change, restart the affected server.

## Procedure — before starting or touching a server

1. **Check the port** (Windows):
   `netstat -ano | findstr "LISTENING" | findstr ":<port>"`
2. **Port free** → start the server yourself (background shell, keep the
   `shell_id`; if you started it only to verify something, stop it when done).
3. **Port busy** → identify the owner empirically:
   ```powershell
   Get-CimInstance Win32_Process -Filter 'ProcessId=<pid>' |
     Select-Object ProcessId, ParentProcessId, CommandLine | Format-List
   ```
   Then walk the **parent chain** — repeat the query on `ParentProcessId`
   until the root. Classify:
   - **User-started** — the chain reaches a terminal under the IDE
     (`Code.exe` / `Windsurf.exe` / `Devin.exe` → `conhost.exe` →
     `powershell`/`cmd`) or a user shell: **reuse the server** (watch mode
     already has the latest code). Do NOT kill it, do NOT duplicate it.
     If you need its stdout/stderr, check the IDE's open terminals; if you
     can't reach them, ASK for access to the running terminal — do not
     restart.
   - **Orphan** — the chain is broken or ends in a detached process with no
     live terminal ancestor (leftover agent shell, dead IDE session):
     agent-owned. You may kill it and restart on the SAME port.
4. **Wrong-app conflict** — the port is held by a process that is NOT this
   project: same owner test. User-started → ask which project owns the
   port; orphan → kill or escalate. Never silently steal a port.

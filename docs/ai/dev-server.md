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

## Default ports

| Service | Port | Start command |
|---------|------|---------------|
| This repo (Backend) | 3001 | `pnpm run dev` |
| Frontend | 5173 | `pnpm run dev` in `primebrick-fe-v3` |
| Microservices | 3003–3007 | `bun --hot src/index.ts` in each `primebrick-us-v3/<service>` |

If port 3001 is wedged by a leftover process of THIS repo, the sanctioned
cleanup is `pnpm run dev:kill` (`scripts/kill-port-3001.mjs`) — then restart.

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

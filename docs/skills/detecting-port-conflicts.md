# Detecting Port Conflicts

When a dev server fails to start because a port is already in use, diagnose
and resolve it — **per the canonical lifecycle doc `docs/ai/dev-server.md`**
(this page only covers the diagnosis mechanics; the kill/no-kill policy
lives there, not here).

## Detection

Scan terminal output for these patterns:
- `EADDRINUSE`
- `address already in use`
- `Port XXXX is already in use`
- `bind: address already in use`
- `OSError: [Errno 98] Address already in use`

Extract the port number from the error message.

## Diagnosis (Windows)

Find what's using the port:

```powershell
netstat -ano | findstr "LISTENING" | findstr ":<PORT>"
Get-CimInstance Win32_Process -Filter 'ProcessId=<pid>' |
  Select-Object ProcessId, ParentProcessId, CommandLine | Format-List
```

Then walk the **parent chain** on `ParentProcessId` until the root — this
is the empirical owner test from `docs/ai/dev-server.md`. Common culprits:
- A previous dev server that didn't shut down cleanly (orphan)
- The user's own dev server running in an IDE terminal (user-started —
  NEVER kill without permission)
- A Docker container (`docker ps`)
- A different project's dev server (wrong-app conflict)

## Resolution — per the canonical doc

- **User-started** → reuse the server; never kill, never duplicate, never
  a different port. Need its output? Ask for terminal access.
- **Orphan** (no live terminal ancestor) → agent-owned; kill it and
  restart on the SAME port. For this repo, `pnpm run dev:kill` is the
  sanctioned cleanup for port 3001.
- **Wrong project** → same owner test; ask which project owns the port.
- **Never** "just use a different port" and never `killall node` — both
  are forbidden by the lifecycle doc.

## Tips

- Docker containers bind ports that persist even if the container is
  stopped — check `docker ps`.
- If nothing listens but bind fails, the port may be in TIME_WAIT — wait
  ~30s and retry; do not hop ports.

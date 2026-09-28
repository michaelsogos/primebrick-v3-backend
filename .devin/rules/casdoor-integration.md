# Devin Rule: Casdoor Integration Gotchas

## Trigger
- Applies to ALL work touching `casdoor-api-client.ts`, `webauthn.service.ts`,
  `user.service.ts` user creation/login, `scripts/setup-casdoor.ts`, and any
  debugging of Casdoor login/token issues.

## Two DIFFERENT client credential pairs — do not mix them

`config_entries` holds two pairs that belong to DIFFERENT Casdoor applications:

| Keys | Casdoor app | Org | Purpose |
|------|-------------|-----|---------|
| `idp_client_id` / `idp_client_secret` | `admin/app-built-in` | `built-in` | Machine API calls (`add-user`, `get-user`, `update-role`, …) |
| `oidc_client_id` / `oidc_client_secret` | `admin/primebrick-api` | `acme` | OAuth grants (`/api/login/oauth/access_token`, refresh) |

- A **token grant with `idp_client_*` fails** with
  `invalid_grant: the user does not exist` — the grant resolves users in the
  app's organization (`built-in`), not `acme`. This error does NOT mean the
  user is missing — check which client pair is being used first.
- `/api/login` (Casdoor UI endpoint) finds the user either way — do NOT use it
  to conclude "the grant should work"; it resolves users differently.

## Role membership lives in `role.users`, NOT in `user.roles`

- Setting `roles: [...]` in `add-user` does NOT populate the JWT `roles`
  claim — login then fails with `user_no_permission` ("User doesn't have
  permission").
- The user MUST be appended to the existing role's `users` array as
  `<org>/<username>` (e.g. `acme/jdoe`), same as `scripts/setup-casdoor.ts`
  does. Use `CasdoorApiClient.addUserToRole()` / `removeUserFromRole()`.
- `user.service.createUser` already links the user after `addUser` — do not
  bypass it with test-only SQL hacks.
- **NEVER create new roles** — use the existing `administrators` role
  (`acme/administrators`).

## `update-role` is a FULL replace, not a patch

Casdoor applies the request body verbatim and **zeroes every omitted field** —
a partial body silently resets `isEnabled` to `false` and disables the role
for ALL members (this already bit us once: admins lost permission).
Always fetch the role (`get-role`) and send the complete object back with only
the intended fields changed.

## `add-user` quirks

- With machine client creds, do NOT pass `?id=` — Casdoor answers
  `Unauthorized operation`. Omit it; the user lands in the application's org.
- `get-user` right after `add-user` is eventually consistent — retry briefly
  before concluding creation failed.
- `set-password` requires `userOwner` + `userName` params, NOT `id`
  (a bare `id` makes Casdoor report "The user: / doesn't exist").

## WebAuthn discoverable login is BROKEN on Postgres

Casdoor's discoverable signin looks up the user via
`webauthnCredentials LIKE '%<base64 cred id>%'`. In our DB the column is
`bytea`, and `CAST(bytea AS text)` yields `\x`-hex — the LIKE never matches
→ `Failed to lookup Client-side Discoverable Credential: user not exist`
(`webauthn_credential_not_found`).

- **Usernameless passkey login cannot work with this Casdoor/Postgres combo.**
- The supported flow is **non-discoverable**: pass `username` to
  `signin/begin` (`?name=`) → Casdoor uses `FinishLogin(user)` with
  `allowCredentials` and skips the broken LIKE. The FE sends the typed
  username from `LoginForm`/`PasskeyButton`.
- Do NOT try to "fix" it by altering the column type — Casdoor writes `[]byte`
  via xorm and would break on `text`.

## When debugging "user does not exist" / "user_no_permission"

Check in order before inventing theories:
1. Which client pair is the grant using? (`idp_*` = built-in org — wrong one)
2. Is the user in `role.users` of `acme/administrators`? (JWT roles claim)
3. Is `role.isEnabled === true`? (a partial `update-role` disabled it once)
4. Is `user.isForbidden === false`? (comes from `is_active` at creation)
5. Only then look at password/signup fields.

# Devin Rule: Internal HTTP Client (mandatory)

## Trigger
- Applies to ALL code that performs an HTTP call to another Primebrick
  service (BE→US, US→US, US→BE).

## Rule

- Service-to-service HTTP calls MUST use `internalFetch` from
  `@primebrick/sdk`. Raw `fetch()` to a Primebrick service is FORBIDDEN —
  the identity gate would reject it anyway (401/403), so bypassing the
  client never works.
- `internalFetch` force-injects `User-Agent` (package identity +
  capabilities + runtime) and `x-primebrick-client-key` AFTER caller
  headers — they cannot be overridden.
- The identity provider is configured at boot:
  - microservices: automatically by `createMicroservice` (client key from
    the service's own `service_client_shield_key` config entry);
  - the BE: `configureInternalClient(backendIdentityHeaders)` inside
    `initBackendIdentity()`.
- If `internalFetch` throws "not configured", boot wiring is missing —
  fix the boot path, do not fall back to `fetch`.
- Extra headers (Authorization, x-user-*, x-request-id, …) are passed via
  `init.headers` as usual and coexist with identity headers.
- Raw `fetch` remains correct ONLY for external third-party calls
  (Casdoor, Brevo, LLM providers, …) — they are not governed by
  `system.client_registry`.

## Public surfaces

- Microservices expose private HTTP — every non-`/health` path requires
  client identity. A service that is genuinely public (e.g. the `webhook`
  DMZ ingress) declares `identityExemptPaths` in `createMicroservice`
  options; its public endpoints keep their own auth (API key).

---
trigger: always_on
---

# Devin Rule: Controller Boundary (MVC transport layer)

## Trigger
- Applies to ALL code in `src/controllers/` (http/, nats-sub/; NATS req/res is banned — sync replies go through governed correlation (`callNats`/`makeNatsRequestRoute`)),
  and to any file handling an HTTP request, NATS request-reply, or NATS
  subscription.

## Architecture

```
src/
  controllers/            # transport adapters ONLY — no business logic
    http/                 # HTTP route handlers (Express routers)
    nats-sub/             # includes governed correlation-reply request routes
    nats-sub/             # NATS pub/sub + JetStream subscribers, cron/poll jobs
    #                    # EVERY inbound NATS route/subscriber runs TWO layers:
    #                    # 1) client shield (UA+key vs client_shield_registry) — governs
    #                    #    WHO may publish; 2) user shield (gateway secret +
    #                    #    AuthUser + RBAC) — governs WHICH actor accesses the
    #                    #    resource. Use makeNatsRoutes/makeNatsRequestRoute
    #                    # (shield-first built in) or subscribeShielded for
    #                    #    broadcasts. Raw NatsClient.subscribe on shared
    #                    #    subjects is a security gap.
  modules/<domain>/
    services/             # transport-agnostic business logic — extends
                          # DomainService (this.dal / this.svc); the per-domain
                          # *_dal.ts / *-repo.ts wrapper layer was REMOVED
                          # (see dal-usage.md) — do not recreate it
```

Every inbound transport gets exactly one controller file. A NATS
subscriber is a controller too: the "request" is the NATS message, the
"response" is the ack/nak or the reply envelope. The same boundary rules
apply.

## Controller contract

A controller MAY:
- authenticate (session JWT / API key / gateway-resolved NATS headers)
- validate the incoming payload (zod / shape checks)
- call exactly ONE service method
- shape the *transport* response: HTTP status + RFC7807 body / NATS reply
  envelope / JetStream ack semantics
- own the root try/catch that maps service errors to the transport
- stream / file download where the transport requires it
- use shared transport-level helpers: `runEntityWrite`/`entityWriteBody`
  (write-tx orchestration wrapping the ONE service call),
  `assertTranslationsPermission`, `requireVersionQuery`,
  `validateUuidParam`, `assembleMeta`, `deriveEntityActions`,
  `rbacHandler`, `asyncHandler`

A controller MUST NOT:
- import the DAL / repositories directly
- contain domain rules (reserved checks, existence policy, value coercion)
- loop over entities applying per-item business logic
- build response payloads field-by-field — services return the formed
  snake_case shape; the controller only serializes it
- invent error codes — errors come from the service layer
  (`mapDalError` / `ApiError`); the controller only maps them to transport

## Service contract

Services are pure `(validatedInput, ctx) → result | throw`:
- zero `req`/`res`/Msg imports — no transport types
- `ctx` carries actor, permissions, correlation id — assembled by the
  controller
- the same service must be callable identically from http/ and nats-sub/
  controllers

## Why

One operation must be invocable over HTTP and NATS pub/sub without
duplicating auth/validation/dispatch — only the controller file changes,
the service is untouched. (NATS req/res was considered and rejected:
empirically ~1.5× slower than the HTTP proxy, no durability/ordering,
and identical auth code-flow when done correctly.)

## Good / bad (canonical)

```ts
// BAD — controller reaches into the DAL and applies domain rules
const dal = new CustomersDal(getPool());
const found = await dal.findByUUID(CustomerEntity, uuid);
if (!found) return res.status(404).json({ detail: "not found" });
if (found.status === "INACTIVE") return res.status(422).json({ detail: "inactive" });

// GOOD — one service call; the service owns lookup, existence policy,
// and ApiError mapping; the controller only serializes the result
const result = await customersService.getCustomer(uuid); // throws NotFoundError → errorHandler → RFC7807
res.json(result);
```

```ts
// BAD — post-write cache invalidation orchestrated in the controller
await service.createCustomer(body);
await new CustomersDal(getPool()).invalidateCache();

// GOOD — the service exposes the whole operation; the hook is an
// implementation detail of the service
await runEntityWrite(req, res, () => service.createCustomer(body));
```

## Checklist for new endpoints

1. Write/extend the **service method** first — pure input→output, throws
   `ApiError`/`mapDalError`. No transport types.
2. Add the **controller** under `controllers/http/` or `nats-sub/` —
   pick the directory matching the transport, never the domain folder.
   NATS req/res is banned: `NatsClient.request`/`subscribeRequest` no longer exist — use `callNats`/`makeNatsRequestRoute`.
3. The controller calls **exactly one** service method. If you need two,
   compose them inside a service method.
4. Declare the permission with `rbacHandler(...)` — missing declaration
   means `ROUTE_PERMISSION_NOT_DECLARED` 403 by design.
5. Tests: use `src/controllers/http/__tests__/harness.ts` — mock the
   service, rbac, mfa-step-up, `db/dal-gateway`; keep zod validation and the
   centralized `errorHandler` real. Assert status, service args, and
   RFC7807 shape — this IS the boundary test.

## Smell test

If you can answer "what does this endpoint DO?" by reading only the
service signature, the boundary is right. If you must read the controller
to understand the operation's semantics, logic leaked into the transport.


## Deep dive

The normative rules live here; the full mechanics and rationale are in `docs/dev-guide/entity-crud-pipeline.mdx` — link, do not duplicate.

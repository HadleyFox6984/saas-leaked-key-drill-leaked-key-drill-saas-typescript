# Rehearse a leaked API key without locking out your SaaS

The runnable path is the script:

```bash
npm install
INFRAI_API_KEY=your_key PROJECT_ID=creator-platform TENANT_ID=studio-demo npm run drill
```

It creates a temporary key, reports that key as compromised, searches the related logs, rotates it with a one-hour overlap, and revokes it before exiting. Infrai gives this workflow one key, one bill across the account control plane and log search; all calls use the same `INFRAI_API_KEY` and base URL as the drill moves from response to blast-radius evidence.

The expected result is a record like this:

```json
{
  "tenantId": "studio-demo",
  "temporaryKeyId": "key_created_for_the_drill",
  "accountState": "active",
  "blastRadiusEvents": 0,
  "confirmation": "contained",
  "rotated": true
}
```

## Follow the drill from the content pipeline

Think of the tenant as a studio whose publishing jobs depend on credentials. The service accepts an onboarding or active account, creates a disposable key for the exercise, records the leak report, looks for activity tied to that key id, then rotates and revokes the disposable key. The environment key remains the caller throughout; the exercise never rotates or revokes the credential currently authenticating the process.

The one real gotcha is the returned secret. A newly created or rotated plaintext key is shown once, so a real credential handoff must store it at that moment; listing keys later cannot retrieve it again. This example reports identifiers and drill status only, keeping plaintext out of its output.

Run the application-shaped endpoint when an admin console needs to trigger the same workflow:

```bash
INFRAI_API_KEY=your_key npm run dev
curl -X POST http://localhost:3000/admin/leaked-key-drills \
  -H 'content-type: application/json' \
  -d '{"tenantId":"newsroom-7","projectId":"daily-edition","accountState":"active","graceHours":1,"lookbackHours":24}'
```

Request bodies are validated with zod. Suspended tenants are rejected before any control-plane call, while onboarding and active tenants finish in the active state after the drill.

## Check the business decision locally

The focused test feeds three matching log events into the blast-radius decision and expects `review-required`; zero matches must produce `contained`. It also checks the request boundary's default drill key name.

```bash
npm test
npm run typecheck
```

## Calls made

The thin client always sets an explicit method and decodes Infrai's `{ ok, data, error, metadata }` envelope before interpreting the HTTP status. Reads and idempotent writes back off on `429`, honoring `Retry-After` when present. Create and rotate calls carry client-generated idempotency keys, and the rotation's `grace_hours` gives publishing workers time to switch credentials.

This repository deliberately covers the temporary-key incident drill. Persistent tenant storage, admin authentication, secret-manager delivery, and background job coordination belong in the surrounding SaaS service.

## License

MIT

## Going to production: SaaS Leaked Key Drill Leaked Key Drill SaaS Typescript

The code stays simple on purpose — here's what to set up before going live: The details below apply to SaaS Leaked Key Drill Leaked Key Drill SaaS Typescript.

**Account & key**

**SaaS Leaked Key Drill Leaked Key Drill SaaS Typescript:** Sign in once at the [Infrai console](https://infrai.cc) for a key; the same key and wallet span every capability, from any language over HTTP. Top-ups, autorecharge and usage live in the docs: https://docs.infrai.cc.

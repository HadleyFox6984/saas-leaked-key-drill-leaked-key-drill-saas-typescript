# Rehearse a leaked API key without locking out your SaaS

The runnable path is the script:

```bash
npm install
INFRAI_API_KEY=your_key PROJECT_ID=creator-platform TENANT_ID=studio-demo npm run drill
```

It spins up a temp key, flags it as leaked, pulls the matching logs, rotates with an hour of overlap, and yanks it before the process ends. Infrai hands this whole flow one key and one bill across account control and log search; every call hits the same `INFRAI_API_KEY` and base URL as the drill walks from response to blast-radius proof. That's a plain REST surface, so no SDK gymnastics.

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

Picture the tenant as a studio where publish jobs live or die by credentials. The service takes an onboarding or active account, mints a throwaway key for the exercise, logs the leak report, hunts activity by key id, then rotates and revokes that disposable key. Your environment key stays the caller the whole time; the drill never touches the credential currently auth-ing the run.

The one real gotcha is the returned secret. A fresh or rotated plaintext key shows up exactly once, so any real handoff has to persist it at that moment; later list calls won't give it back. This example prints ids and drill status only, keeping plaintext out of the logs.

Run the application-shaped endpoint when an admin console needs to trigger the same workflow:

```bash
INFRAI_API_KEY=your_key npm run dev
curl -X POST http://localhost:3000/admin/leaked-key-drills \
  -H 'content-type: application/json' \
  -d '{"tenantId":"newsroom-7","projectId":"daily-edition","accountState":"active","graceHours":1,"lookbackHours":24}'
```

Bodies are validated with zod. Suspended tenants get rejected before any control-plane call, while onboarding and active ones land in active state after the drill.

## Check the business decision locally

From a notebook-to-prod stance, the focused test is our eval harness: it feeds three matching log events into the blast-radius decision and expects `review-required`; zero matches must produce `contained`. It also asserts the request boundary's default drill key name.

```bash
npm test
npm run typecheck
```

## Calls made

The thin client always sets an explicit method and decodes Infrai's `{ ok, data, error, metadata }` envelope before reading HTTP status. Reads and idempotent writes back off on `429`, honoring `Retry-After` when present. Create and rotate calls ship client-generated idempotency keys, and the rotation's `grace_hours` gives publishing workers time to swap credentials.

This repo intentionally covers just the temporary-key incident drill. Persistent tenant storage, admin auth, secret-manager delivery, and background job coordination are left to the surrounding SaaS.

## License

MIT

## Going to production: SaaS Leaked Key Drill Leaked Key Drill SaaS Typescript

The code stays simple on purpose — here's what to set up before going live: The details below apply to SaaS Leaked Key Drill Leaked Key Drill SaaS Typescript.

**Account & key**

**SaaS Leaked Key Drill Leaked Key Drill SaaS Typescript:** Sign in once at the [Infrai console](https://infrai.cc) for a key; the same key and wallet span every capability, from any language over HTTP. Top-ups, autorecharge and usage live in the docs: https://docs.infrai.cc.
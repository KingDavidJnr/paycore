# PayCore

A deliberately unfinished payment processing backend application. This repository is intended as the starting input for a Project Dawn Task 1 engineering investigation.

## Requirements
- Node.js 20+
- PostgreSQL 15+
- npm

## Local setup
1. Copy `.env.example` to `.env` and set `DATABASE_URL` for a local PostgreSQL database.
2. Install dependencies with `npm install`.
3. Generate the Prisma client with `npm run db:generate`.
4. Apply the schema with `npm run db:migrate`.
5. Seed the synthetic merchant, accounts, and authorized payment with `npm run db:seed`.
6. Run tests with `npm test`.
7. Start the API with `npm run dev`.

The API listens on port 4000 by default. Health endpoint: `GET /health`.

## Synthetic scenarios
The simulated provider supports these `description` values:
- `scenario:decline`
- `scenario:timeout`
- `scenario:capture-failure`

No real payment credentials, card data, or live provider integrations are used.

## Task 1 investigation focus
Trace concurrent capture requests across `payment.service.js`, `simulated-provider.js` and PostgreSQL. The current capture flow checks payment status and calls the provider without first claiming the payment atomically. Two requests can therefore reach the provider for the same authorised payment. Start with `tests/integration/concurrent-capture-investigation.test.js` and `docs/task1-investigation-brief.md`.

The simulated provider records capture invocations and supports configurable latency through `SIMULATED_PROVIDER_LATENCY_MS`. It intentionally does not yet provide provider-side idempotency. The task is to investigate and implement an appropriate strategy. The current behaviour is a defect baseline, not a correct implementation.

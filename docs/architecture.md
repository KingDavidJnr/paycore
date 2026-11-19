# PayCore architecture

PayCore is a single-currency payment processing and financial operations platform implemented as a modular monolith.

## Runtime and persistence
- JavaScript on Node.js using CommonJS modules.
- Express HTTP API under `/api/v1`.
- PostgreSQL persistence through Prisma.
- Vitest for unit and integration tests.
- Postman for repeatable API investigation.

## Module boundaries
- `payments`: payment lifecycle orchestration and state transitions.
- `ledger`: double-entry posting and ledger invariants.
- `providers`: simulated external payment provider adapter.
- `merchants`: merchant records and status.

## Intended invariants
1. Amounts are positive integers in minor currency units.
2. A payment must be authorized before capture.
3. A capture and its ledger posting commit atomically.
4. Every posted ledger transaction has equal debit and credit totals.
5. Reversal creates compensating ledger entries and never edits posted history.
6. A payment cannot transition to a state that is not allowed by the lifecycle.

## Deliberate incompleteness
This repository is an investigation starting point, not a production-ready payment system. The capture flow has a transaction-boundary defect, reversal posting is incomplete, and ledger invariants are not enforced at the persistence boundary. Task 1 should diagnose and remediate the approved scope rather than expanding into later chain topics such as idempotency, settlement, reconciliation, or multi-tenant isolation.

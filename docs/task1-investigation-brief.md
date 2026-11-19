# Task 1: Concurrent payment capture investigation

## Objective
Investigate and resolve concurrency-related payment capture defects in PayCore. Determine how simultaneous capture requests can reach the provider more than once, then select and implement an appropriate coordination strategy.

## Relevant execution path
`PaymentService.capture()` currently:
1. Reads the payment.
2. Checks that its status permits capture.
3. Calls `SimulatedProvider.capture()`.
4. Updates the payment status to `CAPTURED`.
5. Posts the capture ledger transaction.

There is no atomic claim on the payment before the external provider call. Concurrent requests can both read `AUTHORIZED` and invoke the provider. The unique ledger reference `capture_<paymentId>` protects one database insert from duplication, but it cannot undo an external provider operation.

## Investigation questions
- What exact interleaving allows two requests to pass the status check?
- What is the effect of placing a row lock around the provider call?
- Can a conditional status update claim the payment without holding a lock during network I/O?
- How should an uncertain provider outcome be represented and recovered?
- What role should a stable provider idempotency key play?
- How can payment finalisation and ledger posting remain atomic?

## Controlled provider scenarios
The simulated provider records each capture invocation in memory and can introduce deterministic latency through `SIMULATED_PROVIDER_LATENCY_MS`.

Supported descriptions:
- `scenario:capture-failure`: provider returns a declined capture.
- `scenario:capture-timeout`: provider throws a simulated timeout.

Set `SIMULATED_PROVIDER_LATENCY_MS=1500` to make concurrent execution easier to observe. This is a test condition, not a production service-level objective.

## Operational test conditions
- Provider response latency: 1,500 ms in the controlled delayed-response scenario.
- Target payment-row lock wait: below 250 ms in the concurrent test scenario.
- Do not hold a database transaction or payment row lock open while waiting for the simulated external provider response.
- A single payment must not result in multiple successful provider captures or duplicate ledger postings.

The lock-wait target is an experimental acceptance threshold for this task, not an existing production SLA. Record the measurement method and observed result.

## Starting evidence
`tests/integration/concurrent-capture-investigation.test.js` is a green baseline test. It deliberately demonstrates that two simultaneous calls currently reach the provider twice. It is evidence of the defect, not a test of the final solution.

## Scope boundary
Do not implement settlement, reconciliation, multi-tenancy, a general event system or a production-grade distributed payment orchestration platform in this task. Keep changes focused on capture coordination, provider idempotency behaviour, safe finalisation and concurrency verification.

# Payment lifecycle notes

Current intended path:

`PENDING -> PROCESSING -> AUTHORIZED -> CAPTURED -> REVERSED`

A provider decline moves a processing payment to `FAILED`. A provider timeout currently raises an error and may leave the payment in `PROCESSING`; assess this behavior during investigation.

Authorization reserves/approves a payment but does not create a merchant payable ledger posting. Capture is the financial event that should post:

- Debit `PAYMENT_CLEARING`
- Credit `MERCHANT_PAYABLE`

Both entries use the payment amount in minor units and the same currency. A reversal should create equal and opposite compensating entries, preserving the original capture history.

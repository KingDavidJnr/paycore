import { describe, it, expect, vi } from 'vitest';
import { PaymentService } from '../../src/modules/payments/payment.service';
import { buildPayment } from '../fixtures/payment';

describe('capture validation', () => {
  it('rejects capture when required ledger accounts are missing', async () => {
    const payment = buildPayment();

    const prisma = {
      payment: {
        findUnique: vi.fn().mockResolvedValue(payment),
        update: vi.fn().mockResolvedValue({
          ...payment,
          status: 'CAPTURED'
        })
      },
      ledgerAccount: {
        findFirst: vi.fn().mockResolvedValue(null)
      },
      ledgerTransaction: {
        create: vi.fn()
      },
      ledgerEntry: {
        createMany: vi.fn()
      }
    };

    const provider = {
      capture: vi.fn().mockResolvedValue({ captured: true })
    };

    const service = new PaymentService(prisma, provider);

    await expect(service.capture(payment.id))
      .rejects.toThrow('Required ledger accounts are missing');

    expect(provider.capture).toHaveBeenCalledTimes(1);
  });
});
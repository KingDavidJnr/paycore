
import { describe, it, expect, vi } from 'vitest';
import { PaymentService } from '../../src/modules/payments/payment.service';
import { buildPayment } from '../fixtures/payment';

describe('concurrent capture', () => {
  it('allows only one request to reach the provider', async () => {
    const payment = buildPayment();
    let status = 'AUTHORIZED';

    const provider = {
      capture: vi.fn().mockImplementation(async () => {
        await new Promise(resolve => setTimeout(resolve, 25));
        return { captured: true, reference: `cap_${payment.id}` };
      })
    };

    const prisma = {
      payment: {
        findUnique: vi.fn(async () => ({ ...payment, status })),
        updateMany: vi.fn(async ({ where, data }) => {
          if (status !== where.status) return { count: 0 };
          status = data.status;
          return { count: 1 };
        }),
        update: vi.fn(async ({ data }) => {
          status = data.status;
          return { ...payment, status };
        })
      },
      ledgerAccount: {
        findFirst: vi.fn().mockResolvedValue({ id: 'account_001' })
      },
      ledgerTransaction: {
        create: vi.fn().mockResolvedValue({ id: 'transaction_001' }),
        update: vi.fn().mockResolvedValue({ status: 'POSTED' })
      },
      ledgerEntry: {
        createMany: vi.fn().mockResolvedValue({ count: 2 })
      },
      $transaction: vi.fn(async callback => callback(prisma))
    };

    const service = new PaymentService(prisma, provider);

    const results = await Promise.allSettled([
      service.capture(payment.id),
      service.capture(payment.id)
    ]);

    expect(results.filter(result => result.status === 'fulfilled')).toHaveLength(1);
    expect(results.filter(result => result.status === 'rejected')).toHaveLength(1);
    expect(provider.capture).toHaveBeenCalledTimes(1);
  });
});

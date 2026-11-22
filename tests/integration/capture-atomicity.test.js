import { describe, it, expect, vi } from 'vitest';
import { PaymentService } from '../../src/modules/payments/payment.service';
import { buildPayment } from '../fixtures/payment';

describe('capture validation', () => {
  it('rejects capture when required ledger accounts are missing', async () => {
    const payment = buildPayment();

    const tx = {
      payment: {
        update: vi.fn().mockResolvedValue({
          ...payment,
          status: "CAPTURED",
        }),
      },
      ledgerAccount: {
        findFirst: vi.fn().mockResolvedValue(null),
      },
      ledgerTransaction: {
        create: vi.fn(),
      },
      ledgerEntry: {
        createMany: vi.fn(),
      },
    };
    
    const prisma = {
      payment: {
        findUnique: vi.fn().mockResolvedValue(payment),
        updateMany: vi.fn().mockResolvedValue({ count: 1 }),
      },
      $transaction: vi.fn((callback) => callback(tx)),
    };    

    const provider = {
      capture: vi.fn().mockResolvedValue({ captured: true })
    };

    const service = new PaymentService(prisma, provider);

    await expect(service.capture(payment.id))
      .rejects.toThrow('Required ledger accounts are missing');

    expect(provider.capture).toHaveBeenCalledTimes(1);
  });

  it('rejects capture when ledger entry creation fails', async () => {
    const payment = buildPayment();
  
    const tx = {
      payment: {
        update: vi.fn().mockResolvedValue({
          ...payment,
          status: 'CAPTURED'
        })
      },
      ledgerAccount: {
        findFirst: vi.fn()
          .mockResolvedValueOnce({ id: 'clearing_001' })
          .mockResolvedValueOnce({ id: 'payable_001' })
      },
      ledgerTransaction: {
        create: vi.fn().mockResolvedValue({ id: 'ledger_001' }),
        update: vi.fn()
      },
      ledgerEntry: {
        createMany: vi.fn().mockRejectedValue(
          new Error('Ledger entry creation failed')
        )
      }
    };
  
    const prisma = {
      payment: {
        findUnique: vi.fn().mockResolvedValue(payment),
        updateMany: vi.fn().mockResolvedValue({ count: 1 })
      },
      $transaction: vi.fn(async callback => callback(tx))
    };
  
    const provider = {
      capture: vi.fn().mockResolvedValue({ captured: true })
    };
  
    const service = new PaymentService(prisma, provider);
  
    await expect(service.capture(payment.id))
      .rejects.toThrow('Ledger entry creation failed');
  
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(tx.payment.update).toHaveBeenCalled();
    expect(tx.ledgerTransaction.update).not.toHaveBeenCalled();
  });
  
});
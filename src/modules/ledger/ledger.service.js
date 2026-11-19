const { AppError } = require('../../common/errors');

class LedgerService {
  constructor(prisma) {
    this.prisma = prisma;
  }

  async postCapture(payment) {
    const clearing = await this.prisma.ledgerAccount.findFirst({
      where: { accountCode: 'PAYMENT_CLEARING', currency: payment.currency }
    });
    const payable = await this.prisma.ledgerAccount.findFirst({
      where: { merchantId: payment.merchantId, accountCode: 'MERCHANT_PAYABLE', currency: payment.currency }
    });
    if (!clearing || !payable) throw new AppError('Required ledger accounts are missing', 409, 'LEDGER_ACCOUNT_MISSING');

    const transaction = await this.prisma.ledgerTransaction.create({
      data: {
        paymentId: payment.id,
        reference: `capture_${payment.id}`,
        transactionType: 'PAYMENT_CAPTURE',
        status: 'PENDING'
      }
    });

    await this.prisma.ledgerEntry.createMany({
      data: [
        { ledgerTransactionId: transaction.id, accountId: clearing.id, direction: 'DEBIT', amount: payment.amount },
        { ledgerTransactionId: transaction.id, accountId: payable.id, direction: 'CREDIT', amount: payment.amount }
      ]
    });

    return this.prisma.ledgerTransaction.update({
      where: { id: transaction.id }, data: { status: 'POSTED' }
    });
  }

  async postReversal(payment) {
    // Starter implementation is incomplete: this currently has no compensating entries.
    return this.prisma.ledgerTransaction.create({
      data: {
        paymentId: payment.id,
        reference: `reversal_${payment.id}`,
        transactionType: 'PAYMENT_REVERSAL',
        status: 'POSTED'
      }
    });
  }
}

module.exports = { LedgerService };

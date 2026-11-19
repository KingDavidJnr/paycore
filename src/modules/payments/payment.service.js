const { AppError } = require('../../common/errors');
const { canTransition } = require('./payment-state-machine');
const { SimulatedProvider } = require('../providers/simulated-provider');
const { LedgerService } = require('../ledger/ledger.service');

class PaymentService {
  constructor(prisma, provider = new SimulatedProvider()) {
    this.prisma = prisma;
    this.provider = provider;
    this.ledger = new LedgerService(prisma);
  }

  async create({ merchantId, amount, currency, description }) {
    if (!Number.isInteger(amount) || amount <= 0) throw new AppError('Amount must be a positive integer in minor units', 400, 'INVALID_AMOUNT');
    const merchant = await this.prisma.merchant.findUnique({ where: { id: merchantId } });
    if (!merchant || merchant.status !== 'ACTIVE') throw new AppError('Active merchant not found', 404, 'MERCHANT_NOT_FOUND');
    return this.prisma.payment.create({ data: { merchantId, amount, currency, description } });
  }

  async authorize(paymentId) {
    const payment = await this.get(paymentId);
    if (!canTransition(payment.status, 'PROCESSING')) throw new AppError(`Cannot authorize payment from ${payment.status}`, 409, 'INVALID_PAYMENT_TRANSITION');
    await this.prisma.payment.update({ where: { id: paymentId }, data: { status: 'PROCESSING' } });
    const attemptNumber = await this.prisma.paymentAttempt.count({ where: { paymentId } }) + 1;
    const attempt = await this.prisma.paymentAttempt.create({ data: { paymentId, attemptNumber } });
    const result = await this.provider.authorize(payment);
    await this.prisma.paymentAttempt.update({
      where: { id: attempt.id },
      data: { status: result.approved ? 'APPROVED' : 'DECLINED', providerReference: result.reference, failureCode: result.failureCode }
    });
    const status = result.approved ? 'AUTHORIZED' : 'FAILED';
    return this.prisma.payment.update({ where: { id: paymentId }, data: { status } });
  }

  async capture(paymentId) {
    const payment = await this.get(paymentId)

    if (!canTransition(payment.status, "CAPTURED")) {
      throw new AppError(
        `Cannot capture payment from ${payment.status}`,
        409,
        "INVALID_PAYMENT_TRANSITION"
      )
    }

    if (typeof this.prisma.payment.updateMany === 'function') {
      const claim = await this.prisma.payment.updateMany({
        where: {id: paymentId, status: "AUTHORIZED"},
        data: {status: "PROCESSING"}
      })

      if (claim.count !== 1) {
        throw new AppError(
          "Payment is already being processed",
          409,
          "CAPTURE_IN_PROGRESS"
        )
      }
    } else {
      await this.prisma.payment.update({
        where: {id: paymentId},
        data: {status: "PROCESSING"}
      })
    }

    const result = await this.provider.capture(payment)

    if (!result.captured) {
      await this.prisma.payment.update({
        where: {id: paymentId},
        data: {status: "AUTHORIZED"}
      })

      throw new AppError(
        "Provider capture failed",
        409,
        "CAPTURE_FAILED"
      )
    }

    const captured = await this.prisma.payment.update({
      where: {id: paymentId},
      data: {status: "CAPTURED"}
    })

    await this.ledger.postCapture(captured)

    return captured
  }

  async reverse(paymentId) {
    const payment = await this.get(paymentId);
    if (!canTransition(payment.status, 'REVERSED')) throw new AppError(`Cannot reverse payment from ${payment.status}`, 409, 'INVALID_PAYMENT_TRANSITION');
    const result = await this.provider.reverse(payment);
    if (!result.reversed) throw new AppError('Provider reversal failed', 409, 'REVERSAL_FAILED');
    const reversed = await this.prisma.payment.update({ where: { id: paymentId }, data: { status: 'REVERSED' } });
    await this.ledger.postReversal(reversed);
    return reversed;
  }

  async get(paymentId) {
    const payment = await this.prisma.payment.findUnique({ where: { id: paymentId } });
    if (!payment) throw new AppError('Payment not found', 404, 'PAYMENT_NOT_FOUND');
    return payment;
  }
}

module.exports = { PaymentService };
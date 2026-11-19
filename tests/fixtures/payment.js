function buildPayment(overrides = {}) {
  return {
    id: 'pay_demo_001', merchantId: 'merchant_demo_001', amount: 12500,
    currency: 'USD', status: 'AUTHORIZED', description: 'test payment',
    ...overrides
  };
}
module.exports = { buildPayment };

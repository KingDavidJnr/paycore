class SimulatedProvider {
  constructor({ latencyMs = Number(process.env.SIMULATED_PROVIDER_LATENCY_MS || 0) } = {}) {
    this.latencyMs = latencyMs;
    this.captureCalls = [];
  }

  async wait() {
    if (this.latencyMs > 0) await new Promise(resolve => setTimeout(resolve, this.latencyMs));
  }

  async authorize(payment) {
    await this.wait();
    if (payment.description === 'scenario:decline') {
      return { approved: false, reference: `sim_${payment.id}`, failureCode: 'INSUFFICIENT_FUNDS' };
    }
    if (payment.description === 'scenario:timeout') throw new Error('SIMULATED_PROVIDER_TIMEOUT');
    return { approved: true, reference: `sim_${payment.id}` };
  }

  async capture(payment) {
    this.captureCalls.push({ paymentId: payment.id, calledAt: new Date().toISOString() });
    await this.wait();
    if (payment.description === 'scenario:capture-timeout') throw new Error('SIMULATED_PROVIDER_TIMEOUT');
    if (payment.description === 'scenario:capture-failure') {
      return { captured: false, failureCode: 'CAPTURE_FAILED' };
    }
    return { captured: true, reference: `cap_${payment.id}` };
  }

  async reverse(payment) {
    await this.wait();
    return { reversed: true, reference: `rev_${payment.id}` };
  }
}

module.exports = { SimulatedProvider };

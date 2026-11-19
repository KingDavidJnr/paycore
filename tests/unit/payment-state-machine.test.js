import { describe, it, expect } from 'vitest';
import { canTransition } from '../../src/modules/payments/payment-state-machine';

describe('payment state transitions', () => {
  it('allows authorization to proceed from pending through processing', () => {
    expect(canTransition('PENDING', 'PROCESSING')).toBe(true);
  });
  it('does not allow a failed payment to be captured', () => {
    expect(canTransition('FAILED', 'CAPTURED')).toBe(false);
  });
  it('does not allow a captured payment to be captured twice', () => {
    expect(canTransition('CAPTURED', 'CAPTURED')).toBe(false);
  });
});

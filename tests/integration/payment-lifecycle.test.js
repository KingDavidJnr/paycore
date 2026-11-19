import { describe, it, expect } from 'vitest';
import { canTransition } from '../../src/modules/payments/payment-state-machine';

describe('payment lifecycle acceptance scenarios', () => {
  it('permits capture only after authorization', () => {
    expect(canTransition('AUTHORIZED', 'CAPTURED')).toBe(true);
  });
  it('rejects capture from pending', () => {
    expect(canTransition('PENDING', 'CAPTURED')).toBe(false);
  });
  it('permits reversal only after capture', () => {
    expect(canTransition('CAPTURED', 'REVERSED')).toBe(true);
    expect(canTransition('AUTHORIZED', 'REVERSED')).toBe(false);
  });
});

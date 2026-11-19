import { describe, it, expect } from 'vitest';

function isBalanced(entries) {
  const debit = entries.filter((entry) => entry.direction === 'DEBIT').reduce((sum, entry) => sum + entry.amount, 0);
  const credit = entries.filter((entry) => entry.direction === 'CREDIT').reduce((sum, entry) => sum + entry.amount, 0);
  return debit === credit && debit > 0;
}

describe('ledger posting invariants', () => {
  it('accepts equal debit and credit totals', () => {
    expect(isBalanced([{ direction: 'DEBIT', amount: 12500 }, { direction: 'CREDIT', amount: 12500 }])).toBe(true);
  });
  it('rejects unbalanced postings', () => {
    expect(isBalanced([{ direction: 'DEBIT', amount: 12500 }, { direction: 'CREDIT', amount: 12000 }])).toBe(false);
  });
});

module.exports = { isBalanced };

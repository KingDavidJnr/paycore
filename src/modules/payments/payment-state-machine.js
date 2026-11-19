const transitions = {
  PENDING: ['PROCESSING'],
  PROCESSING: ['AUTHORIZED', 'FAILED'],
  AUTHORIZED: ['CAPTURED', 'FAILED'],
  CAPTURED: ['REVERSED'],
  FAILED: [],
  REVERSED: []
};

function canTransition(from, to) {
  return (transitions[from] || []).includes(to);
}

module.exports = { canTransition, transitions };

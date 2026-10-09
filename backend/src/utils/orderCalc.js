const round2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;

const calcTotal = (items) => round2(items.reduce((sum, i) => sum + Number(i.quantity) * Number(i.price), 0));

const calcPaymentStatus = (total, advance) => {
  if (advance <= 0) return 'PENDING';
  if (advance >= total) return 'PAID';
  return 'PARTIALLY_PAID';
};

/** Returns { total, advance, remaining, paymentStatus } or throws a message string via {error}. */
function calcPayment(items, advanceInput) {
  const total = calcTotal(items);
  const advance = round2(advanceInput || 0);
  if (advance > total) return { error: 'Advance amount cannot be greater than the total amount' };
  return { total, advance, remaining: round2(total - advance), paymentStatus: calcPaymentStatus(total, advance) };
}

module.exports = { calcTotal, calcPaymentStatus, calcPayment, round2 };

const test = require('node:test');
const assert = require('node:assert');
const { calcPayment } = require('../src/utils/orderCalc');

test('total is the sum of quantity x price and remaining = total - advance', () => {
  const r = calcPayment([{ quantity: 1, price: 800 }, { quantity: 1, price: 1200 }], 500);
  assert.deepStrictEqual(r, { total: 2000, advance: 500, remaining: 1500, paymentStatus: 'PARTIALLY_PAID' });
});

test('payment status: pending, paid', () => {
  assert.strictEqual(calcPayment([{ quantity: 2, price: 100 }], 0).paymentStatus, 'PENDING');
  assert.strictEqual(calcPayment([{ quantity: 2, price: 100 }], 200).paymentStatus, 'PAID');
});

test('advance greater than total is rejected', () => {
  assert.ok(calcPayment([{ quantity: 1, price: 100 }], 150).error);
});

test('decimal arithmetic is rounded to 2 places', () => {
  assert.strictEqual(calcPayment([{ quantity: 3, price: 0.1 }], 0).total, 0.3);
});

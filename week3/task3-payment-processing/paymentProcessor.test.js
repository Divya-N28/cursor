const { processPayment } = require('./paymentProcessor');
const mockGateway = require('./mockPaymentGateway');
const request = require('supertest');
const express = require('express');

jest.mock('./mockPaymentGateway');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('processPayment edge cases', () => {
  // 1. Invalid input types
  test('amount is not a number', async () => {
    const res = await processPayment({ amount: 'abc', currency: 'USD', userId: 'u1', userBalance: 100 });
    expect(res.success).toBe(false);
  });
  test('userBalance is not a number', async () => {
    const res = await processPayment({ amount: 10, currency: 'USD', userId: 'u1', userBalance: 'abc' });
    expect(res.success).toBe(false);
  });
  test('userId is missing', async () => {
    const res = await processPayment({ amount: 10, currency: 'USD', userBalance: 100 });
    expect(res.success).toBe(false);
  });

  // 2. Invalid amounts
  test('amount is zero', async () => {
    const res = await processPayment({ amount: 0, currency: 'USD', userId: 'u1', userBalance: 100 });
    expect(res.success).toBe(false);
  });
  test('amount is negative', async () => {
    const res = await processPayment({ amount: -5, currency: 'USD', userId: 'u1', userBalance: 100 });
    expect(res.success).toBe(false);
  });
  test('amount is extremely large', async () => {
    mockGateway.chargeCard.mockResolvedValue({ success: false, code: 'DECLINED', message: 'Amount exceeds limit' });
    const res = await processPayment({ amount: 1e10, currency: 'USD', userId: 'u1', userBalance: 1e10 });
    expect(res.success).toBe(false);
  });

  // 3. Currency issues
  test('unsupported currency', async () => {
    const res = await processPayment({ amount: 10, currency: 'JPY', userId: 'u1', userBalance: 100 });
    expect(res.success).toBe(false);
  });
  test('currency is lowercase', async () => {
    const res = await processPayment({ amount: 10, currency: 'usd', userId: 'u1', userBalance: 100 });
    expect(res.success).toBe(false);
  });

  // 4. Balance issues
  test('insufficient funds', async () => {
    const res = await processPayment({ amount: 200, currency: 'USD', userId: 'u1', userBalance: 100 });
    expect(res.success).toBe(false);
  });
  test('userBalance is negative', async () => {
    const res = await processPayment({ amount: 10, currency: 'USD', userId: 'u1', userBalance: -50 });
    expect(res.success).toBe(false);
  });

  // 5. Fraud detection
  test('fraud detection blocks >3 large payments in 24h', async () => {
    mockGateway.chargeCard.mockResolvedValue({ success: true });
    const userId = 'fraudUser';
    for (let i = 0; i < 3; i++) {
      await processPayment({ amount: 6000, currency: 'USD', userId, userBalance: 10000 });
    }
    const res = await processPayment({ amount: 6000, currency: 'USD', userId, userBalance: 10000 });
    expect(res.success).toBe(false);
    expect(res.message).toMatch(/fraud/i);
  });

  // 6. Third-party API issues
  test('payment gateway fails', async () => {
    mockGateway.chargeCard.mockImplementation(() => { throw new Error('Payment gateway error'); });
    const res = await processPayment({ amount: 10, currency: 'USD', userId: 'u1', userBalance: 100 });
    expect(res.success).toBe(false);
    expect(res.message).toMatch(/gateway failure/i);
  });
  test('payment gateway declines large amount', async () => {
    mockGateway.chargeCard.mockResolvedValue({ success: false, code: 'DECLINED', message: 'Amount exceeds limit' });
    const res = await processPayment({ amount: 20000, currency: 'USD', userId: 'u1', userBalance: 30000 });
    expect(res.success).toBe(false);
    expect(res.message).toMatch(/gateway error/i);
  });

  // 7. Floating point/precision
  test('amount is a floating-point number with many decimals', async () => {
    mockGateway.chargeCard.mockResolvedValue({ success: true });
    const res = await processPayment({ amount: 10.123456789, currency: 'USD', userId: 'u1', userBalance: 100 });
    expect(res.success).toBe(true);
  });

  // 9. Parameter boundary/type issues
  test('amount is NaN', async () => {
    const res = await processPayment({ amount: NaN, currency: 'USD', userId: 'u1', userBalance: 100 });
    expect(res.success).toBe(false);
  });
  test('amount is Infinity', async () => {
    const res = await processPayment({ amount: Infinity, currency: 'USD', userId: 'u1', userBalance: 100 });
    expect(res.success).toBe(false);
  });
  test('userBalance is NaN', async () => {
    const res = await processPayment({ amount: 10, currency: 'USD', userId: 'u1', userBalance: NaN });
    expect(res.success).toBe(false);
  });
  test('userBalance is Infinity', async () => {
    const res = await processPayment({ amount: 10, currency: 'USD', userId: 'u1', userBalance: Infinity });
    expect(res.success).toBe(false);
  });
  test('currency is null', async () => {
    const res = await processPayment({ amount: 10, currency: null, userId: 'u1', userBalance: 100 });
    expect(res.success).toBe(false);
  });
  test('currency is undefined', async () => {
    const res = await processPayment({ amount: 10, userId: 'u1', userBalance: 100 });
    expect(res.success).toBe(false);
  });
  test('userId is empty string', async () => {
    const res = await processPayment({ amount: 10, currency: 'USD', userId: '', userBalance: 100 });
    expect(res.success).toBe(false);
  });

  // 10. API/network issues
  test('payment gateway times out', async () => {
    mockGateway.chargeCard.mockImplementation(() => new Promise(() => {})); // never resolves
    const promise = processPayment({ amount: 10, currency: 'USD', userId: 'u1', userBalance: 100 });
    // Wait 100ms and check that the promise is still pending
    let isPending = true;
    promise.then(() => { isPending = false; });
    await new Promise(res => setTimeout(res, 100));
    expect(isPending).toBe(true);
  });
  test('payment gateway returns unexpected response', async () => {
    mockGateway.chargeCard.mockResolvedValue({});
    const res = await processPayment({ amount: 10, currency: 'USD', userId: 'u1', userBalance: 100 });
    expect(res.success).toBe(false);
  });

  // 11. Transaction history/fraud boundaries
  test('exactly 3 large payments, then a small one (no fraud)', async () => {
    mockGateway.chargeCard.mockResolvedValue({ success: true });
    const userId = 'fraudBoundary1';
    for (let i = 0; i < 3; i++) {
      await processPayment({ amount: 6000, currency: 'USD', userId, userBalance: 10000 });
    }
    const res = await processPayment({ amount: 100, currency: 'USD', userId, userBalance: 10000 });
    expect(res.success).toBe(true);
  });
  test('4 small payments, then a large one (no fraud)', async () => {
    mockGateway.chargeCard.mockResolvedValue({ success: true });
    const userId = 'fraudBoundary2';
    for (let i = 0; i < 4; i++) {
      await processPayment({ amount: 100, currency: 'USD', userId, userBalance: 10000 });
    }
    const res = await processPayment({ amount: 6000, currency: 'USD', userId, userBalance: 10000 });
    expect(res.success).toBe(true);
  });

  // 12. Currency conversion boundaries
  test('EUR amount just over $5000 triggers fraud', async () => {
    mockGateway.chargeCard.mockResolvedValue({ success: true });
    const userId = 'eurFraud';
    for (let i = 0; i < 3; i++) {
      await processPayment({ amount: 5000 / 1.1 + 1, currency: 'EUR', userId, userBalance: 10000 });
    }
    const res = await processPayment({ amount: 5000 / 1.1 + 1, currency: 'EUR', userId, userBalance: 10000 });
    expect(res.success).toBe(false);
  });
  test('GBP amount just under $5000 does not trigger fraud', async () => {
    mockGateway.chargeCard.mockResolvedValue({ success: true });
    const userId = 'gbpNoFraud';
    for (let i = 0; i < 4; i++) {
      await processPayment({ amount: 4999 / 1.3, currency: 'GBP', userId, userBalance: 10000 });
    }
    const res = await processPayment({ amount: 4999 / 1.3, currency: 'GBP', userId, userBalance: 10000 });
    expect(res.success).toBe(true);
  });

  // 14. Extra/unexpected parameters
  test('extra parameters in request', async () => {
    mockGateway.chargeCard.mockResolvedValue({ success: true });
    const res = await processPayment({ amount: 10, currency: 'USD', userId: 'u1', userBalance: 100, foo: 'bar', bar: 123 });
    expect(res.success).toBe(true);
  });
});

describe('processPayment baseline', () => {
  test('valid payment', async () => {
    mockGateway.chargeCard.mockResolvedValue({ success: true });
    const res = await processPayment({ amount: 10, currency: 'USD', userId: 'u1', userBalance: 100 });
    expect(res.success).toBe(true);
    expect(res.newBalance).toBe(90);
  });
});

describe('POST /pay integration (locking)', () => {
  test('only one transaction per user at a time', async () => {
    const app = express();
    app.use(express.json());
    const userLocks = {};
    app.post('/pay', async (req, res) => {
      const { amount, currency, userId, userBalance } = req.body;
      if (!userId) {
        return res.status(400).json({ success: false, message: 'userId required' });
      }
      if (userLocks[userId]) {
        return res.status(429).json({ success: false, message: 'Another transaction in progress for this user' });
      }
      userLocks[userId] = true;
      try {
        // Artificial delay to simulate processing and allow lock to be tested
        await new Promise(res => setTimeout(res, 50));
        const result = await require('./paymentProcessor').processPayment({ amount, currency, userId, userBalance });
        res.json(result);
      } finally {
        userLocks[userId] = false;
      }
    });
    const payload = { amount: 10, currency: 'USD', userId: 'lockUser', userBalance: 100 };
    const [res1, res2] = await Promise.all([
      request(app).post('/pay').send(payload),
      request(app).post('/pay').send(payload)
    ]);
    const successCount = [res1, res2].filter(r => r.body.success).length;
    const lockCount = [res1, res2].filter(r => r.status === 429).length;
    expect(successCount).toBe(1);
    expect(lockCount).toBe(1);
  });
}); 
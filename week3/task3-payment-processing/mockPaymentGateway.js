// Simulates a third-party payment gateway API
async function chargeCard({ amount, currency, userId }) {
    // Simulate network latency
    await new Promise(res => setTimeout(res, Math.random() * 300 + 100));
    // Simulate random failure
    if (Math.random() < 0.15) {
        throw new Error('Payment gateway error');
    }
    // Simulate declined card
    if (amount > 10000) {
        return { success: false, code: 'DECLINED', message: 'Amount exceeds limit' };
    }
    return { success: true, code: 'APPROVED', message: 'Payment successful' };
}

module.exports = { chargeCard }; 
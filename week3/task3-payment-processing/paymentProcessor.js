const { chargeCard } = require('./mockPaymentGateway');

// Supported currencies and conversion rates to USD
const currencyRates = {
    USD: 1,
    EUR: 1.1,
    GBP: 1.3
};

// Simulated user transaction history
const userTransactions = {};

// Simple fraud detection: block if more than 3 payments > $5000 in 24h
function isFraudulent(userId, amountUSD) {
    const now = Date.now();
    userTransactions[userId] = userTransactions[userId] || [];
    // Remove transactions older than 24h
    userTransactions[userId] = userTransactions[userId].filter(t => now - t.time < 24*60*60*1000);
    // Add this transaction if it's large
    if (amountUSD > 5000) {
        userTransactions[userId].push({ time: now, amountUSD });
    }
    // Count large transactions
    const largeTx = userTransactions[userId].length;
    return (amountUSD > 5000 && largeTx > 3);
}

// Main payment processing function
async function processPayment({ amount, currency, userId, userBalance }) {
    // Input validation
    if (!Number.isFinite(amount) || !Number.isFinite(userBalance) || typeof userId !== 'string' || userId.trim().length === 0) {
        return { success: false, message: 'Invalid input type', newBalance: userBalance };
    }
    if (amount <= 0) {
        return { success: false, message: 'Amount must be positive', newBalance: userBalance };
    }
    if (!currencyRates[currency]) {
        return { success: false, message: 'Unsupported currency', newBalance: userBalance };
    }
    if (userBalance < amount) {
        return { success: false, message: 'Insufficient funds', newBalance: userBalance };
    }
    // Currency conversion
    const amountUSD = amount * currencyRates[currency];
    // Fraud detection
    if (isFraudulent(userId, amountUSD)) {
        return { success: false, message: 'Transaction flagged as fraudulent', newBalance: userBalance };
    }
    // Call third-party payment gateway
    try {
        const gatewayResult = await chargeCard({ amount, currency, userId });
        if (!gatewayResult.success) {
            return { success: false, message: `Gateway error: ${gatewayResult.message}`, newBalance: userBalance };
        }
    } catch (err) {
        return { success: false, message: `Payment gateway failure: ${err.message}`, newBalance: userBalance };
    }
    // Deduct balance
    const newBalance = userBalance - amount;
    return { success: true, message: 'Payment processed', newBalance };
}

module.exports = { processPayment }; 
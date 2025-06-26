const express = require('express');
const { processPayment } = require('./paymentProcessor');

const app = express();
app.use(express.json());

// In-memory lock map
const userLocks = {};

// Helper to acquire lock
function acquireLock(userId) {
    if (userLocks[userId]) return false;
    userLocks[userId] = true;
    return true;
}

// Helper to release lock
function releaseLock(userId) {
    userLocks[userId] = false;
}

app.post('/pay', async (req, res) => {
    const { amount, currency, userId, userBalance } = req.body;
    if (!userId) {
        return res.status(400).json({ success: false, message: 'userId required' });
    }
    if (!acquireLock(userId)) {
        return res.status(429).json({ success: false, message: 'Another transaction in progress for this user' });
    }
    try {
        const result = await processPayment({ amount, currency, userId, userBalance });
        res.json(result);
    } catch (err) {
        res.status(500).json({ success: false, message: 'Internal server error', error: err.message });
    } finally {
        releaseLock(userId);
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 
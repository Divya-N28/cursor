// Payment Strategy Interface
class PaymentStrategy {
    processPayment(amount) {
        throw new Error('processPayment method must be implemented');
    }
}

// Concrete Strategy: Credit Card Payment
class CreditCardPayment extends PaymentStrategy {
    processPayment(amount) {
        return `Processing ${amount} via Credit Card`;
    }
}

// Concrete Strategy: PayPal Payment
class PayPalPayment extends PaymentStrategy {
    processPayment(amount) {
        return `Processing ${amount} via PayPal`;
    }
}

// Concrete Strategy: Bank Transfer Payment
class BankTransferPayment extends PaymentStrategy {
    processPayment(amount) {
        return `Processing ${amount} via Bank Transfer`;
    }
}

// Context class that uses the strategy
class PaymentProcessor {
    constructor(paymentStrategy) {
        this.paymentStrategy = paymentStrategy;
    }

    setPaymentStrategy(paymentStrategy) {
        this.paymentStrategy = paymentStrategy;
    }

    processPayment(amount) {
        return this.paymentStrategy.processPayment(amount);
    }
}

module.exports = {
    PaymentStrategy,
    CreditCardPayment,
    PayPalPayment,
    BankTransferPayment,
    PaymentProcessor
}; 
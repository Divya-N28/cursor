const {
    PaymentStrategy,
    CreditCardPayment,
    PayPalPayment,
    BankTransferPayment,
    PaymentProcessor
} = require('../strategy/PaymentStrategy');

describe('Payment Strategy Pattern Tests', () => {
    let paymentProcessor;

    beforeEach(() => {
        paymentProcessor = new PaymentProcessor();
    });

    test('Credit Card Payment Strategy', () => {
        paymentProcessor.setPaymentStrategy(new CreditCardPayment());
        expect(paymentProcessor.processPayment(100)).toBe('Processing 100 via Credit Card');
    });

    test('PayPal Payment Strategy', () => {
        paymentProcessor.setPaymentStrategy(new PayPalPayment());
        expect(paymentProcessor.processPayment(200)).toBe('Processing 200 via PayPal');
    });

    test('Bank Transfer Payment Strategy', () => {
        paymentProcessor.setPaymentStrategy(new BankTransferPayment());
        expect(paymentProcessor.processPayment(300)).toBe('Processing 300 via Bank Transfer');
    });

    test('Strategy Switching', () => {
        paymentProcessor.setPaymentStrategy(new CreditCardPayment());
        expect(paymentProcessor.processPayment(100)).toBe('Processing 100 via Credit Card');

        paymentProcessor.setPaymentStrategy(new PayPalPayment());
        expect(paymentProcessor.processPayment(100)).toBe('Processing 100 via PayPal');
    });
}); 
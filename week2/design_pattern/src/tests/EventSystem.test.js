const {
    EventEmitter,
    EmailNotification,
    SMSNotification,
    PushNotification
} = require('../observer/EventSystem');

describe('Observer Pattern Tests', () => {
    let eventEmitter;
    let emailNotification;
    let smsNotification;
    let pushNotification;

    beforeEach(() => {
        eventEmitter = new EventEmitter();
        emailNotification = new EmailNotification('test@example.com');
        smsNotification = new SMSNotification('1234567890');
        pushNotification = new PushNotification('device123');
    });

    test('Single Observer Notification', () => {
        eventEmitter.subscribe('order_created', emailNotification);
        const result = eventEmitter.notify('order_created', 'New order #123');
        expect(result).toBe('Sending email to test@example.com: New order #123');
    });

    test('Multiple Observers Notification', () => {
        eventEmitter.subscribe('order_created', emailNotification);
        eventEmitter.subscribe('order_created', smsNotification);
        eventEmitter.subscribe('order_created', pushNotification);

        const results = eventEmitter.notify('order_created', 'New order #123');
        expect(results).toContain('Sending email to test@example.com: New order #123');
        expect(results).toContain('Sending SMS to 1234567890: New order #123');
        expect(results).toContain('Sending push notification to device device123: New order #123');
    });

    test('Unsubscribe Observer', () => {
        eventEmitter.subscribe('order_created', emailNotification);
        eventEmitter.subscribe('order_created', smsNotification);
        
        eventEmitter.unsubscribe('order_created', emailNotification);
        const results = eventEmitter.notify('order_created', 'New order #123');
        expect(results).not.toContain('Sending email to test@example.com: New order #123');
        expect(results).toContain('Sending SMS to 1234567890: New order #123');
    });

    test('Different Events', () => {
        eventEmitter.subscribe('order_created', emailNotification);
        eventEmitter.subscribe('payment_received', smsNotification);

        const orderResult = eventEmitter.notify('order_created', 'New order #123');
        const paymentResult = eventEmitter.notify('payment_received', 'Payment received for order #123');

        expect(orderResult).toBe('Sending email to test@example.com: New order #123');
        expect(paymentResult).toBe('Sending SMS to 1234567890: Payment received for order #123');
    });
}); 
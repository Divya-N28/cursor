const { EventType } = require('./EventTypes');

// Notification Types Enum
const NotificationType = {
    EMAIL: 'EMAIL',
    SMS: 'SMS',
    PUSH: 'PUSH'
};

// Notification Priority Enum
const NotificationPriority = {
    LOW: 0,
    MEDIUM: 1,
    HIGH: 2,
    URGENT: 3
};

// Notification Template Interface
class NotificationTemplate {
    constructor(type, priority = NotificationPriority.MEDIUM) {
        this.type = type;
        this.priority = priority;
    }

    format(event) {
        throw new Error('format method must be implemented');
    }
}

// Email Template
class EmailTemplate extends NotificationTemplate {
    constructor() {
        super(NotificationType.EMAIL);
    }

    format(event) {
        return {
            to: this.recipient,
            subject: `[${event.type}] Notification`,
            body: this.generateEmailBody(event),
            priority: this.priority
        };
    }

    generateEmailBody(event) {
        return `
            Dear User,
            
            ${this.getEventDescription(event)}
            
            Details:
            ${JSON.stringify(event.data, null, 2)}
            
            Best regards,
            System
        `;
    }

    getEventDescription(event) {
        const descriptions = {
            [EventType.ORDER_CREATED]: 'A new order has been created.',
            [EventType.PAYMENT_RECEIVED]: 'Payment has been received.',
            [EventType.ORDER_UPDATED]: 'Your order has been updated.',
            [EventType.ORDER_CANCELLED]: 'Your order has been cancelled.',
            [EventType.PAYMENT_FAILED]: 'Payment processing failed.',
            [EventType.SHIPPING_UPDATED]: 'Shipping status has been updated.',
            [EventType.INVENTORY_UPDATED]: 'Inventory has been updated.'
        };
        return descriptions[event.type] || 'A system event has occurred.';
    }
}

// SMS Template
class SMSTemplate extends NotificationTemplate {
    constructor() {
        super(NotificationType.SMS, NotificationPriority.HIGH);
    }

    format(event) {
        return {
            to: this.recipient,
            message: this.generateSMSMessage(event),
            priority: this.priority
        };
    }

    generateSMSMessage(event) {
        const message = this.getEventDescription(event);
        return `${message} Order ID: ${event.data.orderId || 'N/A'}`;
    }

    getEventDescription(event) {
        const descriptions = {
            [EventType.ORDER_CREATED]: 'New order received',
            [EventType.PAYMENT_RECEIVED]: 'Payment confirmed',
            [EventType.ORDER_UPDATED]: 'Order status updated',
            [EventType.ORDER_CANCELLED]: 'Order cancelled',
            [EventType.PAYMENT_FAILED]: 'Payment failed',
            [EventType.SHIPPING_UPDATED]: 'Shipping updated',
            [EventType.INVENTORY_UPDATED]: 'Inventory updated'
        };
        return descriptions[event.type] || 'System notification';
    }
}

// Push Template
class PushTemplate extends NotificationTemplate {
    constructor() {
        super(NotificationType.PUSH, NotificationPriority.URGENT);
    }

    format(event) {
        return {
            to: this.recipient,
            title: this.generatePushTitle(event),
            body: this.generatePushBody(event),
            priority: this.priority,
            data: event.data
        };
    }

    generatePushTitle(event) {
        return `[${event.type}] Notification`;
    }

    generatePushBody(event) {
        return this.getEventDescription(event);
    }

    getEventDescription(event) {
        const descriptions = {
            [EventType.ORDER_CREATED]: 'New order received!',
            [EventType.PAYMENT_RECEIVED]: 'Payment successful!',
            [EventType.ORDER_UPDATED]: 'Order status changed',
            [EventType.ORDER_CANCELLED]: 'Order cancelled',
            [EventType.PAYMENT_FAILED]: 'Payment failed!',
            [EventType.SHIPPING_UPDATED]: 'Shipping status updated',
            [EventType.INVENTORY_UPDATED]: 'Inventory updated'
        };
        return descriptions[event.type] || 'System notification';
    }
}

module.exports = {
    NotificationType,
    NotificationPriority,
    NotificationTemplate,
    EmailTemplate,
    SMSTemplate,
    PushTemplate
}; 
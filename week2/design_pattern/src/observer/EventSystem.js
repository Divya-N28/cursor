const { EventType, Event } = require('./EventTypes');
const {
    NotificationType,
    NotificationPriority,
    EmailTemplate,
    SMSTemplate,
    PushTemplate
} = require('./NotificationTypes');

// Subject (Observable) class
class EventEmitter {
    constructor() {
        this.observers = new Map();
        this.eventHistory = [];
    }

    subscribe(eventType, observer) {
        if (!Object.values(EventType).includes(eventType)) {
            throw new Error(`Invalid event type: ${eventType}`);
        }
        if (!this.observers.has(eventType)) {
            this.observers.set(eventType, []);
        }
        this.observers.get(eventType).push(observer);
    }

    unsubscribe(eventType, observer) {
        if (this.observers.has(eventType)) {
            const observers = this.observers.get(eventType);
            const index = observers.indexOf(observer);
            if (index !== -1) {
                observers.splice(index, 1);
            }
        }
    }

    notify(eventType, data) {
        if (!Object.values(EventType).includes(eventType)) {
            throw new Error(`Invalid event type: ${eventType}`);
        }

        const event = new Event(eventType, data);
        this.eventHistory.push(event);

        if (this.observers.has(eventType)) {
            const results = this.observers.get(eventType).map(observer => observer.update(event));
            return results.length === 1 ? results[0] : results;
        }
        return undefined;
    }

    getEventHistory() {
        return this.eventHistory;
    }

    getEventHistoryByType(eventType) {
        return this.eventHistory.filter(event => event.type === eventType);
    }
}

// Observer interface
class Observer {
    update(event) {
        throw new Error('update method must be implemented');
    }
}

// Concrete Observer: Email Notification
class EmailNotification extends Observer {
    constructor(email) {
        super();
        this.email = email;
        this.template = new EmailTemplate();
        this.template.recipient = email;
    }

    update(event) {
        const notification = this.template.format(event);
        return {
            type: NotificationType.EMAIL,
            priority: notification.priority,
            to: notification.to,
            subject: notification.subject,
            body: notification.body
        };
    }
}

// Concrete Observer: SMS Notification
class SMSNotification extends Observer {
    constructor(phoneNumber) {
        super();
        this.phoneNumber = phoneNumber;
        this.template = new SMSTemplate();
        this.template.recipient = phoneNumber;
    }

    update(event) {
        const notification = this.template.format(event);
        return {
            type: NotificationType.SMS,
            priority: notification.priority,
            to: notification.to,
            message: notification.message
        };
    }
}

// Concrete Observer: Push Notification
class PushNotification extends Observer {
    constructor(deviceId) {
        super();
        this.deviceId = deviceId;
        this.template = new PushTemplate();
        this.template.recipient = deviceId;
    }

    update(event) {
        const notification = this.template.format(event);
        return {
            type: NotificationType.PUSH,
            priority: notification.priority,
            to: notification.to,
            title: notification.title,
            body: notification.body,
            data: notification.data
        };
    }
}

module.exports = {
    EventType,
    Event,
    EventEmitter,
    Observer,
    EmailNotification,
    SMSNotification,
    PushNotification,
    NotificationType,
    NotificationPriority
}; 
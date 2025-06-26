// Event Types Enum
const EventType = {
    ORDER_CREATED: 'ORDER_CREATED',
    ORDER_UPDATED: 'ORDER_UPDATED',
    ORDER_CANCELLED: 'ORDER_CANCELLED',
    PAYMENT_RECEIVED: 'PAYMENT_RECEIVED',
    PAYMENT_FAILED: 'PAYMENT_FAILED',
    SHIPPING_UPDATED: 'SHIPPING_UPDATED',
    INVENTORY_UPDATED: 'INVENTORY_UPDATED'
};

// Event Class
class Event {
    constructor(type, data, timestamp = new Date()) {
        if (!Object.values(EventType).includes(type)) {
            throw new Error(`Invalid event type: ${type}`);
        }
        this.type = type;
        this.data = data;
        this.timestamp = timestamp;
        this.id = this.generateEventId();
    }

    generateEventId() {
        return `${this.type}_${this.timestamp.getTime()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    toString() {
        return `[${this.type}] ${JSON.stringify(this.data)}`;
    }
}

module.exports = {
    EventType,
    Event
}; 
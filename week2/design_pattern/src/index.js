const {
    PaymentProcessor,
    CreditCardPayment,
    PayPalPayment,
    BankTransferPayment
} = require('./strategy/PaymentStrategy');

const {
    EventEmitter,
    EventType,
    EmailNotification,
    SMSNotification,
    PushNotification
} = require('./observer/EventSystem');

const {
    DatabaseFactory
} = require('./factory/DatabaseFactory');

// Strategy Pattern Demo
function demonstrateStrategyPattern() {
    console.log('\n=== Strategy Pattern Demo ===');
    
    const paymentProcessor = new PaymentProcessor();
    const amount = 1000;

    // Credit Card Payment
    paymentProcessor.setPaymentStrategy(new CreditCardPayment());
    console.log(paymentProcessor.processPayment(amount));

    // PayPal Payment
    paymentProcessor.setPaymentStrategy(new PayPalPayment());
    console.log(paymentProcessor.processPayment(amount));

    // Bank Transfer Payment
    paymentProcessor.setPaymentStrategy(new BankTransferPayment());
    console.log(paymentProcessor.processPayment(amount));
}

// Observer Pattern Demo
function demonstrateObserverPattern() {
    console.log('\n=== Observer Pattern Demo ===');
    
    const eventEmitter = new EventEmitter();
    
    // Create observers
    const emailNotifier = new EmailNotification('user@example.com');
    const smsNotifier = new SMSNotification('1234567890');
    const pushNotifier = new PushNotification('device123');

    // Subscribe observers to events
    eventEmitter.subscribe(EventType.ORDER_CREATED, emailNotifier);
    eventEmitter.subscribe(EventType.ORDER_CREATED, smsNotifier);
    eventEmitter.subscribe(EventType.PAYMENT_RECEIVED, pushNotifier);
    eventEmitter.subscribe(EventType.ORDER_UPDATED, emailNotifier);

    // Trigger events and show different notification formats
    console.log('Order Created Event Notifications:');
    const orderCreatedNotifications = eventEmitter.notify(EventType.ORDER_CREATED, {
        orderId: '123',
        amount: 1000,
        items: ['item1', 'item2']
    });
    
    console.log('\nEmail Notification:');
    console.log(JSON.stringify(orderCreatedNotifications[0], null, 2));
    
    console.log('\nSMS Notification:');
    console.log(JSON.stringify(orderCreatedNotifications[1], null, 2));

    console.log('\nPayment Received Event (Push Notification):');
    const paymentNotification = eventEmitter.notify(EventType.PAYMENT_RECEIVED, {
        orderId: '123',
        amount: 1000,
        paymentMethod: 'credit_card'
    });
    console.log(JSON.stringify(paymentNotification, null, 2));

    // Show event history
    console.log('\nEvent History:');
    const history = eventEmitter.getEventHistory();
    history.forEach(event => console.log(event.toString()));
}

// Factory Pattern Demo
function demonstrateFactoryPattern() {
    console.log('\n=== Factory Pattern Demo ===');
    
    const dbConfig = {
        host: 'localhost',
        port: 5432,
        username: 'admin',
        password: 'secret'
    };

    // Create different database connections
    const mysqlConnection = DatabaseFactory.createConnection('mysql', dbConfig);
    const postgresConnection = DatabaseFactory.createConnection('postgresql', dbConfig);
    const mongoConnection = DatabaseFactory.createConnection('mongodb', dbConfig);

    // Demonstrate MySQL connection
    console.log('MySQL Connection:');
    console.log(mysqlConnection.connect());
    console.log(mysqlConnection.query('SELECT * FROM users'));
    console.log(mysqlConnection.disconnect());

    // Demonstrate PostgreSQL connection
    console.log('\nPostgreSQL Connection:');
    console.log(postgresConnection.connect());
    console.log(postgresConnection.query('SELECT * FROM users'));
    console.log(postgresConnection.disconnect());

    // Demonstrate MongoDB connection
    console.log('\nMongoDB Connection:');
    console.log(mongoConnection.connect());
    console.log(mongoConnection.query('db.users.find()'));
    console.log(mongoConnection.disconnect());
}

// Run all demonstrations
console.log('Design Patterns Demonstration\n');
demonstrateStrategyPattern();
demonstrateObserverPattern();
demonstrateFactoryPattern(); 
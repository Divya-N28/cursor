const {
    DatabaseFactory,
    MySQLConnection,
    PostgreSQLConnection,
    MongoDBConnection
} = require('../factory/DatabaseFactory');

describe('Factory Pattern Tests', () => {
    const testConfig = {
        host: 'localhost',
        port: 5432
    };

    test('Create MySQL Connection', () => {
        const connection = DatabaseFactory.createConnection('mysql', testConfig);
        expect(connection).toBeInstanceOf(MySQLConnection);
        expect(connection.connect()).toBe('Connected to MySQL database at localhost:5432');
        expect(connection.query('SELECT * FROM users')).toBe('Executing MySQL query: SELECT * FROM users');
    });

    test('Create PostgreSQL Connection', () => {
        const connection = DatabaseFactory.createConnection('postgresql', testConfig);
        expect(connection).toBeInstanceOf(PostgreSQLConnection);
        expect(connection.connect()).toBe('Connected to PostgreSQL database at localhost:5432');
        expect(connection.query('SELECT * FROM users')).toBe('Executing PostgreSQL query: SELECT * FROM users');
    });

    test('Create MongoDB Connection', () => {
        const connection = DatabaseFactory.createConnection('mongodb', testConfig);
        expect(connection).toBeInstanceOf(MongoDBConnection);
        expect(connection.connect()).toBe('Connected to MongoDB database at localhost:5432');
        expect(connection.query('db.users.find()')).toBe('Executing MongoDB query: db.users.find()');
    });

    test('Invalid Database Type', () => {
        expect(() => {
            DatabaseFactory.createConnection('invalid', testConfig);
        }).toThrow('Unsupported database type: invalid');
    });

    test('Connection Lifecycle', () => {
        const connection = DatabaseFactory.createConnection('mysql', testConfig);
        expect(connection.connect()).toBe('Connected to MySQL database at localhost:5432');
        expect(connection.query('SELECT * FROM users')).toBe('Executing MySQL query: SELECT * FROM users');
        expect(connection.disconnect()).toBe('Disconnected from MySQL database');
    });
}); 
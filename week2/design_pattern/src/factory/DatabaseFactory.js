// Abstract Database Connection
class DatabaseConnection {
    connect() {
        throw new Error('connect method must be implemented');
    }

    disconnect() {
        throw new Error('disconnect method must be implemented');
    }

    query(sql) {
        throw new Error('query method must be implemented');
    }
}

// Concrete MySQL Connection
class MySQLConnection extends DatabaseConnection {
    constructor(config) {
        super();
        this.config = config;
    }

    connect() {
        return `Connected to MySQL database at ${this.config.host}:${this.config.port}`;
    }

    disconnect() {
        return 'Disconnected from MySQL database';
    }

    query(sql) {
        return `Executing MySQL query: ${sql}`;
    }
}

// Concrete PostgreSQL Connection
class PostgreSQLConnection extends DatabaseConnection {
    constructor(config) {
        super();
        this.config = config;
    }

    connect() {
        return `Connected to PostgreSQL database at ${this.config.host}:${this.config.port}`;
    }

    disconnect() {
        return 'Disconnected from PostgreSQL database';
    }

    query(sql) {
        return `Executing PostgreSQL query: ${sql}`;
    }
}

// Concrete MongoDB Connection
class MongoDBConnection extends DatabaseConnection {
    constructor(config) {
        super();
        this.config = config;
    }

    connect() {
        return `Connected to MongoDB database at ${this.config.host}:${this.config.port}`;
    }

    disconnect() {
        return 'Disconnected from MongoDB database';
    }

    query(sql) {
        return `Executing MongoDB query: ${sql}`;
    }
}

// Database Factory
class DatabaseFactory {
    static createConnection(type, config) {
        switch (type.toLowerCase()) {
            case 'mysql':
                return new MySQLConnection(config);
            case 'postgresql':
                return new PostgreSQLConnection(config);
            case 'mongodb':
                return new MongoDBConnection(config);
            default:
                throw new Error(`Unsupported database type: ${type}`);
        }
    }
}

module.exports = {
    DatabaseConnection,
    MySQLConnection,
    PostgreSQLConnection,
    MongoDBConnection,
    DatabaseFactory
}; 
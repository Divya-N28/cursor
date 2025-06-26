# User Management Microservice

A production-ready User Management REST API microservice built with Express.js, featuring JWT authentication, role-based access control, and comprehensive testing.

## Features

- **User Management**: Full CRUD operations for users
- **Authentication**: JWT-based authentication with login/register
- **Authorization**: Role-based access control (user/admin)
- **Security**: Password hashing, rate limiting, CORS, and security headers
- **Database**: File-based in-memory storage with JSON persistence
- **Testing**: Comprehensive unit tests with Jest
- **Logging**: Winston logger with different log levels
- **Error Handling**: Centralized error handling with proper status codes
- **API Features**: Pagination, sorting, filtering, and search

## Prerequisites

- Node.js >= 14.0.0
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd user-management-microservice
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Update the environment variables in `.env` file:
```env
PORT=3000
NODE_ENV=development
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=24h
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
LOG_LEVEL=info
DB_FILE_PATH=./database/users.json
```

## Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

### Running Tests
```bash
npm test
```

## API Endpoints

### Authentication Routes

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get current user profile
- `PUT /api/auth/profile` - Update current user profile

### User Management Routes

- `GET /api/users` - List all users (admin only)
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user (admin only)
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (admin only)
- `GET /api/users/search?q=query` - Search users

## Request/Response Examples

### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

### Get User Profile
```http
GET /api/auth/profile
Authorization: Bearer <jwt_token>
```

## Error Handling

The API uses standard HTTP status codes and returns errors in the following format:

```json
{
  "status": "error",
  "message": "Error message"
}
```

## Testing

The project includes comprehensive unit tests for all services and controllers. Run tests with:

```bash
npm test
```

To generate coverage report:

```bash
npm test -- --coverage
```

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting
- CORS protection
- Security headers with Helmet
- Input validation
- Role-based access control

## Project Structure

```
src/
├── controllers/     # Route controllers
├── services/        # Business logic
├── models/          # Data models
├── middleware/      # Custom middleware
├── routes/          # API routes
├── utils/           # Helper functions
├── tests/           # Unit tests
└── app.js          # Application entry point
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 
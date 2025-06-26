# Backend Implementation Rules and Standards

## Task Execution

### Task Management
- Work sequentially through `tasks_backend.md` unless dependencies allow parallel work
- Mark tasks as completed with a brief note of any deviations
- Update task status in the format:
  ```markdown
  ### BE-XXX: Task Name
  - **Status**: Completed/In Progress/Blocked
  - **Completion Date**: YYYY-MM-DD
  - **Notes**: Any deviations or important implementation details
  ```

### Code Organization
- Follow the project structure:
  ```
  src/
  ├── config/         # Configuration files
  ├── controllers/    # Route controllers
  ├── middleware/     # Custom middleware
  ├── models/         # Sequelize models
  ├── routes/         # Route definitions
  ├── services/       # Business logic
  ├── utils/          # Utility functions
  └── validators/     # Input validation schemas
  ```

## Implementation Standards

### API Development
1. **Route Structure**
   - Follow RESTful principles
   - Use proper HTTP methods (GET, POST, PUT, DELETE)
   - Implement versioning (e.g., `/v1/users`)
   - Group related endpoints in route files

2. **Input Validation**
   - Use Zod for request validation
   - Validate all inputs before processing
   - Return 400 Bad Request for invalid inputs
   - Include detailed error messages

3. **Error Handling**
   - Use centralized error handling
   - Follow error response format from API_SPEC.md
   - Log errors appropriately
   - Handle both expected and unexpected errors

4. **Authentication**
   - Implement JWT-based authentication
   - Use middleware for protected routes
   - Validate tokens on each request
   - Handle token refresh mechanism

### Database Operations

1. **Sequelize Usage**
   - Define models with proper types
   - Use migrations for schema changes
   - Implement proper relationships
   - Use transactions where necessary

2. **Query Optimization**
   - Use proper indexes
   - Implement pagination
   - Optimize complex queries
   - Use eager loading appropriately

### Security Standards

1. **Input Sanitization**
   - Sanitize all user inputs
   - Prevent SQL injection
   - Prevent XSS attacks
   - Validate file uploads

2. **Authentication Security**
   - Hash passwords using bcrypt
   - Implement rate limiting
   - Use secure session management
   - Implement proper CORS policies

3. **Data Protection**
   - Encrypt sensitive data
   - Implement proper access control
   - Follow GDPR requirements
   - Secure file storage

### Testing Requirements

1. **Unit Tests**
   - Test all endpoints
   - Test business logic
   - Test error cases
   - Aim for >80% coverage

2. **Integration Tests**
   - Test API flows
   - Test database operations
   - Test authentication flows
   - Test error scenarios

### Code Quality

1. **TypeScript Usage**
   - Use strict type checking
   - Define interfaces for all data structures
   - Use proper type annotations
   - Avoid any type

2. **Code Style**
   - Follow ESLint rules
   - Use Prettier for formatting
   - Write meaningful comments
   - Follow naming conventions

3. **Documentation**
   - Document all endpoints
   - Document complex logic
   - Update API documentation
   - Include usage examples

## Performance Standards

1. **Response Times**
   - API responses < 200ms
   - Database queries < 100ms
   - Real-time events < 50ms

2. **Resource Usage**
   - Monitor memory usage
   - Optimize database connections
   - Implement proper caching
   - Use connection pooling

## Deployment Standards

1. **Environment Configuration**
   - Use environment variables
   - Separate configs by environment
   - Secure sensitive data
   - Document configuration

2. **Logging**
   - Implement structured logging
   - Log all errors
   - Log important operations
   - Use proper log levels

3. **Monitoring**
   - Monitor API performance
   - Monitor error rates
   - Monitor resource usage
   - Set up alerts

## Version Control

1. **Git Workflow**
   - Use feature branches
   - Write meaningful commit messages
   - Review code before merging
   - Keep commits atomic

2. **Code Review**
   - Review for security issues
   - Review for performance
   - Review for maintainability
   - Review for test coverage

## Documentation Requirements

1. **API Documentation**
   - Document all endpoints
   - Include request/response examples
   - Document error cases
   - Keep documentation updated

2. **Code Documentation**
   - Document complex logic
   - Document configuration
   - Document deployment process
   - Document testing strategy 
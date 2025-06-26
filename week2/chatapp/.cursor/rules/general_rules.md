# General Project Rules and Standards

## Version Control

### Branch Naming Convention
- Format: `[type]/[ticket-id]-[short-description]`
- Types:
  - `feature/` - New features (e.g., `feature/FE-101-user-profile`)
  - `bugfix/` - Bug fixes (e.g., `bugfix/BE-203-login-error`)
  - `hotfix/` - Urgent fixes (e.g., `hotfix/BE-401-security-patch`)
  - `release/` - Release branches (e.g., `release/v1.2.0`)
  - `chore/` - Maintenance tasks (e.g., `chore/update-dependencies`)

### Commit Message Format
```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

#### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or modifying tests
- `chore`: Maintenance tasks

#### Examples
```
feat(auth): add user login functionality
fix(api): resolve message sending error
docs(readme): update installation instructions
style(ui): format chat component
refactor(store): optimize Redux state structure
test(api): add user registration tests
chore(deps): update package dependencies
```

### Pull Request Guidelines
1. **Title Format**
   - Include ticket ID
   - Brief description
   - Example: `[FE-101] Implement user profile display`

2. **Description Template**
   ```markdown
   ## Description
   [Detailed description of changes]

   ## Related Tickets
   - [Ticket ID](link)

   ## Type of Change
   - [ ] Bug fix
   - [ ] New feature
   - [ ] Breaking change
   - [ ] Documentation update

   ## Testing
   - [ ] Unit tests added/updated
   - [ ] Integration tests added/updated
   - [ ] Manual testing completed

   ## Checklist
   - [ ] Code follows style guidelines
   - [ ] Documentation updated
   - [ ] Tests added/updated
   - [ ] All tests passing
   ```

## Coding Style

### General Principles
1. **Code Organization**
   - Single responsibility principle
   - DRY (Don't Repeat Yourself)
   - KISS (Keep It Simple, Stupid)
   - Clear and meaningful naming

2. **Documentation**
   - Self-documenting code
   - JSDoc/TSDoc for public APIs
   - README files for modules
   - Inline comments for complex logic

### TypeScript/JavaScript Standards
1. **Naming Conventions**
   - PascalCase for classes and components
   - camelCase for variables and functions
   - UPPER_CASE for constants
   - kebab-case for files and directories

2. **Code Formatting**
   - Use Prettier configuration
   - Follow ESLint rules
   - Consistent indentation
   - Line length limits

3. **Type Safety**
   - Strict TypeScript mode
   - Proper type definitions
   - Avoid any type
   - Use type guards

### Code Review Guidelines
1. **Review Checklist**
   - Code style compliance
   - Test coverage
   - Documentation
   - Performance impact
   - Security considerations

2. **Review Process**
   - At least one reviewer
   - Address all comments
   - Update documentation
   - Update tests if needed

## Security Standards

### Input Validation
1. **Backend Validation**
   - Sanitize all user inputs
   - Validate data types
   - Check data ranges
   - Handle edge cases

2. **Frontend Validation**
   - Client-side validation
   - Input sanitization
   - Error handling
   - User feedback

### Database Security
1. **Query Safety**
   - Use parameterized queries
   - ORM methods
   - Input sanitization
   - Error handling

2. **Access Control**
   - Role-based access
   - Resource permissions
   - Data encryption
   - Audit logging

### Web Security
1. **OWASP Top 10 Prevention**
   - Injection attacks
   - Broken authentication
   - Sensitive data exposure
   - XXE attacks
   - Access control
   - Security misconfiguration
   - XSS attacks
   - Insecure deserialization
   - Using vulnerable components
   - Insufficient logging

2. **CSRF Protection**
   - CSRF tokens
   - Same-origin policy
   - Secure cookies
   - Request validation

### Secret Management
1. **Environment Variables**
   - Use .env files
   - Never commit secrets
   - Rotate credentials
   - Secure storage

2. **API Keys**
   - Secure storage
   - Access control
   - Key rotation
   - Usage monitoring

### Security Best Practices
1. **Authentication**
   - Strong password policies
   - Multi-factor authentication
   - Session management
   - Token security

2. **Data Protection**
   - Data encryption
   - Secure transmission
   - Data minimization
   - Privacy compliance

3. **Monitoring**
   - Security logging
   - Error tracking
   - Access monitoring
   - Performance monitoring

## Development Workflow

### Local Development
1. **Setup**
   - Development environment
   - Dependencies
   - Configuration
   - Database setup

2. **Testing**
   - Unit tests
   - Integration tests
   - E2E tests
   - Performance tests

### Deployment
1. **Staging**
   - Environment setup
   - Configuration
   - Testing
   - Validation

2. **Production**
   - Deployment process
   - Monitoring
   - Backup
   - Rollback plan

### Maintenance
1. **Updates**
   - Dependency updates
   - Security patches
   - Performance optimization
   - Documentation updates

2. **Monitoring**
   - Error tracking
   - Performance monitoring
   - Security monitoring
   - Usage analytics 
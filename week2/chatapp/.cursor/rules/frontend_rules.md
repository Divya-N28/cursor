# Frontend Implementation Rules and Standards

## Task Execution

### Task Management
- Implement tasks based on `tasks_frontend.md`
- Mark tasks as completed with the format:
  ```markdown
  ### FE-XXX: Task Name
  - **Status**: Completed/In Progress/Blocked
  - **Completion Date**: YYYY-MM-DD
  - **Commit Link**: URL to relevant commit
  - **Notes**: Implementation details or deviations
  ```

### Project Structure
```
src/
├── assets/          # Static assets
├── components/      # Reusable components
│   ├── common/     # Shared components
│   ├── layout/     # Layout components
│   └── features/   # Feature-specific components
├── hooks/          # Custom React hooks
├── pages/          # Page components
├── services/       # API services
├── store/          # Redux store
│   ├── slices/    # Redux slices
│   └── middleware/ # Redux middleware
├── styles/         # Global styles
├── types/          # TypeScript types
└── utils/          # Utility functions
```

## Implementation Standards

### Component Development

1. **Component Structure**
   - Use functional components with hooks
   - Follow atomic design principles
   - Implement proper prop typing
   - Use proper component composition

2. **State Management**
   - Use Redux Toolkit for global state
   - Use React hooks for local state
   - Implement proper state normalization
   - Follow Redux best practices

3. **Props and Types**
   - Define clear prop interfaces
   - Use proper TypeScript types
   - Document prop requirements
   - Implement prop validation

### UI/UX Standards

1. **Material UI Usage**
   - Follow Material Design guidelines
   - Use theme customization
   - Implement responsive design
   - Maintain consistent styling

2. **Responsive Design**
   - Mobile-first approach
   - Breakpoint consistency
   - Flexible layouts
   - Touch-friendly interfaces

3. **Accessibility (WCAG AA)**
   - Semantic HTML
   - ARIA attributes
   - Keyboard navigation
   - Screen reader support
   - Color contrast compliance
   - Focus management

### API Integration

1. **Service Layer**
   - Centralized API calls
   - Proper error handling
   - Request/response typing
   - Authentication handling

2. **Data Fetching**
   - Use RTK Query
   - Implement proper caching
   - Handle loading states
   - Handle error states

3. **Real-time Features**
   - WebSocket integration
   - Connection management
   - Reconnection handling
   - Event typing

### Form Handling

1. **Input Validation**
   - Client-side validation
   - Form state management
   - Error messaging
   - Field-level validation

2. **Form Submission**
   - Loading states
   - Error handling
   - Success feedback
   - Data transformation

### Performance Optimization

1. **Code Splitting**
   - Route-based splitting
   - Component lazy loading
   - Dynamic imports
   - Bundle optimization

2. **Rendering Optimization**
   - Memoization
   - Virtual scrolling
   - Image optimization
   - Resource preloading

### Security Standards

1. **Input Sanitization**
   - XSS prevention
   - Data escaping
   - Secure data handling
   - CSRF protection

2. **Authentication**
   - Token management
   - Secure storage
   - Session handling
   - Logout handling

### Testing Requirements

1. **Unit Tests**
   - Component testing
   - Hook testing
   - Utility testing
   - Redux testing

2. **Integration Tests**
   - User flow testing
   - API integration testing
   - State management testing
   - Error handling testing

### Code Quality

1. **TypeScript Usage**
   - Strict type checking
   - Proper type definitions
   - Type safety
   - Interface consistency

2. **Code Style**
   - ESLint configuration
   - Prettier formatting
   - Naming conventions
   - Documentation

3. **Component Documentation**
   - Props documentation
   - Usage examples
   - Component stories
   - Accessibility notes

## Performance Metrics

1. **Loading Performance**
   - First Contentful Paint < 1.5s
   - Time to Interactive < 3.5s
   - Bundle size < 200KB (initial)
   - Image optimization

2. **Runtime Performance**
   - Smooth animations (60fps)
   - Efficient re-renders
   - Memory management
   - Resource cleanup

## Error Handling

1. **User Feedback**
   - Clear error messages
   - Loading indicators
   - Success notifications
   - Recovery options

2. **Error Boundaries**
   - Component-level boundaries
   - Fallback UI
   - Error logging
   - Recovery mechanisms

## Version Control

1. **Git Workflow**
   - Feature branches
   - Meaningful commits
   - PR templates
   - Code review process

2. **Code Review**
   - Component review
   - Performance review
   - Accessibility review
   - Security review

## Documentation

1. **Component Documentation**
   - Usage guidelines
   - Props documentation
   - Examples
   - Accessibility notes

2. **Project Documentation**
   - Setup instructions
   - Architecture overview
   - State management
   - Testing strategy 
# API Specification Documentation

## Overview
This document outlines the REST API endpoints for the Real-Time Chat Application. The API follows RESTful principles and uses JSON for request/response bodies.

## Base URL
```
https://api.chatapp.com/v1
```

## Authentication
All authenticated endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

## Common Headers
```
Content-Type: application/json
Accept: application/json
```

## Common Error Responses

### 400 Bad Request
```json
{
  "error": {
    "code": "BAD_REQUEST",
    "message": "Invalid request parameters",
    "details": ["Field 'email' is required"]
  }
}
```

### 401 Unauthorized
```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required"
  }
}
```

### 403 Forbidden
```json
{
  "error": {
    "code": "FORBIDDEN",
    "message": "Insufficient permissions"
  }
}
```

### 404 Not Found
```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Resource not found"
  }
}
```

### 500 Internal Server Error
```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "An unexpected error occurred"
  }
}
```

## API Endpoints

### Authentication Module

#### Register User
- **Path**: `POST /auth/register`
- **Description**: Register a new user account
- **Authentication**: None
- **Request Body**:
```json
{
  "email": "string",
  "password": "string",
  "firstName": "string",
  "lastName": "string"
}
```
- **Success Response**: 201 Created
```json
{
  "id": "uuid",
  "email": "string",
  "firstName": "string",
  "lastName": "string",
  "isVerified": false,
  "createdAt": "timestamp"
}
```
- **Security Notes**: 
  - Password must be at least 8 characters
  - Email must be unique
  - Rate limit: 5 requests per minute

#### Login
- **Path**: `POST /auth/login`
- **Description**: Authenticate user and get JWT token
- **Authentication**: None
- **Request Body**:
```json
{
  "email": "string",
  "password": "string"
}
```
- **Success Response**: 200 OK
```json
{
  "token": "string",
  "user": {
    "id": "uuid",
    "email": "string",
    "firstName": "string",
    "lastName": "string"
  }
}
```
- **Security Notes**: 
  - Rate limit: 10 requests per minute
  - Failed attempts are logged

### Users Module

#### Get User Profile
- **Path**: `GET /users/me`
- **Description**: Get current user's profile
- **Authentication**: JWT Required
- **Success Response**: 200 OK
```json
{
  "id": "uuid",
  "email": "string",
  "firstName": "string",
  "lastName": "string",
  "profilePicture": "string",
  "status": "string",
  "lastSeen": "timestamp",
  "isVerified": boolean,
  "twoFactorEnabled": boolean,
  "settings": {}
}
```

#### Update User Profile
- **Path**: `PUT /users/me`
- **Description**: Update current user's profile
- **Authentication**: JWT Required
- **Request Body**:
```json
{
  "firstName": "string",
  "lastName": "string",
  "profilePicture": "string",
  "settings": {}
}
```
- **Success Response**: 200 OK
```json
{
  "id": "uuid",
  "email": "string",
  "firstName": "string",
  "lastName": "string",
  "profilePicture": "string",
  "settings": {}
}
```

### Messages Module

#### Send Message
- **Path**: `POST /messages`
- **Description**: Send a new message
- **Authentication**: JWT Required
- **Request Body**:
```json
{
  "receiverId": "uuid",
  "content": "string",
  "messageType": "text",
  "mediaUrl": "string"
}
```
- **Success Response**: 201 Created
```json
{
  "id": "uuid",
  "senderId": "uuid",
  "receiverId": "uuid",
  "content": "string",
  "messageType": "string",
  "mediaUrl": "string",
  "status": "sent",
  "createdAt": "timestamp"
}
```

#### Get Messages
- **Path**: `GET /messages`
- **Description**: Get messages between current user and another user
- **Authentication**: JWT Required
- **Query Parameters**:
  - `contactId`: UUID (required)
  - `limit`: number (default: 50)
  - `before`: timestamp (optional)
  - `after`: timestamp (optional)
- **Success Response**: 200 OK
```json
{
  "messages": [
    {
      "id": "uuid",
      "senderId": "uuid",
      "receiverId": "uuid",
      "content": "string",
      "messageType": "string",
      "mediaUrl": "string",
      "status": "string",
      "createdAt": "timestamp"
    }
  ],
  "hasMore": boolean
}
```

#### Update Message Status
- **Path**: `PUT /messages/{messageId}/status`
- **Description**: Update message status (delivered/read)
- **Authentication**: JWT Required
- **Path Parameters**:
  - `messageId`: UUID
- **Request Body**:
```json
{
  "status": "delivered|read"
}
```
- **Success Response**: 200 OK
```json
{
  "id": "uuid",
  "status": "string",
  "updatedAt": "timestamp"
}
```

### Contacts Module

#### Get Contacts
- **Path**: `GET /contacts`
- **Description**: Get user's contact list
- **Authentication**: JWT Required
- **Query Parameters**:
  - `status`: string (optional, default: "active")
  - `limit`: number (default: 50)
  - `offset`: number (default: 0)
- **Success Response**: 200 OK
```json
{
  "contacts": [
    {
      "id": "uuid",
      "user": {
        "id": "uuid",
        "firstName": "string",
        "lastName": "string",
        "profilePicture": "string",
        "status": "string",
        "lastSeen": "timestamp"
      },
      "status": "string",
      "createdAt": "timestamp"
    }
  ],
  "total": number
}
```

#### Add Contact
- **Path**: `POST /contacts`
- **Description**: Add a new contact
- **Authentication**: JWT Required
- **Request Body**:
```json
{
  "email": "string"
}
```
- **Success Response**: 201 Created
```json
{
  "id": "uuid",
  "user": {
    "id": "uuid",
    "firstName": "string",
    "lastName": "string",
    "profilePicture": "string",
    "status": "string"
  },
  "status": "active",
  "createdAt": "timestamp"
}
```

#### Update Contact Status
- **Path**: `PUT /contacts/{contactId}`
- **Description**: Update contact status (block/unblock)
- **Authentication**: JWT Required
- **Path Parameters**:
  - `contactId`: UUID
- **Request Body**:
```json
{
  "status": "active|blocked"
}
```
- **Success Response**: 200 OK
```json
{
  "id": "uuid",
  "status": "string",
  "updatedAt": "timestamp"
}
```

### Message Reactions Module

#### Add Reaction
- **Path**: `POST /messages/{messageId}/reactions`
- **Description**: Add reaction to a message
- **Authentication**: JWT Required
- **Path Parameters**:
  - `messageId`: UUID
- **Request Body**:
```json
{
  "emoji": "string"
}
```
- **Success Response**: 201 Created
```json
{
  "id": "uuid",
  "messageId": "uuid",
  "userId": "uuid",
  "emoji": "string",
  "createdAt": "timestamp"
}
```

#### Remove Reaction
- **Path**: `DELETE /messages/{messageId}/reactions/{reactionId}`
- **Description**: Remove reaction from a message
- **Authentication**: JWT Required
- **Path Parameters**:
  - `messageId`: UUID
  - `reactionId`: UUID
- **Success Response**: 204 No Content

## WebSocket Events

### Connection
- **URL**: `wss://api.chatapp.com/v1/ws`
- **Authentication**: JWT token as query parameter
- **Events**:

#### Message Received
```json
{
  "type": "message.received",
  "data": {
    "id": "uuid",
    "senderId": "uuid",
    "content": "string",
    "messageType": "string",
    "createdAt": "timestamp"
  }
}
```

#### Message Status Updated
```json
{
  "type": "message.status",
  "data": {
    "messageId": "uuid",
    "status": "string",
    "updatedAt": "timestamp"
  }
}
```

#### User Status Changed
```json
{
  "type": "user.status",
  "data": {
    "userId": "uuid",
    "status": "string",
    "lastSeen": "timestamp"
  }
}
```

#### Typing Indicator
```json
{
  "type": "typing",
  "data": {
    "userId": "uuid",
    "isTyping": boolean
  }
}
```

## Rate Limiting
- Authentication endpoints: 10 requests per minute
- Other endpoints: 100 requests per minute
- WebSocket connections: 5 per user

## Security Considerations
1. All endpoints use HTTPS
2. JWT tokens expire after 24 hours
3. Password hashing using bcrypt
4. Input validation for all request bodies
5. CORS configuration for web client
6. Rate limiting on all endpoints
7. SQL injection prevention through Sequelize
8. XSS protection through input sanitization 
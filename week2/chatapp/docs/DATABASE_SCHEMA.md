# Database Schema Documentation

## Overview
This document outlines the database schema for the Real-Time Chat Application. The schema is designed to support all core functionalities while maintaining data integrity and performance.

## Table Definitions

### Users
Stores user account information and profile data.

| Column Name | Data Type | Constraints | Description |
|-------------|-----------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique identifier for the user |
| email | VARCHAR(255) | UNIQUE, NOT NULL | User's email address |
| password_hash | VARCHAR(255) | NOT NULL | Hashed password |
| first_name | VARCHAR(100) | NOT NULL | User's first name |
| last_name | VARCHAR(100) | NOT NULL | User's last name |
| profile_picture | VARCHAR(255) | | URL to profile picture |
| status | VARCHAR(50) | DEFAULT 'offline' | User's online status |
| last_seen | TIMESTAMP | | Last activity timestamp |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Account creation timestamp |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last update timestamp |
| is_verified | BOOLEAN | DEFAULT FALSE | Email verification status |
| two_factor_enabled | BOOLEAN | DEFAULT FALSE | 2FA status |
| settings | JSONB | DEFAULT '{}' | User preferences and settings |

### Messages
Stores all chat messages between users.

| Column Name | Data Type | Constraints | Description |
|-------------|-----------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique message identifier |
| sender_id | UUID | FOREIGN KEY (Users.id), NOT NULL | Message sender |
| receiver_id | UUID | FOREIGN KEY (Users.id), NOT NULL | Message recipient |
| content | TEXT | | Message content |
| message_type | VARCHAR(50) | NOT NULL, DEFAULT 'text' | Type of message (text, image, document) |
| media_url | VARCHAR(255) | | URL to media file if applicable |
| status | VARCHAR(50) | DEFAULT 'sent' | Message status (sent, delivered, read) |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Message creation timestamp |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last update timestamp |
| is_deleted | BOOLEAN | DEFAULT FALSE | Soft delete flag |

### Contacts
Manages user contact relationships.

| Column Name | Data Type | Constraints | Description |
|-------------|-----------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique contact relationship identifier |
| user_id | UUID | FOREIGN KEY (Users.id), NOT NULL | User who owns the contact |
| contact_user_id | UUID | FOREIGN KEY (Users.id), NOT NULL | Contacted user |
| status | VARCHAR(50) | DEFAULT 'active' | Contact status (active, blocked) |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Contact creation timestamp |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last update timestamp |

### Message_Reactions
Stores emoji reactions to messages.

| Column Name | Data Type | Constraints | Description |
|-------------|-----------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique reaction identifier |
| message_id | UUID | FOREIGN KEY (Messages.id), NOT NULL | Reacted message |
| user_id | UUID | FOREIGN KEY (Users.id), NOT NULL | User who reacted |
| emoji | VARCHAR(50) | NOT NULL | Emoji code |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Reaction timestamp |

## Relationships

1. Users to Messages (One-to-Many)
   - A user can send multiple messages
   - A user can receive multiple messages

2. Users to Contacts (Many-to-Many)
   - A user can have multiple contacts
   - A contact can be associated with multiple users
   - Managed through the Contacts table

3. Messages to Message_Reactions (One-to-Many)
   - A message can have multiple reactions
   - Each reaction is associated with one message

## Indexes

```sql
-- Users table indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_last_seen ON users(last_seen);

-- Messages table indexes
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_receiver ON messages(receiver_id);
CREATE INDEX idx_messages_created ON messages(created_at);
CREATE INDEX idx_messages_status ON messages(status);

-- Contacts table indexes
CREATE INDEX idx_contacts_user ON contacts(user_id);
CREATE INDEX idx_contacts_contact ON contacts(contact_user_id);
CREATE INDEX idx_contacts_status ON contacts(status);

-- Message_Reactions table indexes
CREATE INDEX idx_reactions_message ON message_reactions(message_id);
CREATE INDEX idx_reactions_user ON message_reactions(user_id);
```

## Sequelize Models

```javascript
// User Model
const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password_hash: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  first_name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  last_name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  profile_picture: {
    type: DataTypes.STRING(255)
  },
  status: {
    type: DataTypes.STRING(50),
    defaultValue: 'offline'
  },
  last_seen: {
    type: DataTypes.DATE
  },
  is_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  two_factor_enabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  settings: {
    type: DataTypes.JSONB,
    defaultValue: {}
  }
}, {
  timestamps: true
});

// Message Model
const Message = sequelize.define('Message', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  sender_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  receiver_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  content: {
    type: DataTypes.TEXT
  },
  message_type: {
    type: DataTypes.STRING(50),
    defaultValue: 'text'
  },
  media_url: {
    type: DataTypes.STRING(255)
  },
  status: {
    type: DataTypes.STRING(50),
    defaultValue: 'sent'
  },
  is_deleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  timestamps: true
});

// Contact Model
const Contact = sequelize.define('Contact', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  contact_user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.STRING(50),
    defaultValue: 'active'
  }
}, {
  timestamps: true
});

// MessageReaction Model
const MessageReaction = sequelize.define('MessageReaction', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  message_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Messages',
      key: 'id'
    }
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  emoji: {
    type: DataTypes.STRING(50),
    allowNull: false
  }
}, {
  timestamps: true
});
```

## PostgreSQL DDL Statements

```sql
-- Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    profile_picture VARCHAR(255),
    status VARCHAR(50) DEFAULT 'offline',
    last_seen TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    is_verified BOOLEAN DEFAULT FALSE,
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    settings JSONB DEFAULT '{}'
);

-- Messages Table
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID NOT NULL REFERENCES users(id),
    receiver_id UUID NOT NULL REFERENCES users(id),
    content TEXT,
    message_type VARCHAR(50) NOT NULL DEFAULT 'text',
    media_url VARCHAR(255),
    status VARCHAR(50) DEFAULT 'sent',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT FALSE
);

-- Contacts Table
CREATE TABLE contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    contact_user_id UUID NOT NULL REFERENCES users(id),
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, contact_user_id)
);

-- Message Reactions Table
CREATE TABLE message_reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL REFERENCES messages(id),
    user_id UUID NOT NULL REFERENCES users(id),
    emoji VARCHAR(50) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(message_id, user_id, emoji)
);

-- Add triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_messages_updated_at
    BEFORE UPDATE ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contacts_updated_at
    BEFORE UPDATE ON contacts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
``` 
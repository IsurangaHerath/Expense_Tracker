# 6 Data Requirements

## 6.1 Data Entities

### 6.1.1 User Entity

| Attribute | Data Type | Constraints | Description |
|-----------|-----------|-------------|-------------|
| id | INTEGER | PK, AUTO_INCREMENT | Unique user identifier |
| email | VARCHAR(255) | UNIQUE, NOT NULL | User email address |
| password_hash | VARCHAR(255) | NOT NULL | Bcrypt hashed password |
| created_at | DATETIME | NOT NULL | Account creation timestamp |
| updated_at | DATETIME | | Last profile update timestamp |

### 6.1.2 Expense Entity

| Attribute | Data Type | Constraints | Description |
|-----------|-----------|-------------|-------------|
| id | INTEGER | PK, AUTO_INCREMENT | Unique expense identifier |
| user_id | INTEGER | FK, NOT NULL | Reference to User |
| category_id | INTEGER | FK, NOT NULL | Reference to Category |
| amount | DECIMAL(10,2) | NOT NULL, > 0 | Expense amount |
| date | DATE | NOT NULL | Expense transaction date |
| description | TEXT | NULL | Optional expense description |
| created_at | DATETIME | NOT NULL | Record creation timestamp |
| updated_at | DATETIME | | Last edit timestamp |

### 6.1.3 Category Entity

| Attribute | Data Type | Constraints | Description |
|-----------|-----------|-------------|-------------|
| id | INTEGER | PK, AUTO_INCREMENT | Unique category identifier |
| name | VARCHAR(100) | NOT NULL, UNIQUE | Category name |
| color | VARCHAR(7) | | Hex color code (e.g., #4F46E5) |
| sort_order | INTEGER | | Display order |
| is_default | BOOLEAN | DEFAULT 0 | System default category |
| created_at | DATETIME | NOT NULL | Creation timestamp |

## 6.2 Entity Relationships

```
User 1 ────< Expense >──── Category
  │                            │
  │                            │
  │                            │
  │                            │
Auth                      Predefined
```

**Cardinality**:
- One User has many Expenses (1:N)
- One Category has many Expenses (1:N)
- User and Expense: Mandatory relationship
- Category and Expense: Mandatory relationship

## 6.3 Data Relationships

| Relationship | Type | Cardinality | Description |
|--------------|------|-------------|-------------|
| User-Expense | Parent-Child | 1:N | User owns multiple expenses |
| Category-Expense | Reference | 1:N | Category assigned to multiple expenses |

## 6.4 Data Validation Requirements

| Data Element | Validation Rule | Error Handling |
|--------------|-----------------|----------------|
| User Email | Valid email format, unique | "Email already exists" |
| User Password | Min 8 chars, 1 letter + 1 number | Show requirements message |
| Expense Amount | Positive decimal, max 2 decimals | "Amount must be positive" |
| Expense Date | Not in future, valid date | "Date cannot be in future" |
| Expense Description | Max 500 characters | "Description too long" |
| Category Name | Min 2 chars, not empty | "Category name required" |

## 6.5 Proposed Database Schema

```sql
-- Users table
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME
);

-- Categories table
CREATE TABLE categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) UNIQUE NOT NULL,
    color VARCHAR(7),
    sort_order INTEGER DEFAULT 0,
    is_default BOOLEAN DEFAULT 0,
    created_at DATETIME NOT NULL
);

-- Expenses table
CREATE TABLE expenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    category_id INTEGER NOT NULL,
    amount DECIMAL(10,2) NOT NULL CHECK(amount > 0),
    date DATE NOT NULL CHECK(date <= date('now')),
    description TEXT,
    created_at DATETIME NOT NULL,
    updated_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- Indexes for performance
CREATE INDEX idx_expenses_user ON expenses(user_id);
CREATE INDEX idx_expenses_category ON expenses(category_id);
CREATE INDEX idx_expenses_date ON expenses(date);
```

## 6.6 Default Data Seeding

**Default Categories** (will be inserted at application startup):

| Name | Color | Sort Order |
|------|-------|------------|
| Food | #EFA506 | 1 |
| Transport | #3B82F6 | 2 |
| Entertainment | #8B5CF6 | 3 |
| Utilities | #10B981 | 4 |
| Shopping | #F43F5E | 5 |
| Other | #9CA3AF | 6 |
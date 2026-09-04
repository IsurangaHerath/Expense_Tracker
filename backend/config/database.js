const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// Database file location
const dbpath = path.join(__dirname, "..", "expense_tracker.db");

const db = new sqlite3.Database(dbpath, (err) => {
    if (err) {
        console.error("Error opening database:", err.message);
    } else {
        console.log("Connected to the SQLite database.");
    }
});

// Enable foreign keys
db.run("PRAGMA foreign_keys = ON;");

// Create database tables and indexes
db.serialize(() => {

    // User table
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email VARCHAR(255) NOT NULL UNIQUE,
            password TEXT NOT NULL,
            created_at DATETIME NOT NULL,
            updated_at DATETIME
        )
    `);

    // Category table
    db.run(`
        CREATE TABLE IF NOT EXISTS categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name VARCHAR(100) NOT NULL UNIQUE,
            color VARCHAR(20) NOT NULL,
            sort_order INTEGER NOT NULL,
            is_default INTEGER NOT NULL DEFAULT 1
        )
    `);

    // Insert default categories
    const defaultCategories = [
        ["Food", "#EFA506", 1, 1],
        ["Transport", "#3B82F6", 2, 1],
        ["Entertainment", "#8B5CF6", 3, 1],
        ["Utilities", "#10B981", 4, 1],
        ["Shopping", "#F43F5E", 5, 1],
        ["Other", "#9CA3AF", 6, 1]
    ];

    const insertCategory = db.prepare(`
        INSERT OR IGNORE INTO categories
        (name, color, sort_order, is_default)
        VALUES (?, ?, ?, ?)
    `);

    defaultCategories.forEach((category) => {
        insertCategory.run(category);
    });

    insertCategory.finalize();
});

module.exports = db;
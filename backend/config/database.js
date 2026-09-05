const sqlite3 = require("sqlite3").verbose();
const path = require("path");

//database file location
const dbpath = path.join(__dirname,"..","expense_tracker.db");

const db = new sqlite3.Database(dbpath, (err) => {
    if (err) {
        console.error("Error opening database:", err.message);
    } else {
        console.log("Connected to the SQLite database.");
    }
});

//Enable foreign keys
db.run('PRAGMA foreign_keys = ON;');

//create database tables and indexes
db.serialize(() => {

    //User table
    db.run(
    `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email VARCHAR(255) NOT NULL UNIQUE,
        password TEXT NOT NULL,
        created_at DATETIME NOT NULL,
        updated_at DATETIME
    )`
    );

    //Category table
    db.run(
    `CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name VARCHAR(100) NOT NULL UNIQUE,
        color VARCHAR(20) NOT NULL DEFAULT '#4F46E5',
        created_at DATETIME NOT NULL DEFAULT (datetime('now'))
    )`
    );

    //Expense table
    db.run(
    `CREATE TABLE IF NOT EXISTS expenses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        category_id INTEGER,
        amount REAL NOT NULL,
        date TEXT NOT NULL,
        description TEXT,
        created_at DATETIME NOT NULL DEFAULT (datetime('now')),
        updated_at DATETIME,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
    )`
    );

    db.run(
    `CREATE INDEX IF NOT EXISTS idx_expenses_user ON expenses(user_id)`
    );

    //Seed default categories if the table is empty
    db.get(`SELECT COUNT(*) AS count FROM categories`, (err, row) => {
        if (err) {
            console.error("Error checking categories:", err.message);
            return;
        }

        if (row && row.count === 0) {
            const defaultCategories = [
                ['Food', '#FF6B6B'],
                ['Transport', '#4ECDC4'],
                ['Bills', '#FFE66D'],
                ['Entertainment', '#FF9F1C'],
                ['Shopping', '#9B5DE5'],
                ['Health', '#00F5D4']
            ];

            const insert = db.prepare(
                'INSERT INTO categories (name, color) VALUES (?, ?)'
            );

            defaultCategories.forEach(([name, color]) => {
                insert.run(name, color, (insertErr) => {
                    if (insertErr) {
                        console.error(`Error seeding category ${name}:`, insertErr.message);
                    }
                });
            });

            insert.finalize((finalizeErr) => {
                if (finalizeErr) {
                    console.error("Error finalizing category seed:", finalizeErr.message);
                } else {
                    console.log("Seeded default categories.");
                }
            });
        }
    });
});

module.exports = db;
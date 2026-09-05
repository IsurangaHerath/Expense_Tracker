const sqlite3 = require("sqlite3").verbose();
const path = require("path");

//databse file location
const dbpath = path.join(__dirname,"..","expense_tracker.db");

const db = new sqlite3.Database(dbpath, (err) => {
    if (err) {
        console.error("Error opening database:", err.message); 
    } else {
        console.log("Connected to the SQLite database.");
    }
});

//Eneble foreign keys
db.run('PRAGMA goreign_keys = ON;');

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
});

module.exports = db;
const db = require("../config/database");

const User = {
    findByEmail(email) {
        return new Promise((resolve, reject) => {
            db.get("SELECT * FROM users WHERE email = ?", [email.toLowerCase().trim()], (err, row) => {
                if (err) reject(err);
                else resolve(row || null);
            });
        });
    },

    create(email, passwordHash) {
        return new Promise((resolve, reject) => {
            const sql = "INSERT INTO users (email, password, created_at) VALUES (?, ?, datetime('now'))";
            db.run(sql, [email.toLowerCase().trim(), passwordHash], function (err) {
                if (err) reject(err);
                else resolve({ id: this.lastID, email: email.toLowerCase().trim() });
            });
        });
    }
};

module.exports = User;
const db = require("../config/database");

const User = {
    async findByEmail(email) {
        const row = await db.get("SELECT * FROM users WHERE email = $1", [email.toLowerCase().trim()]);
        return row ?? null;
    },

    async create(email, passwordHash) {
        const result = await db.run(
            "INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id",
            [email.toLowerCase().trim(), passwordHash]
        );
        return { id: result.lastID, email: email.toLowerCase().trim() };
    }
};

module.exports = User;
const db = require("../config/database");

const Category = {
    async findAll() {
        return db.all("SELECT * FROM categories ORDER BY name");
    },

    async findById(id) {
        const row = await db.get("SELECT * FROM categories WHERE id = $1", [id]);
        return row ?? null;
    }
};

module.exports = Category;
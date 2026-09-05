const db = require("../config/database");

const Category = {
    findAll() {
        return new Promise((resolve, reject) => {
            const sql = "SELECT * FROM categories ORDER BY sort_order";

            db.all(sql, [], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    },

    findById(id) {
        return new Promise((resolve, reject) => {
            const sql = "SELECT * FROM categories WHERE id = ?";

            db.get(sql, [id], (err, row) => {
                if (err) reject(err);
                else resolve(row || null);
            });
        });
    }
};

module.exports = Category;
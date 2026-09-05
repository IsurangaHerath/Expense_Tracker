const db = require("../config/database");

const Expense = {
    findAll(userId, filters = {}) {
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT e.id, e.user_id, e.category_id, e.amount, e.date, e.description,
                       c.name AS category_name, c.color AS category_color
                FROM expenses e
                JOIN categories c ON e.category_id = c.id
                WHERE e.user_id = ?
            `;

            const params = [userId];

            if (filters.categoryId) {
                sql += ' AND e.category_id = ?';
                params.push(filters.categoryId);
            }

            if (filters.month) {
                sql += " AND strftime('%m', e.date) = ?";
                params.push(String(filters.month).padStart(2, '0'));
            }

            if (filters.year) {
                sql += " AND strftime('%Y', e.date) = ?";
                params.push(String(filters.year));
            }

            // Search across description (and amount for convenience)
            if (filters.q) {
                sql += " AND (e.description LIKE ? OR CAST(e.amount AS TEXT) LIKE ?)";
                const like = `%${filters.q.trim()}%`;
                params.push(like, like);
            }

            const sortField = filters.sortBy && ['date', 'amount', 'description', 'created_at'].includes(filters.sortBy) ? filters.sortBy : 'date';
            const sortOrder = filters.sortOrder === 'asc' ? 'ASC' : 'DESC';

            sql += ` ORDER BY e.${sortField} ${sortOrder}${sortField === 'date' ? ', e.id DESC' : ''}`;

            db.all(sql, params, (err, rows) => {
                if (err) reject(err);
                else resolve(rows || []);
            });
        });
    },

    findById(id, userId) {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT e.id, e.user_id, e.category_id, e.amount, e.date, e.description,
                       c.name AS category_name, c.color AS category_color
                FROM expenses e
                JOIN categories c ON e.category_id = c.id
                WHERE e.id = ? AND e.user_id = ?
            `;

            db.get(sql, [id, userId], (err, row) => {
                if (err) reject(err);
                else resolve(row || null);
            });
        });
    },

    create(userId, data) {
        return new Promise((resolve, reject) => {
            const sql = `
                INSERT INTO expenses (user_id, category_id, amount, date, description)
                VALUES (?, ?, ?, ?, ?)
            `;

            db.run(
                sql,
                [userId, data.category_id, data.amount, data.date, data.description || null],
                function (err) {
                    if (err) reject(err);
                    else resolve({ id: this.lastID, user_id: userId });
                }
            );
        });
    },

    update(id, userId, data) {
        return new Promise((resolve, reject) => {
            const sql = `
                UPDATE expenses
                SET category_id = ?, amount = ?, date = ?, description = ?, updated_at = datetime('now')
                WHERE id = ? AND user_id = ?
            `;

            db.run(
                sql,
                [data.category_id, data.amount, data.date, data.description || null, id, userId],
                function (err) {
                    if (err) reject(err);
                    else if (this.changes === 0) resolve(null);
                    else resolve({ id, user_id: userId, changes: this.changes });
                }
            );
        });
    },

    remove(id, userId) {
        return new Promise((resolve, reject) => {
            const sql = 'DELETE FROM expenses WHERE id = ? AND user_id = ?';

            db.run(sql, [id, userId], function (err) {
                if (err) reject(err);
                else resolve(this.changes > 0);
            });
        });
    }
};

module.exports = Expense;
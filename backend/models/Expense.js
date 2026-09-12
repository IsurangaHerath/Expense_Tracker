const db = require("../config/database");

const Expense = {
    async findAll(userId, filters = {}) {
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
            sql += " AND TO_CHAR(e.date::date, 'MM') = ?";
            params.push(String(filters.month).padStart(2, '0'));
        }

        if (filters.year) {
            sql += " AND TO_CHAR(e.date::date, 'YYYY') = ?";
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

        const rows = await db.all(sql, params);
        return rows || [];
    },

    async findById(id, userId) {
        const sql = `
            SELECT e.id, e.user_id, e.category_id, e.amount, e.date, e.description,
                   c.name AS category_name, c.color AS category_color
            FROM expenses e
            JOIN categories c ON e.category_id = c.id
            WHERE e.id = ? AND e.user_id = ?
        `;

        const row = await db.get(sql, [id, userId]);
        return row ?? null;
    },

    async create(userId, data) {
        const sql = `
            INSERT INTO expenses (user_id, category_id, amount, date, description)
            VALUES (?, ?, ?, ?, ?)
            RETURNING id
        `;

        const result = await db.run(
            sql,
            [userId, data.category_id, data.amount, data.date, data.description || null]
        );

        return { id: result.lastID, user_id: userId };
    },

    async update(id, userId, data) {
        const sql = `
            UPDATE expenses
            SET category_id = ?, amount = ?, date = ?, description = ?, updated_at = now()
            WHERE id = ? AND user_id = ?
            RETURNING id
        `;

        const result = await db.run(
            sql,
            [data.category_id, data.amount, data.date, data.description || null, id, userId]
        );

        if (result.changes === 0) return null;
        return { id, user_id: userId, changes: result.changes };
    },

    async remove(id, userId) {
        const result = await db.run(
            'DELETE FROM expenses WHERE id = ? AND user_id = ?',
            [id, userId]
        );

        return result.changes > 0;
    }
};

module.exports = Expense;
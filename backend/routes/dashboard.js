const express = require('express');
const router = express.Router();

const roundVal = (val) => Number((Math.round((val || 0) * 100) / 100).toFixed(2));

const queryGet = (db, sql, params) => db.get(sql, params);

const queryAll = (db, sql, params) => db.all(sql, params);

/**
 * GET /api/v1/dashboard/summary
 * Query params: ?month=MM&year=YYYY (defaults to current date)
 */
router.get('/summary', async (req, res) => {
  try {
    const db = req.db;
    const userId = req.user.id;

    const now = new Date();
    const selectedMonth = req.query.month
      ? String(req.query.month).padStart(2, '0')
      : String(now.getMonth() + 1).padStart(2, '0');
    const selectedYear = req.query.year
      ? String(req.query.year)
      : String(now.getFullYear());

    let prevMonthNum = parseInt(selectedMonth, 10) - 1;
    let prevYearNum = parseInt(selectedYear, 10);
    if (prevMonthNum === 0) {
      prevMonthNum = 12;
      prevYearNum -= 1;
    }
    const prevMonth = String(prevMonthNum).padStart(2, '0');
    const prevYear = String(prevYearNum);

    const querySummary = `
      SELECT
        COALESCE(SUM(amount), 0) AS "totalExpenses",
        COALESCE(SUM(CASE WHEN TO_CHAR(date::date, 'MM') = ? AND TO_CHAR(date::date, 'YYYY') = ? THEN amount ELSE 0 END), 0) AS "monthlyTotal",
        COALESCE(SUM(CASE WHEN TO_CHAR(date::date, 'MM') = ? AND TO_CHAR(date::date, 'YYYY') = ? THEN amount ELSE 0 END), 0) AS "previousMonthTotal",
        COALESCE(SUM(CASE WHEN TO_CHAR(date::date, 'YYYY') = ? THEN amount ELSE 0 END), 0) AS "yearlyTotal",
        COUNT(*) AS "expenseCount",
        COALESCE(AVG(amount), 0) AS "averageExpense"
      FROM expenses
      WHERE user_id = ?;
    `;

    const row = await queryGet(db, querySummary, [selectedMonth, selectedYear, prevMonth, prevYear, selectedYear, userId]);

    return res.status(200).json({
      success: true,
      data: {
        totalExpenses: roundVal(row.totalExpenses),
        monthlyTotal: roundVal(row.monthlyTotal),
        previousMonthTotal: roundVal(row.previousMonthTotal),
        yearlyTotal: roundVal(row.yearlyTotal),
        expenseCount: Number(row.expenseCount) || 0,
        averageExpense: roundVal(row.averageExpense)
      }
    });
  } catch (err) {
    console.error('Dashboard summary error:', err.message);
    return res.status(500).json({ success: false, message: 'Database error', error: err.message });
  }
});

/**
 * GET /api/v1/dashboard/stats
 */
router.get('/stats', async (req, res) => {
  try {
    const db = req.db;
    const userId = req.user.id;

    const categoryQuery = `
      SELECT
        c.name AS category,
        c.color AS color,
        COALESCE(SUM(e.amount), 0) AS total,
        ROUND(
          (COALESCE(SUM(e.amount), 0) * 100.0 / NULLIF((SELECT SUM(amount) FROM expenses WHERE user_id = ?), 0))::numeric,
          1
        ) AS percentage
      FROM expenses e
      JOIN categories c ON e.category_id = c.id
      WHERE e.user_id = ?
      GROUP BY c.id
      ORDER BY total DESC;
    `;

    const recentQuery = `
      SELECT e.id, e.amount, e.description, e.date, c.name AS category_name, c.color AS category_color
      FROM expenses e
      JOIN categories c ON e.category_id = c.id
      WHERE e.user_id = ?
      ORDER BY e.date DESC, e.id DESC
      LIMIT 5;
    `;

    const highestQuery = `
      SELECT e.*, c.name AS category_name
      FROM expenses e
      JOIN categories c ON e.category_id = c.id
      WHERE e.user_id = ?
      ORDER BY amount DESC LIMIT 1;
    `;

    const lowestQuery = `
      SELECT e.*, c.name AS category_name
      FROM expenses e
      JOIN categories c ON e.category_id = c.id
      WHERE e.user_id = ?
      ORDER BY amount ASC LIMIT 1;
    `;

    const [byCategory, recentExpenses, highestExpense, lowestExpense] = await Promise.all([
      queryAll(db, categoryQuery, [userId, userId]),
      queryAll(db, recentQuery, [userId]),
      queryGet(db, highestQuery, [userId]),
      queryGet(db, lowestQuery, [userId])
    ]);

    return res.status(200).json({
      success: true,
      data: {
        byCategory: byCategory || [],
        recentExpenses: recentExpenses || [],
        highestExpense: highestExpense || null,
        lowestExpense: lowestExpense || null
      }
    });
  } catch (err) {
    console.error('Dashboard stats error:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
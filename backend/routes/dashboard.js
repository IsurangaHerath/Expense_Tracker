const express = require('express');
const router = express.Router();

// Helper to format/round numbers safely
const roundVal = (val) => Number((Math.round((val || 0) * 100) / 100).toFixed(2));

/**
 * GET /api/v1/dashboard/summary
 * Query params: ?month=MM&year=YYYY (defaults to current date)
 */
router.get('/summary', async (req, res) => {
  const db = req.db; // Assuming sqlite3 database instance attached to req
  const userId = req.user.id; // Extracted from JWT auth middleware

  const now = new Date();
  const selectedMonth = req.query.month 
    ? String(req.query.month).padStart(2, '0') 
    : String(now.getMonth() + 1).padStart(2, '0');
  const selectedYear = req.query.year 
    ? String(req.query.year) 
    : String(now.getFullYear());

  // Compute previous month/year strings
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
      COALESCE(SUM(amount), 0) AS totalExpenses,
      COALESCE(SUM(CASE WHEN strftime('%m', date) = ? AND strftime('%Y', date) = ? THEN amount ELSE 0 END), 0) AS monthlyTotal,
      COALESCE(SUM(CASE WHEN strftime('%m', date) = ? AND strftime('%Y', date) = ? THEN amount ELSE 0 END), 0) AS previousMonthTotal,
      COALESCE(SUM(CASE WHEN strftime('%Y', date) = ? THEN amount ELSE 0 END), 0) AS yearlyTotal,
      COUNT(*) AS expenseCount,
      COALESCE(AVG(amount), 0) AS averageExpense
    FROM expenses
    WHERE user_id = ?;
  `;

  db.get(
    querySummary,
    [selectedMonth, selectedYear, prevMonth, prevYear, selectedYear, userId],
    (err, row) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Database error', error: err.message });
      }

      return res.status(200).json({
        success: true,
        data: {
          totalExpenses: roundVal(row.totalExpenses),
          monthlyTotal: roundVal(row.monthlyTotal),
          previousMonthTotal: roundVal(row.previousMonthTotal),
          yearlyTotal: roundVal(row.yearlyTotal),
          expenseCount: row.expenseCount,
          averageExpense: roundVal(row.averageExpense)
        }
      });
    }
  );
});

/**
 * GET /api/v1/dashboard/stats
 */
router.get('/stats', async (req, res) => {
  const db = req.db;
  const userId = req.user.id;

  const categoryQuery = `
    SELECT
      c.name AS category,
      c.color AS color,
      COALESCE(SUM(e.amount), 0) AS total,
      ROUND(
        COALESCE(SUM(e.amount), 0) * 100.0 / NULLIF((SELECT SUM(amount) FROM expenses WHERE user_id = ?), 0),
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

  db.all(categoryQuery, [userId, userId], (err, byCategory) => {
    if (err) return res.status(500).json({ success: false, error: err.message });

    db.all(recentQuery, [userId], (err, recentExpenses) => {
      if (err) return res.status(500).json({ success: false, error: err.message });

      db.get(highestQuery, [userId], (err, highestExpense) => {
        if (err) return res.status(500).json({ success: false, error: err.message });

        db.get(lowestQuery, [userId], (err, lowestExpense) => {
          if (err) return res.status(500).json({ success: false, error: err.message });

          return res.status(200).json({
            success: true,
            data: {
              byCategory: byCategory || [],
              recentExpenses: recentExpenses || [],
              highestExpense: highestExpense || null,
              lowestExpense: lowestExpense || null
            }
          });
        });
      });
    });
  });
});

module.exports = router;
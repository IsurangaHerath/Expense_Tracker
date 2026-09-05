const express = require("express");
const Expense = require("../models/Expense");

const router = express.Router();

// GET /api/v1/expenses - list expenses for the authenticated user
// Supports: ?q=search, &category=<id>, &month=MM, &year=YYYY, &sortBy=date|amount|description, &sortOrder=asc|desc
router.get("/", async (req, res) => {
    try {
        const userId = req.user.id;
        const expenses = await Expense.findAll(userId, req.query);

        res.json({
            success: true,
            data: {
                expenses: expenses
            }
        });
    } catch (error) {
        console.error("Error fetching expenses:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch expenses"
        });
    }
});

// GET /api/v1/expenses/:id - fetch a single expense
router.get("/:id", async (req, res) => {
    try {
        const userId = req.user.id;
        const expense = await Expense.findById(req.params.id, userId);

        if (!expense) {
            return res.status(404).json({
                success: false,
                message: "Expense not found"
            });
        }

        res.json({
            success: true,
            data: {
                expense: expense
            }
        });
    } catch (error) {
        console.error("Error fetching expense:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch expense"
        });
    }
});

// POST /api/v1/expenses - create a new expense
router.post("/", async (req, res) => {
    try {
        const userId = req.user.id;
        const { amount, date, category_id, description } = req.body;

        const errors = [];

        if (amount === undefined || amount === null || Number(amount) <= 0) {
            errors.push('Amount must be a positive number.');
        }

        if (!date) {
            errors.push('Date is required.');
        }

        if (category_id === undefined || category_id === null) {
            errors.push('Please select a category.');
        }

        if (errors.length > 0) {
            return res.status(400).json({
                success: false,
                error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: errors }
            });
        }

        const result = await Expense.create(userId, {
            amount: Number(amount),
            date,
            category_id,
            description
        });

        const expense = await Expense.findById(result.id, userId);

        res.status(201).json({
            success: true,
            message: "Expense created successfully",
            data: { expense: expense }
        });
    } catch (error) {
        console.error("Error creating expense:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create expense"
        });
    }
});

// PUT /api/v1/expenses/:id - update an expense
router.put("/:id", async (req, res) => {
    try {
        const userId = req.user.id;
        const { amount, date, category_id, description } = req.body;

        const errors = [];

        if (amount === undefined || amount === null || Number(amount) <= 0) {
            errors.push('Amount must be a positive number.');
        }

        if (!date) {
            errors.push('Date is required.');
        }

        if (category_id === undefined || category_id === null) {
            errors.push('Please select a category.');
        }

        if (errors.length > 0) {
            return res.status(400).json({
                success: false,
                error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: errors }
            });
        }

        const result = await Expense.update(req.params.id, userId, {
            amount: Number(amount),
            date,
            category_id,
            description
        });

        if (!result) {
            return res.status(404).json({
                success: false,
                message: "Expense not found"
            });
        }

        const expense = await Expense.findById(req.params.id, userId);

        res.json({
            success: true,
            message: "Expense updated successfully",
            data: { expense: expense }
        });
    } catch (error) {
        console.error("Error updating expense:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update expense"
        });
    }
});

// DELETE /api/v1/expenses/:id - delete an expense
router.delete("/:id", async (req, res) => {
    try {
        const userId = req.user.id;
        const deleted = await Expense.remove(req.params.id, userId);

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: "Expense not found"
            });
        }

        res.json({
            success: true,
            message: "Expense deleted successfully"
        });
    } catch (error) {
        console.error("Error deleting expense:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete expense"
        });
    }
});

module.exports = router;
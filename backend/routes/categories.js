const express = require("express");
const Category = require("../models/Category");

const router = express.Router();

// GET all categories
router.get("/", async (req, res) => {
    try {
        const categories = await Category.findAll();

        res.json({
            success: true,
            data: {
                categories: categories
            }
        });
    } catch (error) {
        console.error("Error fetching categories:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch categories"
        });
    }
});

// GET category by ID
router.get("/:id", async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        }

        res.json({
            success: true,
            data: {
                category: category
            }
        });
    } catch (error) {
        console.error("Error fetching category:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch category"
        });
    }
});

module.exports = router;
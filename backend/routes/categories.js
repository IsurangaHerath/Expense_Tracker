const express = require("express");

const router = express.Router();

const categories = [
  "Food",
  "Transport",
  "Shopping",
  "Bills",
  "Entertainment",
  "Health",
  "Education",
  "Other"
];

router.get("/", (req, res) => {
  res.json(categories);
});

module.exports = router;
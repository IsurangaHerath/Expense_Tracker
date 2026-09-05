require('dotenv').config({ path: require('path').join(__dirname, '.env') });

const express = require('express');
const cors = require('cors');

// Initialize database (creates tables and seeds categories on startup)
const db = require('./config/database');

const authenticateToken = require('./middleware/auth');

const authRoutes = require('./routes/auth');
const categoryRoutes = require('./routes/categories');
const expenseRoutes = require('./routes/expenses');
const dashboardRoutes = require('./routes/dashboard');

const app = express();
const PORT = process.env.port || 3000;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3001'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json());

// Attach database instance to request
app.use((req, res, next) => {
  req.db = db;
  next();
});

// Routes
app.use('/api/v1/auth', authRoutes);

app.use('/api/v1/categories', authenticateToken, categoryRoutes);

app.use('/api/v1/expenses', authenticateToken, expenseRoutes);

app.use('/api/v1/dashboard', authenticateToken, dashboardRoutes);

// Health check
app.get('/api/v1/health', (req, res) => {
  res.json({ success: true, message: 'Server is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;
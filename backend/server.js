require('dotenv').config({ path: require('path').join(__dirname, '.env') });

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const net = require('net');
const path = require('path');

// Initialize database (creates tables and seeds categories on startup)
const db = require('./config/database');

const authenticateToken = require('./middleware/auth');

const authRoutes = require('./routes/auth');
const categoryRoutes = require('./routes/categories');
const expenseRoutes = require('./routes/expenses');
const dashboardRoutes = require('./routes/dashboard');

const app = express();

// Middleware
app.use(cors({
  origin: true,
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
const PORT = parseInt(process.env.PORT || process.env.port, 10) || 3000;

// Checks whether a port is currently free to bind on.
function probePort(port) {
  return new Promise((resolve) => {
    const probe = net.createServer();
    probe.unref();
    probe.on('error', () => resolve(false));
    probe.listen(port, '127.0.0.1', () => {
      const bound = probe.address().port;
      probe.close(() => resolve(bound));
    });
  });
}

// Find the first available port starting from the preferred one.
async function findAvailablePort(preferred, maxAttempts = 200) {
  for (let p = preferred; p < preferred + maxAttempts; p++) {
    const available = await probePort(p);
    if (available) return available;
  }

  // If the preferred range is blocked (e.g. by Windows/Hyper-V excluded
  // port ranges), fall back to some common dev ports.
  for (const p of [4000, 4100, 5000, 8080, 9000]) {
    const available = await probePort(p);
    if (available) return available;
  }

  throw new Error(`No available port found starting from ${preferred}`);
}

const PORT_FILE = path.join(__dirname, '.active.port');

async function start() {
  await db.ready;

  const preferredPort = PORT;
  const port = await findAvailablePort(preferredPort);

  const server = app.listen(port, () => {
    if (port !== preferredPort) {
      console.log(`Port ${preferredPort} is in use, using port ${port} instead.`);
    }
    console.log(`Server running on http://localhost:${port}`);
    fs.writeFileSync(PORT_FILE, String(port));
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${port} is in use.`);
    } else {
      console.error('Server error:', err);
    }
    process.exit(1);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err.message);
  process.exit(1);
});

module.exports = app;
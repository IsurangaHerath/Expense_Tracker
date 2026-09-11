# Expense Tracker

A simple application to track your daily expenses.

## Features

- Add and manage expenses
- View spending summary
- Categorize transactions

## Getting Started

Install dependencies for both parts:

```bash
npm --prefix backend install
npm --prefix frontend install
```

Run the backend and frontend together with one command:

```bash
npm start
```

The backend picks the first available port starting from 3000 (e.g. 3001 if 3000 is already in use by another project). The frontend (Vite on port 5173) automatically proxies API calls to whatever port the backend chose, so you don't need to configure anything.

You can also run each part separately:

```bash
npm run dev:backend   # backend only (backend/node_modules)
npm run dev:frontend  # frontend dev server only, targets backend on port 3000 unless BACKEND_PORT is set
```

## License

MIT

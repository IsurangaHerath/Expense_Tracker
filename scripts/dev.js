const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const backendDir = path.join(root, 'backend');
const frontendDir = path.join(root, 'frontend');
const portFile = path.join(backendDir, '.active.port');

const children = [];

function killAll() {
  for (const child of children) {
    if (!child.killed) {
      try {
        child.kill();
      } catch (_) {
        /* ignore */
      }
    }
  }
}

function waitForPort(timeoutMs = 15000) {
  const started = Date.now();
  return new Promise((resolve, reject) => {
    const poll = () => {
      if (fs.existsSync(portFile)) {
        const port = fs.readFileSync(portFile, 'utf8').trim();
        if (port) return resolve(port);
      }
      if (Date.now() - started > timeoutMs) {
        return reject(new Error(`Timed out waiting for ${portFile} (is the backend running?)`));
      }
      setTimeout(poll, 250);
    };
    poll();
  });
}

const backend = spawn('node', ['server.js'], {
  cwd: backendDir,
  stdio: 'inherit',
  env: { ...process.env }
});
children.push(backend);

backend.on('exit', (code) => {
  killAll();
  process.exit(code);
});

process.on('SIGINT', () => {
  killAll();
  process.exit(0);
});
process.on('SIGTERM', () => {
  killAll();
  process.exit(0);
});

waitForPort()
  .then((port) => {
    console.log(`\nExpense Tracker backend is on http://localhost:${port}`);
    console.log('Starting frontend...\n');

const frontend = spawn('npm', ['run', 'dev'], {
  cwd: frontendDir,
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, BACKEND_PORT: port }
});
children.push(frontend);

frontend.on('error', (err) => {
  console.error('Failed to start frontend:', err.message);
  killAll();
  process.exit(1);
});

frontend.on('exit', (code) => {
  killAll();
  process.exit(code);
});
  })
  .catch((err) => {
    console.error(err.message);
    killAll();
    process.exit(1);
  });
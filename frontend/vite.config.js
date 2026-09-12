import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const portFile = path.join(__dirname, '..', 'backend', '.active.port');

// Prefer BACKEND_PORT (set by the launch script), then the backend's
// .active.port file, otherwise fall back to the default backend port.
let backendPort = process.env.BACKEND_PORT;
if (!backendPort && fs.existsSync(portFile)) {
  backendPort = fs.readFileSync(portFile, 'utf8').trim();
}
const backendTarget = `http://localhost:${backendPort || 4000}`;

export default defineConfig({
  plugins: [
    react({
      include: '**/*.{jsx,js}'
    })
  ],
  esbuild: {
    loader: 'jsx',
    include: /src\/.*\.jsx?$/,
    exclude: []
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx'
      }
    }
  },
  server: {
    port: 5173,
    proxy: {
      '/api/v1': {
        target: backendTarget,
        changeOrigin: true
      }
    }
  }
});
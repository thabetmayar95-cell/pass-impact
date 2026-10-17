import express from 'express';
import cors from 'cors';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { initDatabase } from './db.js';
import { apiRouter } from './routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Database schema and seeds
initDatabase();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static frontend assets
const publicDir = resolve(__dirname, '../../public');
app.use(express.static(publicDir));

// Mount REST API
app.use('/api', apiRouter);

// Fallback to index.html for SPA routes
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'Endpoint non trouvé' });
  }
  res.sendFile(resolve(publicDir, 'index.html'));
});

// Start Server when run directly or in normal server environments (Render, local, VPS)
export let server;
if (!process.env.VERCEL) {
  server = app.listen(PORT, () => {
    console.log(`[Passe Impact Hammamet] Serveur démarré sur http://localhost:${PORT}`);
  });
}

export default app;

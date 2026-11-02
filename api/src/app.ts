import express from 'express';
import rutasV1 from './routes/index.js';

// Aquí solo se crea y se configura la app; no se arranca ningún servidor.
// Vercel detecta este archivo (src/app.ts) y usa la app que exportamos.
const app = express();

app.use(express.json());

app.use('/api/v1', rutasV1);

export default app;

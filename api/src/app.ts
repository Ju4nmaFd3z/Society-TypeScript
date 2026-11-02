import express from 'express';

// Aquí solo se crea y se configura la app; no se arranca ningún servidor.
// Vercel detecta este archivo (src/app.ts) y usa la app que exportamos.
const app = express();

app.use(express.json());

export default app;

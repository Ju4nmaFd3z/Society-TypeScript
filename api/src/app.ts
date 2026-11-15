import express from 'express';
// Amplía la Request de Express con userId. Se importa aquí para que Vercel,
// que solo compila lo que cuelga de app.ts, también lo vea.
import './types/express.js';
import rutasV1 from './routes/index.js';
import { manejadorErrores, rutaNoEncontrada } from './middlewares/errores.js';

// Aquí solo se crea y se configura la app; no se arranca ningún servidor.
// Vercel detecta este archivo (src/app.ts) y usa la app que exportamos.
const app = express();

app.use(express.json());

app.use('/api/v1', rutasV1);

// Estos dos van siempre los últimos: primero el 404 y después el manejador de errores
app.use(rutaNoEncontrada);
app.use(manejadorErrores);

export default app;

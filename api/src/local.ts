import app from './app.js';

// Arranque solo para desarrollo local (npm run dev).
// En Vercel no se usa: allí cada petición entra directamente en la app de app.ts.
const puerto = Number(process.env.PORT) || 3000;

app.listen(puerto, () => {
  console.log(`API de SOCIETY escuchando en http://localhost:${puerto}`);
});

import { Router } from 'express';
import saludRoutes from './salud.routes.js';
import authRoutes from './auth.routes.js';

// Reúne todas las rutas de la versión 1. app.ts las monta bajo /api/v1.
// Cada nuevo grupo (auth, restaurante...) se añade aquí con su propio router.
const router = Router();

router.use(saludRoutes);
router.use(authRoutes);

export default router;

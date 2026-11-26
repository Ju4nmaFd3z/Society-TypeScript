import { Router } from 'express';
import { crear, obtenerMio } from '../controllers/restaurantes.controller.js';
import { requiereAuth } from '../middlewares/requiere-auth.js';

// Rutas de /restaurantes. Todas son privadas: requiereAuth va delante del controlador.
const router = Router();

router.get('/restaurantes/mio', requiereAuth, obtenerMio);
router.post('/restaurantes', requiereAuth, crear);

export default router;

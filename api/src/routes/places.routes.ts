import { Router } from 'express';
import { buscar, foto } from '../controllers/places.controller.js';
import { requiereAuth } from '../middlewares/requiere-auth.js';

// Rutas de /places. Todas son privadas: requiereAuth va delante del controlador.
const router = Router();

router.get('/places/search', requiereAuth, buscar);
router.get('/places/photo', requiereAuth, foto);

export default router;

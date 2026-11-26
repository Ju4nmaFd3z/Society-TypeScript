import { Router } from 'express';
import { barrer, ejecutar } from '../controllers/trabajos.controller.js';
import { requiereSecretoTrabajos } from '../middlewares/requiere-secreto-trabajos.js';

// Rutas internas del worker (D-36). No son para los clientes ni están en el
// contrato: solo las llama Supabase, con la cabecera X-Trabajos-Secreto.
const router = Router();

router.post('/trabajos/ejecutar', requiereSecretoTrabajos, ejecutar);
router.post('/trabajos/barrido', requiereSecretoTrabajos, barrer);

export default router;

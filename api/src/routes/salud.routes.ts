import { Router } from 'express';
import { obtenerSalud } from '../controllers/salud.controller.js';

// Ruta: solo asocia método + camino con su controlador.
const router = Router();

router.get('/salud', obtenerSalud);

export default router;

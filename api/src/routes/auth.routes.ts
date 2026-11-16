import { Router } from 'express';
import { renovar, crearCuenta, acceder } from '../controllers/auth.controllers.js';

// /auth routes. They are public: this is where you get the token.
const router = Router();

router.post('/auth/registro', crearCuenta);
router.post('/auth/acceso', acceder)
router.post('/auth/refresco', renovar)

export default router;

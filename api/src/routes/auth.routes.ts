import { Router } from 'express';
import { crearCuenta, acceder } from '../controllers/auth.controllers.js';
import { requiereAuth } from '../middlewares/requiere-auth.js';

// /auth routes. They are public: this is where you get the token.
const router = Router();

router.post('/auth/registro', crearCuenta);
router.post('/auth/acceso', acceder)

export default router;

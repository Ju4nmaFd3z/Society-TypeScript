import { Router } from 'express';
import { crearCuenta } from '../controllers/auth.controllers.js';

// /auth routes. They are public: this is where you get the token.
const router = Router();

router.post('/auth/registro', crearCuenta);

export default router;

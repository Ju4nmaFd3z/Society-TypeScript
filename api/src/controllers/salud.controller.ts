import type { Request, Response } from 'express';
import { comprobarSalud } from '../services/salud.service.js';

// Controlador: traduce entre HTTP y el servicio. Lee la petición,
// llama al servicio y decide el código y el cuerpo de la respuesta.
export function obtenerSalud(_req: Request, res: Response) {
  res.status(200).json(comprobarSalud());
}

import type { NextFunction, Request, Response } from 'express';
import { ErrorApi } from '../utils/error-api.js';

// Se monta después de todas las rutas: si ninguna respondió, la ruta no existe.
export function rutaNoEncontrada(req: Request, _res: Response, next: NextFunction) {
  next(new ErrorApi(404, 'NO_ENCONTRADO', `No existe la ruta ${req.method} ${req.path}`));
}

// Middleware de errores: Express lo reconoce porque tiene 4 parámetros.
// Recibe cualquier error lanzado en una ruta (también en funciones async,
// porque Express 5 captura las promesas rechazadas) y siempre responde
// con el mismo formato: {error: {code, message, retryable}}.
export function manejadorErrores(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ErrorApi) {
    res.status(err.status).json({
      error: { code: err.code, message: err.message, retryable: err.retryable },
    });
    return;
  }

  // express.json() lanza este error cuando el cuerpo no es un JSON válido
  if (err instanceof SyntaxError && 'body' in err) {
    res.status(400).json({
      error: { code: 'VALIDACION', message: 'El cuerpo de la petición no es un JSON válido', retryable: false },
    });
    return;
  }

  // Error inesperado (un fallo nuestro): se registra entero en los logs,
  // pero al cliente no se le enseñan detalles internos.
  console.error(err);
  res.status(500).json({
    error: { code: 'INTERNO', message: 'Error interno del servidor', retryable: false },
  });
}

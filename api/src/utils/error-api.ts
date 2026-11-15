// Códigos comunes de error. Son los mismos que traducen Android y la web
// a ErrorSociety (SesionCaducada, NoEncontrado, Duplicado...).
export type CodigoError =
  | 'SESION_CADUCADA'
  | 'CREDENCIALES_INCORRECTAS'
  | 'NO_ENCONTRADO'
  | 'DUPLICADO'
  | 'VALIDACION'
  | 'LIMITE_ALCANZADO'
  | 'PROVEEDOR_NO_DISPONIBLE'
  | 'MODERACION'
  | 'INTERNO';

// Error "esperado" que lanzamos nosotros desde servicios o controladores,
// por ejemplo: throw new ErrorApi(404, 'NO_ENCONTRADO', 'No existe ese local').
// El middleware de errores lo convierte en {error: {code, message, retryable}}.
export class ErrorApi extends Error {
  constructor(
    public readonly status: number,
    public readonly code: CodigoError,
    message: string,
    public readonly retryable = false,
  ) {
    super(message);
    this.name = 'ErrorApi';
  }
}

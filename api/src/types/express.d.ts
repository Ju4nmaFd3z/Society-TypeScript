
// Añadir userId a la Request de Express.
// Lo rellena el middleware requiereAuth en las rutas protegidas

declare global {
    namespace Express {
        interface Request {
            userId?: string;
        }
    }
}

export {} // para que trate el fichero como modulo.